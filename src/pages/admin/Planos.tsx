import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Users, Zap, Crown, Building2 } from "lucide-react"

interface Plano {
  id: string
  nome: string
  preco: number
  periodo: string
  descricao: string
  limiteUsuarios: number
  recursos: string[]
  popular?: boolean
  icon: React.ElementType
  cor: string
}

const planos: Plano[] = [
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
    icon: Users,
    cor: "bg-slate-500"
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
    icon: Zap,
    cor: "bg-blue-500"
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
    icon: Crown,
    cor: "bg-purple-500"
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
    icon: Building2,
    cor: "bg-amber-500"
  }
]

export default function Planos() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Planos e Preços</h1>
        <p className="text-muted-foreground mt-2">
          Escolha o plano ideal para sua empresa. Todos os planos incluem acesso completo à plataforma de treinamentos.
        </p>
      </div>

      {/* Planos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {planos.map((plano) => (
          <Card 
            key={plano.id} 
            className={`relative flex flex-col ${plano.popular ? 'border-primary shadow-lg scale-105' : ''}`}
          >
            {plano.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                Mais Popular
              </Badge>
            )}
            
            <CardHeader className="text-center pb-2">
              <div className={`mx-auto p-3 rounded-full ${plano.cor} text-white mb-3`}>
                <plano.icon className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">{plano.nome}</CardTitle>
              <CardDescription className="min-h-[40px]">{plano.descricao}</CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col">
              <div className="text-center mb-6">
                <span className="text-4xl font-bold">R$ {plano.preco}</span>
                <span className="text-muted-foreground">{plano.periodo}</span>
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-4 p-2 bg-muted rounded-lg">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {plano.id === "enterprise" 
                    ? `${plano.limiteUsuarios} usuários + pacotes` 
                    : `Até ${plano.limiteUsuarios} usuários`}
                </span>
              </div>
              
              <ul className="space-y-2 flex-1">
                {plano.recursos.map((recurso, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{recurso}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full mt-6 ${plano.popular ? 'bg-gradient-primary' : ''}`}
                variant={plano.popular ? "default" : "outline"}
              >
                Selecionar Plano
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info adicional Enterprise */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-amber-500 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Plano Enterprise - Pacotes Adicionais</h3>
              <p className="text-muted-foreground mt-1">
                No plano Enterprise, sua empresa pode contratar pacotes adicionais de usuários. 
                Cada pacote contém <strong>5 usuários</strong> e custa <strong>R$ 150,00/mês</strong>.
                A contratação é feita por pacote, não sendo possível contratar usuários individuais.
              </p>
              <div className="mt-4 flex gap-4">
                <div className="bg-background p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Preço por pacote</p>
                  <p className="font-bold text-lg">R$ 150,00/mês</p>
                </div>
                <div className="bg-background p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Usuários por pacote</p>
                  <p className="font-bold text-lg">5 usuários</p>
                </div>
                <div className="bg-background p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Mínimo por contratação</p>
                  <p className="font-bold text-lg">1 pacote</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
