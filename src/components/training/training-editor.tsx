import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Image as ImageIcon, FileText } from "lucide-react"
import { Training } from "@/contexts/training-context"
import { TrainingBlockEditor, type ContentBlock } from "@/components/training/training-block-editor"
import { useDepartments } from "@/contexts/department-context"

interface TrainingEditorProps {
  training: Training | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (trainingData: Partial<Training>) => void
}

export function TrainingEditor({ training, open, onOpenChange, onSave }: TrainingEditorProps) {
  const { departments } = useDepartments()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<{
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
    contentBlocks: ContentBlock[]
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
    capa: undefined,
    contentBlocks: []
  })

  useEffect(() => {
    if (training) {
      setFormData({
        titulo: training.titulo,
        subtitulo: training.subtitulo || "",
        descricao: training.descricao,
        texto: training.texto || "",
        videoUrl: training.videoUrl || "",
        categoria: training.categoria,
        duracao: training.duracao,
        status: training.status,
        instrutor: training.instrutor,
        departamento: training.departamento || "todos",
        capa: training.capa,
        contentBlocks: (training as any).contentBlocks || []
      })
    }
  }, [training])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setFormData(prev => ({ ...prev, capa: imageData }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    onSave(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Treinamento</DialogTitle>
          <DialogDescription>
            Edite as informações do treinamento. Campos obrigatórios: título e descrição.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="basico" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basico">Básico</TabsTrigger>
            <TabsTrigger value="blocos">Blocos</TabsTrigger>
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
                  value={formData.titulo}
                  onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                  placeholder="Título do treinamento"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitulo">Subtítulo</Label>
                <Input
                  id="subtitulo"
                  value={formData.subtitulo}
                  onChange={(e) => setFormData({...formData, subtitulo: e.target.value})}
                  placeholder="Subtítulo (opcional)"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <Textarea
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descrição do treinamento"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
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
                  value={formData.duracao}
                  onChange={(e) => setFormData({...formData, duracao: e.target.value})}
                  placeholder="Ex: 2h 30min"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instrutor">Instrutor</Label>
                <Input
                  id="instrutor"
                  value={formData.instrutor}
                  onChange={(e) => setFormData({...formData, instrutor: e.target.value})}
                  placeholder="Nome do instrutor"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="departamento">Departamento</Label>
              <Select value={formData.departamento} onValueChange={(value) => setFormData({...formData, departamento: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o departamento..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Departamentos</SelectItem>
                  {departments.filter(dept => dept.ativo).map((dept) => (
                    <SelectItem key={dept.id} value={dept.nome}>
                      {dept.nome} - {dept.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Selecione "Todos" para disponibilizar o treinamento para todos os departamentos, ou escolha um departamento específico
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                checked={formData.status === "ativo"}
                onCheckedChange={(checked) => setFormData({...formData, status: checked ? "ativo" : "rascunho"})}
              />
              <Label>Publicar imediatamente</Label>
            </div>
          </TabsContent>
          
          <TabsContent value="blocos" className="space-y-4">
            <div className="space-y-2">
              <Label>Blocos de Conteúdo</Label>
              <p className="text-sm text-muted-foreground">
                Organize o conteúdo do treinamento em blocos. Você pode adicionar textos, vídeos, imagens e documentos na ordem desejada.
              </p>
            </div>
            <TrainingBlockEditor
              blocks={formData.contentBlocks}
              onBlocksChange={(blocks) => setFormData({...formData, contentBlocks: blocks})}
            />
          </TabsContent>
          
          <TabsContent value="conteudo" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="texto">Conteúdo do Treinamento</Label>
              <Textarea
                id="texto"
                value={formData.texto}
                onChange={(e) => setFormData({...formData, texto: e.target.value})}
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
                value={formData.videoUrl}
                onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
            
            <div className="space-y-2">
              <Label>Capa do Treinamento</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                {formData.capa ? (
                  <div className="space-y-4">
                    <img 
                      src={formData.capa} 
                      alt="Capa do treinamento" 
                      className="max-w-full h-32 object-cover mx-auto rounded-lg"
                    />
                    <div className="flex gap-2 justify-center">
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="mr-2 h-4 w-4" />
                        Alterar Capa
                      </Button>
                      <Button variant="outline" onClick={() => setFormData(prev => ({ ...prev, capa: undefined }))}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-gradient-primary">
            Salvar Alterações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}