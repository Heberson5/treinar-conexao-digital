import React, { createContext, useContext, useState, ReactNode } from "react"
import { Users, Zap, Crown, Building2 } from "lucide-react"

export interface Plano {
  id: string
  nome: string
  preco: number
  periodo: string
  descricao: string
  limiteUsuarios: number
  recursos: string[]
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
      "Até 3 usuários (incluindo administrador)",
      "Treinamentos ilimitados",
      "Certificados digitais",
      "Relatórios básicos",
      "Suporte por email"
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
      "Até 5 usuários (incluindo administrador)",
      "Treinamentos ilimitados",
      "Certificados personalizados",
      "Relatórios avançados",
      "Suporte prioritário",
      "Integração com calendário"
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
      "Até 15 usuários (incluindo administrador)",
      "Treinamentos ilimitados",
      "Certificados personalizados",
      "Analytics completo",
      "Suporte 24/7",
      "API de integração",
      "Gestão de departamentos"
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
      "50 usuários base (incluindo administrador)",
      "Pacotes adicionais de 5 usuários",
      "Treinamentos ilimitados",
      "White label",
      "Analytics avançado",
      "Suporte dedicado",
      "SLA garantido",
      "Customizações sob demanda"
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
  atualizarPlano: (id: string, dados: Partial<Plano>) => void
  adicionarRecurso: (planoId: string, recurso: string) => void
  removerRecurso: (planoId: string, index: number) => void
  getPlanoById: (id: string) => Plano | undefined
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

  const adicionarRecurso = (planoId: string, recurso: string) => {
    setPlanos(prev => prev.map(p => 
      p.id === planoId 
        ? { ...p, recursos: [...p.recursos, recurso] }
        : p
    ))
  }

  const removerRecurso = (planoId: string, index: number) => {
    setPlanos(prev => prev.map(p => 
      p.id === planoId 
        ? { ...p, recursos: p.recursos.filter((_, i) => i !== index) }
        : p
    ))
  }

  const getPlanoById = (id: string) => planos.find(p => p.id === id)

  return (
    <PlansContext.Provider value={{ 
      planos, 
      planosAtivos,
      atualizarPlano, 
      adicionarRecurso, 
      removerRecurso,
      getPlanoById
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
