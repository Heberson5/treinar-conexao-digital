import React, { createContext, useContext, useState, ReactNode } from "react"
import { Users, Zap, Crown, Building2 } from "lucide-react"

// Lista pré-definida de recursos do sistema
export type RecursoId = 
  | "usuarios"
  | "treinamentos"
  | "certificados"
  | "relatorios_basicos"
  | "relatorios_avancados"
  | "analytics"
  | "suporte_email"
  | "suporte_prioritario"
  | "suporte_24h"
  | "suporte_dedicado"
  | "integracao_calendario"
  | "api_integracao"
  | "gestao_departamentos"
  | "white_label"
  | "sla_garantido"
  | "customizacoes"
  | "pacotes_adicionais"

export interface RecursoSistema {
  id: RecursoId
  nome: string
  descricao: string
  categoria: "usuarios" | "treinamento" | "relatorios" | "suporte" | "integracao" | "enterprise"
}

// Definição de todos os recursos disponíveis no sistema
export const RECURSOS_SISTEMA: RecursoSistema[] = [
  { id: "usuarios", nome: "Limite de Usuários", descricao: "Quantidade máxima de usuários permitidos", categoria: "usuarios" },
  { id: "treinamentos", nome: "Treinamentos", descricao: "Acesso a treinamentos da plataforma", categoria: "treinamento" },
  { id: "certificados", nome: "Certificados Digitais", descricao: "Emissão de certificados digitais", categoria: "treinamento" },
  { id: "relatorios_basicos", nome: "Relatórios Básicos", descricao: "Acesso a relatórios básicos", categoria: "relatorios" },
  { id: "relatorios_avancados", nome: "Relatórios Avançados", descricao: "Acesso a relatórios detalhados", categoria: "relatorios" },
  { id: "analytics", nome: "Analytics Completo", descricao: "Dashboard de analytics avançado", categoria: "relatorios" },
  { id: "suporte_email", nome: "Suporte por Email", descricao: "Suporte via email", categoria: "suporte" },
  { id: "suporte_prioritario", nome: "Suporte Prioritário", descricao: "Atendimento prioritário", categoria: "suporte" },
  { id: "suporte_24h", nome: "Suporte 24/7", descricao: "Suporte disponível 24 horas", categoria: "suporte" },
  { id: "suporte_dedicado", nome: "Suporte Dedicado", descricao: "Gerente de conta dedicado", categoria: "suporte" },
  { id: "integracao_calendario", nome: "Integração com Calendário", descricao: "Sincronização com calendários externos", categoria: "integracao" },
  { id: "api_integracao", nome: "API de Integração", descricao: "Acesso à API para integrações", categoria: "integracao" },
  { id: "gestao_departamentos", nome: "Gestão de Departamentos", descricao: "Gerenciamento por departamentos", categoria: "integracao" },
  { id: "white_label", nome: "White Label", descricao: "Personalização completa da marca", categoria: "enterprise" },
  { id: "sla_garantido", nome: "SLA Garantido", descricao: "Acordo de nível de serviço", categoria: "enterprise" },
  { id: "customizacoes", nome: "Customizações sob Demanda", descricao: "Desenvolvimento personalizado", categoria: "enterprise" },
  { id: "pacotes_adicionais", nome: "Pacotes de Usuários Adicionais", descricao: "Contratação de pacotes extras", categoria: "enterprise" }
]

// Configuração de recurso por plano
export interface RecursoPlano {
  recursoId: RecursoId
  habilitado: boolean
  limite?: number // undefined = ilimitado, número = limite específico
  descricaoCustomizada?: string // descrição personalizada para exibição
}

export interface Plano {
  id: string
  nome: string
  preco: number
  periodo: string
  descricao: string
  limiteUsuarios: number
  recursos: RecursoPlano[]
  popular?: boolean
  icon: string
  cor: string
  ativo: boolean
  precoPacoteAdicional?: number
  usuariosPorPacote?: number
}

export const ICONES_PLANOS: Record<string, React.ElementType> = {
  users: Users,
  zap: Zap,
  crown: Crown,
  building: Building2
}

