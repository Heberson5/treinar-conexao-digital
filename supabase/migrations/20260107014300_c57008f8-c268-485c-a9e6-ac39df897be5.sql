-- Adicionar campos de limite aos planos
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS plano_id UUID;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS data_contratacao TIMESTAMP WITH TIME ZONE;

-- Tabela de planos
CREATE TABLE public.planos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10,2) NOT NULL DEFAULT 0,
  periodo TEXT DEFAULT '/mês',
  limite_usuarios INTEGER NOT NULL DEFAULT 5,
  limite_treinamentos INTEGER NOT NULL DEFAULT 10,
  limite_armazenamento_gb INTEGER DEFAULT 5,
  recursos JSONB DEFAULT '[]',
  cor TEXT DEFAULT 'bg-blue-500',
  icone TEXT DEFAULT 'Users',
  popular BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de snapshots de planos (para garantir que alterações não afetem contratos existentes)
CREATE TABLE public.plano_contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL,
  plano_id UUID REFERENCES public.planos(id) ON DELETE SET NULL,
  -- Snapshot dos valores do plano no momento da contratação
  nome_plano TEXT NOT NULL,
  preco_contratado DECIMAL(10,2) NOT NULL,
  limite_usuarios INTEGER NOT NULL,
  limite_treinamentos INTEGER NOT NULL,
  limite_armazenamento_gb INTEGER,
  recursos_contratados JSONB DEFAULT '[]',
  -- Datas
  data_inicio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_fim TIMESTAMP WITH TIME ZONE,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (empresa_id, ativo) -- Apenas um contrato ativo por empresa
);

-- Tabela para controle de uso
CREATE TABLE public.uso_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE NOT NULL UNIQUE,
  treinamentos_criados INTEGER DEFAULT 0,
  usuarios_ativos INTEGER DEFAULT 0,
  armazenamento_usado_mb INTEGER DEFAULT 0,
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plano_contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uso_empresa ENABLE ROW LEVEL SECURITY;

-- Políticas para planos (públicos para leitura, admin para escrita)
CREATE POLICY "Planos visiveis para todos"
ON public.planos FOR SELECT
USING (true);

CREATE POLICY "Apenas master pode gerenciar planos"
ON public.planos FOR ALL TO authenticated
USING (public.verificar_role(auth.uid(), 'master'));

-- Políticas para contratos
CREATE POLICY "Admin ve contratos da sua empresa"
ON public.plano_contratos FOR SELECT TO authenticated
USING (
  public.eh_admin_ou_master(auth.uid()) OR
  empresa_id IN (SELECT empresa_id FROM public.perfis WHERE id = auth.uid())
);

CREATE POLICY "Master pode gerenciar contratos"
ON public.plano_contratos FOR ALL TO authenticated
USING (public.verificar_role(auth.uid(), 'master'));

-- Políticas para uso
CREATE POLICY "Admin ve uso da sua empresa"
ON public.uso_empresa FOR SELECT TO authenticated
USING (
  public.eh_admin_ou_master(auth.uid()) OR
  empresa_id IN (SELECT empresa_id FROM public.perfis WHERE id = auth.uid())
);

CREATE POLICY "Sistema pode atualizar uso"
ON public.uso_empresa FOR ALL TO authenticated
USING (public.eh_admin_ou_master(auth.uid()));

