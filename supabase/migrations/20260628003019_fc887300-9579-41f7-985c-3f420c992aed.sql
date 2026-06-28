-- Corrigir políticas de visibilidade/gestão de usuários por empresa
CREATE OR REPLACE FUNCTION public.pode_gerenciar_usuario_alvo(p_usuario_alvo uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT CASE
    WHEN public.verificar_role(auth.uid(), 'master'::tipo_role) THEN true
    WHEN public.verificar_role(auth.uid(), 'admin'::tipo_role) THEN EXISTS (
      SELECT 1
      FROM public.perfis alvo
      WHERE alvo.id = p_usuario_alvo
        AND alvo.empresa_id IS NOT NULL
        AND alvo.empresa_id = public.get_empresa_id_do_usuario(auth.uid())
        AND NOT public.verificar_role(alvo.id, 'master'::tipo_role)
    )
    ELSE p_usuario_alvo = auth.uid()
  END;
$$;

DROP POLICY IF EXISTS "Usuarios veem perfis da mesma empresa" ON public.perfis;
DROP POLICY IF EXISTS "Admin/master podem atualizar qualquer perfil" ON public.perfis;
DROP POLICY IF EXISTS "Usuarios podem atualizar proprio perfil" ON public.perfis;

CREATE POLICY "Usuarios veem perfis permitidos por empresa"
ON public.perfis
FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR public.verificar_role(auth.uid(), 'master'::tipo_role)
  OR (
    public.verificar_role(auth.uid(), 'admin'::tipo_role)
    AND empresa_id IS NOT NULL
    AND empresa_id = public.get_empresa_id_do_usuario(auth.uid())
    AND NOT public.verificar_role(id, 'master'::tipo_role)
  )
);

CREATE POLICY "Usuarios atualizam proprio perfil"
ON public.perfis
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

CREATE POLICY "Admins gerenciam perfis da propria empresa"
ON public.perfis
FOR UPDATE
TO authenticated
USING (public.pode_gerenciar_usuario_alvo(id))
WITH CHECK (
  public.verificar_role(auth.uid(), 'master'::tipo_role)
  OR id = auth.uid()
  OR (
    public.verificar_role(auth.uid(), 'admin'::tipo_role)
    AND empresa_id IS NOT NULL
    AND empresa_id = public.get_empresa_id_do_usuario(auth.uid())
    AND NOT public.verificar_role(id, 'master'::tipo_role)
  )
);

