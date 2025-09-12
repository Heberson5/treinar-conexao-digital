import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users, 
  Award, 
  Target,
  Calendar,
  PlayCircle,
  BookOpen,
  CheckCircle
} from "lucide-react"

interface TrainingAnalyticsProps {
  training: {
    id: number
    titulo: string
    categoria: string
    participantes: number
    totalViews: number
    avgCompletion: number
    avgRating: number
    totalTime: number
  }
  timeRange?: "7d" | "30d" | "90d"
}

export function TrainingAnalytics({ training, timeRange = "30d" }: TrainingAnalyticsProps) {
  // Dados simulados para analytics
  const analytics = {
    totalParticipants: training.participantes,
    activeUsers: Math.floor(training.participantes * 0.7),
    completionRate: training.avgCompletion,
    averageRating: training.avgRating,
    totalWatchTime: training.totalTime,
    dropoffRate: 100 - training.avgCompletion,
    engagement: 87,
    satisfaction: 92
  }

  const weeklyProgress = [
    { day: "Segunda", completed: 12, started: 18 },
    { day: "Terça", completed: 15, started: 22 },
    { day: "Quarta", completed: 8, started: 14 },
    { day: "Quinta", completed: 20, started: 28 },
    { day: "Sexta", completed: 25, started: 35 },
    { day: "Sábado", completed: 6, started: 8 },
    { day: "Domingo", completed: 4, started: 5 }
  ]

  const getEngagementColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? "text-yellow-400" : "text-gray-300"}>★</span>
    ))
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalParticipants}</p>
                <p className="text-sm text-muted-foreground">Participantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.completionRate}%</p>
                <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.floor(analytics.totalWatchTime / 60)}h</p>
                <p className="text-sm text-muted-foreground">Tempo Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold flex items-center">
                  {analytics.averageRating.toFixed(1)}
                  <span className="ml-1 text-sm">★</span>
                </p>
                <p className="text-sm text-muted-foreground">Avaliação Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Métricas de Engajamento
            </CardTitle>
            <CardDescription>
              Indicadores de qualidade e satisfação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Taxa de Engajamento</span>
                <span className={`text-sm font-bold ${getEngagementColor(analytics.engagement)}`}>
                  {analytics.engagement}%
                </span>
              </div>
              <Progress value={analytics.engagement} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Satisfação Geral</span>
                <span className={`text-sm font-bold ${getEngagementColor(analytics.satisfaction)}`}>
                  {analytics.satisfaction}%
                </span>
              </div>
              <Progress value={analytics.satisfaction} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Taxa de Abandono</span>
                <span className="text-sm font-bold text-red-600">
                  {analytics.dropoffRate}%
                </span>
              </div>
              <Progress value={analytics.dropoffRate} className="h-2" />
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avaliação Detalhada</span>
                <div className="flex items-center gap-1">
                  {getRatingStars(Math.round(analytics.averageRating))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    ({analytics.averageRating.toFixed(1)})
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Progresso Semanal
            </CardTitle>
            <CardDescription>
              Iniciados vs Concluídos por dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyProgress.map((day, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{day.day}</span>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>Iniciados: {day.started}</span>
                      <span>Concluídos: {day.completed}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 h-2">
                    <div 
                      className="bg-blue-200 rounded"
                      style={{ width: `${(day.started / 35) * 100}%` }}
                    />
                    <div 
                      className="bg-green-500 rounded"
                      style={{ width: `${(day.completed / 35) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center gap-4 mt-6 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 rounded"></div>
                <span>Iniciados</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Concluídos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Resumo de Performance
          </CardTitle>
          <CardDescription>
            Principais insights e recomendações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">Pontos Fortes</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Alta taxa de satisfação ({analytics.satisfaction}%)</li>
                <li>• Boa avaliação média ({analytics.averageRating}/5.0)</li>
                <li>• Engajamento acima da média</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-600">Áreas de Melhoria</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Reduzir taxa de abandono</li>
                <li>• Aumentar participação nos fins de semana</li>
                <li>• Melhorar retenção inicial</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">Recomendações</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Adicionar checkpoints intermediários</li>
                <li>• Implementar gamificação</li>
                <li>• Criar sessões de revisão</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}