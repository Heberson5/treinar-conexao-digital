
-- ============================================================
-- 1) Helper: is caller an admin of the same empresa as target user
-- ============================================================
CREATE OR REPLACE FUNCTION public.mesma_empresa_que_usuario(p_usuario_alvo uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.verificar_role(auth.uid(), 'master'::public.tipo_role)
    OR (
      public.verificar_role(auth.uid(), 'admin'::public.tipo_role)
      AND EXISTS (
        SELECT 1 FROM public.perfis alvo
        WHERE alvo.id = p_usuario_alvo
          AND alvo.empresa_id IS NOT NULL
          AND alvo.empresa_id = public.get_empresa_id_do_usuario(auth.uid())
      )
    );
$$;

REVOKE ALL ON FUNCTION public.mesma_empresa_que_usuario(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mesma_empresa_que_usuario(uuid) TO authenticated;

-- ============================================================
-- 2) configuracoes_sistema: restrict SELECT to authenticated
-- ============================================================
DROP POLICY IF EXISTS "Todos podem ler config sistema" ON public.configuracoes_sistema;
CREATE POLICY "Autenticados podem ler config sistema"
  ON public.configuracoes_sistema FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================
-- 3) avaliacoes_treinamentos: authenticated only
-- ============================================================
DROP POLICY IF EXISTS "Todos podem ver avaliacoes" ON public.avaliacoes_treinamentos;
DROP POLICY IF EXISTS "Usuario pode atualizar sua avaliacao" ON public.avaliacoes_treinamentos;
DROP POLICY IF EXISTS "Usuario pode criar sua avaliacao" ON public.avaliacoes_treinamentos;

CREATE POLICY "Autenticados veem avaliacoes"
  ON public.avaliacoes_treinamentos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuario cria propria avaliacao"
  ON public.avaliacoes_treinamentos FOR INSERT
  TO authenticated
  WITH CHECK (usuario_id = auth.uid());

CREATE POLICY "Usuario atualiza propria avaliacao"
  ON public.avaliacoes_treinamentos FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());

-- ============================================================
-- 4) cargos: authenticated only
-- ============================================================
DROP POLICY IF EXISTS "Cargos visiveis para usuarios autenticados" ON public.cargos;
DROP POLICY IF EXISTS "Apenas admin/master podem criar cargos" ON public.cargos;
DROP POLICY IF EXISTS "Apenas admin/master podem atualizar cargos" ON public.cargos;
DROP POLICY IF EXISTS "Apenas admin/master podem deletar cargos" ON public.cargos;

CREATE POLICY "Autenticados veem cargos"
  ON public.cargos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin/master criam cargos"
  ON public.cargos FOR INSERT
  TO authenticated
  WITH CHECK (
    public.verificar_role(auth.uid(), 'master'::public.tipo_role)
    OR (public.verificar_role(auth.uid(), 'admin'::public.tipo_role)
        AND (empresa_id IS NULL OR empresa_id = public.get_empresa_id_do_usuario(auth.uid())))
  );

CREATE POLICY "Admin/master atualizam cargos"
  ON public.cargos FOR UPDATE
  TO authenticated
  USING (
    public.verificar_role(auth.uid(), 'master'::public.tipo_role)
    OR (public.verificar_role(auth.uid(), 'admin'::public.tipo_role)
        AND (empresa_id IS NULL OR empresa_id = public.get_empresa_id_do_usuario(auth.uid())))
  );

CREATE POLICY "Admin/master deletam cargos"
  ON public.cargos FOR DELETE
  TO authenticated
  USING (
    public.verificar_role(auth.uid(), 'master'::public.tipo_role)
    OR (public.verificar_role(auth.uid(), 'admin'::public.tipo_role)
        AND (empresa_id IS NULL OR empresa_id = public.get_empresa_id_do_usuario(auth.uid())))
  );

-- ============================================================
-- 5) categorias: scope admin write/read to company where applicable
-- ============================================================
DROP POLICY IF EXISTS "Admin/master podem atualizar categorias" ON public.categorias;
DROP POLICY IF EXISTS "Admin/master podem criar categorias" ON public.categorias;
DROP POLICY IF EXISTS "Admin/master podem deletar categorias" ON public.categorias;

CREATE POLICY "Admin/master criam categorias"
  ON public.categorias FOR INSERT
  TO authenticated
  WITH CHECK (
    public.verificar_role(auth.uid(), 'master'::public.tipo_role)
    OR (public.verificar_role(auth.uid(), 'admin'::public.tipo_role)
        AND (empresa_id IS NULL OR empresa_id = public.get_empresa_id_do_usuario(auth.uid())))
  );

