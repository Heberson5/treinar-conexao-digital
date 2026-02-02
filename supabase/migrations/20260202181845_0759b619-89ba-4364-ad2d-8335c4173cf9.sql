-- Função para copiar modelos globais de treinamento para uma empresa
CREATE OR REPLACE FUNCTION public.copiar_modelos_para_empresa(p_empresa_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Inserir cópias dos modelos globais (empresa_id IS NULL) como rascunho para a nova empresa
  INSERT INTO public.treinamentos (
    titulo,
    descricao,
    categoria,
    nivel,
    duracao_minutos,
    obrigatorio,
    publicado,
    empresa_id,
    thumbnail_url,
    conteudo_html
  )
  SELECT
    titulo,
    descricao,
    categoria,
    nivel,
    duracao_minutos,
    false, -- não obrigatório por padrão
    false, -- rascunho
    p_empresa_id,
    thumbnail_url,
    conteudo_html
  FROM public.treinamentos
  WHERE empresa_id IS NULL
    AND publicado = false; -- Apenas modelos que estão como rascunho (modelos base)
END;
$$;

-- Trigger para executar automaticamente quando uma empresa é criada
CREATE OR REPLACE FUNCTION public.on_empresa_created()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Copiar modelos para a nova empresa
  PERFORM public.copiar_modelos_para_empresa(NEW.id);
  RETURN NEW;
END;
$$;

-- Criar trigger na tabela empresas
DROP TRIGGER IF EXISTS trigger_copiar_modelos_empresa ON public.empresas;
CREATE TRIGGER trigger_copiar_modelos_empresa
  AFTER INSERT ON public.empresas
  FOR EACH ROW
  EXECUTE FUNCTION public.on_empresa_created();

-- Adicionar coluna para add-ons de treinamentos extras
ALTER TABLE public.plano_contratos
ADD COLUMN IF NOT EXISTS treinamentos_extras integer DEFAULT 0;

-- Atualizar função de verificar limite para considerar extras
CREATE OR REPLACE FUNCTION public.verificar_limite_treinamentos(p_empresa_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_limite INTEGER;
  v_extras INTEGER;
  v_atual INTEGER;
BEGIN
  -- Buscar limite do contrato ativo + extras
  SELECT 
    limite_treinamentos,
    COALESCE(treinamentos_extras, 0)
  INTO v_limite, v_extras
  FROM public.plano_contratos
  WHERE empresa_id = p_empresa_id AND ativo = true
  LIMIT 1;
  
  -- Se não tem contrato, usar limite padrão de 5
  IF v_limite IS NULL THEN
    v_limite := 5;
    v_extras := 0;
  END IF;
  
  -- Contar treinamentos publicados atuais (rascunhos não contam)
  SELECT COUNT(*) INTO v_atual
  FROM public.treinamentos
  WHERE empresa_id = p_empresa_id
    AND publicado = true;
  
  RETURN v_atual < (v_limite + v_extras);
END;
$$;

-- Função para verificar limite de usuários
CREATE OR REPLACE FUNCTION public.verificar_limite_usuarios(p_empresa_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_limite INTEGER;
  v_atual INTEGER;
BEGIN
  -- Buscar limite do contrato ativo
  SELECT limite_usuarios INTO v_limite
  FROM public.plano_contratos
  WHERE empresa_id = p_empresa_id AND ativo = true
  LIMIT 1;
  
  -- Se não tem contrato, usar limite padrão de 5
  IF v_limite IS NULL THEN
    v_limite := 5;
  END IF;
  
  -- Contar usuários ativos da empresa
  SELECT COUNT(*) INTO v_atual
  FROM public.perfis
  WHERE empresa_id = p_empresa_id
    AND ativo = true;
  
  RETURN v_atual < v_limite;
END;
$$;

-- Trigger para validar limite de usuários ao inserir perfil
CREATE OR REPLACE FUNCTION public.validar_limite_usuarios()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.empresa_id IS NOT NULL AND NEW.ativo = true THEN
    IF NOT public.verificar_limite_usuarios(NEW.empresa_id) THEN
      RAISE EXCEPTION 'Limite de usuários atingido para esta empresa. Faça upgrade do plano.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Criar trigger de validação de usuários
DROP TRIGGER IF EXISTS trigger_validar_limite_usuarios ON public.perfis;
CREATE TRIGGER trigger_validar_limite_usuarios
  BEFORE INSERT ON public.perfis
  FOR EACH ROW
  EXECUTE FUNCTION public.validar_limite_usuarios();

-- Tabela para configurações da landing page (Master only)
CREATE TABLE IF NOT EXISTS public.landing_page_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text DEFAULT 'A Plataforma de Treinamentos do Futuro',
  hero_subtitle text DEFAULT 'Capacite sua equipe com treinamentos interativos, gamificados e com certificação.',
  hero_badge text DEFAULT '🚀 Transforme sua equipe hoje mesmo',
  hero_cta_primary text DEFAULT 'Comece Agora Grátis',
  hero_cta_secondary text DEFAULT 'Ver Demonstração',
  hero_background_color text DEFAULT 'from-primary via-primary-glow to-primary-darker',
  stats_section jsonb DEFAULT '[
    {"value": "50,000+", "label": "Funcionários Treinados", "icon": "Users", "color": "text-blue-600"},
    {"value": "1,500+", "label": "Empresas Atendidas", "icon": "Building", "color": "text-green-600"},
    {"value": "300+", "label": "Cursos Disponíveis", "icon": "BookOpen", "color": "text-purple-600"},
    {"value": "98%", "label": "Taxa de Satisfação", "icon": "Star", "color": "text-yellow-600"}
  ]'::jsonb,
  features_section jsonb DEFAULT '[
    {"title": "Plataforma Segura", "description": "Seus dados protegidos com criptografia de ponta", "icon": "Shield", "color": "bg-blue-100 text-blue-600"},
    {"title": "Aprendizado Rápido", "description": "Metodologia otimizada para máxima retenção", "icon": "Zap", "color": "bg-yellow-100 text-yellow-600"},
    {"title": "Certificação", "description": "Certificados reconhecidos pelo mercado", "icon": "Award", "color": "bg-green-100 text-green-600"}
  ]'::jsonb,
  cta_title text DEFAULT 'Pronto para transformar sua equipe?',
  cta_subtitle text DEFAULT 'Junte-se a milhares de empresas que já revolucionaram seus treinamentos conosco',
  company_name text DEFAULT 'Sauberlich System',
  company_description text DEFAULT 'A plataforma mais avançada para treinamentos corporativos.',
  logo_url text,
  show_annual_toggle boolean DEFAULT false,
  featured_trainings_enabled boolean DEFAULT true,
  custom_css text,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now()
);

-- RLS para landing_page_config (apenas Master pode modificar)
ALTER TABLE public.landing_page_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ler configurações da landing page"
ON public.landing_page_config
FOR SELECT
USING (true);

CREATE POLICY "Apenas master pode modificar landing page"
ON public.landing_page_config
FOR ALL
USING (verificar_role(auth.uid(), 'master'::tipo_role));

-- Inserir configuração padrão se não existir
INSERT INTO public.landing_page_config (id)
SELECT gen_random_uuid()
WHERE NOT EXISTS (SELECT 1 FROM public.landing_page_config);

-- Trigger para atualizar timestamp
CREATE TRIGGER update_landing_page_config_timestamp
  BEFORE UPDATE ON public.landing_page_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();