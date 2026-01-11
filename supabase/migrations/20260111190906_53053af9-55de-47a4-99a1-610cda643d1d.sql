-- Adicionar campo nome_fantasia na tabela empresas
ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS nome_fantasia text;

-- Atualizar nome_fantasia com valor do nome para registros existentes
UPDATE public.empresas 
SET nome_fantasia = nome 
WHERE nome_fantasia IS NULL;