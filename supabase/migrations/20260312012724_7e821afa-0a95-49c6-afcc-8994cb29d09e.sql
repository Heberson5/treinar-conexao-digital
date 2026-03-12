
-- Table for quiz questions linked to a training
CREATE TABLE public.questoes_treinamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  treinamento_id UUID NOT NULL REFERENCES public.treinamentos(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  opcao_a TEXT NOT NULL,
  opcao_b TEXT NOT NULL,
  opcao_c TEXT,
  opcao_d TEXT,
  resposta_correta TEXT NOT NULL DEFAULT 'a',
  ordem INTEGER NOT NULL DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for user quiz attempts
CREATE TABLE public.tentativas_avaliacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  treinamento_id UUID NOT NULL REFERENCES public.treinamentos(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL,
  respostas JSONB NOT NULL DEFAULT '[]'::jsonb,
  nota NUMERIC NOT NULL DEFAULT 0,
  aprovado BOOLEAN NOT NULL DEFAULT false,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questoes_treinamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tentativas_avaliacao ENABLE ROW LEVEL SECURITY;

-- RLS policies for questoes_treinamento
CREATE POLICY "Todos autenticados podem ver questoes" ON public.questoes_treinamento
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/instrutor podem gerenciar questoes" ON public.questoes_treinamento
  FOR ALL TO authenticated USING (
    eh_admin_ou_master(auth.uid()) OR verificar_role(auth.uid(), 'instrutor'::tipo_role)
  );

-- RLS policies for tentativas_avaliacao
CREATE POLICY "Usuario ve proprias tentativas" ON public.tentativas_avaliacao
  FOR SELECT TO authenticated USING (
    usuario_id = auth.uid() OR eh_admin_ou_master(auth.uid())
  );

CREATE POLICY "Usuario pode criar tentativa" ON public.tentativas_avaliacao
  FOR INSERT TO authenticated WITH CHECK (usuario_id = auth.uid());

-- Add column to treinamentos for minimum grade requirement
ALTER TABLE public.treinamentos ADD COLUMN IF NOT EXISTS nota_minima NUMERIC DEFAULT 7;
ALTER TABLE public.treinamentos ADD COLUMN IF NOT EXISTS avaliacao_obrigatoria BOOLEAN DEFAULT false;
