import { useState, useRef } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  BookOpen, 
  Users, 
  Clock,
  Upload,
  Video,
  FileText,
  Image as ImageIcon,
  History
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTraining, Training } from "@/contexts/training-context"
import { TrainingViewer } from "@/components/training/training-viewer"
import { TrainingEditor } from "@/components/training/training-editor"
import { useBrazilianDate } from "@/hooks/use-brazilian-date"
import { useDepartments } from "@/contexts/department-context"

export default function GestaoTreinamentos() {
  const { trainings: treinamentos, createTraining, updateTraining, deleteTraining: removeTraining } = useTraining()
  const { departments } = useDepartments()
  const { formatDate } = useBrazilianDate()

  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTraining, setEditingTraining] = useState<Training | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [viewingTraining, setViewingTraining] = useState<Training | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [newTraining, setNewTraining] = useState<{
    titulo: string
    subtitulo: string
    descricao: string
    texto: string
    videoUrl: string
    categoria: string
    duracao: string
    status: "ativo" | "inativo" | "rascunho"
    instrutor: string
    departamento: string
    capa?: string
  }>({
    titulo: "",
    subtitulo: "",
    descricao: "",
    texto: "",
    videoUrl: "",
    categoria: "",
    duracao: "",
    status: "rascunho",
    instrutor: "",
    departamento: "todos",
    capa: undefined
  })

  const resetForm = () => {
    setNewTraining({
      titulo: "",
      subtitulo: "",
      descricao: "",
      texto: "",
      videoUrl: "",
      categoria: "",
      duracao: "",
      status: "rascunho",
      instrutor: "",
      departamento: "todos",
      capa: undefined
    })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setNewTraining(prev => ({ ...prev, capa: imageData }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreate = () => {
    if (!newTraining.titulo || !newTraining.descricao) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e descrição são obrigatórios",
        variant: "destructive"
      })
      return
    }

    createTraining(newTraining)
    setIsCreateOpen(false)
    resetForm()
    
    toast({
      title: "Treinamento criado!",
      description: "O treinamento foi criado com sucesso."
    })
  }

  const handleDelete = (id: number) => {
    removeTraining(id)
    toast({
      title: "Treinamento excluído",
      description: "O treinamento foi removido com sucesso."
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo": return "bg-green-500"
      case "inativo": return "bg-red-500"
      case "rascunho": return "bg-yellow-500"
      default: return "bg-gray-500"
    }
  }

  const filteredTrainings = treinamentos.filter(training =>
    training.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    training.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    training.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        
        <Button asChild className="bg-gradient-primary">
  <Link to="/admin/treinamentos/novo">
    <Plus className="mr-2 h-4 w-4" />
    Novo Treinamento
  </Link>
</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{treinamentos.length}</p>
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
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{treinamentos.filter(t => t.status === "ativo").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rascunhos</p>
                <p className="text-2xl font-bold">{treinamentos.filter(t => t.status === "rascunho").length}</p>
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
                <p className="text-2xl font-bold">{treinamentos.reduce((acc, t) => acc + t.participantes, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar treinamentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Training List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainings.map((training) => (
          <Card key={training.id} className="hover:shadow-md transition-shadow">
            <div className="aspect-video bg-gradient-primary rounded-t-lg flex items-center justify-center overflow-hidden">
              {training.capa ? (
                <img 
                  src={training.capa} 
                  alt={training.titulo} 
                  className="w-full h-full object-cover"
                />
              ) : training.videoUrl ? (
                <Video className="h-12 w-12 text-white" />
              ) : (
                <BookOpen className="h-12 w-12 text-white" />
              )}
            </div>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2">{training.titulo}</CardTitle>
                <Badge className={`${getStatusColor(training.status)} text-white`}>
                  {training.status}
                </Badge>
              </div>
              {training.subtitulo && (
                <p className="text-sm text-muted-foreground">{training.subtitulo}</p>
              )}
              <CardDescription className="line-clamp-2">
                {training.descricao}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{training.categoria}</span>
                <span>{training.duracao}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {training.participantes} participantes
                </span>
                 <span className="text-muted-foreground">
                   {formatDate(training.criadoEm)}
                 </span>
               </div>
               <div className="flex gap-2">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   className="flex-1"
                   onClick={() => {
                     setViewingTraining(training)
                     setIsViewOpen(true)
                   }}
                 >
                   <Eye className="mr-2 h-4 w-4" />
                   Visualizar
                 </Button>
                 <Button 
                   variant="outline" 
                   size="sm"
                   onClick={() => {
                     setEditingTraining(training)
                     setIsEditOpen(true)
                   }}
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

       {/* Training Viewer Modal */}
       <TrainingViewer
         training={viewingTraining}
         open={isViewOpen}
         onOpenChange={setIsViewOpen}
       />

       {/* Training Editor Modal */}
       <TrainingEditor
         training={editingTraining}
         open={isEditOpen}
         onOpenChange={setIsEditOpen}
         onSave={(data) => {
           if (editingTraining) {
             updateTraining(editingTraining.id, data)
             toast({
               title: "Treinamento atualizado!",
               description: "As alterações foram salvas com sucesso."
             })
           }
         }}
       />
     </div>
   )
 }