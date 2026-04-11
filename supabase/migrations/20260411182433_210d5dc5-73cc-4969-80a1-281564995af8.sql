
CREATE TABLE public.configuracoes_menu (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_config jsonb DEFAULT '[]'::jsonb,
  field_config jsonb DEFAULT '[]'::jsonb,
  report_layout jsonb DEFAULT '{}'::jsonb,
  atualizado_em timestamp with time zone DEFAULT now(),
  criado_em timestamp with time zone DEFAULT now()
);

ALTER TABLE public.configuracoes_menu ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ler config menu"
  ON public.configuracoes_menu FOR SELECT
  USING (true);

CREATE POLICY "Master pode gerenciar config menu"
  ON public.configuracoes_menu FOR ALL
  USING (verificar_role(auth.uid(), 'master'::tipo_role));

-- Insert default row
INSERT INTO public.configuracoes_menu (menu_config, field_config, report_layout)
VALUES ('[]'::jsonb, '[]'::jsonb, '{}'::jsonb);
