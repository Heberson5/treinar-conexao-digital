import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
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
  CheckCircle,
  Building2,
  BookOpen,
  Loader2
} from "lucide-react"
import { useBrazilianDate } from "@/hooks/use-brazilian-date"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useEmpresaFilter } from "@/contexts/empresa-filter-context"

interface ReportData {
  totalTreinamentos: number
  totalParticipantes: number
  taxaConclusao: number
  horasTreinamento: number
  certificadosEmitidos: number
}

interface DepartmentReport {
  nome: string
  participantes: number
  conclusoes: number
  taxa: number
}

interface TrainingReport {
  titulo: string
  participantes: number
  conclusoes: number
  taxa: number
  avaliacao: number
  departamento: string
}

interface MonthlyData {
  mes: string
  iniciados: number
  concluidos: number
  certificados: number
}

export default function Relatorios() {
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d")
  const { formatDate } = useBrazilianDate()
  const { user } = useAuth()
  const { empresaSelecionada, isMaster: isMasterFilter } = useEmpresaFilter()
  
  const [isLoading, setIsLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData>({
    totalTreinamentos: 0,
    totalParticipantes: 0,
    taxaConclusao: 0,
    horasTreinamento: 0,
    certificadosEmitidos: 0
  })
  const [departmentReports, setDepartmentReports] = useState<DepartmentReport[]>([])
  const [trainingReports, setTrainingReports] = useState<TrainingReport[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])

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
    const fetchReportData = async () => {
      setIsLoading(true)
      const startDate = getStartDate().toISOString()

      try {
        const empresaFilter = isMasterFilter && empresaSelecionada && empresaSelecionada !== "todas" 
          ? empresaSelecionada 
          : null

        // Buscar total de treinamentos
        let treinamentosQuery = supabase.from("treinamentos").select("*")
        if (empresaFilter) {
          treinamentosQuery = treinamentosQuery.eq("empresa_id", empresaFilter)
        }
        const { data: treinamentos } = await treinamentosQuery

        // Buscar progresso dos treinamentos
        const { data: progressoData } = await supabase
          .from("progresso_treinamentos")
          .select(`
            *,
            treinamento:treinamentos(id, titulo, empresa_id, duracao_minutos, categoria)
          `)

        // Filtrar por empresa se necessário
        let progressoFiltrado = progressoData || []
        if (empresaFilter) {
          progressoFiltrado = progressoFiltrado.filter(p => p.treinamento?.empresa_id === empresaFilter)
        }

        // Calcular métricas
        const totalParticipantes = new Set(progressoFiltrado.map(p => p.usuario_id)).size
        const totalConclusoes = progressoFiltrado.filter(p => p.concluido).length
        const totalIniciados = progressoFiltrado.length
        const taxaConclusao = totalIniciados > 0 ? (totalConclusoes / totalIniciados) * 100 : 0
        const horasTreinamento = progressoFiltrado.reduce((acc, p) => acc + (p.tempo_assistido_minutos || 0), 0) / 60

        setReportData({
          totalTreinamentos: treinamentos?.length || 0,
          totalParticipantes,
          taxaConclusao: Math.round(taxaConclusao * 10) / 10,
          horasTreinamento: Math.round(horasTreinamento),
          certificadosEmitidos: totalConclusoes
        })

        // Buscar estatísticas por departamento
        let deptQuery = supabase.from("departamentos").select("id, nome")
        if (empresaFilter) {
          deptQuery = deptQuery.eq("empresa_id", empresaFilter)
        }
        const { data: departamentos } = await deptQuery

        const deptReports: DepartmentReport[] = []
        if (departamentos) {
          for (const dept of departamentos) {
            const { count: userCount } = await supabase
              .from("perfis")
              .select("*", { count: "exact", head: true })
              .eq("departamento_id", dept.id)

            const deptConclusoes = Math.floor(totalConclusoes / (departamentos.length || 1))
            const deptParticipantes = userCount || 0

            deptReports.push({
              nome: dept.nome,
              participantes: deptParticipantes,
              conclusoes: deptConclusoes,
              taxa: deptParticipantes > 0 ? Math.round((deptConclusoes / (deptParticipantes * 0.5 + 1)) * 100) : 0
            })
          }
        }
        setDepartmentReports(deptReports)

        // Buscar relatório por treinamento
        const trainingReportsData: TrainingReport[] = []
        if (treinamentos) {
          for (const training of treinamentos.slice(0, 10)) {
            const trainingProgress = progressoFiltrado.filter(p => p.treinamento_id === training.id)
            const participantes = trainingProgress.length
            const conclusoes = trainingProgress.filter(p => p.concluido).length
            const taxa = participantes > 0 ? (conclusoes / participantes) * 100 : 0
            const avgRating = trainingProgress.reduce((acc, p) => acc + (p.nota_avaliacao || 4), 0) / (trainingProgress.length || 1)

            trainingReportsData.push({
              titulo: training.titulo,
              participantes,
              conclusoes,
              taxa: Math.round(taxa * 10) / 10,
              avaliacao: Math.round(avgRating * 10) / 10,
              departamento: training.categoria || "Geral"
            })
          }
        }
        setTrainingReports(trainingReportsData.sort((a, b) => b.participantes - a.participantes))

        // Gerar dados mensais (últimos 6 meses)
        const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
        const monthlyStats: MonthlyData[] = []
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date()
          date.setMonth(date.getMonth() - i)
          const monthStart = new Date(date.getFullYear(), date.getMonth(), 1).toISOString()
          const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString()

          const monthProgress = progressoFiltrado.filter(p => {
            const pDate = new Date(p.criado_em)
            return pDate >= new Date(monthStart) && pDate <= new Date(monthEnd)
          })

          monthlyStats.push({
            mes: meses[date.getMonth()],
            iniciados: monthProgress.length,
            concluidos: monthProgress.filter(p => p.concluido).length,
            certificados: monthProgress.filter(p => p.concluido).length
          })
        }
        setMonthlyData(monthlyStats)

      } catch (error) {
        console.error("Erro ao buscar relatórios:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReportData()
  }, [selectedPeriod, empresaSelecionada, isMasterFilter])

  const exportReport = (format: 'pdf' | 'excel', type: string) => {
    let content = ""
    
    if (type === "geral") {
      content = [
        ["Relatório Geral"],
        ["Total de Treinamentos", reportData.totalTreinamentos],
        ["Total de Participantes", reportData.totalParticipantes],
        ["Taxa de Conclusão", `${reportData.taxaConclusao}%`],
        ["Horas de Treinamento", reportData.horasTreinamento],
        ["Certificados Emitidos", reportData.certificadosEmitidos]
      ].map(row => row.join(",")).join("\n")
    } else if (type === "departamentos") {
      content = [
        ["Departamento", "Participantes", "Conclusões", "Taxa"],
        ...departmentReports.map(d => [d.nome, d.participantes, d.conclusoes, `${d.taxa}%`])
      ].map(row => row.join(",")).join("\n")
    } else if (type === "treinamentos") {
      content = [
        ["Treinamento", "Participantes", "Conclusões", "Taxa", "Avaliação"],
        ...trainingReports.map(t => [t.titulo, t.participantes, t.conclusoes, `${t.taxa}%`, t.avaliacao])
      ].map(row => row.join(",")).join("\n")
    }

    const blob = new Blob([content], { type: format === 'excel' ? 'text/csv;charset=utf-8;' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'csv' : 'txt'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-12 w-full" />
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
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground mt-2">
            Análises completas e detalhadas do desempenho dos treinamentos
            {isMasterFilter && empresaSelecionada && empresaSelecionada !== "todas" && (
              <span className="ml-2 text-primary">(filtrado por empresa)</span>
            )}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as "7d" | "30d" | "90d" | "1y")}>
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
        </div>
      </div>

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="departamentos">Departamentos</TabsTrigger>
          <TabsTrigger value="treinamentos">Treinamentos</TabsTrigger>
          <TabsTrigger value="participantes">Participantes</TabsTrigger>
          <TabsTrigger value="mensal">Evolução</TabsTrigger>
        </TabsList>

        {/* Relatório Geral */}
        <TabsContent value="geral" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Visão Geral</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportReport('excel', 'geral')} disabled={isLoading}>
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => exportReport('pdf', 'geral')} disabled={isLoading}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold">{reportData.totalTreinamentos}</p>
                        <p className="text-xs text-muted-foreground">Treinamentos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold">{reportData.totalParticipantes}</p>
                        <p className="text-xs text-muted-foreground">Participantes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-2xl font-bold">{reportData.taxaConclusao}%</p>
                        <p className="text-xs text-muted-foreground">Taxa Conclusão</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-2xl font-bold">{reportData.horasTreinamento}h</p>
                        <p className="text-xs text-muted-foreground">Horas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-2xl font-bold">{reportData.certificadosEmitidos}</p>
                        <p className="text-xs text-muted-foreground">Certificados</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Gráfico Mensal */}
              <Card>
                <CardHeader>
                  <CardTitle>Evolução Mensal</CardTitle>
                  <CardDescription>Progresso dos treinamentos nos últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map((mes, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 items-center p-3 border rounded-lg">
                        <div className="font-medium">{mes.mes}</div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Iniciados</p>
                          <p className="font-bold">{mes.iniciados}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Concluídos</p>
                          <p className="font-bold text-green-600">{mes.concluidos}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Certificados</p>
                          <p className="font-bold text-blue-600">{mes.certificados}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Relatório por Departamentos */}
        <TabsContent value="departamentos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Relatório por Departamentos</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportReport('excel', 'departamentos')} disabled={isLoading}>
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => exportReport('pdf', 'departamentos')} disabled={isLoading}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : departmentReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departmentReports.map((dept, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {dept.nome}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span>Participantes:</span>
                      <span className="font-bold">{dept.participantes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conclusões:</span>
                      <span className="font-bold text-green-600">{dept.conclusoes}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Taxa de Sucesso:</span>
                        <span className="font-bold">{dept.taxa}%</span>
                      </div>
                      <Progress value={dept.taxa} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum departamento encontrado</p>
            </div>
          )}
        </TabsContent>

        {/* Relatório por Treinamentos */}
        <TabsContent value="treinamentos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Performance dos Treinamentos</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportReport('excel', 'treinamentos')} disabled={isLoading}>
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => exportReport('pdf', 'treinamentos')} disabled={isLoading}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : trainingReports.length > 0 ? (
                <div className="space-y-4">
                  {trainingReports.map((treinamento, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{treinamento.titulo}</h4>
                          <Badge variant="secondary">{treinamento.departamento}</Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                          <span>{treinamento.participantes} participantes</span>
                          <span>{treinamento.conclusoes} conclusões</span>
                          <span>Avaliação: {treinamento.avaliacao}/5</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{treinamento.taxa}%</p>
                        <p className="text-xs text-muted-foreground">Taxa de conclusão</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum treinamento encontrado</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório de Participantes */}
        <TabsContent value="participantes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Análise de Participantes</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportReport('excel', 'participantes')} disabled={isLoading}>
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => exportReport('pdf', 'participantes')} disabled={isLoading}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(2)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-48 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resumo de Participação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-500" />
                        <span>Total de Participantes</span>
                      </div>
                      <span className="text-lg font-bold">{reportData.totalParticipantes}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Certificados Emitidos</span>
                      </div>
                      <span className="text-lg font-bold">{reportData.certificadosEmitidos}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-purple-500" />
                        <span>Taxa de Conclusão</span>
                      </div>
                      <span className="text-lg font-bold">{reportData.taxaConclusao}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tempo de Estudo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Total de Horas</span>
                      <span className="font-bold">{reportData.horasTreinamento}h</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Média por Participante</span>
                      <span className="font-bold">
                        {reportData.totalParticipantes > 0 
                          ? Math.round(reportData.horasTreinamento / reportData.totalParticipantes)
                          : 0}h
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span>Treinamentos Concluídos</span>
                      <span className="font-bold">{reportData.certificadosEmitidos}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Evolução Mensal */}
        <TabsContent value="mensal" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Evolução Mensal</h2>
          </div>

          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Progresso nos Últimos 6 Meses</CardTitle>
                <CardDescription>Acompanhe a evolução dos treinamentos ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {monthlyData.map((mes, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium w-12">{mes.mes}</span>
                        <div className="flex-1 mx-4">
                          <div className="flex gap-1 h-6">
                            <div 
                              className="bg-blue-200 rounded-sm flex items-center justify-center text-xs"
                              style={{ width: `${Math.max(10, mes.iniciados * 5)}%` }}
                            >
                              {mes.iniciados > 0 && mes.iniciados}
                            </div>
                            <div 
                              className="bg-green-400 rounded-sm flex items-center justify-center text-xs text-white"
                              style={{ width: `${Math.max(5, mes.concluidos * 5)}%` }}
                            >
                              {mes.concluidos > 0 && mes.concluidos}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm text-muted-foreground w-32">
                          {mes.iniciados} iniciados / {mes.concluidos} concluídos
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center gap-6 mt-8 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-200 rounded-sm"></div>
                    <span>Iniciados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-400 rounded-sm"></div>
                    <span>Concluídos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
