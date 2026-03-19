ALTER TABLE public.questoes_treinamento 
  ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'quiz',
  ADD COLUMN IF NOT EXISTS opcoes jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS valor_minimo numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_maximo numeric DEFAULT 10,
  ADD COLUMN IF NOT EXISTS passo numeric DEFAULT 1;

ALTER TABLE public.treinamentos
  ADD COLUMN IF NOT EXISTS tempo_avaliacao_minutos integer DEFAULT 0;