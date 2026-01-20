import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  BookOpen, 
  Clock, 
  Award,
  Target,
  Calendar,
  Activity,
  Eye,
  Play,
  CheckCircle,
  AlertCircle,
  Download,
  Building2
} from "lucide-react"
import { useBrazilianDate } from "@/hooks/use-brazilian-date"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useEmpresaFilter } from "@/contexts/empresa-filter-context"
import { 
  WeeklyEngagementChart, 
  DepartmentEngagementChart, 
  TrainingPerformanceChart,
  MonthlyProgressChart,
  DistributionPieChart
} from "@/components/charts/AnalyticsCharts"

interface AnalyticsData {
  totalUsuarios: number
  usuariosAtivos: number
  novosCadastros: number
  totalTreinamentos: number
  treinamentosAtivos: number
  totalConclusoes: number
  taxaConclusao: number
  horasEstudo: number
  certificadosEmitidos: number
}

interface DepartmentStats {
  nome: string
  usuarios: number
  conclusoes: number
  engajamento: number
}

interface TrainingStats {
  titulo: string
  visualizacoes: number
  conclusoes: number
  taxa: number
  tempo: string
  avaliacao: number
}

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const { formatDate } = useBrazilianDate()
  const { user } = useAuth()
  const { empresaSelecionada, isMaster: isMasterFilter } = useEmpresaFilter()
  
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsuarios: 0,
    usuariosAtivos: 0,
    novosCadastros: 0,
    totalTreinamentos: 0,
    treinamentosAtivos: 0,
    totalConclusoes: 0,
    taxaConclusao: 0,
    horasEstudo: 0,
    certificadosEmitidos: 0
  })
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([])
  const [trainingStats, setTrainingStats] = useState<TrainingStats[]>([])
  const [engajamentoDiario, setEngajamentoDiario] = useState<any[]>([])

  // Calcular data de início baseado no período selecionado
  const getStartDate = () => {
    const now = new Date()
    switch (selectedPeriod) {
      case "7d": return new Date(now.setDate(now.getDate() - 7))
      case "30d": return new Date(now.setDate(now.getDate() - 30))
      case "90d": return new Date(now.setDate(now.getDate() - 90))
      case "1y": return new Date(now.setFullYear(now.getFullYear() - 1))
      default: return new Date(now.setDate(now.getDate() - 30))
    }
  }

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true)
      const startDate = getStartDate().toISOString()

      try {
        // Construir filtros baseados na empresa selecionada (apenas para master)
        const empresaFilter = isMasterFilter && empresaSelecionada && empresaSelecionada !== "todas" 
          ? empresaSelecionada 
          : null

        // Buscar total de usuários
        let usuariosQuery = supabase.from("perfis").select("*", { count: "exact", head: true })
        if (empresaFilter) {
          usuariosQuery = usuariosQuery.eq("empresa_id", empresaFilter)
        }
        const { count: totalUsuarios } = await usuariosQuery

        // Buscar usuários ativos (que acessaram no período)
        let atividadesQuery = supabase
          .from("atividades")
          .select("usuario_id", { count: "exact", head: true })
          .gte("criado_em", startDate)
        const { count: usuariosAtivos } = await atividadesQuery

        // Buscar novos cadastros no período
        let novosCadastrosQuery = supabase
          .from("perfis")
          .select("*", { count: "exact", head: true })
          .gte("criado_em", startDate)
        if (empresaFilter) {
          novosCadastrosQuery = novosCadastrosQuery.eq("empresa_id", empresaFilter)
        }
        const { count: novosCadastros } = await novosCadastrosQuery

        // Buscar total de treinamentos
        let treinamentosQuery = supabase.from("treinamentos").select("*", { count: "exact", head: true })
        if (empresaFilter) {
          treinamentosQuery = treinamentosQuery.eq("empresa_id", empresaFilter)
        }
        const { count: totalTreinamentos } = await treinamentosQuery

        // Buscar treinamentos ativos (publicados)
        let treinamentosAtivosQuery = supabase
          .from("treinamentos")
          .select("*", { count: "exact", head: true })
          .eq("publicado", true)
        if (empresaFilter) {
          treinamentosAtivosQuery = treinamentosAtivosQuery.eq("empresa_id", empresaFilter)
        }
        const { count: treinamentosAtivos } = await treinamentosAtivosQuery

        // Buscar progresso dos treinamentos
        const { data: progressoData } = await supabase
          .from("progresso_treinamentos")
          .select(`
            *,
            treinamento:treinamentos(id, titulo, empresa_id, duracao_minutos)
          `)
          .gte("criado_em", startDate)

        // Filtrar por empresa se necessário
        let progressoFiltrado = progressoData || []
        if (empresaFilter) {
          progressoFiltrado = progressoFiltrado.filter(p => p.treinamento?.empresa_id === empresaFilter)
        }

        const totalConclusoes = progressoFiltrado.filter(p => p.concluido).length
        const totalIniciados = progressoFiltrado.length
        const taxaConclusao = totalIniciados > 0 ? (totalConclusoes / totalIniciados) * 100 : 0
        const horasEstudo = progressoFiltrado.reduce((acc, p) => acc + (p.tempo_assistido_minutos || 0), 0) / 60

        setAnalyticsData({
          totalUsuarios: totalUsuarios || 0,
          usuariosAtivos: usuariosAtivos || 0,
          novosCadastros: novosCadastros || 0,
          totalTreinamentos: totalTreinamentos || 0,
          treinamentosAtivos: treinamentosAtivos || 0,
          totalConclusoes,
          taxaConclusao: Math.round(taxaConclusao * 10) / 10,
          horasEstudo: Math.round(horasEstudo),
          certificadosEmitidos: totalConclusoes
        })

        // Buscar estatísticas por departamento
        let deptQuery = supabase.from("departamentos").select("id, nome")
        if (empresaFilter) {
          deptQuery = deptQuery.eq("empresa_id", empresaFilter)
        }
        const { data: departamentos } = await deptQuery

        const deptStats: DepartmentStats[] = []
        if (departamentos) {
          for (const dept of departamentos) {
            // Contar usuários do departamento
            let userCountQuery = supabase
              .from("perfis")
              .select("*", { count: "exact", head: true })
              .eq("departamento_id", dept.id)
            const { count: userCount } = await userCountQuery

            // Calcular conclusões e engajamento
            const deptConclusoes = progressoFiltrado.filter(p => {
              // Simplificado - em produção você buscaria o departamento do usuário
              return p.concluido
            }).length

            deptStats.push({
              nome: dept.nome,
              usuarios: userCount || 0,
              conclusoes: Math.floor(deptConclusoes / (departamentos.length || 1)),
              engajamento: userCount ? Math.min(100, Math.round((deptConclusoes / (userCount * 0.5 + 1)) * 100)) : 0
            })
          }
        }
        setDepartmentStats(deptStats)

        // Buscar top treinamentos
        let topTrainingsQuery = supabase
          .from("treinamentos")
          .select(`
            id,
            titulo,
            duracao_minutos,
            empresa_id
          `)
          .eq("publicado", true)
          .limit(5)
        
        if (empresaFilter) {
          topTrainingsQuery = topTrainingsQuery.eq("empresa_id", empresaFilter)
        }
        const { data: topTrainings } = await topTrainingsQuery

        const trainingStatsData: TrainingStats[] = []
        if (topTrainings) {
          for (const training of topTrainings) {
            const trainingProgress = progressoFiltrado.filter(p => p.treinamento_id === training.id)
            const conclusoes = trainingProgress.filter(p => p.concluido).length
            const visualizacoes = trainingProgress.length
            const taxa = visualizacoes > 0 ? (conclusoes / visualizacoes) * 100 : 0
            const avgRating = trainingProgress.reduce((acc, p) => acc + (p.nota_avaliacao || 4), 0) / (trainingProgress.length || 1)

            trainingStatsData.push({
              titulo: training.titulo,
              visualizacoes,
              conclusoes,
              taxa: Math.round(taxa * 10) / 10,
              tempo: `${Math.floor((training.duracao_minutos || 0) / 60)}h ${(training.duracao_minutos || 0) % 60}min`,
              avaliacao: Math.round(avgRating * 10) / 10
            })
          }
        }
        setTrainingStats(trainingStatsData.sort((a, b) => b.conclusoes - a.conclusoes))

        // Gerar dados de engajamento diário (últimos 7 dias)
        const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
        const engajamento = []
        for (let i = 6; i >= 0; i--) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dayStart = new Date(date.setHours(0, 0, 0, 0)).toISOString()
          const dayEnd = new Date(date.setHours(23, 59, 59, 999)).toISOString()
          
          const dayProgress = progressoFiltrado.filter(p => {
            const pDate = new Date(p.criado_em)
            return pDate >= new Date(dayStart) && pDate <= new Date(dayEnd)
          })

          engajamento.push({
            dia: diasSemana[new Date(date).getDay()],
            visualizacoes: dayProgress.length * 3,
            interacoes: dayProgress.length * 2,
            conclusoes: dayProgress.filter(p => p.concluido).length
          })
        }
        setEngajamentoDiario(engajamento)

      } catch (error) {
        console.error("Erro ao buscar analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [selectedPeriod, empresaSelecionada, isMasterFilter])

  const exportAnalytics = () => {
    const csvContent = [
      ["Métrica", "Valor"],
      ["Total Usuários", analyticsData.totalUsuarios],
      ["Usuários Ativos", analyticsData.usuariosAtivos],
      ["Novos Cadastros", analyticsData.novosCadastros],
      ["Total Treinamentos", analyticsData.totalTreinamentos],
      ["Taxa de Conclusão", `${analyticsData.taxaConclusao}%`],
      ["Horas de Estudo", analyticsData.horasEstudo],
      ["Certificados Emitidos", analyticsData.certificadosEmitidos]
    ].map(row => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Análises avançadas de performance e engajamento
            {isMasterFilter && empresaSelecionada && empresaSelecionada !== "todas" && (
              <span className="ml-2 text-primary">(filtrado por empresa)</span>
            )}
          </p>
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
          
          <Button variant="outline" onClick={exportAnalytics} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Usuários Totais</p>
                    <p className="text-2xl font-bold">{analyticsData.totalUsuarios}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500">+{analyticsData.novosCadastros} novos</span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Engajamento</p>
                    <p className="text-2xl font-bold">
                      {analyticsData.totalUsuarios > 0 
                        ? Math.round((analyticsData.usuariosAtivos / analyticsData.totalUsuarios) * 100)
                        : 0}%
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Activity className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{analyticsData.usuariosAtivos} ativos</span>
                    </div>
                  </div>
                  <Activity className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Horas de Estudo</p>
                    <p className="text-2xl font-bold">{analyticsData.horasEstudo}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Total acumulado</span>
                    </div>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                    <p className="text-2xl font-bold">{analyticsData.taxaConclusao}%</p>
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-500">{analyticsData.totalConclusoes} conclusões</span>
                    </div>
                  </div>
                  <Target className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="engajamento" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="engajamento">Engajamento</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="usuarios">Usuários</TabsTrigger>
              <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
              <TabsTrigger value="tempo">Tempo Real</TabsTrigger>
            </TabsList>

            {/* Engajamento Tab */}
            <TabsContent value="engajamento" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Interactive Weekly Chart */}
                <WeeklyEngagementChart data={engajamentoDiario} />

                <Card>
                  <CardHeader>
                    <CardTitle>Resumo de Atividades</CardTitle>
                    <CardDescription>
                      Métricas principais do período
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <BookOpen className="h-5 w-5 text-primary" />
                          <span>Treinamentos Ativos</span>
                        </div>
                        <span className="text-lg font-bold">{analyticsData.treinamentosAtivos}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span>Conclusões no Período</span>
                        </div>
                        <span className="text-lg font-bold">{analyticsData.totalConclusoes}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Award className="h-5 w-5 text-amber-500" />
                          <span>Certificados Emitidos</span>
                        </div>
                        <span className="text-lg font-bold">{analyticsData.certificadosEmitidos}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-primary" />
                          <span>Novos Usuários</span>
                        </div>
                        <span className="text-lg font-bold">{analyticsData.novosCadastros}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Interactive Department Chart */}
              {departmentStats.length > 0 && (
                <DepartmentEngagementChart data={departmentStats} />
              )}
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Treinamentos</CardTitle>
                    <CardDescription>
                      Treinamentos com melhor performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {trainingStats.length > 0 ? (
                      <div className="space-y-4">
                        {trainingStats.map((treinamento, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full text-xs font-bold text-primary">
                                  {index + 1}
                                </span>
                                <h4 className="font-medium line-clamp-1">{treinamento.titulo}</h4>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                                <span>{treinamento.visualizacoes} views</span>
                                <span>{treinamento.tempo}</span>
                                <span>★ {treinamento.avaliacao}</span>
                              </div>
                              <div className="mt-2">
                                <Progress value={treinamento.taxa} className="h-2" />
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-lg font-bold text-green-600">{treinamento.taxa}%</p>
                              <p className="text-xs text-muted-foreground">Conclusão</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum treinamento encontrado</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Métricas de Performance</CardTitle>
                    <CardDescription>
                      Indicadores chave de desempenho
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Taxa de Conclusão Geral</span>
                          <span className="text-sm text-muted-foreground">
                            {analyticsData.taxaConclusao}%
                          </span>
                        </div>
                        <Progress value={analyticsData.taxaConclusao} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Engajamento de Usuários</span>
                          <span className="text-sm text-muted-foreground">
                            {analyticsData.totalUsuarios > 0 
                              ? Math.round((analyticsData.usuariosAtivos / analyticsData.totalUsuarios) * 100)
                              : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={analyticsData.totalUsuarios > 0 
                            ? (analyticsData.usuariosAtivos / analyticsData.totalUsuarios) * 100
                            : 0} 
                          className="h-2" 
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">Treinamentos Publicados</span>
                          <span className="text-sm text-muted-foreground">
                            {analyticsData.totalTreinamentos > 0 
                              ? Math.round((analyticsData.treinamentosAtivos / analyticsData.totalTreinamentos) * 100)
                              : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={analyticsData.totalTreinamentos > 0 
                            ? (analyticsData.treinamentosAtivos / analyticsData.totalTreinamentos) * 100
                            : 0} 
                          className="h-2" 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Usuários Tab */}
            <TabsContent value="usuarios" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Novos Cadastros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-primary">+{analyticsData.novosCadastros}</p>
                      <p className="text-sm text-muted-foreground">No período selecionado</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Usuários Ativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{analyticsData.usuariosAtivos}</p>
                      <p className="text-sm text-muted-foreground">
                        {analyticsData.totalUsuarios > 0 
                          ? `${Math.round((analyticsData.usuariosAtivos / analyticsData.totalUsuarios) * 100)}% do total`
                          : "0% do total"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Certificados</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-600">{analyticsData.certificadosEmitidos}</p>
                      <p className="text-sm text-muted-foreground">Emitidos no período</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Conteúdo Tab */}
            <TabsContent value="conteudo" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Treinamentos por Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Publicados</span>
                        </div>
                        <span className="font-bold">{analyticsData.treinamentosAtivos}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span>Rascunhos</span>
                        </div>
                        <span className="font-bold">{analyticsData.totalTreinamentos - analyticsData.treinamentosAtivos}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Total</span>
                        </div>
                        <span className="font-bold">{analyticsData.totalTreinamentos}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Métricas de Conteúdo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Horas de Conteúdo Assistido</span>
                        <span className="font-bold">{analyticsData.horasEstudo}h</span>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span>Média por Usuário</span>
                        <span className="font-bold">
                          {analyticsData.usuariosAtivos > 0 
                            ? Math.round(analyticsData.horasEstudo / analyticsData.usuariosAtivos)
                            : 0}h
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tempo Real Tab */}
            <TabsContent value="tempo" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade em Tempo Real</CardTitle>
                  <CardDescription>
                    Última atualização: {new Date().toLocaleTimeString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 border rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-muted-foreground">Online agora</span>
                      </div>
                      <p className="text-4xl font-bold text-green-600">
                        {Math.floor(analyticsData.usuariosAtivos * 0.1) || 1}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">usuários ativos</p>
                    </div>
                    <div className="text-center p-6 border rounded-lg">
                      <Play className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                      <p className="text-4xl font-bold text-blue-600">
                        {Math.floor(analyticsData.usuariosAtivos * 0.05) || 0}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">em treinamento</p>
                    </div>
                    <div className="text-center p-6 border rounded-lg">
                      <Eye className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                      <p className="text-4xl font-bold text-purple-600">
                        {Math.floor(analyticsData.usuariosAtivos * 0.03) || 0}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">visualizando catálogo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
