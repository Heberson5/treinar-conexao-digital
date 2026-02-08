
-- Função security definer para obter empresa_id do usuário (evita recursão)
CREATE OR REPLACE FUNCTION public.get_empresa_id_do_usuario(p_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT empresa_id FROM public.perfis WHERE id = p_user_id LIMIT 1;
$$;

-- 1. FIX: Perfis - restringir visibilidade por empresa
DROP POLICY IF EXISTS "Usuarios podem ver todos os perfis" ON public.perfis;

CREATE POLICY "Usuarios veem perfis da mesma empresa"
ON public.perfis FOR SELECT TO authenticated
USING (
  empresa_id = public.get_empresa_id_do_usuario(auth.uid())
  OR eh_admin_ou_master(auth.uid())
  OR id = auth.uid()
);

-- 2. FIX: Treinamentos - filtrar por empresa
DROP POLICY IF EXISTS "Treinamentos publicados visiveis para todos" ON public.treinamentos;

CREATE POLICY "Treinamentos visiveis para empresa"
ON public.treinamentos FOR SELECT TO authenticated
USING (
  (
    publicado = true AND (
      empresa_id IS NULL  -- modelos globais
      OR empresa_id = public.get_empresa_id_do_usuario(auth.uid())
    )
  )
  OR eh_admin_ou_master(auth.uid())
  OR instrutor_id = auth.uid()
);

-- 3. FIX: Configurações IA - apenas admin/master
DROP POLICY IF EXISTS "Admin pode ver configurações de IA da empresa" ON public.configuracoes_ia_empresa;

CREATE POLICY "Apenas admin pode ver configurações de IA"
ON public.configuracoes_ia_empresa FOR SELECT TO authenticated
USING (eh_admin_ou_master(auth.uid()));