const planosIniciais: Plano[] = [
  {
    id: "basico",
    nome: "Básico",
    preco: 99,
    periodo: "/mês",
    descricao: "Ideal para pequenas empresas que estão começando",
    limiteUsuarios: 3,
    recursos: [
      { recursoId: "usuarios", habilitado: true, limite: 3, descricaoCustomizada: "Até 3 usuários (incluindo administrador)" },
      { recursoId: "treinamentos", habilitado: true, descricaoCustomizada: "Treinamentos ilimitados" },
      { recursoId: "certificados", habilitado: true, limite: 10, descricaoCustomizada: "Até 10 certificados por mês" },
      { recursoId: "relatorios_basicos", habilitado: true, descricaoCustomizada: "Relatórios básicos" },
      { recursoId: "suporte_email", habilitado: true, descricaoCustomizada: "Suporte por email" },
      { recursoId: "relatorios_avancados", habilitado: false },
      { recursoId: "analytics", habilitado: false },
      { recursoId: "suporte_prioritario", habilitado: false },
      { recursoId: "suporte_24h", habilitado: false },
      { recursoId: "suporte_dedicado", habilitado: false },
      { recursoId: "integracao_calendario", habilitado: false },
      { recursoId: "api_integracao", habilitado: false },
      { recursoId: "gestao_departamentos", habilitado: false },
      { recursoId: "white_label", habilitado: false },
      { recursoId: "sla_garantido", habilitado: false },
      { recursoId: "customizacoes", habilitado: false },
      { recursoId: "pacotes_adicionais", habilitado: false }
    ],
    icon: "users",
    cor: "bg-slate-500",
    ativo: true
  },
  {
    id: "plus",
    nome: "Plus",
    preco: 199,
    periodo: "/mês",
    descricao: "Para equipes em crescimento que precisam de mais recursos",
    limiteUsuarios: 5,
    recursos: [
      { recursoId: "usuarios", habilitado: true, limite: 5, descricaoCustomizada: "Até 5 usuários (incluindo administrador)" },
      { recursoId: "treinamentos", habilitado: true, descricaoCustomizada: "Treinamentos ilimitados" },
      { recursoId: "certificados", habilitado: true, limite: 30, descricaoCustomizada: "Até 30 certificados por mês" },
      { recursoId: "relatorios_basicos", habilitado: true, descricaoCustomizada: "Relatórios básicos" },
      { recursoId: "relatorios_avancados", habilitado: true, descricaoCustomizada: "Relatórios avançados" },
      { recursoId: "suporte_email", habilitado: true, descricaoCustomizada: "Suporte por email" },
      { recursoId: "suporte_prioritario", habilitado: true, descricaoCustomizada: "Suporte prioritário" },
      { recursoId: "integracao_calendario", habilitado: true, descricaoCustomizada: "Integração com calendário" },
      { recursoId: "analytics", habilitado: false },
      { recursoId: "suporte_24h", habilitado: false },
      { recursoId: "suporte_dedicado", habilitado: false },
      { recursoId: "api_integracao", habilitado: false },
      { recursoId: "gestao_departamentos", habilitado: false },
      { recursoId: "white_label", habilitado: false },
      { recursoId: "sla_garantido", habilitado: false },
      { recursoId: "customizacoes", habilitado: false },
      { recursoId: "pacotes_adicionais", habilitado: false }
    ],
    icon: "zap",
    cor: "bg-blue-500",
    ativo: true
  },
  {
    id: "premium",
    nome: "Premium",
    preco: 399,
    periodo: "/mês",
    descricao: "Solução completa para empresas de médio porte",
    limiteUsuarios: 15,
    recursos: [
      { recursoId: "usuarios", habilitado: true, limite: 15, descricaoCustomizada: "Até 15 usuários (incluindo administrador)" },
      { recursoId: "treinamentos", habilitado: true, descricaoCustomizada: "Treinamentos ilimitados" },
      { recursoId: "certificados", habilitado: true, descricaoCustomizada: "Certificados ilimitados" },
      { recursoId: "relatorios_basicos", habilitado: true, descricaoCustomizada: "Relatórios básicos" },
      { recursoId: "relatorios_avancados", habilitado: true, descricaoCustomizada: "Relatórios avançados" },
      { recursoId: "analytics", habilitado: true, descricaoCustomizada: "Analytics completo" },
      { recursoId: "suporte_email", habilitado: true, descricaoCustomizada: "Suporte por email" },
      { recursoId: "suporte_prioritario", habilitado: true, descricaoCustomizada: "Suporte prioritário" },
      { recursoId: "suporte_24h", habilitado: true, descricaoCustomizada: "Suporte 24/7" },
      { recursoId: "integracao_calendario", habilitado: true, descricaoCustomizada: "Integração com calendário" },
      { recursoId: "api_integracao", habilitado: true, descricaoCustomizada: "API de integração" },
      { recursoId: "gestao_departamentos", habilitado: true, descricaoCustomizada: "Gestão de departamentos" },
      { recursoId: "suporte_dedicado", habilitado: false },
      { recursoId: "white_label", habilitado: false },
      { recursoId: "sla_garantido", habilitado: false },
      { recursoId: "customizacoes", habilitado: false },
      { recursoId: "pacotes_adicionais", habilitado: false }
    ],
    popular: true,
    icon: "crown",
    cor: "bg-purple-500",
    ativo: true
  },
  {
    id: "enterprise",
    nome: "Enterprise",
    preco: 799,
    periodo: "/mês",
    descricao: "Para grandes empresas com necessidades específicas",
    limiteUsuarios: 50,
    recursos: [
      { recursoId: "usuarios", habilitado: true, limite: 50, descricaoCustomizada: "50 usuários base (incluindo administrador)" },
      { recursoId: "pacotes_adicionais", habilitado: true, descricaoCustomizada: "Pacotes adicionais de 5 usuários" },
      { recursoId: "treinamentos", habilitado: true, descricaoCustomizada: "Treinamentos ilimitados" },
      { recursoId: "certificados", habilitado: true, descricaoCustomizada: "Certificados ilimitados" },
      { recursoId: "relatorios_basicos", habilitado: true, descricaoCustomizada: "Relatórios básicos" },
      { recursoId: "relatorios_avancados", habilitado: true, descricaoCustomizada: "Relatórios avançados" },
      { recursoId: "analytics", habilitado: true, descricaoCustomizada: "Analytics avançado" },
      { recursoId: "suporte_email", habilitado: true, descricaoCustomizada: "Suporte por email" },
      { recursoId: "suporte_prioritario", habilitado: true, descricaoCustomizada: "Suporte prioritário" },
      { recursoId: "suporte_24h", habilitado: true, descricaoCustomizada: "Suporte 24/7" },
      { recursoId: "suporte_dedicado", habilitado: true, descricaoCustomizada: "Suporte dedicado" },
      { recursoId: "integracao_calendario", habilitado: true, descricaoCustomizada: "Integração com calendário" },
      { recursoId: "api_integracao", habilitado: true, descricaoCustomizada: "API de integração" },
      { recursoId: "gestao_departamentos", habilitado: true, descricaoCustomizada: "Gestão de departamentos" },
      { recursoId: "white_label", habilitado: true, descricaoCustomizada: "White label" },
      { recursoId: "sla_garantido", habilitado: true, descricaoCustomizada: "SLA garantido" },
      { recursoId: "customizacoes", habilitado: true, descricaoCustomizada: "Customizações sob demanda" }
    ],
    icon: "building",
    cor: "bg-amber-500",
    ativo: true,
    precoPacoteAdicional: 150,
    usuariosPorPacote: 5
  }
]

