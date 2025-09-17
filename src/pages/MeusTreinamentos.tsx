import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useTraining } from "@/contexts/training-context"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  PlayCircle, 
  Clock, 
  CheckCircle, 
  Search,
  Filter,
  BookOpen,
  Star,
  Award,
  Calendar,
  RotateCcw,
  Eye
} from "lucide-react"
import { TrainingViewer } from "@/components/training/training-viewer"
import { TrainingCertificate } from "@/components/training/training-certificate"
import { useBrazilianDate } from "@/hooks/use-brazilian-date"

export default function MeusTreinamentos() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [viewingTraining, setViewingTraining] = useState<any>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const navigate = useNavigate()
  const { getTrainingsByDepartment, startTraining, accessTraining } = useTraining()
  const { user } = useAuth()
  const { formatDateOnly, formatLastAccessed } = useBrazilianDate()
  
  // Buscar treinamentos disponíveis para o departamento do usuário
  const availableTrainings = getTrainingsByDepartment(user?.departamento).filter(
    training => training.status === "ativo"
  )
  
  const trainings = availableTrainings.map(training => ({
    id: training.id,
    title: training.titulo,
    description: training.descricao,
    category: training.categoria,
    duration: training.duracao,
    progress: training.progress || 0,
    status: training.progress === 100 ? "concluido" : training.progress && training.progress > 0 ? "em-progresso" : "nao-iniciado",
    rating: training.rating || 4.5,
    instructor: training.instrutor,
    deadline: training.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastAccessed: training.lastAccessed || "Nunca acessado",
    completed: training.completed || false,
    thumbnail: training.capa || "/api/placeholder/300/200",
    originalTraining: training
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case "concluido": return "bg-green-500"
      case "em-progresso": return "bg-blue-500"
      case "nao-iniciado": return "bg-gray-400"
      default: return "bg-gray-400"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "concluido": return "Concluído"
      case "em-progresso": return "Em Progresso"
      case "nao-iniciado": return "Não Iniciado"
      default: return "Desconhecido"
    }
  }

  const filteredTrainings = trainings.filter(training => {
    const matchesSearch = training.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         training.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "todos" || training.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const completedTrainings = trainings.filter(t => t.completed)
  const inProgressTrainings = trainings.filter(t => t.progress > 0 && !t.completed)
  const notStartedTrainings = trainings.filter(t => t.progress === 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Meus Treinamentos</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe seu progresso e continue aprendendo
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
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">{completedTrainings.length}</p>
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
                <p className="text-sm text-muted-foreground">Em Progresso</p>
                <p className="text-2xl font-bold">{inProgressTrainings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Award className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Certificados</p>
                <p className="text-2xl font-bold">{completedTrainings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar treinamentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Status</SelectItem>
            <SelectItem value="concluido">Concluídos</SelectItem>
            <SelectItem value="em-progresso">Em Progresso</SelectItem>
            <SelectItem value="nao-iniciado">Não Iniciados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="em-progresso">Em Progresso</TabsTrigger>
          <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
          <TabsTrigger value="nao-iniciados">Não Iniciados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="todos" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrainings.map((training) => (
              <Card key={training.id} className="hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gradient-primary rounded-t-lg flex items-center justify-center overflow-hidden">
                  {training.thumbnail !== "/api/placeholder/300/200" ? (
                    <img 
                      src={training.thumbnail} 
                      alt={training.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PlayCircle className="h-12 w-12 text-white" />
                  )}
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{training.title}</CardTitle>
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(training.status)} text-white`}
                    >
                      {getStatusText(training.status)}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {training.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {training.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {training.rating}
                    </span>
                  </div>
                  
                  {training.progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{training.progress}%</span>
                      </div>
                      <Progress value={training.progress} />
                    </div>
                  )}
                  
                   <div className="flex items-center justify-between text-sm">
                     <span className="text-muted-foreground">
                       Prazo: {formatDateOnly(training.deadline)}
                     </span>
                      <span className="text-muted-foreground">
                        {formatLastAccessed(training.lastAccessed)}
                      </span>
                   </div>
                   
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={() => {
                          if (training.progress === 0) {
                            startTraining(training.originalTraining.id)
                          } else {
                            accessTraining(training.originalTraining.id)
                          }
                          navigate(`/treinamento/${training.originalTraining.id}`)
                        }}
                      >
                        {training.progress === 0 ? "Iniciar" : training.completed ? "Revisar" : "Continuar"}
                      </Button>
                     <Button 
                       variant="outline" 
                       size="icon"
                       onClick={() => {
                         setViewingTraining(training.originalTraining)
                         setIsViewOpen(true)
                       }}
                     >
                       <Eye className="h-4 w-4" />
                     </Button>
                     {training.completed && (
                      <TrainingCertificate
                        training={training.originalTraining}
                        userProgress={{
                          totalTime: training.progress * 2, // Simulated
                          completionRate: training.progress,
                          score: 85 // Simulated
                        }}
                        userName="Usuário Demo"
                      />
                     )}
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="em-progresso" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressTrainings.map((training) => (
              <Card key={training.id} className="hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gradient-primary rounded-t-lg flex items-center justify-center overflow-hidden">
                  {training.thumbnail !== "/api/placeholder/300/200" ? (
                    <img 
                      src={training.thumbnail} 
                      alt={training.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PlayCircle className="h-12 w-12 text-white" />
                  )}
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2">{training.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {training.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{training.progress}%</span>
                    </div>
                    <Progress value={training.progress} />
                   </div>
                   <div className="flex gap-2">
                     <Button 
                       className="flex-1"
                       onClick={() => {
                         accessTraining(training.originalTraining.id)
                         navigate(`/treinamento/${training.originalTraining.id}`)
                       }}
                     >
                       Continuar
                     </Button>
                     <Button 
                       variant="outline" 
                       size="icon"
                       onClick={() => {
                         setViewingTraining(training.originalTraining)
                         setIsViewOpen(true)
                       }}
                     >
                       <Eye className="h-4 w-4" />
                     </Button>
                   </div>
                 </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="concluidos" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedTrainings.map((training) => (
              <Card key={training.id} className="hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gradient-primary rounded-t-lg flex items-center justify-center overflow-hidden">
                  {training.thumbnail !== "/api/placeholder/300/200" ? (
                    <img 
                      src={training.thumbnail} 
                      alt={training.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CheckCircle className="h-12 w-12 text-white" />
                  )}
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2">{training.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {training.description}
                  </CardDescription>
                </CardHeader>
                 <CardContent className="space-y-4">
                   <div className="flex gap-2">
                     <Button 
                       variant="outline" 
                       className="flex-1"
                       onClick={() => {
                         accessTraining(training.originalTraining.id)
                         navigate(`/treinamento/${training.originalTraining.id}`)
                       }}
                     >
                       <RotateCcw className="mr-2 h-4 w-4" />
                       Revisar
                     </Button>
                     <Button 
                       variant="outline" 
                       size="icon"
                       onClick={() => {
                         setViewingTraining(training.originalTraining)
                         setIsViewOpen(true)
                       }}
                     >
                       <Eye className="h-4 w-4" />
                     </Button>
                      <TrainingCertificate
                        training={training.originalTraining}
                        userProgress={{
                          totalTime: training.progress * 2,
                          completionRate: training.progress,
                          score: 85
                        }}
                        userName="Usuário Demo"
                      />
                   </div>
                 </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="nao-iniciados" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notStartedTrainings.map((training) => (
              <Card key={training.id} className="hover:shadow-md transition-shadow">
                <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center overflow-hidden">
                  {training.thumbnail !== "/api/placeholder/300/200" ? (
                    <img 
                      src={training.thumbnail} 
                      alt={training.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2">{training.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {training.description}
                  </CardDescription>
                </CardHeader>
                 <CardContent>
                   <div className="flex gap-2">
                     <Button 
                       className="flex-1"
                       onClick={() => {
                         startTraining(training.originalTraining.id)
                         navigate(`/treinamento/${training.originalTraining.id}`)
                       }}
                     >
                       <PlayCircle className="mr-2 h-4 w-4" />
                       Iniciar Treinamento
                     </Button>
                     <Button 
                       variant="outline" 
                       size="icon"
                       onClick={() => {
                         setViewingTraining(training.originalTraining)
                         setIsViewOpen(true)
                       }}
                     >
                       <Eye className="h-4 w-4" />
                     </Button>
                   </div>
                 </CardContent>
              </Card>
            ))}
          </div>
         </TabsContent>
       </Tabs>

       {/* Training Viewer Modal */}
       <TrainingViewer
         training={viewingTraining}
         open={isViewOpen}
         onOpenChange={setIsViewOpen}
         onStartTraining={(id) => {
           startTraining(id)
           setIsViewOpen(false)
         }}
         onContinueTraining={(id) => {
           accessTraining(id)
           setIsViewOpen(false)
         }}
       />
     </div>
   )
 }