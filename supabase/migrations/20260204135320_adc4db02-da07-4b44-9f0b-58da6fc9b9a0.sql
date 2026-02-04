-- Tabela de pagamentos para controle financeiro
CREATE TABLE IF NOT EXISTS public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  contrato_id UUID REFERENCES public.plano_contratos(id),
  valor DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  metodo_pagamento TEXT,
  referencia TEXT,
  observacoes TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_empresa ON public.pagamentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON public.pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_vencimento ON public.pagamentos(data_vencimento);

-- Habilitar RLS
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso - apenas master pode ver/gerenciar pagamentos
CREATE POLICY "Master pode ver todos os pagamentos"
ON public.pagamentos
FOR SELECT
TO authenticated
USING (verificar_role(auth.uid(), 'master'::tipo_role));

CREATE POLICY "Master pode gerenciar pagamentos"
ON public.pagamentos
FOR ALL
TO authenticated
USING (verificar_role(auth.uid(), 'master'::tipo_role));

-- Adicionar coluna de bloqueio na tabela empresas
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS bloqueada BOOLEAN DEFAULT false;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS data_bloqueio TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS motivo_bloqueio TEXT;

-- Trigger para atualizar timestamp
CREATE TRIGGER update_pagamentos_updated_at
BEFORE UPDATE ON public.pagamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();