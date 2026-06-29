ALTER TABLE public.sms_configuracoes
  ADD COLUMN IF NOT EXISTS api_key text NULL,
  ADD COLUMN IF NOT EXISTS api_id text NULL;