-- Função para verificar limite de treinamentos
CREATE OR REPLACE FUNCTION public.verificar_limite_treinamentos(p_empresa_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limite INTEGER;
  v_atual INTEGER;
BEGIN
  -- Buscar limite do contrato ativo
  SELECT limite_treinamentos INTO v_limite
  FROM public.plano_contratos
  WHERE empresa_id = p_empresa_id AND ativo = true
  LIMIT 1;
  
  -- Se não tem contrato, usar limite padrão de 5
  IF v_limite IS NULL THEN
    v_limite := 5;
  END IF;
  
  -- Contar treinamentos atuais
  SELECT COUNT(*) INTO v_atual
  FROM public.treinamentos
  WHERE empresa_id = p_empresa_id;
  
  RETURN v_atual < v_limite;
END;
$$;

-- Função para criar contrato com snapshot do plano
CREATE OR REPLACE FUNCTION public.criar_contrato_plano(
  p_empresa_id UUID,
  p_plano_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plano RECORD;
  v_contrato_id UUID;
BEGIN
  -- Buscar dados do plano
  SELECT * INTO v_plano FROM public.planos WHERE id = p_plano_id;
  
  IF v_plano IS NULL THEN
    RAISE EXCEPTION 'Plano não encontrado';
  END IF;
  
  -- Desativar contratos anteriores
  UPDATE public.plano_contratos
  SET ativo = false, data_fim = now()
  WHERE empresa_id = p_empresa_id AND ativo = true;
  
  -- Criar novo contrato com snapshot
  INSERT INTO public.plano_contratos (
    empresa_id,
    plano_id,
    nome_plano,
    preco_contratado,
    limite_usuarios,
    limite_treinamentos,
    limite_armazenamento_gb,
    recursos_contratados
  ) VALUES (
    p_empresa_id,
    p_plano_id,
    v_plano.nome,
    v_plano.preco,
    v_plano.limite_usuarios,
    v_plano.limite_treinamentos,
    v_plano.limite_armazenamento_gb,
    v_plano.recursos
  ) RETURNING id INTO v_contrato_id;
  
  -- Criar ou atualizar registro de uso
  INSERT INTO public.uso_empresa (empresa_id)
  VALUES (p_empresa_id)
  ON CONFLICT (empresa_id) DO NOTHING;
  
  RETURN v_contrato_id;
END;
$$;

-- Trigger para validar limite antes de criar treinamento
CREATE OR REPLACE FUNCTION public.validar_limite_treinamento()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.empresa_id IS NOT NULL THEN
    IF NOT public.verificar_limite_treinamentos(NEW.empresa_id) THEN
      RAISE EXCEPTION 'Limite de treinamentos atingido para esta empresa. Faça upgrade do plano.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER verificar_limite_antes_criar_treinamento
BEFORE INSERT ON public.treinamentos
FOR EACH ROW EXECUTE FUNCTION public.validar_limite_treinamento();

-- Trigger para atualizar contador de uso
CREATE OR REPLACE FUNCTION public.atualizar_uso_treinamentos()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.empresa_id IS NOT NULL THEN
    INSERT INTO public.uso_empresa (empresa_id, treinamentos_criados)
    VALUES (NEW.empresa_id, 1)
    ON CONFLICT (empresa_id) 
    DO UPDATE SET treinamentos_criados = public.uso_empresa.treinamentos_criados + 1,
                  atualizado_em = now();
  ELSIF TG_OP = 'DELETE' AND OLD.empresa_id IS NOT NULL THEN
    UPDATE public.uso_empresa 
    SET treinamentos_criados = GREATEST(0, treinamentos_criados - 1),
        atualizado_em = now()
    WHERE empresa_id = OLD.empresa_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER atualizar_uso_apos_treinamento
AFTER INSERT OR DELETE ON public.treinamentos
FOR EACH ROW EXECUTE FUNCTION public.atualizar_uso_treinamentos();

-- Triggers de timestamp
CREATE TRIGGER atualizar_planos_timestamp BEFORE UPDATE ON public.planos
FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp();

CREATE TRIGGER atualizar_contratos_timestamp BEFORE UPDATE ON public.plano_contratos
FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp();

-- Inserir planos padrão
INSERT INTO public.planos (nome, descricao, preco, limite_usuarios, limite_treinamentos, limite_armazenamento_gb, cor, icone, ordem, recursos) VALUES
('Starter', 'Ideal para pequenas equipes', 99, 10, 15, 5, 'bg-blue-500', 'Users', 1, '[{"id": "suporte_email", "habilitado": true, "descricao": "Suporte por email"}, {"id": "relatorios_basicos", "habilitado": true, "descricao": "Relatórios básicos"}]'),
('Professional', 'Para empresas em crescimento', 299, 50, 50, 20, 'bg-purple-500', 'Building2', 2, '[{"id": "suporte_prioritario", "habilitado": true, "descricao": "Suporte prioritário"}, {"id": "relatorios_avancados", "habilitado": true, "descricao": "Relatórios avançados"}, {"id": "api_acesso", "habilitado": true, "descricao": "Acesso à API"}]'),
('Enterprise', 'Solução completa para grandes empresas', 799, 200, 200, 100, 'bg-amber-500', 'Crown', 3, '[{"id": "suporte_dedicado", "habilitado": true, "descricao": "Suporte dedicado 24/7"}, {"id": "relatorios_custom", "habilitado": true, "descricao": "Relatórios customizados"}, {"id": "api_ilimitada", "habilitado": true, "descricao": "API ilimitada"}, {"id": "sso", "habilitado": true, "descricao": "Single Sign-On"}]');
