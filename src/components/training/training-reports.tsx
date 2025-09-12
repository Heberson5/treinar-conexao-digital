import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { 
  Download, 
  FileText, 
  TrendingUp, 
  Users, 
  Clock, 
  Award, 
  BarChart3,
  Calendar,
  Filter,
  Target,
  CheckCircle
} from "lucide-react"
import { useBrazilianDate } from "@/hooks/use-brazilian-date"

interface TrainingReportsProps {
  trainings: any[]
  timeRange?: "7d" | "30d" | "90d" | "1y"
}

export function TrainingReports({ trainings, timeRange = "30d" }: TrainingReportsProps) {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "1y">(timeRange)
  const { formatDate } = useBrazilianDate()

  // Simulated report data
  const reportData = {
    totalTrainings: trainings.length,
    totalParticipants: trainings.reduce((acc, t) => acc + t.participantes, 0),
    avgCompletionRate: 78,
    totalHours: trainings.reduce((acc, t) => acc + parseInt(t.duracao?.replace(/\D/g, '') || '0'), 0),
    topPerformingTrainings: trainings.slice(0, 5),
    categoryBreakdown: [
      { category: "Segurança", count: 8, completion: 85 },
      { category: "Liderança", count: 5, completion: 72 },
      { category: "Vendas", count: 6, completion: 90 },
      { category: "Tecnologia", count: 4, completion: 68 },
      { category: "Soft Skills", count: 3, completion: 82 }
    ],
    monthlyProgress: [
      { month: "Jan", completed: 45, started: 68 },
      { month: "Fev", completed: 52, started: 71 },
      { month: "Mar", completed: 38, started: 55 },
      { month: "Abr", completed: 61, started: 82 },
      { month: "Mai", completed: 48, started: 64 },
      { month: "Jun", completed: 55, started: 73 }
    ]
  }

  const exportReport = (format: 'pdf' | 'excel') => {
    // Simulated export functionality
    const blob = new Blob(['Relatório de treinamentos...'], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-treinamentos.${format === 'pdf' ? 'pdf' : 'xlsx'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Relatórios de Treinamentos</h2>
          <p className="text-muted-foreground">Análise detalhada do desempenho dos treinamentos</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <Download className="mr-2 h-4 w-4" />
            Excel
          </Button>
          
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reportData.totalTrainings}</p>
                <p className="text-sm text-muted-foreground">Treinamentos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reportData.totalParticipants}</p>
                <p className="text-sm text-muted-foreground">Total de Participantes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reportData.avgCompletionRate}%</p>
                <p className="text-sm text-muted-foreground">Taxa Média de Conclusão</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reportData.totalHours}h</p>
                <p className="text-sm text-muted-foreground">Horas de Treinamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Trainings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Treinamentos de Melhor Performance
            </CardTitle>
            <CardDescription>
              Baseado na taxa de conclusão e avaliações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.topPerformingTrainings.map((training, index) => (
                <div key={training.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium line-clamp-1">{training.titulo}</h4>
                      <p className="text-sm text-muted-foreground">{training.categoria}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {85 + index * 2}% conclusão
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Breakdown por Categoria
            </CardTitle>
            <CardDescription>
              Distribuição e performance por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.categoryBreakdown.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{category.count} cursos</span>
                      <span className="text-sm font-medium">{category.completion}%</span>
                    </div>
                  </div>
                  <Progress value={category.completion} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progresso Mensal
          </CardTitle>
          <CardDescription>
            Comparação entre treinamentos iniciados e concluídos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.monthlyProgress.map((month, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{month.month}</span>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Iniciados: {month.started}</span>
                    <span>Concluídos: {month.completed}</span>
                  </div>
                </div>
                <div className="flex gap-1 h-3">
                  <div 
                    className="bg-blue-200 rounded"
                    style={{ width: `${(month.started / 100) * 100}%` }}
                  />
                  <div 
                    className="bg-green-500 rounded"
                    style={{ width: `${(month.completed / 100) * 100}%` }}
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

      {/* Summary Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Resumo Executivo
          </CardTitle>
          <CardDescription>
            Principais insights e recomendações do período
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">Destaques Positivos</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Taxa de conclusão acima da meta (78%)</li>
                <li>• Crescimento de 15% em participantes</li>
                <li>• Alta satisfação em treinamentos de Vendas</li>
                <li>• Redução de 20% no tempo médio de conclusão</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-yellow-600">Pontos de Atenção</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Baixa adesão em treinamentos de Tecnologia</li>
                <li>• Taxa de abandono elevada no primeiro módulo</li>
                <li>• Necessidade de mais conteúdo prático</li>
                <li>• Feedback sobre duração excessiva</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-blue-600">Recomendações</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Implementar módulos mais curtos</li>
                <li>• Adicionar mais elementos interativos</li>
                <li>• Criar trilhas de aprendizado personalizadas</li>
                <li>• Melhorar onboarding inicial</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}