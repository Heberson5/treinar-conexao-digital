import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AuditLogEntry {
  id: string;
  action: "created" | "updated" | "started" | "paused" | "completed" | "accessed";
  timestamp: string;
  userId?: string;
  userName?: string;
  details: {
    [key: string]: any;
  };
  description: string;
}

export interface Training {
  id: number;
  titulo: string;
  subtitulo?: string;
  descricao: string;
  texto?: string;
  videoUrl?: string;
  categoria: string;
  duracao: string;
  status: "ativo" | "inativo" | "rascunho";
  participantes: number;
  criadoEm: string;
  instrutor: string;
  fotos: string[];
  arquivos: string[];
  capa?: string;
  departamento?: string; // Campo para controlar acesso por departamento
  // Campos para visualização do usuário
  progress?: number;
  rating?: number;
  deadline?: string;
  lastAccessed?: string;
  completed?: boolean;
  // Auditoria
  auditLog: AuditLogEntry[];
}

interface TrainingContextType {
  trainings: Training[];
  createTraining: (training: Omit<Training, 'id' | 'participantes' | 'criadoEm' | 'fotos' | 'arquivos' | 'auditLog'>) => void;
  updateTraining: (id: number, training: Partial<Training>) => void;
  deleteTraining: (id: number) => void;
  getActiveTrainings: () => Training[];
  getTrainingById: (id: number) => Training | undefined;
  getTrainingsByDepartment: (departamento?: string) => Training[];
  startTraining: (id: number) => void;
  pauseTraining: (id: number) => void;
  completeTraining: (id: number) => void;
  accessTraining: (id: number) => void;
  addAuditLog: (trainingId: number, entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

const createAuditEntry = (
  action: AuditLogEntry['action'],
  description: string,
  details: any = {}
): Omit<AuditLogEntry, 'id' | 'timestamp'> => ({
  action,
  description,
  details,
  userId: "user-1", // Em um app real, viria do contexto de autenticação
  userName: "Usuário Atual"
});

const initialTrainings: Training[] = [
  // ============ TREINAMENTOS DE TI ============
  {
    id: 1,
    titulo: "Segurança da Informação - Fundamentos",
    subtitulo: "Proteja os dados da empresa contra ameaças cibernéticas",
    descricao: "Treinamento completo sobre práticas essenciais de segurança da informação, proteção de dados e prevenção de ataques cibernéticos.",
    texto: `## Seção 1: Introdução à Segurança da Informação

A segurança da informação é um conjunto de práticas e políticas destinadas a proteger dados e sistemas contra acessos não autorizados, uso indevido, divulgação, interrupção, modificação ou destruição.

[Imagem: https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800]

### Por que a segurança é importante?

• Proteção de dados sensíveis da empresa
• Conformidade com leis como LGPD
• Prevenção de prejuízos financeiros
• Manutenção da reputação corporativa

---

## Seção 2: Tipos de Ameaças Cibernéticas

[Vídeo: https://www.youtube.com/watch?v=inWWhr5tnEA]

### Principais ameaças:

1. **Phishing** - E-mails falsos que tentam roubar credenciais
2. **Malware** - Software malicioso que infecta sistemas
3. **Ransomware** - Sequestro de dados mediante pagamento
4. **Engenharia Social** - Manipulação psicológica para obter informações

[Imagem: https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800]

---

## Seção 3: Boas Práticas de Segurança

☑ Use senhas fortes com no mínimo 12 caracteres
☑ Ative autenticação em dois fatores
☑ Nunca compartilhe suas credenciais
☑ Mantenha softwares sempre atualizados
☑ Desconfie de links e anexos suspeitos
☑ Faça backup regular dos seus dados

### Criando senhas seguras

Uma senha forte deve conter:
• Letras maiúsculas e minúsculas
• Números
• Caracteres especiais (!@#$%^&*)
• Nenhuma informação pessoal

---

## Seção 4: Procedimentos em Caso de Incidente

Se você identificar um possível incidente de segurança:

1. **Não entre em pânico** - Mantenha a calma
2. **Não desligue o computador** - Preserve as evidências
3. **Documente o ocorrido** - Anote hora e o que aconteceu
4. **Comunique imediatamente** - Entre em contato com a equipe de TI
5. **Não tente resolver sozinho** - Aguarde instruções

[Imagem: https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800]`,
    categoria: "Tecnologia",
    duracao: "2h 30min",
    status: "ativo",
    participantes: 156,
    criadoEm: new Date('2024-01-15').toISOString(),
    instrutor: "Carlos Mendes",
    departamento: "todos",
    fotos: [],
    arquivos: [],
    capa: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
    progress: 0,
    rating: 4.9,
    deadline: new Date('2024-03-15').toISOString(),
    lastAccessed: "Nunca acessado",
    completed: false,
    auditLog: [{
      id: "log-1",
      action: "created",
      timestamp: new Date('2024-01-15T09:00:00Z').toISOString(),
      userId: "admin-1",
      userName: "Carlos Mendes",
      description: "Treinamento criado com status ativo",
      details: { status: "ativo", categoria: "Tecnologia" }
    }]
  },
  {
    id: 2,
    titulo: "Introdução ao Microsoft 365",
    subtitulo: "Domine as ferramentas de produtividade do Office",
    descricao: "Aprenda a usar Word, Excel, PowerPoint, Teams e outras ferramentas do pacote Microsoft 365 para aumentar sua produtividade.",
    texto: `## Seção 1: Visão Geral do Microsoft 365

O Microsoft 365 é uma suíte de aplicativos de produtividade baseada na nuvem que permite trabalhar de qualquer lugar.

[Imagem: https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800]

### Aplicativos incluídos:

• **Word** - Processador de texto
• **Excel** - Planilhas eletrônicas
• **PowerPoint** - Apresentações
• **Outlook** - E-mail e calendário
• **Teams** - Comunicação e colaboração
• **OneDrive** - Armazenamento na nuvem

---

## Seção 2: Microsoft Word

[Vídeo: https://www.youtube.com/watch?v=S-nHYzK-BVg]

### Funcionalidades essenciais:

1. Criar e formatar documentos profissionais
2. Usar estilos para padronização
3. Inserir tabelas, imagens e gráficos
4. Revisar e comentar documentos
5. Colaborar em tempo real

[Imagem: https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800]

---

## Seção 3: Microsoft Excel

O Excel é fundamental para análise de dados e criação de relatórios.

### Fórmulas essenciais:

• **SOMA** - Soma valores de células
• **MÉDIA** - Calcula a média de valores
• **PROCV** - Busca valores em tabelas
• **SE** - Cria condições lógicas
• **CONT.SE** - Conta células com critérios

[Imagem: https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800]

---

## Seção 4: Microsoft Teams

[Vídeo: https://www.youtube.com/watch?v=jugBQqE_2sM]

O Teams é a plataforma de comunicação e colaboração da Microsoft.

☑ Chat individual e em grupo
☑ Reuniões por vídeo com até 300 participantes
☑ Compartilhamento de arquivos
☑ Integração com outros apps Microsoft
☑ Canais para organizar conversas por tema

### Dicas de produtividade:

1. Use @menções para chamar atenção de colegas
2. Configure status para mostrar disponibilidade
3. Agende reuniões diretamente pelo calendário
4. Use o recurso de gravação para reuniões importantes`,
    categoria: "Tecnologia",
    duracao: "3h 00min",
    status: "ativo",
    participantes: 234,
    criadoEm: new Date('2024-01-20').toISOString(),
    instrutor: "Ana Oliveira",
    departamento: "TI",
    fotos: [],
    arquivos: [],
    capa: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    progress: 0,
    rating: 4.7,
    deadline: new Date('2024-03-20').toISOString(),
    lastAccessed: "Nunca acessado",
    completed: false,
    auditLog: [{
      id: "log-2",
      action: "created",
      timestamp: new Date('2024-01-20T10:00:00Z').toISOString(),
      userId: "admin-1",
      userName: "Ana Oliveira",
      description: "Treinamento criado com status ativo",
      details: { status: "ativo", categoria: "Tecnologia" }
    }]
  },

  // ============ TREINAMENTOS DE RH ============
  {
    id: 3,
    titulo: "Integração de Novos Colaboradores",
    subtitulo: "Bem-vindo à nossa empresa!",
    descricao: "Programa de onboarding completo para novos funcionários conhecerem a cultura, valores e processos da empresa.",
    texto: `## Seção 1: Bem-vindo à Empresa!

Seja muito bem-vindo(a) à nossa equipe! Este treinamento irá ajudá-lo a conhecer nossa cultura, valores e tudo que você precisa saber para ter sucesso aqui.

[Imagem: https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800]

### Nossa Missão:
Transformar vidas através de soluções inovadoras que fazem a diferença no dia a dia das pessoas.

### Nossos Valores:
• **Integridade** - Agimos com ética e transparência
• **Inovação** - Buscamos sempre melhorar
• **Colaboração** - Trabalhamos juntos
• **Excelência** - Entregamos qualidade

---

## Seção 2: Estrutura Organizacional

[Vídeo: https://www.youtube.com/watch?v=1Rb0fH3O3pw]

Conheça como nossa empresa está organizada:

1. **Diretoria Executiva** - Define a estratégia
2. **Gerências** - Gerenciam áreas específicas
3. **Coordenações** - Coordenam equipes
4. **Equipes Operacionais** - Executam as atividades

[Imagem: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800]

---

## Seção 3: Políticas e Benefícios

### Horário de Trabalho:
• Entrada: 8h às 9h (flexível)
• Saída: 17h às 18h
• Intervalo: 1h para almoço

### Benefícios:

☑ Vale-refeição/alimentação
☑ Plano de saúde e odontológico
☑ Seguro de vida
☑ Participação nos lucros
☑ Auxílio home office
☑ Day off no aniversário
☑ Gympass

[Imagem: https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800]

---

## Seção 4: Próximos Passos

### Sua primeira semana:

1. **Dia 1** - Configuração de acessos e equipamentos
2. **Dia 2** - Conhecer a equipe e o gestor
3. **Dia 3** - Treinamentos específicos da área
4. **Dia 4** - Acompanhamento de processos
5. **Dia 5** - Reunião de feedback inicial

### Canais de Comunicação:

• **E-mail corporativo** - Comunicação formal
• **Teams** - Comunicação do dia a dia
• **Intranet** - Notícias e documentos
• **RH** - Dúvidas sobre benefícios e folha`,
    categoria: "Recursos Humanos",
    duracao: "1h 30min",
    status: "ativo",
    participantes: 89,
    criadoEm: new Date('2024-02-01').toISOString(),
    instrutor: "Maria Silva",
    departamento: "todos",
    fotos: [],
    arquivos: [],
    capa: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
    progress: 0,
    rating: 4.8,
    deadline: new Date('2024-04-01').toISOString(),
    lastAccessed: "Nunca acessado",
    completed: false,
    auditLog: [{
      id: "log-3",
      action: "created",
      timestamp: new Date('2024-02-01T09:00:00Z').toISOString(),
      userId: "admin-1",
      userName: "Maria Silva",
      description: "Treinamento criado com status ativo",
      details: { status: "ativo", categoria: "Recursos Humanos" }
    }]
  },
  {
    id: 4,
    titulo: "Comunicação Assertiva no Ambiente de Trabalho",
    subtitulo: "Desenvolva habilidades de comunicação profissional",
    descricao: "Aprenda técnicas de comunicação eficaz para melhorar relacionamentos, resolver conflitos e transmitir ideias com clareza.",
    texto: `## Seção 1: O que é Comunicação Assertiva?

A comunicação assertiva é a habilidade de expressar pensamentos, sentimentos e necessidades de forma clara, direta e respeitosa.

[Imagem: https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800]

### Benefícios da comunicação assertiva:

• Reduz mal-entendidos
• Melhora relacionamentos profissionais
• Aumenta a produtividade
• Diminui conflitos
• Fortalece a confiança

---

## Seção 2: Estilos de Comunicação

[Vídeo: https://www.youtube.com/watch?v=vlwmfiCb-vc]

Existem 4 estilos principais de comunicação:

1. **Passivo** - Evita expressar opiniões
2. **Agressivo** - Impõe opiniões sem respeitar outros
3. **Passivo-Agressivo** - Expressa frustração indiretamente
4. **Assertivo** - Expressa com respeito e clareza ✓

[Imagem: https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=800]

---

## Seção 3: Técnicas de Comunicação Assertiva

### Técnica DESC:

• **D**escreva a situação objetivamente
• **E**xpresse seus sentimentos
• **S**olicite mudanças específicas
• **C**onsequências positivas da mudança

### Linguagem corporal assertiva:

☑ Contato visual adequado
☑ Postura ereta e aberta
☑ Tom de voz calmo e firme
☑ Gestos naturais e moderados
☑ Expressão facial condizente

[Imagem: https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800]

---

## Seção 4: Lidando com Situações Difíceis

### Como dar feedback construtivo:

1. Escolha o momento certo
2. Seja específico sobre o comportamento
3. Foque no impacto, não na pessoa
4. Ofereça sugestões de melhoria
5. Acompanhe o progresso

### Como receber feedback:

1. Ouça atentamente sem interromper
2. Agradeça pela contribuição
3. Peça exemplos se necessário
4. Reflita antes de responder
5. Crie um plano de ação

[Vídeo: https://www.youtube.com/watch?v=wtl5UrrgU8c]`,
    categoria: "Recursos Humanos",
    duracao: "2h 00min",
    status: "ativo",
    participantes: 145,
    criadoEm: new Date('2024-02-10').toISOString(),
    instrutor: "Fernanda Costa",
    departamento: "RH",
    fotos: [],
    arquivos: [],
    capa: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800",
    progress: 0,
    rating: 4.9,
    deadline: new Date('2024-04-10').toISOString(),
    lastAccessed: "Nunca acessado",
    completed: false,
    auditLog: [{
      id: "log-4",
      action: "created",
      timestamp: new Date('2024-02-10T09:00:00Z').toISOString(),
      userId: "admin-1",
      userName: "Fernanda Costa",
      description: "Treinamento criado com status ativo",
      details: { status: "ativo", categoria: "Recursos Humanos" }
    }]
  },

  // ============ TREINAMENTOS DE VENDAS ============
  {
    id: 5,
    titulo: "Técnicas de Negociação Avançada",
    subtitulo: "Feche mais negócios com estratégias comprovadas",
    descricao: "Domine técnicas avançadas de negociação para aumentar suas vendas e construir relacionamentos duradouros com clientes.",
    texto: `## Seção 1: Fundamentos da Negociação

A negociação é uma habilidade essencial para qualquer profissional de vendas. Não se trata apenas de fechar negócios, mas de criar valor para ambas as partes.

[Imagem: https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800]

### Princípios da negociação ganha-ganha:

• Foque em interesses, não posições
• Separe as pessoas dos problemas
• Crie opções de ganho mútuo
• Use critérios objetivos

---

## Seção 2: Preparação para Negociação

[Vídeo: https://www.youtube.com/watch?v=MjhDkNmtjy0]

Antes de qualquer negociação, prepare-se:

1. **Pesquise o cliente** - Conheça seu negócio e desafios
2. **Defina objetivos** - O que você quer alcançar?
3. **Estabeleça limites** - Qual o mínimo aceitável?
4. **Prepare alternativas** - Tenha um plano B
5. **Antecipe objeções** - Prepare respostas

[Imagem: https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800]

### BATNA - Best Alternative To a Negotiated Agreement

Sua BATNA é sua melhor alternativa caso a negociação não funcione. Quanto melhor sua BATNA, mais poder você tem na negociação.

---

## Seção 3: Técnicas de Fechamento

### Principais técnicas:

☑ **Fechamento Direto** - Peça o pedido diretamente
☑ **Alternativa** - Ofereça duas opções, ambas positivas
☑ **Resumo** - Recapitule os benefícios antes de fechar
☑ **Urgência** - Crie senso de urgência legítima
☑ **Prova Social** - Use casos de sucesso

[Imagem: https://images.unsplash.com/photo-1560472355-536de3962603?w=800]

---

## Seção 4: Lidando com Objeções

[Vídeo: https://www.youtube.com/watch?v=H5_PVDW1P4k]

### Método LAER:

1. **L**isten - Ouça a objeção completamente
2. **A**cknowledge - Reconheça a preocupação
3. **E**xplore - Explore para entender melhor
4. **R**espond - Responda com soluções

### Objeções comuns:

• "Está caro" → Demonstre valor e ROI
• "Preciso pensar" → Identifique a real preocupação
• "Já temos fornecedor" → Mostre diferencias
• "Não tenho tempo" → Agende follow-up específico`,
    categoria: "Vendas",
    duracao: "3h 00min",
    status: "ativo",
    participantes: 78,
    criadoEm: new Date('2024-02-15').toISOString(),
    instrutor: "João Santos",
    departamento: "Vendas",
    fotos: [],
    arquivos: [],
    capa: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800",
    progress: 0,
    rating: 4.8,
    deadline: new Date('2024-04-15').toISOString(),
    lastAccessed: "Nunca acessado",
    completed: false,
    auditLog: [{
      id: "log-5",
      action: "created",
      timestamp: new Date('2024-02-15T09:00:00Z').toISOString(),
      userId: "admin-1",
      userName: "João Santos",
      description: "Treinamento criado com status ativo",
      details: { status: "ativo", categoria: "Vendas" }
    }]
  },
  {
    id: 6,
    titulo: "Atendimento ao Cliente de Excelência",
    subtitulo: "Encante seus clientes em cada interação",
    descricao: "Aprenda a proporcionar experiências memoráveis aos clientes, aumentando satisfação, fidelização e recomendações.",
    texto: `## Seção 1: A Importância do Atendimento

Um atendimento excepcional é o maior diferencial competitivo de uma empresa. Clientes satisfeitos compram mais e indicam sua marca.

[Imagem: https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800]

### Estatísticas importantes:

• 86% dos clientes pagam mais por experiência melhor
• 73% consideram experiência fator decisivo de compra
• 1 cliente insatisfeito conta para 9-15 pessoas
• Reter cliente custa 5x menos que conquistar novo

---

## Seção 2: Pilares do Atendimento Excepcional

[Vídeo: https://www.youtube.com/watch?v=YBqAq4WYVqY]

### Os 5 pilares:

1. **Empatia** - Coloque-se no lugar do cliente
2. **Agilidade** - Resolva problemas rapidamente
3. **Personalização** - Trate cada cliente como único
4. **Proatividade** - Antecipe necessidades
5. **Consistência** - Mantenha qualidade em todos os canais

[Imagem: https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800]

---

## Seção 3: Técnicas de Atendimento

### Escuta Ativa:

☑ Preste atenção total ao cliente
☑ Não interrompa
☑ Faça perguntas esclarecedoras
☑ Repita para confirmar entendimento
☑ Demonstre interesse genuíno

### Linguagem positiva:

| Evite ❌ | Prefira ✓ |
|----------|-----------|
| "Não posso" | "O que posso fazer é..." |
| "Isso não é comigo" | "Vou te direcionar para..." |
| "Você está errado" | "Deixa eu verificar..." |
| "É política da empresa" | "Vou buscar uma solução..." |

[Imagem: https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800]

---

## Seção 4: Gestão de Reclamações

[Vídeo: https://www.youtube.com/watch?v=Q6qqNLZJi-Q]

### Método HEART:

1. **H**ear - Ouça sem interromper
2. **E**mpathize - Demonstre empatia
3. **A**pologize - Peça desculpas sinceras
4. **R**esolve - Resolva o problema
5. **T**hank - Agradeça pelo feedback

### Transforme reclamações em oportunidades:

• Cada reclamação é uma chance de melhorar
• Clientes que reclamam querem continuar com você
• Resolução eficaz gera mais fidelidade
• Use feedback para melhorar processos`,
    categoria: "Vendas",
    duracao: "2h 30min",
    status: "ativo",
    participantes: 167,
    criadoEm: new Date('2024-02-20').toISOString(),
    instrutor: "Paula Ribeiro",
    departamento: "Vendas",
    fotos: [],
    arquivos: [],
    capa: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=800",
    progress: 0,
    rating: 4.9,
    deadline: new Date('2024-04-20').toISOString(),
    lastAccessed: "Nunca acessado",
    completed: false,
    auditLog: [{
      id: "log-6",
      action: "created",
      timestamp: new Date('2024-02-20T09:00:00Z').toISOString(),
      userId: "admin-1",
      userName: "Paula Ribeiro",
      description: "Treinamento criado com status ativo",
      details: { status: "ativo", categoria: "Vendas" }
    }]
  },

  // ============ TREINAMENTOS FINANCEIRO ============
  {
    id: 7,
    titulo: "Gestão de Despesas e Reembolsos",
    subtitulo: "Entenda o processo de prestação de contas",
    descricao: "Aprenda os procedimentos corretos para solicitação de reembolsos, prestação de contas e gestão de despesas corporativas.",
    texto: `## Seção 1: Política de Despesas

Conhecer a política de despesas é fundamental para garantir reembolsos rápidos e evitar problemas.

[Imagem: https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800]

### Tipos de despesas reembolsáveis:

• Viagens a trabalho (transporte, hospedagem, alimentação)
• Materiais de escritório
• Custos com cliente (almoços de negócios)
• Cursos e treinamentos aprovados
• Combustível para uso profissional

### Despesas NÃO reembolsáveis:

• Bebidas alcoólicas
• Despesas pessoais
• Multas de trânsito
• Itens de luxo
• Serviços de entretenimento

---

## Seção 2: Como Solicitar Reembolso

[Vídeo: https://www.youtube.com/watch?v=dQw4w9WgXcQ]

### Passo a passo:

1. **Guarde todos os comprovantes** - Notas fiscais originais
2. **Acesse o sistema** - Portal de reembolsos
3. **Preencha a solicitação** - Dados completos
4. **Anexe documentos** - Fotos legíveis dos comprovantes
5. **Envie para aprovação** - Aguarde o gestor

[Imagem: https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800]

### Prazos importantes:

☑ Solicitação: até 30 dias após a despesa
☑ Aprovação do gestor: até 5 dias úteis
☑ Processamento financeiro: até 10 dias úteis
☑ Crédito em conta: próxima folha de pagamento

---

## Seção 3: Cartão Corporativo

### Regras de uso:

• Use apenas para despesas aprovadas
• Mantenha comprovantes de todas as compras
• Não use para despesas pessoais
• Comunique perda ou roubo imediatamente
• Faça prestação de contas mensalmente

[Imagem: https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800]

---

## Seção 4: Viagens Corporativas

[Vídeo: https://www.youtube.com/watch?v=ScMzIvxBSi4]

### Antes da viagem:

1. Solicite aprovação com antecedência mínima de 7 dias
2. Use a agência de viagens parceira
3. Escolha opções dentro da política (classe econômica, hotéis credenciados)
4. Receba adiantamento se necessário

### Durante a viagem:

☑ Guarde todos os comprovantes
☑ Respeite os limites de diárias
☑ Use transporte adequado (táxi/app credenciado)
☑ Evite despesas não essenciais

### Após a viagem:

• Faça prestação de contas em até 5 dias
• Devolva valores não utilizados
• Anexe relatório de atividades`,
    categoria: "Financeiro",
    duracao: "1h 30min",
    status: "ativo",
    participantes: 234,
    criadoEm: new Date('2024-02-25').toISOString(),
    instrutor: "Ricardo Almeida",
    departamento: "todos",
    fotos: [],
    arquivos: [],
    capa: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
    progress: 0,
    rating: 4.6,
    deadline: new Date('2024-04-25').toISOString(),
    lastAccessed: "Nunca acessado",
    completed: false,
    auditLog: [{
      id: "log-7",
      action: "created",
      timestamp: new Date('2024-02-25T09:00:00Z').toISOString(),
      userId: "admin-1",
      userName: "Ricardo Almeida",
      description: "Treinamento criado com status ativo",
      details: { status: "ativo", categoria: "Financeiro" }
    }]
  },
  {
    id: 8,
    titulo: "Noções de Finanças para Não Financeiros",
    subtitulo: "Entenda os números que movem a empresa",
    descricao: "Aprenda conceitos básicos de finanças empresariais para tomar melhores decisões e contribuir com os resultados da empresa.",
    texto: `## Seção 1: Por que Entender Finanças?

Mesmo que você não trabalhe diretamente com finanças, entender os números da empresa ajuda a tomar melhores decisões.

[Imagem: https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800]

### Benefícios:

• Entender o impacto das suas decisões
• Contribuir melhor nas discussões de orçamento
• Identificar oportunidades de economia
• Comunicar-se melhor com a área financeira
• Desenvolver visão estratégica de negócio

---

## Seção 2: Demonstrativos Financeiros Básicos

[Vídeo: https://www.youtube.com/watch?v=WEDIj9JBTC8]

### DRE - Demonstração do Resultado:

Mostra se a empresa teve lucro ou prejuízo em um período.

• **Receita** - Quanto a empresa vendeu
• **Custos** - Gastos para produzir/entregar
• **Despesas** - Gastos operacionais
• **Lucro** - O que sobra no final

[Imagem: https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800]

### Balanço Patrimonial:

Mostra a situação financeira da empresa em um momento.

• **Ativos** - O que a empresa possui
• **Passivos** - O que a empresa deve
• **Patrimônio Líquido** - Ativos - Passivos

---

## Seção 3: Indicadores Importantes

### KPIs Financeiros:

☑ **Margem Bruta** - % de lucro sobre vendas
☑ **EBITDA** - Lucro operacional
☑ **ROI** - Retorno sobre investimento
☑ **Ticket Médio** - Valor médio por venda
☑ **CAC** - Custo de aquisição de cliente
☑ **LTV** - Valor do cliente ao longo do tempo

[Imagem: https://images.unsplash.com/photo-1543286386-713bdd548da4?w=800]

---

## Seção 4: Orçamento e Planejamento

[Vídeo: https://www.youtube.com/watch?v=nFJ8ivzMaKE]

### Como funciona o orçamento:

1. **Planejamento anual** - Define metas e recursos
2. **Alocação por área** - Distribui orçamento
3. **Acompanhamento mensal** - Verifica execução
4. **Revisões periódicas** - Ajusta conforme necessário

### Boas práticas:

• Planeje antes de gastar
• Justifique investimentos com ROI
• Monitore seu orçamento regularmente
• Comunique desvios antecipadamente
• Busque alternativas mais econômicas`,
    categoria: "Financeiro",
    duracao: "2h 00min",
    status: "ativo",
    participantes: 189,
    criadoEm: new Date('2024-03-01').toISOString(),
    instrutor: "Ana Costa",
    departamento: "Financeiro",
    fotos: [],
    arquivos: [],
    capa: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    progress: 0,
    rating: 4.7,
    deadline: new Date('2024-05-01').toISOString(),
    lastAccessed: "Nunca acessado",
    completed: false,
    auditLog: [{
      id: "log-8",
      action: "created",
      timestamp: new Date('2024-03-01T09:00:00Z').toISOString(),
      userId: "admin-1",
      userName: "Ana Costa",
      description: "Treinamento criado com status ativo",
      details: { status: "ativo", categoria: "Financeiro" }
    }]
  },

  // ============ TREINAMENTOS DE MARKETING ============
  {
    id: 9,
    titulo: "Marketing Digital para Iniciantes",
    subtitulo: "Domine as estratégias do mundo digital",
    descricao: "Aprenda os fundamentos do marketing digital, incluindo SEO, redes sociais, e-mail marketing e análise de métricas.",
    texto: `## Seção 1: O que é Marketing Digital?

Marketing digital é o conjunto de estratégias para promover produtos e serviços através de canais digitais.

[Imagem: https://images.unsplash.com/photo-1432888622747-4eb9a8f5a70d?w=800]

### Principais canais:

• **Site/Blog** - Sua base na internet
• **Redes Sociais** - Relacionamento e engajamento
• **E-mail** - Comunicação direta
• **Buscadores** - Ser encontrado (SEO/SEM)
• **Mídia Paga** - Anúncios segmentados

---

## Seção 2: SEO - Otimização para Buscadores

[Vídeo: https://www.youtube.com/watch?v=MYE6T_gd7H0]

### O que é SEO?

SEO (Search Engine Optimization) são técnicas para melhorar o posicionamento do seu site no Google.

### Fatores importantes:

☑ Palavras-chave relevantes
☑ Conteúdo de qualidade
☑ Links de outros sites (backlinks)
☑ Velocidade do site
☑ Experiência mobile
☑ Estrutura técnica do site

[Imagem: https://images.unsplash.com/photo-1571721795195-a2ca2d3370a9?w=800]

---

## Seção 3: Redes Sociais

### Estratégia por plataforma:

• **Instagram** - Visual, lifestyle, stories
• **LinkedIn** - B2B, conteúdo profissional
• **Facebook** - Comunidades, grupos
• **TikTok** - Vídeos curtos, trends
• **YouTube** - Vídeos longos, tutoriais

[Imagem: https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800]

### Boas práticas:

1. Conheça seu público
2. Publique com consistência
3. Interaja com seguidores
4. Use hashtags estrategicamente
5. Analise métricas e ajuste

---

## Seção 4: Métricas e Análise

[Vídeo: https://www.youtube.com/watch?v=gNRGkMeITVU]

### KPIs de Marketing Digital:

• **Alcance** - Quantas pessoas viram
• **Engajamento** - Curtidas, comentários, compartilhamentos
• **Cliques** - Quantos clicaram no link
• **Conversões** - Quantos realizaram a ação desejada
• **ROI** - Retorno sobre investimento

### Ferramentas essenciais:

☑ Google Analytics
☑ Google Search Console
☑ Meta Business Suite
☑ Semrush / Ahrefs
☑ Hotjar`,
    categoria: "Marketing",
    duracao: "3h 00min",
    status: "ativo",
    participantes: 156,
    criadoEm: new Date('2024-03-05').toISOString(),
    instrutor: "Pedro Lima",
    departamento: "Marketing",
    fotos: [],
    arquivos: [],
    capa: "https://images.unsplash.com/photo-1432888622747-4eb9a8f5a70d?w=800",
    progress: 0,
    rating: 4.8,
    deadline: new Date('2024-05-05').toISOString(),
    lastAccessed: "Nunca acessado",
    completed: false,
    auditLog: [{
      id: "log-9",
      action: "created",
      timestamp: new Date('2024-03-05T09:00:00Z').toISOString(),
      userId: "admin-1",
      userName: "Pedro Lima",
      description: "Treinamento criado com status ativo",
      details: { status: "ativo", categoria: "Marketing" }
    }]
  },
  {
    id: 10,
    titulo: "Branding e Identidade Visual",
    subtitulo: "Construa uma marca forte e memorável",
    descricao: "Entenda os elementos que compõem uma marca forte, desde a identidade visual até o tom de voz e posicionamento.",
    texto: `## Seção 1: O que é Branding?

Branding é o processo de construção e gestão de uma marca. Vai muito além do logo - é a percepção que as pessoas têm da empresa.

[Imagem: https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800]

### Elementos do branding:

• **Propósito** - Por que existimos?
• **Valores** - No que acreditamos?
• **Posicionamento** - Como queremos ser percebidos?
• **Personalidade** - Se fosse uma pessoa, como seria?
• **Identidade Visual** - Como nos apresentamos visualmente?

---

## Seção 2: Identidade Visual

[Vídeo: https://www.youtube.com/watch?v=Z41pjc0sQU0]

### Componentes:

1. **Logo** - Símbolo principal da marca
2. **Cores** - Paleta de cores oficial
3. **Tipografia** - Fontes utilizadas
4. **Elementos gráficos** - Ícones, patterns, ilustrações
5. **Fotografia** - Estilo de imagens

[Imagem: https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800]

### Psicologia das cores:

☑ **Azul** - Confiança, profissionalismo
☑ **Vermelho** - Energia, urgência
☑ **Verde** - Natureza, crescimento
☑ **Amarelo** - Otimismo, criatividade
☑ **Roxo** - Luxo, criatividade
☑ **Laranja** - Entusiasmo, acessibilidade

---

## Seção 3: Tom de Voz

O tom de voz é como a marca se comunica em todos os pontos de contato.

[Imagem: https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800]

### Definindo o tom:

• **Formal ou informal?**
• **Sério ou bem-humorado?**
• **Técnico ou acessível?**
• **Direto ou elaborado?**

### Aplicação:

1. Site e blog
2. Redes sociais
3. E-mails
4. Atendimento ao cliente
5. Materiais de vendas

---

## Seção 4: Aplicação Prática

[Vídeo: https://www.youtube.com/watch?v=yKpUdG95R1A]

### Manual de marca:

Todo colaborador deve conhecer e seguir o manual de marca, que contém:

• Uso correto do logo
• Cores e códigos (RGB, CMYK, Hex)
• Fontes e tamanhos
• Exemplos de uso correto e incorreto
• Templates para materiais

### Consistência é fundamental:

☑ Use sempre as cores oficiais
☑ Não distorça o logo
☑ Siga o tom de voz definido
☑ Use templates aprovados
☑ Consulte o time de marketing em caso de dúvida`,
    categoria: "Marketing",
    duracao: "2h 30min",
    status: "ativo",
    participantes: 98,
    criadoEm: new Date('2024-03-10').toISOString(),
    instrutor: "Juliana Martins",
    departamento: "Marketing",
    fotos: [],
    arquivos: [],
    capa: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800",
    progress: 0,
    rating: 4.9,
    deadline: new Date('2024-05-10').toISOString(),
    lastAccessed: "Nunca acessado",
    completed: false,
    auditLog: [{
      id: "log-10",
      action: "created",
      timestamp: new Date('2024-03-10T09:00:00Z').toISOString(),
      userId: "admin-1",
      userName: "Juliana Martins",
      description: "Treinamento criado com status ativo",
      details: { status: "ativo", categoria: "Marketing" }
    }]
  },

  // ============ TREINAMENTOS GERAIS (TODOS) ============
  {
    id: 11,
    titulo: "LGPD - Lei Geral de Proteção de Dados",
    subtitulo: "Conheça seus direitos e deveres sobre dados pessoais",
    descricao: "Entenda a LGPD e como ela afeta o tratamento de dados pessoais na empresa. Treinamento obrigatório para todos os colaboradores.",
    texto: `## Seção 1: O que é a LGPD?

A Lei Geral de Proteção de Dados (Lei 13.709/2018) regula o tratamento de dados pessoais no Brasil.

[Imagem: https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800]

### Objetivos da lei:

• Proteger a privacidade das pessoas
• Dar transparência ao uso de dados
• Estabelecer regras claras para empresas
• Criar autoridade de fiscalização (ANPD)
• Definir penalidades para infrações

---

## Seção 2: Conceitos Importantes

[Vídeo: https://www.youtube.com/watch?v=pplYCd8yT2E]

### Definições:

• **Dado Pessoal** - Qualquer informação que identifique uma pessoa
• **Dado Sensível** - Dados sobre raça, religião, saúde, etc.
• **Titular** - A pessoa dona dos dados
• **Controlador** - Quem decide sobre o tratamento
• **Operador** - Quem executa o tratamento
• **Tratamento** - Qualquer operação com dados

[Imagem: https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800]

---

## Seção 3: Direitos do Titular

### A pessoa tem direito a:

☑ Saber quais dados são coletados
☑ Acessar seus dados
☑ Corrigir informações incorretas
☑ Solicitar exclusão dos dados
☑ Revogar consentimento
☑ Portabilidade para outro fornecedor
☑ Saber com quem os dados são compartilhados

[Imagem: https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800]

---

## Seção 4: Nossas Responsabilidades

[Vídeo: https://www.youtube.com/watch?v=VloEqhKqSYM]

### O que você deve fazer:

1. **Colete apenas o necessário** - Minimize os dados
2. **Tenha base legal** - Consentimento ou interesse legítimo
3. **Proteja os dados** - Use senhas, criptografia
4. **Não compartilhe indevidamente** - Só com autorização
5. **Comunique incidentes** - Avise o DPO imediatamente

### Sanções por descumprimento:

• Advertência
• Multa de até 2% do faturamento
• Multa de até R$ 50 milhões por infração
• Bloqueio ou eliminação dos dados
• Suspensão das atividades
• Dano reputacional`,
    categoria: "Compliance",
    duracao: "1h 30min",
    status: "ativo",
    participantes: 345,
    criadoEm: new Date('2024-03-15').toISOString(),
    instrutor: "Carlos Mendes",
    departamento: "todos",
    fotos: [],
    arquivos: [],
    capa: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800",
    progress: 0,
    rating: 4.7,
    deadline: new Date('2024-05-15').toISOString(),
    lastAccessed: "Nunca acessado",
    completed: false,
    auditLog: [{
      id: "log-11",
      action: "created",
      timestamp: new Date('2024-03-15T09:00:00Z').toISOString(),
      userId: "admin-1",
      userName: "Carlos Mendes",
      description: "Treinamento criado com status ativo",
      details: { status: "ativo", categoria: "Compliance" }
    }]
  },
  {
    id: 12,
    titulo: "Segurança no Trabalho - NR Básica",
    subtitulo: "Prevenção de acidentes e saúde ocupacional",
    descricao: "Treinamento obrigatório sobre normas regulamentadoras, prevenção de acidentes e saúde ocupacional no ambiente de trabalho.",
    texto: `## Seção 1: Introdução à Segurança do Trabalho

A segurança do trabalho visa prevenir acidentes e doenças ocupacionais, protegendo a vida e a saúde dos trabalhadores.

[Imagem: https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800]

### Por que é importante?

• Preserva vidas e saúde
• Evita afastamentos
• Reduz custos com acidentes
• Melhora o ambiente de trabalho
• É exigido por lei

---

## Seção 2: Principais Normas Regulamentadoras

[Vídeo: https://www.youtube.com/watch?v=t5_1M7Lbxf4]

### NRs mais importantes:

• **NR-1** - Disposições gerais
• **NR-5** - CIPA
• **NR-6** - EPIs
• **NR-7** - PCMSO (exames médicos)
• **NR-9** - PPRA (riscos ambientais)
• **NR-17** - Ergonomia

[Imagem: https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800]

---

## Seção 3: EPIs e Cuidados Básicos

### Equipamentos de Proteção Individual:

☑ Capacete - Proteção da cabeça
☑ Óculos - Proteção dos olhos
☑ Luvas - Proteção das mãos
☑ Calçados - Proteção dos pés
☑ Protetores auriculares - Proteção auditiva
☑ Máscaras - Proteção respiratória

[Imagem: https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800]

### Suas responsabilidades:

1. Usar os EPIs fornecidos
2. Conservar e higienizar equipamentos
3. Comunicar defeitos ou danos
4. Não modificar os equipamentos
5. Solicitar troca quando necessário

---

## Seção 4: Prevenção de Acidentes

[Vídeo: https://www.youtube.com/watch?v=u8QR3sTNeUU]

### Atos inseguros a evitar:

• Não usar EPIs adequados
• Improvisar ferramentas
• Desrespeitar sinalizações
• Operar equipamentos sem autorização
• Trabalhar sob efeito de álcool/drogas
• Não seguir procedimentos

### Condições inseguras a reportar:

☑ Equipamentos defeituosos
☑ Falta de sinalização
☑ Iluminação inadequada
☑ Piso escorregadio
☑ Instalações elétricas expostas
☑ Falta de extintores

### Em caso de acidente:

1. Mantenha a calma
2. Chame socorro (SAMU 192)
3. Não mova a vítima (exceto risco iminente)
4. Comunique ao gestor e SESMT
5. Preserve o local para investigação`,
    categoria: "Segurança",
    duracao: "2h 00min",
    status: "ativo",
    participantes: 456,
    criadoEm: new Date('2024-03-20').toISOString(),
    instrutor: "Roberto Ferreira",
    departamento: "todos",
    fotos: [],
    arquivos: [],
    capa: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    progress: 0,
    rating: 4.8,
    deadline: new Date('2024-05-20').toISOString(),
    lastAccessed: "Nunca acessado",
    completed: false,
    auditLog: [{
      id: "log-12",
      action: "created",
      timestamp: new Date('2024-03-20T09:00:00Z').toISOString(),
      userId: "admin-1",
      userName: "Roberto Ferreira",
      description: "Treinamento criado com status ativo",
      details: { status: "ativo", categoria: "Segurança" }
    }]
  }
];

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [trainings, setTrainings] = useState<Training[]>(() => {
    const saved = localStorage.getItem('training-portal-trainings');
    if (saved) {
      const parsedTrainings = JSON.parse(saved);
      // Garantir que todos os treinamentos tenham auditLog como array
      return parsedTrainings.map((training: any) => ({
        ...training,
        auditLog: Array.isArray(training.auditLog) ? training.auditLog : []
      }));
    }
    return initialTrainings;
  });

  useEffect(() => {
    try {
      // Limitar auditLog a últimos 50 registros por treinamento para economizar espaço
      const optimizedTrainings = trainings.map(training => ({
        ...training,
        auditLog: training.auditLog.slice(-50)
      }));
      
      localStorage.setItem('training-portal-trainings', JSON.stringify(optimizedTrainings));
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.warn('Armazenamento local cheio. Limpando dados antigos...');
        // Limpar dados antigos e tentar novamente
        try {
          // Manter apenas treinamentos dos últimos 6 meses
          const sixMonthsAgo = new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
          const recentTrainings = trainings.filter(training => 
            new Date(training.criadoEm) > sixMonthsAgo
          ).map(training => ({
            ...training,
            auditLog: training.auditLog.slice(-20) // Ainda menos logs para economizar espaço
          }));
          
          localStorage.setItem('training-portal-trainings', JSON.stringify(recentTrainings));
        } catch (secondError) {
          console.error('Não foi possível salvar dados mesmo após limpeza:', secondError);
          // Como último recurso, limpar completamente
          localStorage.removeItem('training-portal-trainings');
        }
      } else {
        console.error('Erro ao salvar treinamentos:', error);
      }
    }
  }, [trainings]);