interface PlansContextType {
  planos: Plano[]
  planosAtivos: Plano[]
  recursosSistema: RecursoSistema[]
  atualizarPlano: (id: string, dados: Partial<Plano>) => void
  atualizarRecursoPlano: (planoId: string, recursoId: RecursoId, dados: Partial<RecursoPlano>) => void
  getPlanoById: (id: string) => Plano | undefined
  getRecursoPlano: (planoId: string, recursoId: RecursoId) => RecursoPlano | undefined
  verificarPermissao: (planoId: string, recursoId: RecursoId) => boolean
  getLimiteRecurso: (planoId: string, recursoId: RecursoId) => number | undefined
  getRecursosHabilitados: (planoId: string) => RecursoPlano[]
}

const PlansContext = createContext<PlansContextType | undefined>(undefined)

export function PlansProvider({ children }: { children: ReactNode }) {
  const [planos, setPlanos] = useState<Plano[]>(planosIniciais)

  const planosAtivos = planos.filter(p => p.ativo)

  const atualizarPlano = (id: string, dados: Partial<Plano>) => {
    setPlanos(prev => prev.map(p => 
      p.id === id ? { ...p, ...dados } : p
    ))
  }

  const atualizarRecursoPlano = (planoId: string, recursoId: RecursoId, dados: Partial<RecursoPlano>) => {
    setPlanos(prev => prev.map(p => {
      if (p.id !== planoId) return p
      return {
        ...p,
        recursos: p.recursos.map(r => 
          r.recursoId === recursoId ? { ...r, ...dados } : r
        )
      }
    }))
  }

  const getPlanoById = (id: string) => planos.find(p => p.id === id)

  const getRecursoPlano = (planoId: string, recursoId: RecursoId): RecursoPlano | undefined => {
    const plano = getPlanoById(planoId)
    return plano?.recursos.find(r => r.recursoId === recursoId)
  }

  const verificarPermissao = (planoId: string, recursoId: RecursoId): boolean => {
    const recurso = getRecursoPlano(planoId, recursoId)
    return recurso?.habilitado ?? false
  }

  const getLimiteRecurso = (planoId: string, recursoId: RecursoId): number | undefined => {
    const recurso = getRecursoPlano(planoId, recursoId)
    return recurso?.limite
  }

  const getRecursosHabilitados = (planoId: string): RecursoPlano[] => {
    const plano = getPlanoById(planoId)
    return plano?.recursos.filter(r => r.habilitado) ?? []
  }

  return (
    <PlansContext.Provider value={{ 
      planos, 
      planosAtivos,
      recursosSistema: RECURSOS_SISTEMA,
      atualizarPlano, 
      atualizarRecursoPlano,
      getPlanoById,
      getRecursoPlano,
      verificarPermissao,
      getLimiteRecurso,
      getRecursosHabilitados
    }}>
      {children}
    </PlansContext.Provider>
  )
}

export function usePlans() {
  const context = useContext(PlansContext)
  if (context === undefined) {
    throw new Error("usePlans deve ser usado dentro de um PlansProvider")
  }
  return context
}