-- Base de integração Mobizon SMS
CREATE TABLE IF NOT EXISTS public.sms_configuracoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NULL,
  provedor text NOT NULL DEFAULT 'mobizon',
  ativo boolean NOT NULL DEFAULT false,
  modo_teste boolean NOT NULL DEFAULT true,
  remetente text NULL,
  api_key_configurada boolean NOT NULL DEFAULT false,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sms_configuracoes_empresa_unique UNIQUE (empresa_id),
  CONSTRAINT sms_configuracoes_provedor_check CHECK (provedor IN ('mobizon'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sms_configuracoes TO authenticated;
GRANT ALL ON public.sms_configuracoes TO service_role;
ALTER TABLE public.sms_configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Master gerencia todas configuracoes SMS"
ON public.sms_configuracoes
FOR ALL
TO authenticated
USING (public.verificar_role(auth.uid(), 'master'::tipo_role))
WITH CHECK (public.verificar_role(auth.uid(), 'master'::tipo_role));

CREATE POLICY "Admins gerenciam SMS da propria empresa"
ON public.sms_configuracoes
FOR ALL
TO authenticated
USING (
  public.verificar_role(auth.uid(), 'admin'::tipo_role)
  AND empresa_id = public.get_empresa_id_do_usuario(auth.uid())
)
WITH CHECK (
  public.verificar_role(auth.uid(), 'admin'::tipo_role)
  AND empresa_id = public.get_empresa_id_do_usuario(auth.uid())
);

CREATE TABLE IF NOT EXISTS public.sms_gatilhos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NULL,
  codigo text NOT NULL,
  nome text NOT NULL,
  descricao text NULL,
  ativo boolean NOT NULL DEFAULT false,
  antecedencia_minutos integer NULL,
  template text NOT NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sms_gatilhos_empresa_codigo_unique UNIQUE (empresa_id, codigo),
  CONSTRAINT sms_gatilhos_codigo_check CHECK (codigo IN ('senha_provisoria','dois_fatores','lembrete_agendado','novo_treinamento'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sms_gatilhos TO authenticated;
GRANT ALL ON public.sms_gatilhos TO service_role;
ALTER TABLE public.sms_gatilhos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Master gerencia todos gatilhos SMS"
ON public.sms_gatilhos
FOR ALL
TO authenticated
USING (public.verificar_role(auth.uid(), 'master'::tipo_role))
WITH CHECK (public.verificar_role(auth.uid(), 'master'::tipo_role));

CREATE POLICY "Admins gerenciam gatilhos SMS da propria empresa"
ON public.sms_gatilhos
FOR ALL
TO authenticated
USING (
  public.verificar_role(auth.uid(), 'admin'::tipo_role)
  AND empresa_id = public.get_empresa_id_do_usuario(auth.uid())
)
WITH CHECK (
  public.verificar_role(auth.uid(), 'admin'::tipo_role)
  AND empresa_id = public.get_empresa_id_do_usuario(auth.uid())
);

CREATE TABLE IF NOT EXISTS public.sms_envios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NULL,
  usuario_id uuid NULL,
  telefone text NOT NULL,
  gatilho text NOT NULL,
  mensagem text NOT NULL,
  status text NOT NULL DEFAULT 'pendente',
  resposta_provedor jsonb NOT NULL DEFAULT '{}'::jsonb,
  erro text NULL,
  enviado_em timestamptz NULL,
  criado_em timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sms_envios_status_check CHECK (status IN ('pendente','enviado','falhou','simulado'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sms_envios TO authenticated;
GRANT ALL ON public.sms_envios TO service_role;
ALTER TABLE public.sms_envios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Master ve todos envios SMS"
ON public.sms_envios
FOR SELECT
TO authenticated
USING (public.verificar_role(auth.uid(), 'master'::tipo_role));

CREATE POLICY "Admins veem envios SMS da propria empresa"
ON public.sms_envios
FOR SELECT
TO authenticated
USING (
  public.verificar_role(auth.uid(), 'admin'::tipo_role)
  AND empresa_id = public.get_empresa_id_do_usuario(auth.uid())
);

CREATE POLICY "Service role gerencia envios SMS"
ON public.sms_envios
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

DROP TRIGGER IF EXISTS update_sms_configuracoes_updated_at ON public.sms_configuracoes;
CREATE TRIGGER update_sms_configuracoes_updated_at
BEFORE UPDATE ON public.sms_configuracoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_sms_gatilhos_updated_at ON public.sms_gatilhos;
CREATE TRIGGER update_sms_gatilhos_updated_at
BEFORE UPDATE ON public.sms_gatilhos
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Gatilhos globais padrão, em modo desligado até a chave Mobizon ser cadastrada
INSERT INTO public.sms_gatilhos (empresa_id, codigo, nome, descricao, ativo, antecedencia_minutos, template)
VALUES
  (NULL, 'senha_provisoria', 'Senha provisória', 'Envia senha provisória em redefinições administrativas.', false, NULL, 'Sua senha provisória é {{senha}}. Acesse o sistema e altere no primeiro login.'),
  (NULL, 'dois_fatores', 'Validação em 2 fatores', 'Envia código de validação para autenticação em duas etapas.', false, NULL, 'Seu código de validação é {{codigo}}. Ele expira em {{minutos}} minutos.'),
  (NULL, 'lembrete_agendado', 'Lembrete de treinamento agendado', 'Envia SMS antes de treinamentos no calendário do funcionário.', false, 30, 'Lembrete: o treinamento {{treinamento}} começa em 30 minutos.'),
  (NULL, 'novo_treinamento', 'Novo treinamento publicado', 'Avisa quando um novo treinamento é publicado ou atribuído.', false, NULL, 'Novo treinamento disponível: {{treinamento}}. Acesse a plataforma para iniciar.')
ON CONFLICT (empresa_id, codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  antecedencia_minutos = EXCLUDED.antecedencia_minutos,
  template = EXCLUDED.template;