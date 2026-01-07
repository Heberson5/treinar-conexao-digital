import React, { createContext, useContext, useState, ReactNode } from "react"
import { Users, Zap, Crown, Building2 } from "lucide-react"


// Lista pré-definida de recursos do sistema
export type RecursoId = 
@@ -57,6 +58,13 @@ export interface RecursoPlano {
  descricaoCustomizada?: string // descrição personalizada para exibição
}








// Configuração global de desconto anual
export interface ConfiguracaoDescontoAnual {
  habilitado: boolean
@@ -70,6 +78,8 @@ export interface Plano {
  periodo: string
  descricao: string
  limiteUsuarios: number


  recursos: RecursoPlano[]
  popular?: boolean
  icon: string
@@ -81,142 +91,22 @@ export interface Plano {

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
  descontoAnual: ConfiguracaoDescontoAnual

  atualizarPlano: (id: string, dados: Partial<Plano>) => void
  atualizarRecursoPlano: (planoId: string, recursoId: RecursoId, dados: Partial<RecursoPlano>) => void
  atualizarDescontoAnual: (dados: Partial<ConfiguracaoDescontoAnual>) => void
@@ -226,17 +116,74 @@ interface PlansContextType {
  getLimiteRecurso: (planoId: string, recursoId: RecursoId) => number | undefined
  getRecursosHabilitados: (planoId: string) => RecursoPlano[]
  calcularPrecoAnual: (preco: number) => { precoAnual: number, precoComDesconto: number, economia: number }

}

const PlansContext = createContext<PlansContextType | undefined>(undefined)

export function PlansProvider({ children }: { children: ReactNode }) {
  const [planos, setPlanos] = useState<Plano[]>(planosIniciais)

  const [descontoAnual, setDescontoAnual] = useState<ConfiguracaoDescontoAnual>({
    habilitado: false,
    percentual: 15 // 15% de desconto padrão
  })
