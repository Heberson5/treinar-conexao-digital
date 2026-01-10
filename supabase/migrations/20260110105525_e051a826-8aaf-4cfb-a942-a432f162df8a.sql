-- Adicionar colunas para modelo de IA e chave de API
ALTER TABLE public.configuracoes_ia_empresa
ADD COLUMN IF NOT EXISTS modelo_ia TEXT DEFAULT 'gemini-2.5-flash',
ADD COLUMN IF NOT EXISTS api_key TEXT;