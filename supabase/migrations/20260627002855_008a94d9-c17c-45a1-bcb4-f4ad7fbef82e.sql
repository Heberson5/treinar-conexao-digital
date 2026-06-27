
-- Tabela para persistir permissões customizadas por papel
CREATE TABLE IF NOT EXISTS public.permissoes_role (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.empresas(id) ON DELETE CASCADE,
  role public.tipo_role NOT NULL,
  permissao_id text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (empresa_id, role, permissao_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.permissoes_role TO authenticated;
GRANT ALL ON public.permissoes_role TO service_role;

ALTER TABLE public.permissoes_role ENABLE ROW LEVEL SECURITY;

-- Todos autenticados podem ler (necessário para usePermissions resolver permissões no carregamento)
CREATE POLICY "Permissoes legivel por autenticados"
ON public.permissoes_role FOR SELECT
TO authenticated
USING (
  empresa_id IS NULL
  OR empresa_id = public.get_empresa_id_do_usuario(auth.uid())
  OR public.verificar_role(auth.uid(), 'master'::tipo_role)
);

-- Apenas Master ou Admin da empresa pode gravar
CREATE POLICY "Permissoes gerenciaveis por admin/master"
ON public.permissoes_role FOR INSERT
TO authenticated
WITH CHECK (
  public.verificar_role(auth.uid(), 'master'::tipo_role)
  OR (public.eh_admin_ou_master(auth.uid()) AND empresa_id = public.get_empresa_id_do_usuario(auth.uid()))
);

CREATE POLICY "Permissoes atualizaveis por admin/master"
ON public.permissoes_role FOR UPDATE
TO authenticated
USING (
  public.verificar_role(auth.uid(), 'master'::tipo_role)
  OR (public.eh_admin_ou_master(auth.uid()) AND empresa_id = public.get_empresa_id_do_usuario(auth.uid()))
);

CREATE POLICY "Permissoes deletaveis por admin/master"
ON public.permissoes_role FOR DELETE
TO authenticated
USING (
  public.verificar_role(auth.uid(), 'master'::tipo_role)
  OR (public.eh_admin_ou_master(auth.uid()) AND empresa_id = public.get_empresa_id_do_usuario(auth.uid()))
);

CREATE TRIGGER trg_permissoes_role_atualizado_em
BEFORE UPDATE ON public.permissoes_role
FOR EACH ROW EXECUTE FUNCTION public.atualizar_timestamp();
