-- Criar enum para os 4 tipos de roles
CREATE TYPE public.tipo_role AS ENUM ('master', 'admin', 'instrutor', 'usuario');

-- Tabela de empresas
CREATE TABLE public.empresas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cnpj TEXT UNIQUE,
  logo_url TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de departamentos
CREATE TABLE public.departamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de perfis de usuário
CREATE TABLE public.perfis (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  departamento_id UUID REFERENCES public.departamentos(id) ON DELETE SET NULL,
  cargo TEXT,
  telefone TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de roles dos usuários (separada por segurança)
CREATE TABLE public.usuario_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role tipo_role NOT NULL DEFAULT 'usuario',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (usuario_id, role)
);

-- Tabela de treinamentos
CREATE TABLE public.treinamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  thumbnail_url TEXT,
  duracao_minutos INTEGER DEFAULT 0,
  categoria TEXT,
  nivel TEXT DEFAULT 'iniciante',
  instrutor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  departamento_id UUID REFERENCES public.departamentos(id) ON DELETE SET NULL,
  obrigatorio BOOLEAN DEFAULT false,
  publicado BOOLEAN DEFAULT false,
  data_limite TIMESTAMP WITH TIME ZONE,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de progresso dos treinamentos
CREATE TABLE public.progresso_treinamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  treinamento_id UUID REFERENCES public.treinamentos(id) ON DELETE CASCADE NOT NULL,
  percentual_concluido INTEGER DEFAULT 0,
  tempo_assistido_minutos INTEGER DEFAULT 0,
  concluido BOOLEAN DEFAULT false,
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_conclusao TIMESTAMP WITH TIME ZONE,
  nota_avaliacao INTEGER,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (usuario_id, treinamento_id)
);

-- Tabela de atividades/log
CREATE TABLE public.atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuario_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treinamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_treinamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

-- Função para verificar role do usuário (SECURITY DEFINER para evitar recursão)
CREATE OR REPLACE FUNCTION public.verificar_role(usuario_id UUID, _role tipo_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuario_roles
    WHERE usuario_roles.usuario_id = $1 AND role = $2
  )
$$;

-- Função para verificar se é admin ou master
CREATE OR REPLACE FUNCTION public.eh_admin_ou_master(usuario_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.usuario_roles
    WHERE usuario_roles.usuario_id = $1 AND role IN ('master', 'admin')
  )
$$;

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.atualizar_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$;

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.criar_perfil_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfis (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    NEW.email
  );
  
  -- Atribuir role padrão de usuário
  INSERT INTO public.usuario_roles (usuario_id, role)
  VALUES (NEW.id, 'usuario');
  
  RETURN NEW;
END;
$$;

-- Triggers para atualizar timestamp
CREATE TRIGGER atualizar_empresas_timestamp BEFORE UPDATE ON public.empresas
FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp();

CREATE TRIGGER atualizar_departamentos_timestamp BEFORE UPDATE ON public.departamentos
FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp();

CREATE TRIGGER atualizar_perfis_timestamp BEFORE UPDATE ON public.perfis
FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp();

CREATE TRIGGER atualizar_treinamentos_timestamp BEFORE UPDATE ON public.treinamentos
FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp();

CREATE TRIGGER atualizar_progresso_timestamp BEFORE UPDATE ON public.progresso_treinamentos
FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp();

-- Trigger para criar perfil ao registrar usuário
CREATE TRIGGER criar_perfil_ao_registrar
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.criar_perfil_usuario();

-- Políticas RLS para empresas
CREATE POLICY "Empresas visiveis para usuarios autenticados"
ON public.empresas FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Apenas admin/master podem criar empresas"
ON public.empresas FOR INSERT TO authenticated
WITH CHECK (public.eh_admin_ou_master(auth.uid()));

CREATE POLICY "Apenas admin/master podem atualizar empresas"
ON public.empresas FOR UPDATE TO authenticated
USING (public.eh_admin_ou_master(auth.uid()));

CREATE POLICY "Apenas master pode deletar empresas"
ON public.empresas FOR DELETE TO authenticated
USING (public.verificar_role(auth.uid(), 'master'));

-- Políticas RLS para departamentos
CREATE POLICY "Departamentos visiveis para usuarios autenticados"
ON public.departamentos FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Apenas admin/master podem criar departamentos"
ON public.departamentos FOR INSERT TO authenticated
WITH CHECK (public.eh_admin_ou_master(auth.uid()));

CREATE POLICY "Apenas admin/master podem atualizar departamentos"
ON public.departamentos FOR UPDATE TO authenticated
USING (public.eh_admin_ou_master(auth.uid()));

CREATE POLICY "Apenas admin/master podem deletar departamentos"
ON public.departamentos FOR DELETE TO authenticated
USING (public.eh_admin_ou_master(auth.uid()));

-- Políticas RLS para perfis
CREATE POLICY "Usuarios podem ver todos os perfis"
ON public.perfis FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Usuarios podem atualizar proprio perfil"
ON public.perfis FOR UPDATE TO authenticated
USING (id = auth.uid());

CREATE POLICY "Admin/master podem atualizar qualquer perfil"
ON public.perfis FOR UPDATE TO authenticated
USING (public.eh_admin_ou_master(auth.uid()));

-- Políticas RLS para usuario_roles
CREATE POLICY "Usuarios podem ver suas roles"
ON public.usuario_roles FOR SELECT TO authenticated
USING (usuario_id = auth.uid() OR public.eh_admin_ou_master(auth.uid()));

CREATE POLICY "Apenas master pode gerenciar roles"
ON public.usuario_roles FOR ALL TO authenticated
USING (public.verificar_role(auth.uid(), 'master'));

-- Políticas RLS para treinamentos
CREATE POLICY "Treinamentos publicados visiveis para todos"
ON public.treinamentos FOR SELECT TO authenticated
USING (publicado = true OR public.eh_admin_ou_master(auth.uid()) OR instrutor_id = auth.uid());

CREATE POLICY "Instrutor/admin/master podem criar treinamentos"
ON public.treinamentos FOR INSERT TO authenticated
WITH CHECK (
  public.eh_admin_ou_master(auth.uid()) OR 
  public.verificar_role(auth.uid(), 'instrutor')
);

CREATE POLICY "Instrutor pode atualizar seus treinamentos"
ON public.treinamentos FOR UPDATE TO authenticated
USING (instrutor_id = auth.uid() OR public.eh_admin_ou_master(auth.uid()));

CREATE POLICY "Admin/master podem deletar treinamentos"
ON public.treinamentos FOR DELETE TO authenticated
USING (public.eh_admin_ou_master(auth.uid()));

-- Políticas RLS para progresso_treinamentos
CREATE POLICY "Usuario ve proprio progresso"
ON public.progresso_treinamentos FOR SELECT TO authenticated
USING (usuario_id = auth.uid() OR public.eh_admin_ou_master(auth.uid()));

CREATE POLICY "Usuario pode criar proprio progresso"
ON public.progresso_treinamentos FOR INSERT TO authenticated
WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuario pode atualizar proprio progresso"
ON public.progresso_treinamentos FOR UPDATE TO authenticated
USING (usuario_id = auth.uid());

-- Políticas RLS para atividades
CREATE POLICY "Usuario ve proprias atividades"
ON public.atividades FOR SELECT TO authenticated
USING (usuario_id = auth.uid() OR public.eh_admin_ou_master(auth.uid()));

CREATE POLICY "Sistema pode criar atividades"
ON public.atividades FOR INSERT TO authenticated
WITH CHECK (usuario_id = auth.uid());