import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Image as ImageIcon, FileText, ArrowLeft, Save, Info } from "lucide-react"
import { useTraining } from "@/contexts/training-context"
import {
  TrainingBlockEditor,
  type ContentBlock,
} from "@/components/training/training-block-editor"
import { useDepartments } from "@/contexts/department-context"
import { useToast } from "@/hooks/use-toast"
import { usePlans } from "@/contexts/plans-context"

type NovoTreinamentoForm = {
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
}

export default function NovoTreinamento() {
  const navigate = useNavigate()
  const { trainings, createTraining } = useTraining()
  const { departments } = useDepartments()
  const { toast } = useToast()
  const { planos, getLimiteRecurso } = usePlans()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<NovoTreinamentoForm>({
    titulo: "",
    subtitulo: "",
    descricao: "",
    texto: "",
    videoUrl: "",
    categoria: "",
    duracao: "",
    status: "rascunho",
    instrutor: "",
    departamento: "",
    capa: undefined,
    contentBlocks: [],
  })

  // Plano do portal para cálculo de limite de treinamentos
  const planoPortalId =
    import.meta.env.VITE_PLANO_PORTAL_ID || "premium" // fallback para o plano "premium" se a env não estiver definida

  const planoPortal =
    planos.find((p) => p.id === planoPortalId) ||
    planos.find((p) => (p as any).popular) || // se tiver um plano marcado como "mais contratado"
    planos[0] // fallback total: primeiro plano da lista

  const limiteTreinamentosPlano = planoPortal
    ? getLimiteRecurso(planoPortal.id, "treinamentos")
    : undefined

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        capa: reader.result as string,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!formData.titulo.trim() || !formData.descricao.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos o título e a descrição do treinamento.",
        variant: "destructive",
      })
      return
    }

    // Validação de limite de treinamentos cadastrados (ativos + inativos)
    const statusContaParaLimite =
      formData.status === "ativo" || formData.status === "inativo"

    if (statusContaParaLimite && typeof limiteTreinamentosPlano === "number") {
      const cadastrados = trainings.filter(
        (t) => t.status === "ativo" || t.status === "inativo",
      ).length

      const totalAposCriacao = cadastrados + 1

      if (totalAposCriacao > limiteTreinamentosPlano) {
        toast({
          title: "Limite de treinamentos atingido",
          description:
            `O plano ${planoPortal?.nome ?? ""} permite até ${limiteTreinamentosPlano} ` +
            `treinamentos cadastrados (ativos + inativos). ` +
            `Rascunhos continuam permitidos, mas não poderão ser ativados enquanto o limite estiver cheio.`,
          variant: "destructive",
        })
        return
      }
    }

    createTraining({
      titulo: formData.titulo,
      subtitulo: formData.subtitulo,
      descricao: formData.descricao,
      texto: formData.texto,
      videoUrl: formData.videoUrl,
      categoria: formData.categoria,
      duracao: formData.duracao,
      status: formData.status,
      instrutor: formData.instrutor,
      departamento: formData.departamento,
      capa: formData.capa,
    })

    toast({
      title: "Treinamento criado",
      description: "O treinamento foi criado com sucesso.",
    })

    navigate("/admin/treinamentos")
  }

  return (
    <div className="container max-w-6xl py-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/treinamentos")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Novo treinamento</h1>
            <p className="text-sm text-muted-foreground">
              Crie um novo treinamento estruturado com blocos de conteúdo, mídias e materiais
              de apoio.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {typeof limiteTreinamentosPlano === "number" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>
                Plano {planoPortal?.nome ?? planoPortalId}:{" "}
                {trainings.filter(
                  (t) => t.status === "ativo" || t.status === "inativo",
                ).length}
                /{limiteTreinamentosPlano} treinamentos cadastrados (ativos + inativos)
              </span>
            </div>
          )}

          <Button variant="outline" onClick={() => navigate("/admin/treinamentos")}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar treinamento
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basico" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basico">Dados básicos</TabsTrigger>
          <TabsTrigger value="blocos">Blocos</TabsTrigger>
          <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
          <TabsTrigger value="midia">Mídia</TabsTrigger>
          <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
        </TabsList>

        {/* Aba: Dados básicos */}
        <TabsContent value="basico" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Introdução à Segurança do Trabalho"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, titulo: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subtitulo">Subtítulo (opcional)</Label>
                <Input
                  id="subtitulo"
                  placeholder="Uma visão geral dos principais conceitos de segurança"
                  value={formData.subtitulo}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, subtitulo: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  rows={4}
                  placeholder="Descreva os objetivos gerais do treinamento, principais tópicos e público-alvo."
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, descricao: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  placeholder="Ex: Segurança, Compliance, Integração"
                  value={formData.categoria}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, categoria: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instrutor">Instrutor</Label>
                <Input
                  id="instrutor"
                  placeholder="Nome do instrutor responsável"
                  value={formData.instrutor}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, instrutor: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracao">Duração estimada</Label>
                <Input
                  id="duracao"
                  placeholder="Ex: 1h30, 2 horas, 3 módulos"
                  value={formData.duracao}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, duracao: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Departamento</Label>
                <Select
                  value={formData.departamento}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, departamento: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os departamentos</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "ativo" | "inativo" | "rascunho") =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="ativo">Ativo (visível para os colaboradores)</SelectItem>
                    <SelectItem value="inativo">
                      Inativo (oculto para os colaboradores)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Aba: Blocos */}
        <TabsContent value="blocos" className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Blocos de conteúdo</h2>
              <p className="text-sm text-muted-foreground">
                Estruture o treinamento em blocos (textos, vídeos, perguntas, listas de
                verificação, etc.).
              </p>
            </div>
          </div>

          <TrainingBlockEditor
            blocks={formData.contentBlocks}
            onChange={(blocks) =>
              setFormData((prev) => ({
                ...prev,
                contentBlocks: blocks,
              }))
            }
          />
        </TabsContent>

        {/* Aba: Conteúdo consolidado */}
        <TabsContent value="conteudo" className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Conteúdo consolidado</h2>
            <p className="text-sm text-muted-foreground">
              Aqui você pode escrever ou revisar o texto completo do treinamento, consolidando
              os principais pontos dos blocos.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="texto">Texto principal</Label>
            <Textarea
              id="texto"
              rows={10}
              placeholder="Escreva aqui o conteúdo completo do treinamento..."
              value={formData.texto}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  texto: e.target.value,
                }))
              }
            />
          </div>
        </TabsContent>

        {/* Aba: Mídia */}
        <TabsContent value="midia" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Imagem de capa</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-40 h-24 rounded-md border border-dashed border-muted-foreground/40 flex items-center justify-center overflow-hidden bg-muted">
                    {formData.capa ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.capa}
                        alt="Capa do treinamento"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Enviar imagem
                    </Button>
                    {formData.capa && (
                      <p className="text-xs text-muted-foreground">
                        Clique novamente para substituir a imagem.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">URL do vídeo (opcional)</Label>
                <Input
                  id="videoUrl"
                  placeholder="Cole aqui a URL de um vídeo (YouTube, Vimeo, etc.)"
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      videoUrl: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Resumo para card do catálogo</Label>
              <Textarea
                rows={6}
                placeholder="Este texto aparece nos cards de listagem de treinamentos."
                value={formData.subtitulo}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    subtitulo: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        </TabsContent>

        {/* Aba: Arquivos */}
        <TabsContent value="arquivos" className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Materiais complementares
            </h2>
            <p className="text-sm text-muted-foreground">
              Área reservada para anexar materiais complementares (apostilas, PDFs, slides, etc.).
              A implementação de upload de arquivos pode ser integrada com seu storage (S3,
              Supabase Storage, etc.).
            </p>
          </div>

          <div className="rounded-md border border-dashed border-muted-foreground/40 p-6 text-sm text-muted-foreground">
            Funcionalidade de upload de arquivos ainda não implementada neste front-end.
            Quando o backend/storage estiver disponível, você pode:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Adicionar um input de arquivos múltiplos</li>
              <li>Enviar para o storage configurado</li>
              <li>Persistir os links no objeto de treinamento</li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
