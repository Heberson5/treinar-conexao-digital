
-- Tabela de eventos detalhados de execução de treinamento/avaliação
CREATE TABLE IF NOT EXISTS public.tentativas_eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL,
  treinamento_id uuid NOT NULL,
  tipo_evento text NOT NULL, -- 'estudo_iniciado','estudo_pausado','estudo_retomado','avaliacao_iniciada','avaliacao_violacao','avaliacao_reiniciada','avaliacao_finalizada'
  detalhes jsonb DEFAULT '{}'::jsonb,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tentativas_eventos_user_tre ON public.tentativas_eventos(usuario_id, treinamento_id);
CREATE INDEX IF NOT EXISTS idx_tentativas_eventos_tipo ON public.tentativas_eventos(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_tentativas_eventos_criado ON public.tentativas_eventos(criado_em DESC);

ALTER TABLE public.tentativas_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuario cria proprios eventos" ON public.tentativas_eventos
  FOR INSERT TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuario ve proprios eventos" ON public.tentativas_eventos
  FOR SELECT TO authenticated
  USING (usuario_id = auth.uid() OR public.eh_admin_ou_master(auth.uid()));

-- Campos extras nas tentativas para enriquecer relatórios
ALTER TABLE public.tentativas_avaliacao
  ADD COLUMN IF NOT EXISTS duracao_segundos integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tempo_estudo_segundos integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS numero_tentativa integer DEFAULT 1;
