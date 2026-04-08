
-- Adicionar coluna numero em cada tabela (sem constraint unique primeiro)
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.departamentos ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.cargos ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.categorias ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.treinamentos ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.planos ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.plano_contratos ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.pagamentos ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.lembretes ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.questoes_treinamento ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.tentativas_avaliacao ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.progresso_treinamentos ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.avaliacoes_treinamentos ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.atividades ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.auditoria ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.configuracoes_ia_empresa ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.uso_empresa ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.landing_page_config ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.configuracoes_sistema ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.cnpj_demo_usado ADD COLUMN IF NOT EXISTS numero INTEGER;
ALTER TABLE public.usuario_roles ADD COLUMN IF NOT EXISTS numero INTEGER;

-- Atribuir números sequenciais usando ROW_NUMBER
WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.empresas)
UPDATE public.empresas e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.departamentos)
UPDATE public.departamentos e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.cargos)
UPDATE public.cargos e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.categorias)
UPDATE public.categorias e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.treinamentos)
UPDATE public.treinamentos e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.perfis)
UPDATE public.perfis e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.planos)
UPDATE public.planos e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.plano_contratos)
UPDATE public.plano_contratos e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.pagamentos)
UPDATE public.pagamentos e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.lembretes)
UPDATE public.lembretes e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.questoes_treinamento)
UPDATE public.questoes_treinamento e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.tentativas_avaliacao)
UPDATE public.tentativas_avaliacao e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.progresso_treinamentos)
UPDATE public.progresso_treinamentos e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.avaliacoes_treinamentos)
UPDATE public.avaliacoes_treinamentos e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.atividades)
UPDATE public.atividades e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.auditoria)
UPDATE public.auditoria e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.configuracoes_ia_empresa)
UPDATE public.configuracoes_ia_empresa e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY atualizado_em ASC NULLS LAST) as rn FROM public.uso_empresa)
UPDATE public.uso_empresa e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.landing_page_config)
UPDATE public.landing_page_config e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY atualizado_em ASC NULLS LAST) as rn FROM public.configuracoes_sistema)
UPDATE public.configuracoes_sistema e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.cnpj_demo_usado)
UPDATE public.cnpj_demo_usado e SET numero = n.rn FROM n WHERE e.id = n.id;

WITH n AS (SELECT id, ROW_NUMBER() OVER (ORDER BY criado_em ASC NULLS LAST) as rn FROM public.usuario_roles)
UPDATE public.usuario_roles e SET numero = n.rn FROM n WHERE e.id = n.id;

-- Criar sequences e configurar defaults
DO $$
DECLARE
  tbl TEXT;
  max_val INTEGER;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY[
    'empresas','departamentos','cargos','categorias','treinamentos','perfis',
    'planos','plano_contratos','pagamentos','lembretes','questoes_treinamento',
    'tentativas_avaliacao','progresso_treinamentos','avaliacoes_treinamentos',
    'atividades','auditoria','configuracoes_ia_empresa','uso_empresa',
    'landing_page_config','configuracoes_sistema','cnpj_demo_usado','usuario_roles'
  ]) LOOP
    EXECUTE format('CREATE SEQUENCE IF NOT EXISTS public.%I_numero_seq', tbl);
    EXECUTE format('SELECT COALESCE(MAX(numero), 0) FROM public.%I', tbl) INTO max_val;
    IF max_val > 0 THEN
      EXECUTE format('SELECT setval(''public.%I_numero_seq'', %s)', tbl, max_val);
    END IF;
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN numero SET DEFAULT nextval(''public.%I_numero_seq'')', tbl, tbl);
  END LOOP;
END;
$$;
