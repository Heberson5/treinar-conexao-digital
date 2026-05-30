
-- 1. Add columns to configuracoes_sistema
ALTER TABLE public.configuracoes_sistema
  ADD COLUMN IF NOT EXISTS session_timeout_min integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS logoff_on_close boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tentativas_login_max integer NOT NULL DEFAULT 5,
  ADD COLUMN IF NOT EXISTS bloqueio_horas integer NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS backup_destino text NOT NULL DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS backup_config jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 2. Add footer + sections order to landing_page_config
ALTER TABLE public.landing_page_config
  ADD COLUMN IF NOT EXISTS footer_section jsonb NOT NULL DEFAULT '{
    "enabled": true,
    "logoText": "Sauberlich System",
    "description": "A plataforma mais avançada para treinamentos corporativos.",
    "columns": [
      {"title": "Empresa", "links": [{"label": "Sobre Nós", "href": "/sobre"}, {"label": "Termos de Uso", "href": "/termos"}]},
      {"title": "Suporte", "links": [{"label": "Contato", "href": "mailto:contato@empresa.com"}, {"label": "Ajuda", "href": "#"}]},
      {"title": "Redes Sociais", "links": [{"label": "LinkedIn", "href": "#"}, {"label": "Instagram", "href": "#"}]}
    ],
    "copyright": "© Sauberlich System. Todos os direitos reservados.",
    "bgColor": "bg-foreground text-background"
  }'::jsonb,
  ADD COLUMN IF NOT EXISTS sections_order jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS sections_alignment jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 3. Create tentativas_login table
CREATE TABLE IF NOT EXISTS public.tentativas_login (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  sucesso boolean NOT NULL DEFAULT false,
  ip text,
  user_agent text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tentativas_login_email_data
  ON public.tentativas_login(email, criado_em DESC);

GRANT SELECT, INSERT ON public.tentativas_login TO authenticated;
GRANT ALL ON public.tentativas_login TO service_role;

ALTER TABLE public.tentativas_login ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Master ve todas tentativas"
  ON public.tentativas_login FOR SELECT
  TO authenticated
  USING (verificar_role(auth.uid(), 'master'::tipo_role));

CREATE POLICY "Sistema insere tentativas"
  ON public.tentativas_login FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 4. Function to check if user can attempt login
CREATE OR REPLACE FUNCTION public.pode_tentar_login(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_max integer;
  v_horas integer;
  v_falhas integer;
  v_ultima_falha timestamptz;
  v_proxima_tentativa timestamptz;
BEGIN
  SELECT tentativas_login_max, bloqueio_horas
    INTO v_max, v_horas
  FROM public.configuracoes_sistema
  LIMIT 1;

  v_max := COALESCE(v_max, 5);
  v_horas := COALESCE(v_horas, 24);

  -- Count consecutive failures since last successful login (or last unblock window)
  SELECT COUNT(*), MAX(criado_em)
    INTO v_falhas, v_ultima_falha
  FROM public.tentativas_login
  WHERE email = lower(p_email)
    AND sucesso = false
    AND criado_em > now() - (v_horas || ' hours')::interval
    AND criado_em > COALESCE(
      (SELECT MAX(criado_em) FROM public.tentativas_login
        WHERE email = lower(p_email) AND sucesso = true),
      'epoch'::timestamptz
    );

  IF v_falhas >= v_max THEN
    v_proxima_tentativa := v_ultima_falha + (v_horas || ' hours')::interval;
    RETURN jsonb_build_object(
      'permitido', false,
      'tentativas', v_falhas,
      'max', v_max,
      'desbloqueio_em', v_proxima_tentativa
    );
  END IF;

  RETURN jsonb_build_object(
    'permitido', true,
    'tentativas', v_falhas,
    'restantes', v_max - v_falhas,
    'max', v_max
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.pode_tentar_login(text) TO anon, authenticated;

-- 5. Function to register a login attempt
CREATE OR REPLACE FUNCTION public.registrar_tentativa_login(p_email text, p_sucesso boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.tentativas_login (email, sucesso)
  VALUES (lower(p_email), p_sucesso);
END;
$$;

GRANT EXECUTE ON FUNCTION public.registrar_tentativa_login(text, boolean) TO anon, authenticated;
