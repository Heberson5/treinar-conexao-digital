-- Adicionar colunas para controle de troca de senha na tabela perfis
ALTER TABLE public.perfis 
ADD COLUMN IF NOT EXISTS trocar_senha_primeiro_login boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS dias_para_trocar_senha integer DEFAULT NULL,
ADD COLUMN IF NOT EXISTS data_ultima_troca_senha timestamp with time zone DEFAULT NULL,
ADD COLUMN IF NOT EXISTS data_proxima_troca_senha timestamp with time zone DEFAULT NULL;

-- Criar tabela de cargos da empresa
CREATE TABLE IF NOT EXISTS public.cargos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text,
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE,
  ativo boolean DEFAULT true,
  criado_em timestamp with time zone DEFAULT now(),
  atualizado_em timestamp with time zone DEFAULT now()
);

-- Habilitar RLS na tabela cargos
ALTER TABLE public.cargos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cargos
CREATE POLICY "Cargos visiveis para usuarios autenticados" 
ON public.cargos 
FOR SELECT 
USING (true);

CREATE POLICY "Apenas admin/master podem criar cargos" 
ON public.cargos 
FOR INSERT 
WITH CHECK (eh_admin_ou_master(auth.uid()));

CREATE POLICY "Apenas admin/master podem atualizar cargos" 
ON public.cargos 
FOR UPDATE 
USING (eh_admin_ou_master(auth.uid()));

CREATE POLICY "Apenas admin/master podem deletar cargos" 
ON public.cargos 
FOR DELETE 
USING (eh_admin_ou_master(auth.uid()));

-- Trigger para atualizar data de atualização
CREATE TRIGGER update_cargos_updated_at
BEFORE UPDATE ON public.cargos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir alguns cargos padrão (sem empresa_id, ou seja, globais)
INSERT INTO public.cargos (nome, descricao, empresa_id) VALUES
('Administrador', 'Responsável pela gestão do sistema', NULL),
('Analista de RH', 'Responsável pelos recursos humanos', NULL),
('Gerente', 'Responsável pela gestão de equipes', NULL),
('Supervisor', 'Responsável pela supervisão de atividades', NULL),
('Colaborador', 'Funcionário geral da empresa', NULL)
ON CONFLICT DO NOTHING;