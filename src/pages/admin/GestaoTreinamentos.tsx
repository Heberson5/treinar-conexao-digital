import { useState, useRef } from "react"
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
  Image as ImageIcon
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useTraining } from "@/contexts/training-context"

export default function GestaoTreinamentos() {
  const { trainings: treinamentos, createTraining, deleteTraining: removeTraining } = useTraining()

  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingTraining, setEditingTraining] = useState<any | null>(null)
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
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Novo Treinamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Treinamento</DialogTitle>
              <DialogDescription>
                Preencha as informações do treinamento. Todos os campos são opcionais exceto título e descrição.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="basico" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basico">Básico</TabsTrigger>
                <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
                <TabsTrigger value="midia">Mídia</TabsTrigger>
                <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basico" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={newTraining.titulo}
                      onChange={(e) => setNewTraining({...newTraining, titulo: e.target.value})}
                      placeholder="Título do treinamento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitulo">Subtítulo</Label>
                    <Input
                      id="subtitulo"
                      value={newTraining.subtitulo}
                      onChange={(e) => setNewTraining({...newTraining, subtitulo: e.target.value})}
                      placeholder="Subtítulo (opcional)"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição *</Label>
                  <Textarea
                    id="descricao"
                    value={newTraining.descricao}
                    onChange={(e) => setNewTraining({...newTraining, descricao: e.target.value})}
                    placeholder="Descrição do treinamento"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Select value={newTraining.categoria} onValueChange={(value) => setNewTraining({...newTraining, categoria: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seguranca">Segurança</SelectItem>
                        <SelectItem value="vendas">Vendas</SelectItem>
                        <SelectItem value="desenvolvimento">Desenvolvimento</SelectItem>
                        <SelectItem value="soft-skills">Soft Skills</SelectItem>
                        <SelectItem value="lideranca">Liderança</SelectItem>
                        <SelectItem value="tecnologia">Tecnologia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duracao">Duração</Label>
                    <Input
                      id="duracao"
                      value={newTraining.duracao}
                      onChange={(e) => setNewTraining({...newTraining, duracao: e.target.value})}
                      placeholder="Ex: 2h 30min"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instrutor">Instrutor</Label>
                    <Input
                      id="instrutor"
                      value={newTraining.instrutor}
                      onChange={(e) => setNewTraining({...newTraining, instrutor: e.target.value})}
                      placeholder="Nome do instrutor"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={newTraining.status === "ativo"}
                    onCheckedChange={(checked) => setNewTraining({...newTraining, status: checked ? "ativo" : "rascunho"})}
                  />
                  <Label>Publicar imediatamente</Label>
                </div>
              </TabsContent>
              
              <TabsContent value="conteudo" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="texto">Conteúdo do Treinamento</Label>
                  <Textarea
                    id="texto"
                    value={newTraining.texto}
                    onChange={(e) => setNewTraining({...newTraining, texto: e.target.value})}
                    placeholder="Conteúdo detalhado do treinamento..."
                    rows={12}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="midia" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="video">Link do Vídeo (YouTube)</Label>
                  <Input
                    id="video"
                    value={newTraining.videoUrl}
                    onChange={(e) => setNewTraining({...newTraining, videoUrl: e.target.value})}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Capa do Treinamento</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    {newTraining.capa ? (
                      <div className="space-y-4">
                        <img 
                          src={newTraining.capa} 
                          alt="Capa do treinamento" 
                          className="max-w-full h-32 object-cover mx-auto rounded-lg"
                        />
                        <div className="flex gap-2 justify-center">
                          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            Alterar Capa
                          </Button>
                          <Button variant="outline" onClick={() => setNewTraining(prev => ({ ...prev, capa: undefined }))}>
                            Remover
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                        <div className="mt-4">
                          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload de Capa
                          </Button>
                          <p className="text-sm text-muted-foreground mt-2">
                            JPG, JPEG, PNG, GIF até 5MB
                          </p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="arquivos" className="space-y-4">
                <div className="space-y-2">
                  <Label>Arquivos de Apoio</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="mt-4">
                      <Button variant="outline">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload de Arquivos
                      </Button>
                      <p className="text-sm text-muted-foreground mt-2">
                        PDF, Word, TXT, Excel até 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} className="bg-gradient-primary">
                Criar Treinamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                  {training.criadoEm}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </Button>
                <Button variant="outline" size="sm">
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
    </div>
  )
}