  const createTraining = (trainingData: Omit<Training, 'id' | 'participantes' | 'criadoEm' | 'fotos' | 'arquivos' | 'auditLog'>) => {
    const now = new Date().toISOString();
    const newTraining: Training = {
      ...trainingData,
      id: Date.now(),
      participantes: 0,
      criadoEm: now,
      fotos: [],
      arquivos: [],
      auditLog: [
        {
          id: `log-${Date.now()}`,
          action: "created",
          timestamp: now,
          userId: "admin-1",
          userName: "Administrador",
          description: `Treinamento "${trainingData.titulo}" criado com status ${trainingData.status}`,
          details: {
            titulo: trainingData.titulo,
            categoria: trainingData.categoria,
            status: trainingData.status,
            instrutor: trainingData.instrutor,
            duracao: trainingData.duracao
          }
        }
      ],
      // Inicializar campos para usuários apenas se o status for ativo
      ...(trainingData.status === 'ativo' && {
        progress: 0,
        rating: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastAccessed: "Nunca acessado",
        completed: false
      })
    };

    setTrainings(prev => [...prev, newTraining]);
    return newTraining;
  };

  const addAuditLog = (trainingId: number, entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const now = new Date().toISOString();
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now
    };

    setTrainings(prev => prev.map(training => 
      training.id === trainingId 
        ? { 
            ...training, 
            auditLog: [...training.auditLog, auditEntry]
          }
        : training
    ));
  };

  const updateTraining = (id: number, updateData: Partial<Training>) => {
    setTrainings(prev => prev.map(training => {
      if (training.id === id) {
        const updatedTraining = { 
          ...training, 
          ...updateData,
          // Se status mudou para ativo e não tinha campos de usuário, adicionar
          ...(updateData.status === 'ativo' && !training.progress && {
            progress: 0,
            rating: 0,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            lastAccessed: "Nunca acessado",
            completed: false
          })
        };

        // Adicionar log de auditoria para alterações
        const changedFields = Object.keys(updateData).filter(key => 
          training[key as keyof Training] !== updateData[key as keyof Training]
        );

        if (changedFields.length > 0) {
          const auditEntry = createAuditEntry(
            "updated",
            `Treinamento editado. Campos alterados: ${changedFields.join(', ')}`,
            {
              changedFields,
              oldValues: changedFields.reduce((acc, field) => ({
                ...acc,
                [field]: training[field as keyof Training]
              }), {}),
              newValues: changedFields.reduce((acc, field) => ({
                ...acc,
                [field]: updateData[field as keyof Training]
              }), {})
            }
          );

          updatedTraining.auditLog = [...training.auditLog, {
            ...auditEntry,
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString()
          }];
        }

        return updatedTraining;
      }
      return training;
    }));
  };

  const deleteTraining = (id: number) => {
    setTrainings(prev => prev.filter(training => training.id !== id));
  };

  const getActiveTrainings = () => {
    return trainings.filter(training => training.status === 'ativo');
  };

  const getTrainingsByDepartment = (departamento?: string) => {
    if (!departamento) return trainings;
    
    return trainings.filter(training => 
      training.departamento === 'todos' || 
      training.departamento === departamento
    );
  };

  const getTrainingById = (id: number) => {
    return trainings.find(training => training.id === id);
  };

  const startTraining = (id: number) => {
    const now = new Date().toISOString();
    setTrainings(prev => prev.map(training => 
      training.id === id 
        ? { 
            ...training, 
            progress: training.progress || 1,
            lastAccessed: now,
            auditLog: [...training.auditLog, {
              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: now,
              ...createAuditEntry("started", "Treinamento iniciado pelo usuário", {
                previousProgress: training.progress || 0
              })
            }]
          }
        : training
    ));
  };

  const pauseTraining = (id: number) => {
    const now = new Date().toISOString();
    setTrainings(prev => prev.map(training => 
      training.id === id 
        ? { 
            ...training, 
            lastAccessed: now,
            auditLog: [...training.auditLog, {
              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: now,
              ...createAuditEntry("paused", "Treinamento pausado pelo usuário", {
                currentProgress: training.progress || 0
              })
            }]
          }
        : training
    ));
  };

  const completeTraining = (id: number) => {
    const now = new Date().toISOString();
    setTrainings(prev => prev.map(training => 
      training.id === id 
        ? { 
            ...training, 
            progress: 100,
            completed: true,
            lastAccessed: now,
            auditLog: [...training.auditLog, {
              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: now,
              ...createAuditEntry("completed", "Treinamento concluído com sucesso", {
                finalProgress: 100,
                completed: true
              })
            }]
          }
        : training
    ));
  };

  const accessTraining = (id: number) => {
    const now = new Date().toISOString();
    setTrainings(prev => prev.map(training => 
      training.id === id 
        ? { 
            ...training, 
            lastAccessed: now,
            auditLog: [...training.auditLog, {
              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: now,
              ...createAuditEntry("accessed", "Treinamento acessado pelo usuário", {
                currentProgress: training.progress || 0
              })
            }]
          }
        : training
    ));
  };

  return (
    <TrainingContext.Provider value={{
      trainings,
      createTraining,
      updateTraining,
      deleteTraining,
      getActiveTrainings,
      getTrainingById,
      getTrainingsByDepartment,
      startTraining,
      pauseTraining,
      completeTraining,
      accessTraining,
      addAuditLog
    }}>
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const context = useContext(TrainingContext);
  if (context === undefined) {
    throw new Error('useTraining deve ser usado dentro de um TrainingProvider');
  }
  return context;
}