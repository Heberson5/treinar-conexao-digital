
-- Audit log table
CREATE TABLE public.auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  usuario_nome text NOT NULL,
  acao text NOT NULL, -- 'criar', 'editar', 'excluir', 'login', 'logout'
  menu text NOT NULL, -- 'usuarios', 'treinamentos', 'empresas', etc.
  local text, -- detail within the menu
  descricao text NOT NULL,
  dados_anteriores jsonb,
  dados_novos jsonb,
  ip_address text,
  criado_em timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Master pode ver toda auditoria" ON public.auditoria
  FOR SELECT TO authenticated
  USING (verificar_role(auth.uid(), 'master'::tipo_role));

CREATE POLICY "Admin pode ver auditoria da empresa" ON public.auditoria
  FOR SELECT TO authenticated
  USING (eh_admin_ou_master(auth.uid()));

CREATE POLICY "Qualquer autenticado pode inserir auditoria" ON public.auditoria
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

-- System configuration table
CREATE TABLE public.configuracoes_sistema (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_sistema text NOT NULL DEFAULT 'Portal Treinamentos',
  favicon_url text,
  logo_sidebar_url text,
  atualizado_em timestamp with time zone DEFAULT now()
);

ALTER TABLE public.configuracoes_sistema ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ler config sistema" ON public.configuracoes_sistema
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Master pode gerenciar config sistema" ON public.configuracoes_sistema
  FOR ALL TO authenticated
  USING (verificar_role(auth.uid(), 'master'::tipo_role));

-- Insert default row
INSERT INTO public.configuracoes_sistema (nome_sistema) VALUES ('Portal Treinamentos');

-- Lembretes/alertas de revisão table
CREATE TABLE public.lembretes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  titulo text NOT NULL,
  descricao text,
  data_lembrete timestamp with time zone NOT NULL,
  tipo text NOT NULL DEFAULT 'revisao', -- 'revisao', 'treinamento', 'evento'
  treinamento_id uuid REFERENCES public.treinamentos(id) ON DELETE CASCADE,
  evento_id text,
  notificado boolean DEFAULT false,
  criado_em timestamp with time zone DEFAULT now()
);

ALTER TABLE public.lembretes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario ve proprios lembretes" ON public.lembretes
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Usuario cria proprios lembretes" ON public.lembretes
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuario atualiza proprios lembretes" ON public.lembretes
  FOR UPDATE TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Usuario deleta proprios lembretes" ON public.lembretes
  FOR DELETE TO authenticated
  USING (usuario_id = auth.uid());
