# Plano de implementação

São 4 frentes grandes. Vou executar em ordem de prioridade, em entregas separadas para você validar cada uma antes da próxima.

---

## Frente 1 — Editor Landing Page estilo Canva

**Objetivo:** trocar o editor por seções/forms por uma tela com canvas WYSIWYG onde cada elemento (texto, imagem, botão, ícone, stat, feature) é arrastável, redimensionável e editável inline.

**Abordagem técnica:**
- Modelo de dados: nova coluna `canvas_layout jsonb` em `landing_page_config` armazenando array de seções, cada uma com `elements[]` (id, type, x, y, w, h, content, style, align).
- Biblioteca: `react-rnd` para drag/resize (leve, sem conflito com dnd-kit existente).
- Painel esquerdo: lista de seções (Hero, Stats, Features, Planos, CTA, Footer) + botão "+ adicionar elemento".
- Canvas central: render fiel à landing pública com handles de mover/redimensionar quando selecionado.
- Painel direito (inspector): edição de texto, cor, fonte, alinhamento (esq/centro/dir, topo/meio/base), tamanho, link.
- Toolbar superior: desfazer/refazer, dispositivo (desktop/tablet/mobile), salvar, pré-visualizar.
- Render público: `landing-preview.tsx` lê `canvas_layout` quando existir; fallback para o formato antigo.

**Arquivos:**
- `src/pages/admin/LandingPageEditor.tsx` (refatoração total)
- `src/components/landing/canvas/` (novo: `Canvas.tsx`, `ElementRenderer.tsx`, `Inspector.tsx`, `SectionList.tsx`, `Toolbar.tsx`, `types.ts`)
- `src/components/landing/landing-preview.tsx` (suporte ao novo formato)
- Migration: adiciona `canvas_layout jsonb` em `landing_page_config`
- `bun add react-rnd`

---

## Frente 2 — Automação dos planos na home

**Objetivo:** seção de planos da landing pública refletir automaticamente `planos` ativos do banco (nome, preço, recursos, limites), respeitando `show_annual_toggle`.

**Mudanças:**
- `src/components/landing/landing-preview.tsx` e página pública `Index.tsx`: substituir dados mockados/estáticos por query `from('planos').select('*').eq('ativo', true).order('preco')`.
- Card por plano: nome, preço (mensal/anual conforme toggle), bullets de `recursos` (jsonb), CTA "Assinar" → `/checkout?plano={id}`.
- Destaque visual no plano marcado como `destaque=true` (se coluna existir; senão no de preço médio).
- Loading skeleton + estado vazio.

**Arquivos:** `src/components/landing/landing-plans-section.tsx` (novo), `Index.tsx`, `landing-preview.tsx`.

---

## Frente 3 — Integração Mobizon (SMS)

**Objetivo:** SMS via Mobizon com gatilhos configuráveis: senha provisória, 2FA, lembrete de treinamento agendado, novo treinamento publicado.

**Mudanças:**

1. **Secret:** solicitar `MOBIZON_API_KEY` via formulário seguro quando você confirmar que tem a chave (você respondeu "Ainda não" — então deixo a estrutura pronta e peço a chave quando for ativar).

2. **Edge function `send-sms`:** wrapper Mobizon (`api.mobizon.com.br/service/Message/SendSMSMessage`), recebe `{to, text, trigger}`, registra em `auditoria`.

3. **Tabela `sms_gatilhos`:** `id, tipo (reset_senha | login_2fa | lembrete_treinamento | novo_treinamento), ativo bool, antecedencia_min int, template_texto text, empresa_id`.

4. **Tela "SMS / Mobizon"** dentro de `/admin/integracoes` (nova aba):
   - Status da conexão + botão testar envio
   - Lista de gatilhos com switch ativar/desativar, antecedência (para lembrete), template editável com variáveis ({nome}, {treinamento}, {horario}, {codigo})

5. **Fluxos:**
   - Reset: `password-recovery-form.tsx` ganha opção "Enviar por SMS" → edge function `request-sms-password-reset` gera senha provisória, atualiza usuário (service role), envia SMS.
   - 2FA: após login bem-sucedido, se `perfis.telefone` + 2FA ativo → tela de código, edge function `verify-2fa-code`.
   - Lembrete agendado: cron (`pg_cron`) a cada 5min chama edge `dispatch-sms-reminders` que varre `lembretes` próximos e envia.
   - Novo treinamento: trigger ao publicar (`UPDATE treinamentos SET publicado=true`) enfileira SMS aos usuários autorizados.

**Arquivos:** 3 edge functions, 1 migration, `src/components/integrations/mobizon-sms-card.tsx`, edição em `password-recovery-form.tsx` e `login-form.tsx`, `src/pages/admin/Integracoes.tsx`.

---

## Frente 4 — Corrigir edição de permissões

**Objetivo:** salvar alterações em `/admin/permissoes`.

**Investigação prevista:** ler `src/pages/admin/Permissoes.tsx` + `use-permissions.ts`. Atualmente as permissões estão **hardcoded** em `PERMISSOES_POR_ROLE` no hook — por isso o "salvar" não persiste. Solução:
- Criar tabela `permissoes_role (role tipo_role, permissao_id text, ativo bool)`
- `usePermissions` lê da tabela com cache
- `Permissoes.tsx` salva via upsert
- Master vê tudo, ignora tabela

---

## Ordem de execução

Entrego e paro para você validar a cada frente:

1. **Frente 4** primeiro (rápida, desbloqueia outras telas) — ~1 turno
2. **Frente 2** (automação planos, escopo pequeno) — ~1 turno
3. **Frente 3** (Mobizon: estrutura + tela + 1 fluxo por vez) — ~3 turnos
4. **Frente 1** (Editor Canva, maior complexidade) — ~3-4 turnos

Confirma essa ordem? Se sim, começo agora pela **Frente 4 (permissões)** e **Frente 2 (planos)** no mesmo turno, e seguimos.