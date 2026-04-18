-- Tabela para armazenar inscrições de Web Push por dispositivo/usuário
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT push_subscriptions_endpoint_unique UNIQUE (endpoint)
);

CREATE INDEX IF NOT EXISTS push_subscriptions_usuario_idx
  ON public.push_subscriptions (usuario_id);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Usuário gerencia (ver/criar/atualizar/excluir) apenas as próprias inscrições
CREATE POLICY "Usuario ve proprias push_subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid() OR public.eh_admin_ou_master(auth.uid()));

CREATE POLICY "Usuario cria propria push_subscription"
  ON public.push_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuario atualiza propria push_subscription"
  ON public.push_subscriptions
  FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuario deleta propria push_subscription"
  ON public.push_subscriptions
  FOR DELETE
  TO authenticated
  USING (usuario_id = auth.uid() OR public.eh_admin_ou_master(auth.uid()));

-- Trigger para atualizar timestamp
CREATE TRIGGER push_subscriptions_set_updated
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();