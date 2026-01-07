import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Search,
  Filter,
  BookOpen,
  Clock,
  Star,
  Users,
  PlayCircle,
  Award,
  TrendingUp
} from "lucide-react"
import { useTraining } from "@/contexts/training-context"
import { useAuth } from "@/contexts/auth-context"

interface TrainingCatalog {
  id: number
  titulo: string
  descricao: string
  categoria: string
  nivel: "basico" | "intermediario" | "avancado"
  duracao: string
  rating: number
  participantes: number
  instrutor: string
  tags: string[]
  popular: boolean
  novo: boolean
  thumbnail: string
}

export default function Catalogo() {
  const { getTrainingsByDepartment } = useTraining()
  const { user } = useAuth()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("todas")
  const [levelFilter, setLevelFilter] = useState("todos")
  
  // Obter treinamentos filtrados por departamento do usuário
  const availableTrainings = getTrainingsByDepartment(user?.departamento_id).filter(
    training => training.status === "ativo"
  )
  
  const trainings: TrainingCatalog[] = [
    {
      id: 1,
      titulo: "Segurança no Trabalho - Módulo Básico",
      descricao: "Aprenda os fundamentos da segurança ocupacional e prevenção de acidentes no ambiente de trabalho",
      categoria: "Segurança",
      nivel: "basico",
      duracao: "2h 30min",
      rating: 4.8,
      participantes: 234,
      instrutor: "Maria Silva",
      tags: ["Segurança", "NR", "Prevenção"],
      popular: true,
      novo: false,
      thumbnail: "/api/placeholder/300/200"
    },
    {
      id: 2,
      titulo: "Atendimento ao Cliente Excelente",
      descricao: "Técnicas avançadas para proporcionar uma experiência excepcional ao cliente",
      categoria: "Vendas",
      nivel: "intermediario",
      duracao: "1h 45min",
      rating: 4.9,
      participantes: 189,
      instrutor: "João Santos",
      tags: ["Vendas", "Relacionamento", "CX"],
      popular: true,
      novo: false,
      thumbnail: "/api/placeholder/300/200"
    },
    {
      id: 3,
      titulo: "Liderança Transformacional",
      descricao: "Desenvolva suas habilidades de liderança para transformar equipes e resultados",
      categoria: "Liderança",
      nivel: "avancado",
      duracao: "4h 15min",
      rating: 4.7,
      participantes: 156,
      instrutor: "Ana Costa",
      tags: ["Liderança", "Gestão", "Transformação"],
      popular: false,
      novo: true,
      thumbnail: "/api/placeholder/300/200"
    },
    {
      id: 4,
      titulo: "Excel Avançado para Negócios",
      descricao: "Domine funções avançadas do Excel para análise de dados e automatização",
      categoria: "Tecnologia",
      nivel: "intermediario",
      duracao: "3h 30min",
      rating: 4.6,
      participantes: 298,
      instrutor: "Carlos Lima",
      tags: ["Excel", "Dados", "Produtividade"],
      popular: true,
      novo: false,
      thumbnail: "/api/placeholder/300/200"
    },
    {
      id: 5,
      titulo: "Comunicação Assertiva",
      descricao: "Aprenda a se comunicar de forma clara, objetiva e respeitosa em qualquer contexto",
      categoria: "Soft Skills",
      nivel: "basico",
      duracao: "2h 00min",
      rating: 4.5,
      participantes: 421,
      instrutor: "Sofia Ribeiro",
      tags: ["Comunicação", "Relacionamento", "Assertividade"],
      popular: false,
      novo: true,
      thumbnail: "/api/placeholder/300/200"
    },
    {
      id: 6,
      titulo: "Gestão de Projetos com Metodologias Ágeis",
      descricao: "Implemente Scrum e Kanban para gerenciar projetos de forma eficiente",
      categoria: "Gestão",
      nivel: "avancado",
      duracao: "5h 00min",
      rating: 4.8,
      participantes: 167,
      instrutor: "Roberto Alves",
      tags: ["Scrum", "Kanban", "Gestão", "Ágil"],
      popular: false,
      novo: false,
      thumbnail: "/api/placeholder/300/200"
    }
  ]

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case "basico": return "bg-green-500"
      case "intermediario": return "bg-yellow-500"
      case "avancado": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getNivelText = (nivel: string) => {
    switch (nivel) {
      case "basico": return "Básico"
      case "intermediario": return "Intermediário"
      case "avancado": return "Avançado"
      default: return "Não definido"
    }
  }

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = categoryFilter === "todas" || training.categoria === categoryFilter
    const matchesLevel = levelFilter === "todos" || training.nivel === levelFilter
    return matchesSearch && matchesCategory && matchesLevel
  })

  const categorias = Array.from(new Set(trainings.map(t => t.categoria)))
  const popularTrainings = trainings.filter(t => t.popular)
  const newTrainings = trainings.filter(t => t.novo)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Catálogo de Treinamentos</h1>
        <p className="text-muted-foreground mt-2">
          Explore nosso catálogo completo de cursos e treinamentos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
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
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Populares</p>
                <p className="text-2xl font-bold">{popularTrainings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Novos</p>
                <p className="text-2xl font-bold">{newTrainings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Participantes</p>
                <p className="text-2xl font-bold">{trainings.reduce((acc, t) => acc + t.participantes, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar treinamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full lg:w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as Categorias</SelectItem>
            {categorias.map(categoria => (
              <SelectItem key={categoria} value={categoria}>{categoria}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-full lg:w-[200px]">
            <SelectValue placeholder="Nível" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Níveis</SelectItem>
            <SelectItem value="basico">Básico</SelectItem>
            <SelectItem value="intermediario">Intermediário</SelectItem>
            <SelectItem value="avancado">Avançado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Training Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainings.map((training) => (
          <Card key={training.id} className="hover:shadow-lg transition-shadow group">
            <div className="aspect-video bg-gradient-primary rounded-t-lg flex items-center justify-center relative overflow-hidden">
              <PlayCircle className="h-12 w-12 text-white group-hover:scale-110 transition-transform" />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {training.popular && (
                  <Badge className="bg-orange-500 text-white">
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Popular
                  </Badge>
                )}
                {training.novo && (
                  <Badge className="bg-green-500 text-white">
                    Novo
                  </Badge>
                )}
              </div>
              
              {/* Level Badge */}
              <div className="absolute top-3 right-3">
                <Badge className={`${getNivelColor(training.nivel)} text-white`}>
                  {getNivelText(training.nivel)}
                </Badge>
              </div>
            </div>
            
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                  {training.titulo}
                </CardTitle>
              </div>
              <CardDescription className="line-clamp-2">
                {training.descricao}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {training.duracao}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {training.rating}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Por {training.instrutor}
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {training.participantes}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {training.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <Button className="w-full group-hover:bg-primary/90 transition-colors">
                <PlayCircle className="mr-2 h-4 w-4" />
                Iniciar Treinamento
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredTrainings.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhum treinamento encontrado</h3>
          <p className="text-muted-foreground">
            Tente ajustar os filtros ou termo de busca
          </p>
        </div>
      )}
    </div>
  )
}