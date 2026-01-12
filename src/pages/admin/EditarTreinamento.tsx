import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Image as ImageIcon, FileText, ArrowLeft, Save, Info, Sparkles, Loader2 } from "lucide-react";
import { useTraining } from "@/contexts/training-context";
import { TrainingBlockEditor, type ContentBlock } from "@/components/training/training-block-editor";
import { useDepartments } from "@/contexts/department-context";
import { useToast } from "@/hooks/use-toast";
import { usePlans } from "@/contexts/plans-context";
import { useAIRewrite } from "@/hooks/use-ai-rewrite";
import { useAuth } from "@/contexts/auth-context";

export default function EditarTreinamento() {
  const navigate = useNavigate();
  const { id } = useParams();
  const trainingId = id ? Number(id) : undefined;
  const { trainings, getTrainingById, updateTraining } = useTraining();
  const { departments } = useDepartments();
  const { toast } = useToast();
  const { planos, getLimiteRecurso } = usePlans();
  const { user } = useAuth();
  const { rewriteText, checkAIAccess } = useAIRewrite();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showAIButton, setShowAIButton] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);

  const [formData, setFormData] = useState<{
    titulo: string;
    subtitulo: string;
    descricao: string;
    texto: string;
    videoUrl: string;
    categoria: string;
    duracao: string;
    status: "ativo" | "inativo" | "rascunho";
    instrutor: string;
    departamento: string;
    capa?: string;
    contentBlocks: ContentBlock[];
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
    contentBlocks: [],
  });

  const [loading, setLoading] = useState(true);

  // Verificar acesso à IA quando o componente carrega
  useEffect(() => {
    const checkAccess = async () => {
      if (user?.role === "master") {
        setShowAIButton(true);
      } else if (user?.role === "admin" || user?.role === "instrutor") {
        const { enabled } = await checkAIAccess();
        setShowAIButton(enabled);
      }
    };
    checkAccess();
  }, [user]);

  // Função para reescrever texto com IA
  const handleAIRewrite = async () => {
    if (!formData.texto?.trim()) {
      toast({
        title: "Texto vazio",
        description: "Escreva algum conteúdo antes de usar a IA para reescrever.",
        variant: "destructive"
      });
      return;
    }
    
    setIsRewriting(true);
    const rewrittenText = await rewriteText(formData.texto);
    if (rewrittenText) {
      setFormData(prev => ({ ...prev, texto: rewrittenText }));
    }
    setIsRewriting(false);
  };
  const planoPortalId =
    import.meta.env.VITE_PLANO_PORTAL_ID || "premium";

  const planoPortal =
    planos.find((p) => p.id === planoPortalId) ||
    planos.find((p) => (p as any).popular) ||
    planos[0];

  const limiteTreinamentosPlano = planoPortal
    ? getLimiteRecurso(planoPortal.id, "treinamentos")
    : undefined;

  useEffect(() => {
    if (trainingId) {
      const training = getTrainingById(trainingId);
      if (training) {
        setFormData({
          titulo: training.titulo || "",
          subtitulo: training.subtitulo || "",
          descricao: training.descricao || "",
          texto: training.texto || "",
          videoUrl: training.videoUrl || "",
          categoria: training.categoria || "",
          duracao: training.duracao || "",
          status: training.status || "rascunho",
          instrutor: training.instrutor || "",
          departamento: training.departamento || "todos",
          capa: training.capa,
          contentBlocks: [],
        });
      }
    }
    setLoading(false);
  }, [trainingId, getTrainingById]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setFormData((prev) => ({ ...prev, capa: imageData }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.titulo || !formData.descricao) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e descrição são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (!trainingId) {
      toast({
        title: "Treinamento não encontrado",
        description: "Não foi possível identificar o treinamento para edição.",
        variant: "destructive",
      });
      return;
    }

    // Validação de limite de treinamentos cadastrados (ativos + inativos)
    const statusContaParaLimite =
      formData.status === "ativo" || formData.status === "inativo";

    if (statusContaParaLimite && typeof limiteTreinamentosPlano === "number") {
      const cadastradosSemAtual = trainings.filter(
        (t) =>
          (t.status === "ativo" || t.status === "inativo") &&
          t.id !== trainingId,
      ).length;

      const totalAposEdicao = cadastradosSemAtual + 1;

      if (totalAposEdicao > limiteTreinamentosPlano) {
        toast({
          title: "Limite de treinamentos atingido",
          description:
            `O plano ${planoPortal?.nome ?? ""} permite até ${limiteTreinamentosPlano} ` +
            `treinamentos cadastrados (ativos + inativos). ` +
            `Rascunhos continuam permitidos, mas não poderão ser ativados enquanto o limite estiver cheio.`,
          variant: "destructive",
        });
        return;
      }
    }

    updateTraining(trainingId, {
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
    });

    toast({
      title: "Treinamento atualizado!",
      description: "As alterações foram salvas com sucesso.",
    });
    navigate("/admin/treinamentos");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">Editar Treinamento</h1>
        </div>

        <div className="flex items-center gap-4">
          {typeof limiteTreinamentosPlano === "number" && (
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
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

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/admin/treinamentos")}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-gradient-primary">
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <Tabs defaultValue="basico" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basico">Básico</TabsTrigger>
          <TabsTrigger value="blocos">Blocos</TabsTrigger>
          <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
          <TabsTrigger value="midia">Mídia</TabsTrigger>
          <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
        </TabsList>

        <TabsContent value="basico" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input
                id="titulo"
                value={formData.titulo}
                onChange={(e) =>
                  setFormData({ ...formData, titulo: e.target.value })
                }
                placeholder="Título do treinamento"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitulo">Subtítulo</Label>
              <Input
                id="subtitulo"
                value={formData.subtitulo}
                onChange={(e) =>
                  setFormData({ ...formData, subtitulo: e.target.value })
                }
                placeholder="Subtítulo (opcional)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) =>
                setFormData({ ...formData, descricao: e.target.value })
              }
              placeholder="Descrição do treinamento"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoria: value })
                }
              >
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
                onChange={(e) =>
                  setFormData({ ...formData, duracao: e.target.value })
                }
                placeholder="Ex: 2h 30min"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instrutor">Instrutor</Label>
              <Input
                id="instrutor"
                value={formData.instrutor}
                onChange={(e) =>
                  setFormData({ ...formData, instrutor: e.target.value })
                }
                placeholder="Nome do instrutor"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="departamento">Departamento</Label>
            <Select
              value={formData.departamento}
              onValueChange={(value) =>
                setFormData({ ...formData, departamento: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o departamento..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Departamentos</SelectItem>
                {departments
                  .filter((dept) => dept.ativo)
                  .map((dept) => (
                    <SelectItem key={dept.id} value={dept.nome}>
                      {dept.nome} - {dept.descricao}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Selecione "Todos" para disponibilizar o treinamento para todos os departamentos, ou
              escolha um departamento específico
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.status === "ativo"}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  status: checked ? "ativo" : "rascunho",
                })
              }
            />
            <Label>Publicar imediatamente</Label>
          </div>
        </TabsContent>

        <TabsContent value="blocos" className="space-y-4">
          <div className="space-y-2">
            <Label>Blocos de Conteúdo</Label>
            <p className="text-sm text-muted-foreground">
              Organize o conteúdo do treinamento em blocos. Você pode adicionar textos, vídeos,
              imagens e documentos na ordem desejada.
            </p>
          </div>
          <TrainingBlockEditor
            blocks={formData.contentBlocks}
            onBlocksChange={(blocks) =>
              setFormData({ ...formData, contentBlocks: blocks })
            }
          />
        </TabsContent>

        <TabsContent value="conteudo" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Label htmlFor="texto">Conteúdo do Treinamento</Label>
              <p className="text-sm text-muted-foreground">
                Escreva ou edite o conteúdo detalhado do treinamento.
              </p>
            </div>
            {showAIButton && (
              <Button
                type="button"
                variant="outline"
                onClick={handleAIRewrite}
                disabled={isRewriting || !formData.texto?.trim()}
                className="gap-2"
              >
                {isRewriting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reescrevendo...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Reescrever com IA
                  </>
                )}
              </Button>
            )}
          </div>
          <Textarea
            id="texto"
            value={formData.texto}
            onChange={(e) =>
              setFormData({ ...formData, texto: e.target.value })
            }
            placeholder="Conteúdo detalhado do treinamento..."
            rows={12}
          />
          {showAIButton && (
            <p className="text-xs text-muted-foreground">
              Clique em "Reescrever com IA" para melhorar a clareza e legibilidade do texto automaticamente
            </p>
          )}
        </TabsContent>

        <TabsContent value="midia" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video">Link do Vídeo (YouTube)</Label>
            <Input
              id="video"
              value={formData.videoUrl}
              onChange={(e) =>
                setFormData({ ...formData, videoUrl: e.target.value })
              }
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
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Alterar Capa
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, capa: undefined }))
                      }
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
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
    </div>
  );
}
