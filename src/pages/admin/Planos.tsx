import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Users } from "lucide-react"
import { usePlans, ICONES_PLANOS } from "@/contexts/plans-context"

function getIconComponent(iconName: string) {
  return ICONES_PLANOS[iconName] || Users
}

export default function Planos() {
  const { planos } = usePlans()

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold">Planos e Preços</h1>
        <p className="text-muted-foreground mt-2">
          Escolha o plano ideal para sua empresa. Todos os planos incluem acesso completo à plataforma de treinamentos.
        </p>
      </div>

      {/* Grade de Planos – sempre 4 planos (Básico, Plus, Premium, Enterprise) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {planos.map((plano) => {
          const IconComponent = getIconComponent(plano.icon)

          return (
            <Card
              key={plano.id}
              className={`relative flex flex-col ${
                plano.popular ? "border-primary shadow-lg scale-105" : ""
              }`}
            >
              {plano.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Mais Popular
                </Badge>
              )}

              <CardHeader className="text-center pb-2">
                <div className={`mx-auto p-3 rounded-full ${plano.cor} text-white mb-3`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{plano.nome}</CardTitle>
                <CardDescription className="min-h-[40px]">
                  {plano.descricao}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col">
                {/* Preço */}
                <div className="text-center mb-6">
                  <span className="text-4xl font-bold">
                    R$ {plano.preco.toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-muted-foreground">{plano.periodo}</span>
                </div>

                {/* Limite de usuários */}
                <div className="flex items-center justify-center gap-2 mb-4 p-2 bg-muted rounded-lg">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {plano.id === "enterprise"
                      ? `${plano.limiteUsuarios} usuários + pacotes adicionais`
                      : `Até ${plano.limiteUsuarios} usuários`}
                  </span>
                </div>

                {/* Lista de recursos */}
                <ul className="space-y-2 flex-1">
                  {plano.recursos.map((recurso, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{recurso}</span>
                    </li>
                  ))}
                </ul>

                {/* Botão de ação (opcional, mantém o comportamento antigo) */}
                <Button
                  className={`w-full mt-6 ${plano.popular ? "bg-gradient-primary" : ""}`}
                  variant={plano.popular ? "default" : "outline"}
                >
                  Selecionar Plano
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Informações adicionais do plano Enterprise */}
      <Card className="bg-muted/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-amber-500 text-white">
              {/* O ícone do Enterprise continua o mesmo do contexto (building) */}
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Plano Enterprise - Pacotes Adicionais</h3>
              <p className="text-muted-foreground mt-1">
                No plano Enterprise, sua empresa pode contratar pacotes adicionais de usuários,
                mantendo a escalabilidade para grandes equipes.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Os detalhes de valor e quantidade de usuários por pacote são definidos no contexto
                de planos e refletidos na área de contratação/comercial.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
