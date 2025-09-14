import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Download
} from "lucide-react"
import { useBrazilianDate } from "@/hooks/use-brazilian-date"

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("30d")
  const [selectedMetric, setSelectedMetric] = useState("usuarios")
  const { formatDate } = useBrazilianDate()

  // Dados simulados para analytics
  const analyticsData = {
    overview: {
      totalUsuarios: 1247,
      usuariosAtivos: 892,
      novosCadastros: 156,
      taxaEngajamento: 71.5,
      horasEstudo: 3420,
      certificadosEmitidos: 234,
      taxaConclusao: 87.3,
      avaliacaoMedia: 4.6
    },
    tendencias: {
      usuarios: { valor: 1247, mudanca: 12.5, trend: "up" },
      treinamentos: { valor: 45, mudanca: -3.2, trend: "down" },
      certificados: { valor: 234, mudanca: 18.7, trend: "up" },
      engajamento: { valor: 71.5, mudanca: 5.8, trend: "up" }
    },
    engajamento: [
      { dia: "Seg", visualizacoes: 245, interacoes: 89, conclusoes: 23 },
      { dia: "Ter", visualizacoes: 289, interacoes: 134, conclusoes: 45 },
      { dia: "Qua", visualizacoes: 334, interacoes: 167, conclusoes: 67 },
      { dia: "Qui", visualizacoes: 398, interacoes: 198, conclusoes: 89 },
      { dia: "Sex", visualizacoes: 456, interacoes: 234, conclusoes: 123 },
      { dia: "Sáb", visualizacoes: 189, interacoes: 67, conclusoes: 34 },
      { dia: "Dom", visualizacoes: 134, interacoes: 45, conclusoes: 12 }
    ],
    treinamentos: [
      { 
        titulo: "Segurança no Trabalho", 
        visualizacoes: 1456, 
        conclusoes: 1234, 
        taxa: 84.7,
        tempo: "2h 15m",
        avaliacao: 4.8
      },
      { 
        titulo: "Atendimento ao Cliente", 
        visualizacoes: 987, 
        conclusoes: 756, 
        taxa: 76.6,
        tempo: "1h 45m",
        avaliacao: 4.5
      },
      { 
        titulo: "Liderança Eficaz", 
        visualizacoes: 645, 
        conclusoes: 598, 
        taxa: 92.7,
        tempo: "3h 20m",
        avaliacao: 4.9
      }
    ],
    dispositivos: [
      { dispositivo: "Desktop", percentual: 65, usuarios: 811 },
      { dispositivo: "Mobile", percentual: 28, usuarios: 349 },
      { dispositivo: "Tablet", percentual: 7, usuarios: 87 }
    ],
    horarios: [
      { hora: "00-04", atividade: 5 },
      { hora: "04-08", atividade: 8 },
      { hora: "08-12", atividade: 85 },
      { hora: "12-16", atividade: 92 },
      { hora: "16-20", atividade: 78 },
      { hora: "20-24", atividade: 32 }
    ],
    departamentos: [
      { nome: "TI", usuarios: 234, conclusoes: 89, engajamento: 92.5 },
      { nome: "Vendas", usuarios: 189, conclusoes: 156, engajamento: 87.2 },
      { nome: "RH", usuarios: 145, conclusoes: 134, engajamento: 91.8 },
      { nome: "Marketing", usuarios: 167, conclusoes: 98, engajamento: 74.5 },
      { nome: "Financeiro", usuarios: 123, conclusoes: 102, engajamento: 83.9 }
    ]
  }

  const exportAnalytics = () => {
    // Simular exportação
    const blob = new Blob(['Relatório de Analytics...'], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'analytics-relatorio.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Análises avançadas de performance e engajamento
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
          
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Totais</p>
                <p className="text-2xl font-bold">{analyticsData.overview.totalUsuarios}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+{analyticsData.tendencias.usuarios.mudanca}%</span>
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
                <p className="text-2xl font-bold">{analyticsData.overview.taxaEngajamento}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">+{analyticsData.tendencias.engajamento.mudanca}%</span>
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
                <p className="text-2xl font-bold">{analyticsData.overview.horasEstudo}</p>
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
                <p className="text-2xl font-bold">{analyticsData.overview.taxaConclusao}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">Meta: 85%</span>
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
            <Card>
              <CardHeader>
                <CardTitle>Atividade Semanal</CardTitle>
                <CardDescription>
                  Visualizações, interações e conclusões por dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.engajamento.map((dia, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{dia.dia}</span>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>{dia.visualizacoes} views</span>
                          <span>{dia.interacoes} interações</span>
                          <span>{dia.conclusoes} conclusões</span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-3">
                        <div 
                          className="bg-blue-200 rounded-sm"
                          style={{ width: `${(dia.visualizacoes / 500) * 100}%` }}
                        />
                        <div 
                          className="bg-green-400 rounded-sm"
                          style={{ width: `${(dia.interacoes / 500) * 100}%` }}
                        />
                        <div 
                          className="bg-purple-500 rounded-sm"
                          style={{ width: `${(dia.conclusoes / 500) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center gap-4 mt-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-200 rounded-sm"></div>
                    <span>Visualizações</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                    <span>Interações</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-sm"></div>
                    <span>Conclusões</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horários de Maior Atividade</CardTitle>
                <CardDescription>
                  Distribuição de atividade por período do dia
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.horarios.map((periodo, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{periodo.hora}h</span>
                      <div className="flex-1 mx-4">
                        <Progress value={periodo.atividade} className="h-3" />
                      </div>
                      <span className="text-sm text-muted-foreground">{periodo.atividade}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Engajamento por Departamento</CardTitle>
              <CardDescription>
                Performance e participação por área da empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.departamentos.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{dept.nome}</h4>
                        <p className="text-sm text-muted-foreground">
                          {dept.usuarios} usuários • {dept.conclusoes} conclusões
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{dept.engajamento}%</p>
                      <p className="text-xs text-muted-foreground">Engajamento</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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
                <div className="space-y-4">
                  {analyticsData.treinamentos.map((treinamento, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="flex items-center justify-center w-6 h-6 bg-primary/10 rounded-full text-xs font-bold text-primary">
                            {index + 1}
                          </span>
                          <h4 className="font-medium">{treinamento.titulo}</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                          <span>{treinamento.visualizacoes} views</span>
                          <span>{treinamento.tempo} duração</span>
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dispositivos Utilizados</CardTitle>
                <CardDescription>
                  Distribuição de acesso por tipo de dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analyticsData.dispositivos.map((dispositivo, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{dispositivo.dispositivo}</span>
                        <span className="text-sm text-muted-foreground">
                          {dispositivo.usuarios} usuários ({dispositivo.percentual}%)
                        </span>
                      </div>
                      <Progress value={dispositivo.percentual} className="h-2" />
                    </div>
                  ))}
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
                  <p className="text-3xl font-bold text-primary">+{analyticsData.overview.novosCadastros}</p>
                  <p className="text-sm text-muted-foreground">Nos últimos 30 dias</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">+25% vs mês anterior</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuários Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">{analyticsData.overview.usuariosAtivos}</p>
                  <p className="text-sm text-muted-foreground">De {analyticsData.overview.totalUsuarios} total</p>
                  <Progress 
                    value={(analyticsData.overview.usuariosAtivos / analyticsData.overview.totalUsuarios) * 100} 
                    className="mt-4"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avaliação Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-yellow-600">★ {analyticsData.overview.avaliacaoMedia}</p>
                  <p className="text-sm text-muted-foreground">De 5 estrelas</p>
                  <Badge variant="secondary" className="mt-2">
                    Excelente
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Conteúdo Tab */}
        <TabsContent value="conteudo">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Conteúdo</CardTitle>
              <CardDescription>
                Performance detalhada dos materiais de treinamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Análise de conteúdo em desenvolvimento...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tempo Real Tab */}
        <TabsContent value="tempo">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  Usuários Online Agora
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-500">47</p>
                  <p className="text-sm text-muted-foreground">Usuários ativos</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividade Atual</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Visualizando conteúdo</span>
                    <Badge>32 usuários</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fazendo exercícios</span>
                    <Badge>12 usuários</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Assistindo vídeos</span>
                    <Badge>18 usuários</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}