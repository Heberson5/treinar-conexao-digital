import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Users, 
  Award,
  PlayCircle,
  Calendar,
  Target
} from "lucide-react"

export default function Dashboard() {
  const stats = [
    {
      title: "Treinamentos Ativos",
      value: "24",
      change: "+12%",
      trend: "up",
      icon: BookOpen,
      color: "text-blue-600"
    },
    {
      title: "Usuários Cadastrados", 
      value: "1,234",
      change: "+8%",
      trend: "up",
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Taxa de Conclusão",
      value: "87%",
      change: "+5%",
      trend: "up",
      icon: Target,
      color: "text-purple-600"
    },
    {
      title: "Horas de Treinamento",
      value: "2,847",
      change: "+23%",
      trend: "up",
      icon: Clock,
      color: "text-orange-600"
    }
  ]

  const recentTrainings = [
    {
      id: 1,
      title: "Segurança no Trabalho",
      department: "Operações",
      progress: 85,
      status: "Em andamento",
      participants: 45,
      dueDate: "2024-01-30"
    },
    {
      id: 2,
      title: "Atendimento ao Cliente",
      department: "Vendas",
      progress: 100,
      status: "Concluído",
      participants: 32,
      dueDate: "2024-01-25"
    },
    {
      id: 3,
      title: "Gestão de Tempo",
      department: "Administrativo", 
      progress: 45,
      status: "Em andamento",
      participants: 28,
      dueDate: "2024-02-05"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe o desempenho e progresso dos treinamentos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> desde o mês passado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Treinamentos Recentes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Treinamentos Recentes
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso dos treinamentos em andamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrainings.map((training) => (
                <div key={training.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{training.title}</h4>
                      <Badge variant={training.status === "Concluído" ? "default" : "secondary"}>
                        {training.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {training.department} • {training.participants} participantes
                    </p>
                    <div className="flex items-center gap-2">
                      <Progress value={training.progress} className="flex-1" />
                      <span className="text-sm font-medium">{training.progress}%</span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <Button variant="ghost" size="icon">
                      <PlayCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas ações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Novo usuário cadastrado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    João Silva se cadastrou no sistema
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Há 2 horas
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Treinamento concluído
                  </p>
                  <p className="text-xs text-muted-foreground">
                    "Atendimento ao Cliente" foi finalizado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Há 4 horas
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Novo treinamento criado
                  </p>
                  <p className="text-xs text-muted-foreground">
                    "Liderança Eficaz" foi adicionado ao catálogo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ontem
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progresso Mensal
          </CardTitle>
          <CardDescription>
            Evolução das métricas de treinamento nos últimos meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/10">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Gráfico de progresso será implementado</p>
              <p className="text-sm text-muted-foreground">Integração com biblioteca de gráficos em desenvolvimento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}