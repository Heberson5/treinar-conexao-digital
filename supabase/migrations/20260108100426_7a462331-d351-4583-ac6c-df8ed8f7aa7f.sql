-- Limpar planos existentes e inserir 4 planos conforme solicitado
DELETE FROM public.planos;

-- Inserir os 4 planos com valores corretos
INSERT INTO public.planos (id, nome, descricao, preco, limite_usuarios, limite_treinamentos, limite_armazenamento_gb, recursos, popular, icone, cor, ativo, ordem, periodo)
VALUES 
  (gen_random_uuid(), 'Básico', 'Ideal para pequenas empresas que estão começando', 99, 3, 10, 5, 
   '[{"id": "usuarios", "habilitado": true, "descricao": "Até 3 usuários"}, {"id": "treinamentos", "habilitado": true, "descricao": "Até 10 treinamentos"}, {"id": "certificados", "habilitado": true, "descricao": "Certificados digitais"}, {"id": "relatorios_basicos", "habilitado": true, "descricao": "Relatórios básicos"}, {"id": "suporte_email", "habilitado": true, "descricao": "Suporte por email"}]'::jsonb,
   false, 'Users', 'bg-slate-500', true, 1, '/mês'),
  
  (gen_random_uuid(), 'Plus', 'Para equipes em crescimento que precisam de mais recursos', 199, 5, 25, 10,
   '[{"id": "usuarios", "habilitado": true, "descricao": "Até 5 usuários"}, {"id": "treinamentos", "habilitado": true, "descricao": "Até 25 treinamentos"}, {"id": "certificados", "habilitado": true, "descricao": "Certificados digitais"}, {"id": "relatorios_basicos", "habilitado": true, "descricao": "Relatórios básicos"}, {"id": "relatorios_avancados", "habilitado": true, "descricao": "Relatórios avançados"}, {"id": "suporte_email", "habilitado": true, "descricao": "Suporte por email"}, {"id": "suporte_prioritario", "habilitado": true, "descricao": "Suporte prioritário"}, {"id": "integracao_calendario", "habilitado": true, "descricao": "Integração com calendário"}]'::jsonb,
   false, 'Zap', 'bg-blue-500', true, 2, '/mês'),
  
  (gen_random_uuid(), 'Premium', 'Solução completa para empresas de médio porte', 399, 15, 50, 25,
   '[{"id": "usuarios", "habilitado": true, "descricao": "Até 15 usuários"}, {"id": "treinamentos", "habilitado": true, "descricao": "Até 50 treinamentos"}, {"id": "certificados", "habilitado": true, "descricao": "Certificados ilimitados"}, {"id": "relatorios_basicos", "habilitado": true, "descricao": "Relatórios básicos"}, {"id": "relatorios_avancados", "habilitado": true, "descricao": "Relatórios avançados"}, {"id": "analytics", "habilitado": true, "descricao": "Analytics completo"}, {"id": "suporte_email", "habilitado": true, "descricao": "Suporte por email"}, {"id": "suporte_prioritario", "habilitado": true, "descricao": "Suporte prioritário"}, {"id": "suporte_24h", "habilitado": true, "descricao": "Suporte 24/7"}, {"id": "integracao_calendario", "habilitado": true, "descricao": "Integração com calendário"}, {"id": "api_integracao", "habilitado": true, "descricao": "API de integração"}, {"id": "gestao_departamentos", "habilitado": true, "descricao": "Gestão de departamentos"}, {"id": "integracao_ia", "habilitado": true, "descricao": "Integração com IA"}]'::jsonb,
   true, 'Crown', 'bg-purple-500', true, 3, '/mês'),
  
  (gen_random_uuid(), 'Enterprise', 'Para grandes empresas com necessidades específicas', 799, 50, 100, 100,
   '[{"id": "usuarios", "habilitado": true, "descricao": "50 usuários + pacotes"}, {"id": "treinamentos", "habilitado": true, "descricao": "Até 100 treinamentos"}, {"id": "certificados", "habilitado": true, "descricao": "Certificados ilimitados"}, {"id": "relatorios_basicos", "habilitado": true, "descricao": "Relatórios básicos"}, {"id": "relatorios_avancados", "habilitado": true, "descricao": "Relatórios avançados"}, {"id": "analytics", "habilitado": true, "descricao": "Analytics completo"}, {"id": "suporte_email", "habilitado": true, "descricao": "Suporte por email"}, {"id": "suporte_prioritario", "habilitado": true, "descricao": "Suporte prioritário"}, {"id": "suporte_24h", "habilitado": true, "descricao": "Suporte 24/7"}, {"id": "suporte_dedicado", "habilitado": true, "descricao": "Suporte dedicado"}, {"id": "integracao_calendario", "habilitado": true, "descricao": "Integração com calendário"}, {"id": "api_integracao", "habilitado": true, "descricao": "API de integração"}, {"id": "gestao_departamentos", "habilitado": true, "descricao": "Gestão de departamentos"}, {"id": "white_label", "habilitado": true, "descricao": "White label"}, {"id": "sla_garantido", "habilitado": true, "descricao": "SLA garantido"}, {"id": "customizacoes", "habilitado": true, "descricao": "Customizações sob demanda"}, {"id": "pacotes_adicionais", "habilitado": true, "descricao": "Pacotes de usuários adicionais"}, {"id": "integracao_ia", "habilitado": true, "descricao": "Integração com IA"}]'::jsonb,
   false, 'Building2', 'bg-amber-500', true, 4, '/mês');

-- Criar tabela para armazenar configurações de integração de IA por empresa
CREATE TABLE IF NOT EXISTS public.configuracoes_ia_empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  provedor_ia TEXT NOT NULL DEFAULT 'gemini' CHECK (provedor_ia IN ('gemini', 'chatgpt', 'deepseek')),
  habilitado BOOLEAN DEFAULT true,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(empresa_id)
);

-- Habilitar RLS
ALTER TABLE public.configuracoes_ia_empresa ENABLE ROW LEVEL SECURITY;

-- Policies para configuracoes_ia_empresa
CREATE POLICY "Admin pode ver configurações de IA da empresa"
  ON public.configuracoes_ia_empresa
  FOR SELECT
  USING (
    eh_admin_ou_master(auth.uid()) OR 
    empresa_id IN (SELECT empresa_id FROM perfis WHERE id = auth.uid())
  );

CREATE POLICY "Admin pode criar/atualizar configurações de IA"
  ON public.configuracoes_ia_empresa
  FOR ALL
  USING (eh_admin_ou_master(auth.uid()));

-- Trigger para atualizar timestamp
CREATE TRIGGER atualizar_config_ia_timestamp
  BEFORE UPDATE ON public.configuracoes_ia_empresa
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_timestamp();