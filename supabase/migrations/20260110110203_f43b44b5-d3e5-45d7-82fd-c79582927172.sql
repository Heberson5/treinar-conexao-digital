-- Adicionar colunas separadas para cada provedor de IA
ALTER TABLE public.configuracoes_ia_empresa
ADD COLUMN IF NOT EXISTS api_key_gemini TEXT,
ADD COLUMN IF NOT EXISTS api_key_chatgpt TEXT,
ADD COLUMN IF NOT EXISTS api_key_deepseek TEXT;

-- Migrar dados existentes da coluna api_key para a coluna correspondente ao provedor
UPDATE public.configuracoes_ia_empresa
SET api_key_gemini = api_key
WHERE provedor_ia = 'gemini' AND api_key IS NOT NULL;

UPDATE public.configuracoes_ia_empresa
SET api_key_chatgpt = api_key
WHERE provedor_ia = 'chatgpt' AND api_key IS NOT NULL;

UPDATE public.configuracoes_ia_empresa
SET api_key_deepseek = api_key
WHERE provedor_ia = 'deepseek' AND api_key IS NOT NULL;