CREATE POLICY "Admin/master atualizam categorias"
  ON public.categorias FOR UPDATE
  TO authenticated
  USING (
    public.verificar_role(auth.uid(), 'master'::public.tipo_role)
    OR (public.verificar_role(auth.uid(), 'admin'::public.tipo_role)
        AND (empresa_id IS NULL OR empresa_id = public.get_empresa_id_do_usuario(auth.uid())))
  );

CREATE POLICY "Admin/master deletam categorias"
  ON public.categorias FOR DELETE
  TO authenticated
  USING (
    public.verificar_role(auth.uid(), 'master'::public.tipo_role)
    OR (public.verificar_role(auth.uid(), 'admin'::public.tipo_role)
        AND (empresa_id IS NULL OR empresa_id = public.get_empresa_id_do_usuario(auth.uid())))
  );

-- ============================================================
-- 6) atividades / auditoria / progresso / tentativas_avaliacao:
--    admin scope must be same empresa as target user
-- ============================================================
DROP POLICY IF EXISTS "Usuario ve proprias atividades" ON public.atividades;
CREATE POLICY "Usuario ve proprias atividades"
  ON public.atividades FOR SELECT
  TO authenticated
  USING (
    usuario_id = auth.uid()
    OR public.mesma_empresa_que_usuario(usuario_id)
  );

DROP POLICY IF EXISTS "Admin pode ver auditoria da empresa" ON public.auditoria;
CREATE POLICY "Admin ve auditoria da empresa"
  ON public.auditoria FOR SELECT
  TO authenticated
  USING (public.mesma_empresa_que_usuario(usuario_id));

DROP POLICY IF EXISTS "Usuario ve proprio progresso" ON public.progresso_treinamentos;
CREATE POLICY "Usuario ve proprio progresso"
  ON public.progresso_treinamentos FOR SELECT
  TO authenticated
  USING (
    usuario_id = auth.uid()
    OR public.mesma_empresa_que_usuario(usuario_id)
  );

DROP POLICY IF EXISTS "Usuario ve proprias tentativas" ON public.tentativas_avaliacao;
CREATE POLICY "Usuario ve proprias tentativas"
  ON public.tentativas_avaliacao FOR SELECT
  TO authenticated
  USING (
    usuario_id = auth.uid()
    OR public.mesma_empresa_que_usuario(usuario_id)
  );

-- ============================================================
-- 7) questoes_treinamento: hide resposta_correta from regular users
--    Regular users MUST use the RPCs below.
-- ============================================================
DROP POLICY IF EXISTS "Todos autenticados podem ver questoes" ON public.questoes_treinamento;

CREATE POLICY "Admin/instrutor veem questoes"
  ON public.questoes_treinamento FOR SELECT
  TO authenticated
  USING (
    public.eh_admin_ou_master(auth.uid())
    OR public.verificar_role(auth.uid(), 'instrutor'::public.tipo_role)
  );

