import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  BookOpen, 
  Users, 
  Clock,
  Video,
  Sparkles,
  Globe,
  Building2,
  FileText
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { TrainingViewer } from "@/components/training/training-viewer"
import { useBrazilianDate } from "@/hooks/use-brazilian-date"
import { useEmpresaFilter } from "@/contexts/empresa-filter-context"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/integrations/supabase/client"

interface TrainingDB {
  id: string
  titulo: string
  descricao: string | null
  categoria: string | null
  nivel: string | null
  duracao_minutos: number | null
  obrigatorio: boolean | null
  publicado: boolean | null
  empresa_id: string | null
  departamento_id: string | null
  instrutor_id: string | null
  thumbnail_url: string | null
  criado_em: string | null
  atualizado_em: string | null
}

const DEFAULT_COVER = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop"

export default function GestaoTreinamentos() {
  const { formatDate } = useBrazilianDate()
  const { isMaster, empresaSelecionada } = useEmpresaFilter()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("todos")
  const [trainings, setTrainings] = useState<TrainingDB[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewingTraining, setViewingTraining] = useState<any>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  // Buscar treinamentos do Supabase
  useEffect(() => {
    const fetchTrainings = async () => {
      setIsLoading(true)
      try {
        // Para Master: buscar todos os treinamentos (incluindo modelos globais)
        // Para outros: buscar apenas da empresa ou modelos globais
        let query = supabase
          .from("treinamentos")
          .select("*")
          .order("criado_em", { ascending: false })

        // Se não for master e tiver empresa selecionada, filtrar por empresa
        if (!isMaster && empresaSelecionada && empresaSelecionada !== "todas") {
          query = query.or(`empresa_id.eq.${empresaSelecionada},empresa_id.is.null`)
        }

        const { data, error } = await query

        if (error) {
          console.error("Erro ao buscar treinamentos:", error)
          toast({
            title: "Erro",
            description: "Não foi possível carregar os treinamentos.",
            variant: "destructive"
          })
        } else {
          setTrainings(data || [])
        }
      } catch (error) {
        console.error("Erro:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrainings()
  }, [isMaster, empresaSelecionada])

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("treinamentos")
      .delete()
      .eq("id", id)

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o treinamento.",
        variant: "destructive"
      })
    } else {
      setTrainings(prev => prev.filter(t => t.id !== id))
      toast({
        title: "Treinamento excluído",
        description: "O treinamento foi removido com sucesso."
      })
    }
  }

  const getStatusBadge = (training: TrainingDB) => {
    if (!training.publicado) {
      return <Badge className="bg-yellow-500 text-white">Rascunho</Badge>
    }
    return <Badge className="bg-green-500 text-white">Ativo</Badge>
  }

  const getTypeBadge = (training: TrainingDB) => {
    if (!training.empresa_id) {
      return (
        <Badge variant="outline" className="border-purple-500 text-purple-600">
          <Globe className="h-3 w-3 mr-1" />
          Modelo Global
        </Badge>
      )
    }
    return null
  }

  // Filtros
  const modelosGlobais = trainings.filter(t => !t.empresa_id)
  const treinamentosEmpresa = trainings.filter(t => t.empresa_id)
  const rascunhos = trainings.filter(t => !t.publicado)
  const ativos = trainings.filter(t => t.publicado)

  const getFilteredTrainings = () => {
    let filtered = trainings

    // Filtrar por aba
    switch (activeTab) {
      case "modelos":
        filtered = modelosGlobais
        break
      case "empresa":
        filtered = treinamentosEmpresa
        break
      case "rascunhos":
        filtered = rascunhos
        break
      case "ativos":
        filtered = ativos
        break
    }

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.descricao?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (t.categoria?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      )
    }

    return filtered
  }

  const filteredTrainings = getFilteredTrainings()

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return "N/A"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}min`
    }
    return `${mins}min`
  }

  const handleViewTraining = (training: TrainingDB) => {
    // Converter para o formato esperado pelo TrainingViewer
    setViewingTraining({
      id: training.id,
      titulo: training.titulo,
      descricao: training.descricao || "",
      texto: training.descricao || "",
      categoria: training.categoria || "Geral",
      duracao: formatDuration(training.duracao_minutos),
      status: training.publicado ? "ativo" : "rascunho",
      participantes: 0,
      criadoEm: training.criado_em || new Date().toISOString(),
      instrutor: "Instrutor",
      fotos: [],
      arquivos: [],
      capa: training.thumbnail_url || DEFAULT_COVER,
      auditLog: []
    })
    setIsViewOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="aspect-video rounded-t-lg" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Treinamentos</h1>
          <p className="text-muted-foreground mt-2">
            Crie e gerencie os treinamentos da plataforma
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {isMaster && (
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              IA Disponível
            </Button>
          )}

          <Button asChild className="bg-gradient-primary">
            <Link to="/admin/treinamentos/novo">
              <Plus className="mr-2 h-4 w-4" />
              Novo Treinamento
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{trainings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{ativos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rascunhos</p>
                <p className="text-2xl font-bold">{rascunhos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modelos Globais</p>
                <p className="text-2xl font-bold">{modelosGlobais.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs e Busca */}
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="todos">Todos ({trainings.length})</TabsTrigger>
            <TabsTrigger value="modelos">
              <Globe className="h-4 w-4 mr-1" />
              Modelos ({modelosGlobais.length})
            </TabsTrigger>
            <TabsTrigger value="empresa">
              <Building2 className="h-4 w-4 mr-1" />
              Empresa ({treinamentosEmpresa.length})
            </TabsTrigger>
            <TabsTrigger value="ativos">Ativos ({ativos.length})</TabsTrigger>
            <TabsTrigger value="rascunhos">Rascunhos ({rascunhos.length})</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar treinamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Training List */}
      {filteredTrainings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum treinamento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Nenhum treinamento corresponde à sua busca."
                : "Comece criando seu primeiro treinamento."}
            </p>
            <Button asChild>
              <Link to="/admin/treinamentos/novo">
                <Plus className="mr-2 h-4 w-4" />
                Criar Treinamento
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainings.map((training) => (
            <Card key={training.id} className="hover:shadow-md transition-shadow overflow-hidden">
              <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center overflow-hidden relative">
                <img 
                  src={training.thumbnail_url || DEFAULT_COVER} 
                  alt={training.titulo} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_COVER
                  }}
                />
                {!training.empresa_id && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-purple-600 text-white">
                      <Globe className="h-3 w-3 mr-1" />
                      Modelo
                    </Badge>
                  </div>
                )}
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg line-clamp-2">{training.titulo}</CardTitle>
                  {getStatusBadge(training)}
                </div>
                <CardDescription className="line-clamp-2">
                  {training.descricao || "Sem descrição"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{training.categoria || "Geral"}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(training.duracao_minutos)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <Badge variant="outline">{training.nivel || "Iniciante"}</Badge>
                  <span className="text-muted-foreground">
                    {training.criado_em ? formatDate(training.criado_em) : "N/A"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewTraining(training)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/admin/treinamentos/editar/${training.id}`)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(training.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Training Viewer Modal */}
      <TrainingViewer
        training={viewingTraining}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
      />
    </div>
  )
}
