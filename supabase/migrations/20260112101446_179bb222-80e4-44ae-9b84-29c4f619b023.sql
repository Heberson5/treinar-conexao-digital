-- Sistema de Demonstração
-- Adiciona suporte para empresas/usuários de demonstração com limite de 7 dias

-- Adicionar campos extras na tabela empresas para gestão completa
ALTER TABLE public.empresas
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS endereco TEXT,
ADD COLUMN IF NOT EXISTS responsavel TEXT,
ADD COLUMN IF NOT EXISTS razao_social TEXT,
ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS demo_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS demo_created_at TIMESTAMP WITH TIME ZONE;

-- Tabela para armazenar CNPJs que já usaram demonstração (evita reuso)
CREATE TABLE IF NOT EXISTS public.cnpj_demo_usado (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cnpj TEXT NOT NULL UNIQUE,
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE SET NULL,
  usado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.cnpj_demo_usado ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cnpj_demo_usado
CREATE POLICY "Master pode ver todos os CNPJs demo usados"
ON public.cnpj_demo_usado
FOR SELECT
USING (verificar_role(auth.uid(), 'master'::tipo_role));

CREATE POLICY "Master pode gerenciar CNPJs demo"
ON public.cnpj_demo_usado
FOR ALL
USING (verificar_role(auth.uid(), 'master'::tipo_role));

-- Função para verificar se CNPJ já usou demo
CREATE OR REPLACE FUNCTION public.verificar_cnpj_demo_disponivel(p_cnpj TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM public.cnpj_demo_usado
    WHERE cnpj = p_cnpj
  );
END;
$$;

-- Função para registrar uso de demo por CNPJ
CREATE OR REPLACE FUNCTION public.registrar_cnpj_demo(p_cnpj TEXT, p_empresa_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.cnpj_demo_usado (cnpj, empresa_id)
  VALUES (p_cnpj, p_empresa_id)
  ON CONFLICT (cnpj) DO NOTHING;
END;
$$;

-- Função para verificar se demo expirou
CREATE OR REPLACE FUNCTION public.verificar_demo_expirada(p_empresa_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_demo BOOLEAN;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT is_demo, demo_expires_at 
  INTO v_is_demo, v_expires_at
  FROM public.empresas
  WHERE id = p_empresa_id;
  
  IF v_is_demo IS NOT TRUE THEN
    RETURN FALSE; -- Não é demo, então não expirou
  END IF;
  
  RETURN v_expires_at IS NOT NULL AND v_expires_at < now();
END;
$$;

-- Índice para buscas por CNPJ
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON public.empresas(cnpj);
CREATE INDEX IF NOT EXISTS idx_empresas_is_demo ON public.empresas(is_demo);
CREATE INDEX IF NOT EXISTS idx_cnpj_demo_usado_cnpj ON public.cnpj_demo_usado(cnpj);