## Escopo

Sete melhorias em diferentes áreas administrativas. Implementarei nessa ordem, com commits lógicos por área.

---

### 1. Lista completa de fusos horários (Configurações → Geral)
- Substituir a lista atual (3 itens) por uma lista completa de timezones IANA, agrupada por região (Américas, Europa, Ásia, África, Oceania, Pacífico, Atlântico, UTC).
- Manter `America/Sao_Paulo` como padrão.

### 2. Logoff automático e bloqueio após tentativas (aba Segurança)
- Adicionar três campos na aba Segurança:
  - **Tempo de inatividade (min)** para logoff automático (default 30).
  - **Logoff ao fechar navegador** (switch — invalida sessão no `beforeunload`).
  - **Tentativas máximas de login** (já existe, mas será aplicado de fato).
  - **Período de bloqueio (h)** após esgotar tentativas (default 24).
- Persistir em `configuracoes_sistema` (novas colunas: `session_timeout_min`, `logoff_on_close`, `tentativas_login_max`, `bloqueio_horas`).
- Criar hook `useIdleLogout` que escuta mouse/teclado/touch, dispara `supabase.auth.signOut()` após N min de inatividade. Integrar em `MainLayout`.
- Criar tabela `tentativas_login` (email, ip, criado_em, sucesso). Edge function `check-login-attempts` consultada antes do `signInWithPassword`. Se atingiu o máximo nas últimas X horas → bloquear até "redefinir senha" (reset por email zera contagem) ou expirar janela.
- Mensagem clara ao usuário: "Conta bloqueada por excesso de tentativas. Redefina sua senha ou tente novamente em HH:MM."

### 3. Filtro por data na aba Auditoria
- Adicionar dois `DatePicker` (de/até) + botão "Hoje" / "Limpar".
- Default: data atual (00:00 → 23:59).
- Filtrar `criado_em` no Supabase + combinar com busca textual existente.

### 4. Configuração de Backup
- Na aba Backup, adicionar:
  - Select **Destino**: `Local (download)`, `Lovable Cloud Storage`, `Google Drive (link)`, `Dropbox (link)`, `S3 (URL)`.
  - Campo condicional de **URL/Token** quando destino externo.
  - **Pasta/Bucket** de destino.
  - Botão "Testar conexão" e "Executar backup agora".
- Persistir em `configuracoes_sistema` (`backup_destino`, `backup_config jsonb`).
- Backup local: gera JSON com dump das tabelas principais e baixa no browser (já é o que dá pra fazer client-side sem servidor de cron — destinos externos guardam apenas a configuração; execução automática real exigiria edge function agendada, fora do escopo).

### 5. Landing Page Editor — drag & drop e alinhamento
- Refatorar `LandingPageEditor.tsx` para usar `@dnd-kit/sortable` (já listo no projeto? se não, instalar).
- Cada seção (Hero, Stats, Features, Trainings, CTA, **Footer novo**) vira um bloco arrastável.
- Dentro de cada seção, elementos editáveis (título, subtítulo, badge, CTAs, ícones) com:
  - Edição inline (clique para editar).
  - Controles de **alinhamento horizontal** (esq/centro/dir) e **vertical** (topo/meio/base) via toggle group, salvos em `alignment: { h, v }` no JSON da seção.
  - Botão "mover para cima/baixo" além do drag.
- Renderizar essas configurações em `landing-preview.tsx` aplicando classes Tailwind (`text-left/center/right`, `items-start/center/end`).

### 6. Seção faltante após CTA Final
- Adicionar **Footer Section** ao schema da landing page (`footer_section jsonb`): logo, descrição, links (Sobre, Termos, Contato), redes sociais, copyright.
- Renderizar abaixo do CTA em `landing-preview.tsx` e na home pública.
- Tornar editável no editor.

### 7. Termos de Uso reformulados (jurídico)
- Reescrever `landing_page_config.termos_de_uso` com um texto completo estilo jurídico brasileiro:
  - Preâmbulo, Definições, Objeto, Cadastro e Conta, Licença de uso, Obrigações do usuário, Propriedade intelectual, Pagamentos e cancelamento, Suspensão e rescisão, Limitação de responsabilidade, LGPD e privacidade, Confidencialidade, Comunicações, Alterações, Foro, Disposições finais.
  - Formatação Markdown com numeração (Cláusula 1ª, 1.1, 1.1.1) e cabeçalhos hierárquicos.
- Atualizar via `UPDATE` na tabela.

---

## Detalhes técnicos

**Migrations necessárias:**
1. `configuracoes_sistema`: novas colunas `session_timeout_min int default 30`, `logoff_on_close bool default false`, `tentativas_login_max int default 5`, `bloqueio_horas int default 24`, `backup_destino text default 'local'`, `backup_config jsonb default '{}'`.
2. `landing_page_config`: nova coluna `footer_section jsonb default '{...}'`, `sections_order jsonb default '[]'`, e cada seção JSON ganha campo `alignment`.
3. Nova tabela `tentativas_login` (email text, ip text, sucesso bool, criado_em timestamptz). RLS: insert público (auth), select master.
4. Função `pode_tentar_login(p_email text)` returns bool — verifica janela de bloqueio.

**Edge functions:**
- `check-login-attempts` — chamada antes do login para validar bloqueio (usa service role, lê `tentativas_login` e `configuracoes_sistema`).
- `record-login-attempt` — registra cada tentativa.

**Arquivos a criar:**
- `src/lib/timezones.ts` (lista completa IANA)
- `src/hooks/use-idle-logout.ts`
- `src/components/landing/sortable-section.tsx`
- `src/components/landing/alignment-controls.tsx`
- `src/components/landing/footer-section-editor.tsx`
- `supabase/functions/check-login-attempts/index.ts`
- `supabase/functions/record-login-attempt/index.ts`

**Arquivos a editar:**
- `src/pages/admin/Configuracoes.tsx` (timezone list, aba Segurança nova, aba Auditoria filtro data, aba Backup destino)
- `src/components/auth/login-form.tsx` (chamar edge function antes/depois do login)
- `src/components/layout/main-layout.tsx` (hook de inatividade)
- `src/pages/admin/LandingPageEditor.tsx` (dnd + alignment + footer)
- `src/components/landing/landing-preview.tsx` (render alinhamento + footer)
- `src/pages/Index.tsx` (footer público)

## Confirmação

Posso prosseguir com tudo? Se algum item for prioridade diferente (ex.: "faça só 1, 2 e 3 agora"), me avise.