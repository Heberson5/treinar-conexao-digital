
CREATE TABLE public.categorias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  ativo boolean DEFAULT true,
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE,
  criado_em timestamptz DEFAULT now(),
  atualizado_em timestamptz DEFAULT now()
);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categorias visiveis para autenticados" ON public.categorias
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin/master podem criar categorias" ON public.categorias
  FOR INSERT TO authenticated WITH CHECK (eh_admin_ou_master(auth.uid()));

CREATE POLICY "Admin/master podem atualizar categorias" ON public.categorias
  FOR UPDATE TO authenticated USING (eh_admin_ou_master(auth.uid()));

CREATE POLICY "Admin/master podem deletar categorias" ON public.categorias
  FOR DELETE TO authenticated USING (eh_admin_ou_master(auth.uid()));

INSERT INTO public.categorias (nome) VALUES
  ('Onboarding'),
  ('Segurança'),
  ('Compliance'),
  ('Vendas'),
  ('Atendimento'),
  ('Liderança'),
  ('Técnico'),
  ('Soft Skills'),
  ('Outros');
