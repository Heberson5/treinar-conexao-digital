-- Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Criar tabela para armazenar avaliações dos treinamentos
CREATE TABLE public.avaliacoes_treinamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  treinamento_id UUID NOT NULL REFERENCES public.treinamentos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,
  nota INTEGER NOT NULL CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(treinamento_id, usuario_id)
);

-- Enable RLS
ALTER TABLE public.avaliacoes_treinamentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuario pode criar sua avaliacao"
ON public.avaliacoes_treinamentos
FOR INSERT
WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuario pode atualizar sua avaliacao"
ON public.avaliacoes_treinamentos
FOR UPDATE
USING (usuario_id = auth.uid());

CREATE POLICY "Todos podem ver avaliacoes"
ON public.avaliacoes_treinamentos
FOR SELECT
USING (true);

-- Trigger para atualizar timestamp
CREATE TRIGGER update_avaliacoes_updated_at
BEFORE UPDATE ON public.avaliacoes_treinamentos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar coluna conteudo_html à tabela treinamentos para armazenar o conteúdo completo
ALTER TABLE public.treinamentos 
ADD COLUMN IF NOT EXISTS conteudo_html TEXT;

-- Adicionar coluna media_avaliacao para cache da média
ALTER TABLE public.treinamentos 
ADD COLUMN IF NOT EXISTS media_avaliacao NUMERIC(2,1) DEFAULT 0;

-- Adicionar coluna total_avaliacoes
ALTER TABLE public.treinamentos 
ADD COLUMN IF NOT EXISTS total_avaliacoes INTEGER DEFAULT 0;

-- Função para atualizar média de avaliação
CREATE OR REPLACE FUNCTION public.atualizar_media_avaliacao()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.treinamentos
  SET 
    media_avaliacao = (
      SELECT COALESCE(AVG(nota), 0) 
      FROM public.avaliacoes_treinamentos 
      WHERE treinamento_id = COALESCE(NEW.treinamento_id, OLD.treinamento_id)
    ),
    total_avaliacoes = (
      SELECT COUNT(*) 
      FROM public.avaliacoes_treinamentos 
      WHERE treinamento_id = COALESCE(NEW.treinamento_id, OLD.treinamento_id)
    )
  WHERE id = COALESCE(NEW.treinamento_id, OLD.treinamento_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger para atualizar média automaticamente
CREATE TRIGGER trigger_atualizar_media_avaliacao
AFTER INSERT OR UPDATE OR DELETE ON public.avaliacoes_treinamentos
FOR EACH ROW
EXECUTE FUNCTION public.atualizar_media_avaliacao();