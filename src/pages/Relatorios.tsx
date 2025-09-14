import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  BookOpen
} from "lucide-react"
import { TrainingReports } from "@/components/training/training-reports"
import { useTraining } from "@/contexts/training-context"
import { useBrazilianDate } from "@/hooks/use-brazilian-date"

export default function Relatorios() {
  const { trainings } = useTraining()
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d")
  const [selectedDepartment, setSelectedDepartment] = useState("todos")
  const { formatDate } = useBrazilianDate()

  // Dados simulados para relatórios
  const relatoriosData = {
    geral: {
      totalTreinamentos: trainings.length,
      totalParticipantes: 1247,
      taxaConclusao: 87.5,
      horasTreinamento: 3420,
      certificadosEmitidos: 892,
      custoPorParticipante: 125.50
    },
    departamentos: [
      { nome: "TI", participantes: 45, conclusoes: 89, taxa: 97.8 },
      { nome: "Vendas", participantes: 67, conclusoes: 58, taxa: 86.6 },
      { nome: "RH", participantes: 32, conclusoes: 28, taxa: 87.5 },
      { nome: "Marketing", participantes: 38, conclusoes: 33, taxa: 86.8 },
      { nome: "Financeiro", participantes: 28, conclusoes: 25, taxa: 89.3 }
    ],
    treinamentos: [
      { 
        titulo: "Segurança no Trabalho", 
        participantes: 156, 
        conclusoes: 142, 
        taxa: 91.0,
        avaliacao: 4.8,
        departamento: "Todos"
      },
      { 
        titulo: "Atendimento ao Cliente", 
        participantes: 89, 
        conclusoes: 78, 
        taxa: 87.6,
        avaliacao: 4.6,
        departamento: "Vendas"
      },
      { 
        titulo: "Liderança Eficaz", 
        participantes: 45, 
        conclusoes: 41, 
        taxa: 91.1,
        avaliacao: 4.9,
        departamento: "Gestão"
      }
    ],
    mensal: [
      { mes: "Jan", iniciados: 124, concluidos: 98, certificados: 89 },
      { mes: "Fev", iniciados: 156, concluidos: 134, certificados: 125 },
      { mes: "Mar", iniciados: 189, concluidos: 167, certificados: 152 },
      { mes: "Abr", iniciados: 167, concluidos: 145, certificados: 132 },
      { mes: "Mai", iniciados: 198, concluidos: 178, certificados: 165 },
      { mes: "Jun", iniciados: 234, concluidos: 201, certificados: 189 }
    ]
  }

  const exportReport = (format: 'pdf' | 'excel', type: string) => {
    // Simular exportação
    const blob = new Blob([`Relatório ${type} - ${format.toUpperCase()}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio-${type}-${format === 'pdf' ? 'pdf' : 'xlsx'}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground mt-2">
            Análises completas e detalhadas do desempenho dos treinamentos
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
          <TabsTrigger value="detalhado">Detalhado</TabsTrigger>
        </TabsList>

        {/* Relatório Geral */}
        <TabsContent value="geral" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Visão Geral</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportReport('excel', 'geral')}>
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => exportReport('pdf', 'geral')}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{relatoriosData.geral.totalTreinamentos}</p>
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
                    <p className="text-2xl font-bold">{relatoriosData.geral.totalParticipantes}</p>
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
                    <p className="text-2xl font-bold">{relatoriosData.geral.taxaConclusao}%</p>
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
                    <p className="text-2xl font-bold">{relatoriosData.geral.horasTreinamento}</p>
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
                    <p className="text-2xl font-bold">{relatoriosData.geral.certificadosEmitidos}</p>
                    <p className="text-xs text-muted-foreground">Certificados</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="text-lg font-bold">R$ {relatoriosData.geral.custoPorParticipante}</p>
                    <p className="text-xs text-muted-foreground">Custo/Participante</p>
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
                {relatoriosData.mensal.map((mes, index) => (
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
        </TabsContent>

        {/* Relatório por Departamentos */}
        <TabsContent value="departamentos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Relatório por Departamentos</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportReport('excel', 'departamentos')}>
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => exportReport('pdf', 'departamentos')}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatoriosData.departamentos.map((dept, index) => (
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
        </TabsContent>

        {/* Relatório por Treinamentos */}
        <TabsContent value="treinamentos" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Performance dos Treinamentos</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportReport('excel', 'treinamentos')}>
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => exportReport('pdf', 'treinamentos')}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          <Card>
            <CardContent>
              <div className="space-y-4">
                {relatoriosData.treinamentos.map((treinamento, index) => (
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Relatório de Participantes */}
        <TabsContent value="participantes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Análise de Participantes</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportReport('excel', 'participantes')}>
                <Download className="mr-2 h-4 w-4" />
                Excel
              </Button>
              <Button variant="outline" onClick={() => exportReport('pdf', 'participantes')}>
                <FileText className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engajamento por Faixa Etária</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { faixa: "18-25 anos", percentual: 15, participantes: 187 },
                    { faixa: "26-35 anos", percentual: 45, participantes: 561 },
                    { faixa: "36-45 anos", percentual: 30, participantes: 374 },
                    { faixa: "46+ anos", percentual: 10, participantes: 125 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm">{item.faixa}</span>
                        <span className="text-sm font-medium">{item.participantes} ({item.percentual}%)</span>
                      </div>
                      <Progress value={item.percentual} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo Médio de Conclusão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { categoria: "Segurança", tempo: "2h 15min", meta: "2h 30min", status: "success" },
                    { categoria: "Vendas", tempo: "3h 45min", meta: "3h 30min", status: "warning" },
                    { categoria: "Liderança", tempo: "1h 50min", meta: "2h 00min", status: "success" },
                    { categoria: "Tecnologia", tempo: "4h 20min", meta: "4h 00min", status: "warning" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{item.categoria}</p>
                        <p className="text-sm text-muted-foreground">Meta: {item.meta}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${item.status === 'success' ? 'text-green-600' : 'text-yellow-600'}`}>
                          {item.tempo}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Relatório Detalhado */}
        <TabsContent value="detalhado">
          <TrainingReports trainings={trainings} timeRange={selectedPeriod} />
        </TabsContent>
      </Tabs>
    </div>
  )
}