-- RPC: return questions WITHOUT resposta_correta
CREATE OR REPLACE FUNCTION public.obter_questoes_avaliacao(p_treinamento_id uuid)
RETURNS TABLE (
  id uuid,
  treinamento_id uuid,
  pergunta text,
  opcao_a text,
  opcao_b text,
  opcao_c text,
  opcao_d text,
  opcoes jsonb,
  ordem integer,
  tipo text,
  valor_minimo numeric,
  valor_maximo numeric,
  passo numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT q.id, q.treinamento_id, q.pergunta,
         q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d,
         q.opcoes, q.ordem, q.tipo,
         q.valor_minimo, q.valor_maximo, q.passo
  FROM public.questoes_treinamento q
  WHERE q.treinamento_id = p_treinamento_id
    AND auth.uid() IS NOT NULL
  ORDER BY q.ordem;
$$;

REVOKE ALL ON FUNCTION public.obter_questoes_avaliacao(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.obter_questoes_avaliacao(uuid) TO authenticated;

-- RPC: grade answers server-side and insert tentativa
CREATE OR REPLACE FUNCTION public.corrigir_avaliacao(
  p_treinamento_id uuid,
  p_respostas jsonb,
  p_duracao_segundos integer,
  p_tempo_estudo_segundos integer,
  p_nota_minima numeric DEFAULT 7
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_total integer := 0;
  v_acertos integer := 0;
  v_detalhes jsonb := '{}'::jsonb;
  v_gabarito jsonb := '{}'::jsonb;
  v_q record;
  v_resp text;
  v_correta boolean;
  v_nota numeric;
  v_aprovado boolean;
  v_numero integer;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Não autenticado';
  END IF;

  FOR v_q IN
    SELECT id, tipo, resposta_correta
    FROM public.questoes_treinamento
    WHERE treinamento_id = p_treinamento_id
  LOOP
    v_total := v_total + 1;
    v_resp := COALESCE(p_respostas ->> v_q.id::text, '');
    v_correta := false;

    IF v_q.tipo IN ('resposta-curta') THEN
      v_correta := lower(btrim(v_resp)) = lower(btrim(COALESCE(v_q.resposta_correta,'')));
    ELSE
      v_correta := v_resp = COALESCE(v_q.resposta_correta,'');
    END IF;

    IF v_correta THEN v_acertos := v_acertos + 1; END IF;
    v_detalhes := v_detalhes || jsonb_build_object(v_q.id::text, v_correta);
    v_gabarito := v_gabarito || jsonb_build_object(v_q.id::text, v_q.resposta_correta);
  END LOOP;

  v_nota := CASE WHEN v_total > 0 THEN (v_acertos::numeric / v_total) * 10 ELSE 0 END;
  v_aprovado := v_nota >= COALESCE(p_nota_minima, 7);

  SELECT COUNT(*) + 1 INTO v_numero
  FROM public.tentativas_avaliacao
  WHERE treinamento_id = p_treinamento_id AND usuario_id = v_uid;

  INSERT INTO public.tentativas_avaliacao (
    treinamento_id, usuario_id, respostas, nota, aprovado,
    duracao_segundos, tempo_estudo_segundos, numero_tentativa
  ) VALUES (
    p_treinamento_id, v_uid,
    (SELECT jsonb_agg(jsonb_build_object('questao_id', k, 'resposta', p_respostas->>k))
       FROM jsonb_object_keys(p_respostas) k),
    v_nota, v_aprovado,
    COALESCE(p_duracao_segundos,0), COALESCE(p_tempo_estudo_segundos,0),
    v_numero
  );

  RETURN jsonb_build_object(
    'nota', v_nota,
    'aprovado', v_aprovado,
    'total', v_total,
    'acertos', v_acertos,
    'detalhes', v_detalhes,
    'gabarito', v_gabarito,
    'numero_tentativa', v_numero
  );
END;
$$;

REVOKE ALL ON FUNCTION public.corrigir_avaliacao(uuid, jsonb, integer, integer, numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.corrigir_avaliacao(uuid, jsonb, integer, integer, numeric) TO authenticated;

-- ============================================================
-- 8) tentativas_login: restrict INSERT to own email + register via RPC only
-- ============================================================
DROP POLICY IF EXISTS "Sistema insere tentativas" ON public.tentativas_login;
-- Deny direct client inserts; RPC (SECURITY DEFINER) still works
CREATE POLICY "Bloquear inserts diretos de tentativas"
  ON public.tentativas_login FOR INSERT
  TO authenticated
  WITH CHECK (
    lower(btrim(email)) = lower(btrim(COALESCE((auth.jwt() ->> 'email'), '')))
  );

-- ============================================================
-- 9) Storage bucket avatars: remove permissive listing policy.
--    Public bucket CDN URLs continue to work.
-- ============================================================
DROP POLICY IF EXISTS "Public can read avatars" ON storage.objects;
CREATE POLICY "Authenticated can read avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');

-- ============================================================
-- 10) Revoke EXECUTE on internal SECURITY DEFINER functions from anon
--     (linter: SECURITY DEFINER function callable by anon/authenticated)
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.eh_admin_ou_master(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_empresa_id_do_usuario(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.verificar_role(uuid, public.tipo_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.pode_gerenciar_usuario_alvo(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.listar_usuarios_visiveis_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.criar_contrato_plano(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.copiar_modelos_para_empresa(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.verificar_limite_treinamentos(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.verificar_limite_usuarios(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.verificar_demo_expirada(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.registrar_cnpj_demo(text, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.registrar_tentativa_login(text, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.pode_tentar_login(text) FROM PUBLIC, anon;
-- keep verificar_cnpj_demo_disponivel available to anon: it is called during pre-signup

-- Trigger-only functions: strip execute for all API roles
REVOKE EXECUTE ON FUNCTION public.atualizar_timestamp() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.atualizar_uso_treinamentos() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_empresa_created() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validar_limite_treinamento() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validar_limite_usuarios() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.criar_perfil_usuario() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.atualizar_media_avaliacao() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- ============================================================
-- 11) Deduplicate MP payments: add UNIQUE on pagamentos.referencia (payment id)
-- ============================================================
CREATE UNIQUE INDEX IF NOT EXISTS pagamentos_referencia_key
  ON public.pagamentos (referencia)
  WHERE referencia IS NOT NULL;
