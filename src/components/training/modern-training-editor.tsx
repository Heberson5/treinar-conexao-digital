// Editor moderno de treinamentos estilo Word com seções/páginas
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Plus,
  Trash2,
  GripVertical,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Video,
  Quote,
  Minus,
  List,
  ListOrdered,
  CheckSquare,
  FileText,
  ChevronLeft,
  ChevronRight,
  Settings,
  Copy,
  MoreVertical,
  Sparkles,
  Loader2,
  Upload,
  Link2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Eye,
  Save,
  ArrowLeft,
  Layers,
  PanelLeft,
  X,
  Palette,
  Building2,
} from "lucide-react";
import { useAIRewrite } from "@/hooks/use-ai-rewrite";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Types
export interface ContentBlock {
  id: string;
  type: "text" | "heading" | "image" | "video" | "divider" | "quote" | "list" | "checklist" | "numbered-list";
  content: string;
  level?: 1 | 2 | 3;
  align?: "left" | "center" | "right";
  mediaUrl?: string;
  caption?: string;
  listItems?: string[];
  checkItems?: { text: string; checked: boolean }[];
  // Estilos de texto
  fontSize?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  textColor?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
}

export interface TrainingSection {
  id: string;
  title: string;
  blocks: ContentBlock[];
}

export interface TrainingData {
  titulo: string;
  subtitulo: string;
  descricao: string;
  categoria: string;
  duracao: string;
  status: "ativo" | "inativo" | "rascunho";
  instrutor: string;
  departamento: string;
  empresa_id?: string;
  capa?: string;
  sections: TrainingSection[];
}

interface ModernTrainingEditorProps {
  initialData?: Partial<TrainingData>;
  onSave: (data: TrainingData) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createEmptyBlock = (type: ContentBlock["type"] = "text"): ContentBlock => ({
  id: generateId(),
  type,
  content: "",
  align: "left",
  level: type === "heading" ? 2 : undefined,
  listItems: type === "list" || type === "numbered-list" ? [""] : undefined,
  checkItems: type === "checklist" ? [{ text: "", checked: false }] : undefined,
  fontSize: "base",
});

const createEmptySection = (title = "Nova Seção"): TrainingSection => ({
  id: generateId(),
  title,
  blocks: [createEmptyBlock("text")],
});

// Cores predefinidas para o texto
const TEXT_COLORS = [
  { name: "Padrão", value: "" },
  { name: "Preto", value: "text-black" },
  { name: "Cinza", value: "text-gray-600" },
  { name: "Vermelho", value: "text-red-600" },
  { name: "Laranja", value: "text-orange-600" },
  { name: "Amarelo", value: "text-yellow-600" },
  { name: "Verde", value: "text-green-600" },
  { name: "Azul", value: "text-blue-600" },
  { name: "Roxo", value: "text-purple-600" },
  { name: "Rosa", value: "text-pink-600" },
];

// Tamanhos de fonte
const FONT_SIZES = [
  { name: "Extra Pequeno", value: "xs" },
  { name: "Pequeno", value: "sm" },
  { name: "Normal", value: "base" },
  { name: "Grande", value: "lg" },
  { name: "Extra Grande", value: "xl" },
  { name: "2x Grande", value: "2xl" },
  { name: "3x Grande", value: "3xl" },
];

interface Departamento {
  id: string;
  nome: string;
  empresa_id: string | null;
}

interface Empresa {
  id: string;
  nome: string;
  nome_fantasia: string | null;
}

export function ModernTrainingEditor({
  initialData,
  onSave,
  onCancel,
  isEditing = false,
}: ModernTrainingEditorProps) {
  const { user } = useAuth();
  const { rewriteText, checkAIAccess } = useAIRewrite();
  const [showAIButton, setShowAIButton] = useState(false);
  const [rewritingBlockId, setRewritingBlockId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadContext, setUploadContext] = useState<{
    sectionId: string;
    blockId?: string;
    type: "image" | "video";
  } | null>(null);

  // Departamentos e empresas do Supabase
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Editor state
  const [activeSection, setActiveSection] = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [mediaDialogData, setMediaDialogData] = useState<{
    sectionId: string;
    position: number;
    type: "image" | "video";
  } | null>(null);
  const [mediaUrl, setMediaUrl] = useState("");

  // Form data
  const [formData, setFormData] = useState<TrainingData>({
    titulo: initialData?.titulo || "",
    subtitulo: initialData?.subtitulo || "",
    descricao: initialData?.descricao || "",
    categoria: initialData?.categoria || "",
    duracao: initialData?.duracao || "",
    status: initialData?.status || "rascunho",
    instrutor: initialData?.instrutor || "",
    departamento: initialData?.departamento || "",
    empresa_id: initialData?.empresa_id || user?.empresa_id || "",
    capa: initialData?.capa,
    sections: initialData?.sections || [createEmptySection("Introdução")],
  });

  // Carregar departamentos e empresas do Supabase
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        // Carregar departamentos
        const { data: depData, error: depError } = await supabase
          .from("departamentos")
          .select("id, nome, empresa_id")
          .eq("ativo", true);

        if (depError) {
          console.error("Erro ao carregar departamentos:", depError);
        } else {
          setDepartamentos(depData || []);
        }

        // Carregar empresas (apenas para master)
        if (user?.role === "master") {
          const { data: empData, error: empError } = await supabase
            .from("empresas")
            .select("id, nome, nome_fantasia")
            .eq("ativo", true);

          if (empError) {
            console.error("Erro ao carregar empresas:", empError);
          } else {
            setEmpresas(empData || []);
          }
        }
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [user?.role]);

  // Filtrar departamentos pela empresa selecionada
  const departamentosFiltrados = formData.empresa_id
    ? departamentos.filter(
        (d) => !d.empresa_id || d.empresa_id === formData.empresa_id
      )
    : departamentos;

  // Check AI access
  useEffect(() => {
    const check = async () => {
      if (user?.role === "master" || user?.role === "admin" || user?.role === "instrutor") {
        const { enabled } = await checkAIAccess();
        setShowAIButton(enabled || user?.role === "master");
      }
    };
    check();
  }, [user, checkAIAccess]);

  // Section management
  const addSection = () => {
    const newSection = createEmptySection(`Seção ${formData.sections.length + 1}`);
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    setActiveSection(formData.sections.length);
  };

  const deleteSection = (index: number) => {
    if (formData.sections.length === 1) return;
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
    if (activeSection >= index && activeSection > 0) {
      setActiveSection(activeSection - 1);
    }
  };

  const duplicateSection = (index: number) => {
    const sectionToCopy = formData.sections[index];
    const newSection: TrainingSection = {
      ...sectionToCopy,
      id: generateId(),
      title: `${sectionToCopy.title} (cópia)`,
      blocks: sectionToCopy.blocks.map((block) => ({ ...block, id: generateId() })),
    };
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections.slice(0, index + 1),
        newSection,
        ...prev.sections.slice(index + 1),
      ],
    }));
  };

  const updateSectionTitle = (index: number, title: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, i) =>
        i === index ? { ...section, title } : section
      ),
    }));
  };

  // Block management
  const addBlock = (sectionIndex: number, type: ContentBlock["type"], position?: number) => {
    const newBlock = createEmptyBlock(type);
    setFormData((prev) => {
      const newSections = [...prev.sections];
      const section = newSections[sectionIndex];
      const insertAt = position !== undefined ? position + 1 : section.blocks.length;
      section.blocks = [
        ...section.blocks.slice(0, insertAt),
        newBlock,
        ...section.blocks.slice(insertAt),
      ];
      return { ...prev, sections: newSections };
    });
  };

  const updateBlock = (sectionIndex: number, blockId: string, updates: Partial<ContentBlock>) => {
    setFormData((prev) => {
      const newSections = [...prev.sections];
      newSections[sectionIndex].blocks = newSections[sectionIndex].blocks.map((block) =>
        block.id === blockId ? { ...block, ...updates } : block
      );
      return { ...prev, sections: newSections };
    });
  };

  const deleteBlock = (sectionIndex: number, blockId: string) => {
    setFormData((prev) => {
      const newSections = [...prev.sections];
      const section = newSections[sectionIndex];
      if (section.blocks.length === 1) {
        section.blocks = [createEmptyBlock("text")];
      } else {
        section.blocks = section.blocks.filter((block) => block.id !== blockId);
      }
      return { ...prev, sections: newSections };
    });
  };

  // Drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === "section") {
      const newSections = Array.from(formData.sections);
      const [removed] = newSections.splice(source.index, 1);
      newSections.splice(destination.index, 0, removed);
      setFormData((prev) => ({ ...prev, sections: newSections }));
      if (activeSection === source.index) {
        setActiveSection(destination.index);
      }
      return;
    }

    // Block drag within same section
    if (source.droppableId === destination.droppableId) {
      const sectionIndex = parseInt(source.droppableId.replace("section-", ""));
      const newBlocks = Array.from(formData.sections[sectionIndex].blocks);
      const [removed] = newBlocks.splice(source.index, 1);
      newBlocks.splice(destination.index, 0, removed);

      setFormData((prev) => {
        const newSections = [...prev.sections];
        newSections[sectionIndex].blocks = newBlocks;
        return { ...prev, sections: newSections };
      });
    }
  };

  // File upload - aceita todos os tipos de imagem
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadContext) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const sectionIndex = formData.sections.findIndex((s) => s.id === uploadContext.sectionId);

      if (uploadContext.blockId) {
        updateBlock(sectionIndex, uploadContext.blockId, { mediaUrl: result });
      } else if (mediaDialogData) {
        const newBlock = createEmptyBlock(uploadContext.type);
        newBlock.mediaUrl = result;
        addBlock(sectionIndex, uploadContext.type, mediaDialogData.position);
      }
    };
    reader.readAsDataURL(file);

    setUploadContext(null);
    setShowMediaDialog(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // AI rewrite
  const handleAIRewrite = async (sectionIndex: number, blockId: string, content: string) => {
    if (!content.trim()) return;

    setRewritingBlockId(blockId);
    const rewritten = await rewriteText(content);
    if (rewritten) {
      updateBlock(sectionIndex, blockId, { content: rewritten });
    }
    setRewritingBlockId(null);
  };

  // Add media via URL
  const handleAddMediaUrl = () => {
    if (!mediaDialogData || !mediaUrl.trim()) return;

    const newBlock = createEmptyBlock(mediaDialogData.type);
    newBlock.mediaUrl = mediaUrl;

    setFormData((prev) => {
      const newSections = [...prev.sections];
      const section = newSections[activeSection];
      const insertAt = mediaDialogData.position + 1;
      section.blocks = [
        ...section.blocks.slice(0, insertAt),
        newBlock,
        ...section.blocks.slice(insertAt),
      ];
      return { ...prev, sections: newSections };
    });

    setMediaUrl("");
    setShowMediaDialog(false);
    setMediaDialogData(null);
  };

  // Cover image upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData((prev) => ({ ...prev, capa: event.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Render preview block with proper formatting
  const renderPreviewBlock = (block: ContentBlock) => {
    const fontSizeClass = {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
    }[block.fontSize || "base"];

    const alignClass = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    }[block.align || "left"];

    const textStyles = cn(
      fontSizeClass,
      alignClass,
      block.textColor,
      block.isBold && "font-bold",
      block.isItalic && "italic",
      block.isUnderline && "underline"
    );

    switch (block.type) {
      case "heading":
        const HeadingTag = `h${block.level || 2}` as "h1" | "h2" | "h3";
        const headingSize = {
          1: "text-3xl font-bold",
          2: "text-2xl font-semibold",
          3: "text-xl font-medium",
        }[block.level || 2];
        return block.content ? (
          <HeadingTag 
            key={block.id} 
            className={cn(
              headingSize, 
              alignClass, 
              block.textColor,
              block.isBold && "font-bold",
              block.isItalic && "italic",
              block.isUnderline && "underline"
            )}
          >
            {block.content}
          </HeadingTag>
        ) : null;
      
      case "text":
        return block.content ? (
          <div key={block.id} className={textStyles}>
            {block.content.split('\n').map((line, i) => (
              <p key={i} className="mb-2 last:mb-0">
                {line || <br />}
              </p>
            ))}
          </div>
        ) : null;
      
      case "quote":
        return block.content ? (
          <blockquote
            key={block.id}
            className={cn(
              "border-l-4 border-primary pl-4 py-2 italic bg-muted/30 rounded-r-md",
              textStyles
            )}
          >
            {block.content}
          </blockquote>
        ) : null;
      
      case "image":
        return block.mediaUrl ? (
          <figure key={block.id} className={alignClass}>
            <img 
              src={block.mediaUrl} 
              alt={block.caption || ""} 
              className="max-w-full rounded-lg shadow-md" 
            />
            {block.caption && (
              <figcaption className="text-sm text-muted-foreground mt-2">
                {block.caption}
              </figcaption>
            )}
          </figure>
        ) : null;
      
      case "video":
        return block.mediaUrl ? (
          <div key={block.id} className={cn("aspect-video", alignClass)}>
            {block.mediaUrl.includes("youtube") || block.mediaUrl.includes("youtu.be") ? (
              <iframe
                src={block.mediaUrl
                  .replace("watch?v=", "embed/")
                  .replace("youtu.be/", "youtube.com/embed/")}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            ) : block.mediaUrl.includes("vimeo") ? (
              <iframe
                src={block.mediaUrl.replace("vimeo.com/", "player.vimeo.com/video/")}
                className="w-full h-full rounded-lg"
                allowFullScreen
              />
            ) : (
              <video src={block.mediaUrl} controls className="w-full h-full rounded-lg" />
            )}
          </div>
        ) : null;
      
      case "list":
        return (block.listItems?.filter(item => item.trim()).length) ? (
          <ul key={block.id} className="list-disc list-inside space-y-1 ml-4">
            {block.listItems?.filter(item => item.trim()).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : null;
      
      case "numbered-list":
        return (block.listItems?.filter(item => item.trim()).length) ? (
          <ol key={block.id} className="list-decimal list-inside space-y-1 ml-4">
            {block.listItems?.filter(item => item.trim()).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        ) : null;
      
      case "checklist":
        return (block.checkItems?.filter(item => item.text.trim()).length) ? (
          <div key={block.id} className="space-y-2">
            {block.checkItems?.filter(item => item.text.trim()).map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  checked={item.checked} 
                  readOnly 
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className={item.checked ? "line-through text-muted-foreground" : ""}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        ) : null;
      
      case "divider":
        return <Separator key={block.id} className="my-6" />;
      
      default:
        return null;
    }
  };

  // Render preview content
  const renderPreviewContent = () => {
    return (
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">{formData.titulo || "Sem título"}</DialogTitle>
            {formData.subtitulo && (
              <p className="text-lg text-muted-foreground">{formData.subtitulo}</p>
            )}
            {formData.descricao && (
              <p className="text-sm text-muted-foreground mt-2">{formData.descricao}</p>
            )}
          </DialogHeader>

          <div className="space-y-8 mt-6">
            {formData.capa && (
              <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                <img src={formData.capa} alt={formData.titulo} className="w-full h-full object-cover" />
              </div>
            )}

            {formData.sections.map((section, sectionIndex) => (
              <div key={section.id} className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-2">
                  <Badge variant="outline" className="shrink-0">
                    Seção {sectionIndex + 1}
                  </Badge>
                  <h2 className="text-xl font-bold">{section.title}</h2>
                </div>
                <div className="space-y-4 pl-2">
                  {section.blocks.map((block) => renderPreviewBlock(block))}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  // Render block
  const renderBlock = (block: ContentBlock, sectionIndex: number, blockIndex: number) => {
    const alignClass = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    }[block.align || "left"];

    const fontSizeClass = {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
    }[block.fontSize || "base"];

    const blockContent = () => {
      switch (block.type) {
        case "heading":
          const headingClass = {
            1: "text-3xl font-bold",
            2: "text-2xl font-semibold",
            3: "text-xl font-medium",
          }[block.level || 2];

          return (
            <Input
              value={block.content}
              onChange={(e) => updateBlock(sectionIndex, block.id, { content: e.target.value })}
              placeholder={`Título ${block.level || 2}`}
              className={cn(
                "border-none shadow-none focus-visible:ring-0 bg-transparent",
                headingClass,
                alignClass,
                block.textColor
              )}
            />
          );

        case "text":
          return (
            <Textarea
              value={block.content}
              onChange={(e) => updateBlock(sectionIndex, block.id, { content: e.target.value })}
              placeholder="Comece a digitar seu conteúdo aqui..."
              className={cn(
                "min-h-[120px] border-none shadow-none focus-visible:ring-0 resize-none bg-transparent",
                fontSizeClass,
                alignClass,
                block.textColor,
                block.isBold && "font-bold",
                block.isItalic && "italic",
                block.isUnderline && "underline"
              )}
            />
          );

        case "quote":
          return (
            <div className="border-l-4 border-primary pl-4 py-2 bg-muted/30 rounded-r-md">
              <Textarea
                value={block.content}
                onChange={(e) => updateBlock(sectionIndex, block.id, { content: e.target.value })}
                placeholder="Digite uma citação..."
                className="min-h-[80px] border-none shadow-none focus-visible:ring-0 resize-none italic bg-transparent"
              />
            </div>
          );

        case "image":
          return (
            <div className={cn("space-y-2", alignClass === "text-center" ? "mx-auto" : alignClass === "text-right" ? "ml-auto" : "")}>
              {block.mediaUrl ? (
                <div className="relative group/media">
                  <img
                    src={block.mediaUrl}
                    alt={block.caption || "Imagem"}
                    className="max-w-full h-auto rounded-lg shadow-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover/media:opacity-100 transition-opacity"
                    onClick={() => updateBlock(sectionIndex, block.id, { mediaUrl: undefined })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Input
                    value={block.caption || ""}
                    onChange={(e) => updateBlock(sectionIndex, block.id, { caption: e.target.value })}
                    placeholder="Legenda da imagem (opcional)"
                    className="mt-2 text-center text-sm text-muted-foreground border-none shadow-none bg-transparent"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Arraste uma imagem ou clique para fazer upload</p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUploadContext({
                          sectionId: formData.sections[sectionIndex].id,
                          blockId: block.id,
                          type: "image",
                        });
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  <div className="mt-4">
                    <Input
                      placeholder="Ou cole uma URL de imagem..."
                      className="max-w-md mx-auto"
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          updateBlock(sectionIndex, block.id, { mediaUrl: e.target.value });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            updateBlock(sectionIndex, block.id, { mediaUrl: input.value });
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );

        case "video":
          return (
            <div className={cn("space-y-2", alignClass === "text-center" ? "mx-auto" : alignClass === "text-right" ? "ml-auto" : "")}>
              {block.mediaUrl ? (
                <div className="relative group/media">
                  {block.mediaUrl.includes("youtube") || block.mediaUrl.includes("youtu.be") || block.mediaUrl.includes("vimeo") ? (
                    <div className="aspect-video rounded-lg overflow-hidden shadow-md">
                      <iframe
                        src={block.mediaUrl
                          .replace("watch?v=", "embed/")
                          .replace("youtu.be/", "youtube.com/embed/")}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video src={block.mediaUrl} controls className="max-w-full rounded-lg shadow-md" />
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover/media:opacity-100 transition-opacity"
                    onClick={() => updateBlock(sectionIndex, block.id, { mediaUrl: undefined })}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Input
                    value={block.caption || ""}
                    onChange={(e) => updateBlock(sectionIndex, block.id, { caption: e.target.value })}
                    placeholder="Legenda do vídeo (opcional)"
                    className="mt-2 text-center text-sm text-muted-foreground border-none shadow-none bg-transparent"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center bg-muted/20 hover:bg-muted/30 transition-colors">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Cole uma URL do YouTube, Vimeo ou faça upload</p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUploadContext({
                          sectionId: formData.sections[sectionIndex].id,
                          blockId: block.id,
                          type: "video",
                        });
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                  <div className="mt-4">
                    <Input
                      placeholder="Cole a URL do vídeo..."
                      className="max-w-md mx-auto"
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          updateBlock(sectionIndex, block.id, { mediaUrl: e.target.value });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            updateBlock(sectionIndex, block.id, { mediaUrl: input.value });
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          );

        case "divider":
          return <Separator className="my-6" />;

        case "list":
          return (
            <div className="space-y-2">
              {(block.listItems || [""]).map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-muted-foreground">•</span>
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...(block.listItems || [])];
                      newItems[i] = e.target.value;
                      updateBlock(sectionIndex, block.id, { listItems: newItems });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const newItems = [...(block.listItems || [])];
                        newItems.splice(i + 1, 0, "");
                        updateBlock(sectionIndex, block.id, { listItems: newItems });
                      }
                      if (e.key === "Backspace" && item === "" && (block.listItems?.length || 0) > 1) {
                        e.preventDefault();
                        const newItems = [...(block.listItems || [])];
                        newItems.splice(i, 1);
                        updateBlock(sectionIndex, block.id, { listItems: newItems });
                      }
                    }}
                    placeholder="Item da lista..."
                    className="flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent"
                  />
                </div>
              ))}
            </div>
          );

        case "numbered-list":
          return (
            <div className="space-y-2">
              {(block.listItems || [""]).map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-muted-foreground min-w-[20px]">{i + 1}.</span>
                  <Input
                    value={item}
                    onChange={(e) => {
                      const newItems = [...(block.listItems || [])];
                      newItems[i] = e.target.value;
                      updateBlock(sectionIndex, block.id, { listItems: newItems });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const newItems = [...(block.listItems || [])];
                        newItems.splice(i + 1, 0, "");
                        updateBlock(sectionIndex, block.id, { listItems: newItems });
                      }
                      if (e.key === "Backspace" && item === "" && (block.listItems?.length || 0) > 1) {
                        e.preventDefault();
                        const newItems = [...(block.listItems || [])];
                        newItems.splice(i, 1);
                        updateBlock(sectionIndex, block.id, { listItems: newItems });
                      }
                    }}
                    placeholder="Item da lista..."
                    className="flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent"
                  />
                </div>
              ))}
            </div>
          );

        case "checklist":
          return (
            <div className="space-y-2">
              {(block.checkItems || [{ text: "", checked: false }]).map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={(e) => {
                      const newItems = [...(block.checkItems || [])];
                      newItems[i] = { ...newItems[i], checked: e.target.checked };
                      updateBlock(sectionIndex, block.id, { checkItems: newItems });
                    }}
                    className="h-4 w-4 rounded border-muted-foreground"
                  />
                  <Input
                    value={item.text}
                    onChange={(e) => {
                      const newItems = [...(block.checkItems || [])];
                      newItems[i] = { ...newItems[i], text: e.target.value };
                      updateBlock(sectionIndex, block.id, { checkItems: newItems });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const newItems = [...(block.checkItems || [])];
                        newItems.splice(i + 1, 0, { text: "", checked: false });
                        updateBlock(sectionIndex, block.id, { checkItems: newItems });
                      }
                      if (e.key === "Backspace" && item.text === "" && (block.checkItems?.length || 0) > 1) {
                        e.preventDefault();
                        const newItems = [...(block.checkItems || [])];
                        newItems.splice(i, 1);
                        updateBlock(sectionIndex, block.id, { checkItems: newItems });
                      }
                    }}
                    placeholder="Item do checklist..."
                    className={cn(
                      "flex-1 border-none shadow-none focus-visible:ring-0 bg-transparent",
                      item.checked && "line-through text-muted-foreground"
                    )}
                  />
                </div>
              ))}
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <Draggable draggableId={block.id} index={blockIndex} key={block.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={cn(
              "group relative mb-4 rounded-lg transition-all",
              snapshot.isDragging && "shadow-lg bg-background ring-2 ring-primary"
            )}
          >
            {/* Block toolbar */}
            <div className="absolute -left-12 top-0 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div {...provided.dragHandleProps} className="cursor-grab p-1 rounded hover:bg-muted">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => deleteBlock(sectionIndex, block.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Excluir bloco</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Block type toolbar - always visible */}
            <div className="flex items-center gap-1 mb-2 flex-wrap">
              {block.type === "heading" && (
                <div className="flex items-center gap-0.5 bg-background border rounded-md p-0.5">
                  {[1, 2, 3].map((level) => (
                    <Button
                      key={level}
                      variant={block.level === level ? "secondary" : "ghost"}
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateBlock(sectionIndex, block.id, { level: level as 1 | 2 | 3 })}
                    >
                      <span className="text-xs font-bold">H{level}</span>
                    </Button>
                  ))}
                </div>
              )}

              {(block.type === "text" || block.type === "heading" || block.type === "quote") && (
                <>
                  {/* Formatação de texto - Negrito, Itálico, Sublinhado */}
                  <div className="flex items-center gap-0.5 bg-background border rounded-md p-0.5">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={block.isBold ? "secondary" : "ghost"}
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateBlock(sectionIndex, block.id, { isBold: !block.isBold })}
                          >
                            <Bold className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Negrito</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={block.isItalic ? "secondary" : "ghost"}
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateBlock(sectionIndex, block.id, { isItalic: !block.isItalic })}
                          >
                            <Italic className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Itálico</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={block.isUnderline ? "secondary" : "ghost"}
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateBlock(sectionIndex, block.id, { isUnderline: !block.isUnderline })}
                          >
                            <Underline className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Sublinhado</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Alinhamento */}
                  <div className="flex items-center gap-0.5 bg-background border rounded-md p-0.5">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={block.align === "left" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateBlock(sectionIndex, block.id, { align: "left" })}
                          >
                            <AlignLeft className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Alinhar à esquerda</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={block.align === "center" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateBlock(sectionIndex, block.id, { align: "center" })}
                          >
                            <AlignCenter className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Centralizar</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={block.align === "right" ? "secondary" : "ghost"}
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateBlock(sectionIndex, block.id, { align: "right" })}
                          >
                            <AlignRight className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Alinhar à direita</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {/* Tamanho da fonte */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 gap-1 px-2">
                        <Type className="h-3.5 w-3.5" />
                        <span className="text-xs">
                          {FONT_SIZES.find(s => s.value === (block.fontSize || "base"))?.name || "Normal"}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {FONT_SIZES.map((size) => (
                        <DropdownMenuItem
                          key={size.value}
                          onClick={() => updateBlock(sectionIndex, block.id, { fontSize: size.value as any })}
                          className={cn(block.fontSize === size.value && "bg-accent")}
                        >
                          <span className={`text-${size.value}`}>{size.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Cor do texto */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-7 gap-1 px-2">
                        <Palette className="h-3.5 w-3.5" />
                        <span className="text-xs">Cor</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {TEXT_COLORS.map((color) => (
                        <DropdownMenuItem
                          key={color.value}
                          onClick={() => updateBlock(sectionIndex, block.id, { textColor: color.value })}
                          className={cn(block.textColor === color.value && "bg-accent")}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded-full mr-2 border",
                              color.value || "bg-foreground"
                            )}
                          />
                          <span className={color.value}>{color.name}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Botão de IA sempre visível */}
                  {showAIButton && (block.type === "text" || block.type === "quote") && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 px-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30 hover:border-purple-500/50"
                            onClick={() => handleAIRewrite(sectionIndex, block.id, block.content)}
                            disabled={rewritingBlockId === block.id || !block.content.trim()}
                          >
                            {rewritingBlockId === block.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                            )}
                            <span className="text-xs">Reescrever com IA</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reescrever texto usando inteligência artificial</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </>
              )}
            </div>

            {/* Block content */}
            <div className="py-1">{blockContent()}</div>

            {/* Add block button */}
            <div className="absolute left-1/2 -bottom-2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-6 w-6 rounded-full shadow-md">
                    <Plus className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem onClick={() => addBlock(sectionIndex, "text", blockIndex)}>
                    <Type className="h-4 w-4 mr-2" /> Texto
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(sectionIndex, "heading", blockIndex)}>
                    <Heading2 className="h-4 w-4 mr-2" /> Título
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => addBlock(sectionIndex, "image", blockIndex)}>
                    <ImageIcon className="h-4 w-4 mr-2" /> Imagem
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(sectionIndex, "video", blockIndex)}>
                    <Video className="h-4 w-4 mr-2" /> Vídeo
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => addBlock(sectionIndex, "quote", blockIndex)}>
                    <Quote className="h-4 w-4 mr-2" /> Citação
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(sectionIndex, "list", blockIndex)}>
                    <List className="h-4 w-4 mr-2" /> Marcadores
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(sectionIndex, "numbered-list", blockIndex)}>
                    <ListOrdered className="h-4 w-4 mr-2" /> Numeração
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(sectionIndex, "checklist", blockIndex)}>
                    <CheckSquare className="h-4 w-4 mr-2" /> Checklist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(sectionIndex, "divider", blockIndex)}>
                    <Minus className="h-4 w-4 mr-2" /> Divisor
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Top toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Button variant="ghost" size="icon" onClick={onCancel} className="shrink-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <Input
              value={formData.titulo}
              onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
              placeholder="Título do treinamento"
              className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 h-auto p-0 bg-transparent w-full"
            />
            <p className="text-xs text-muted-foreground">
              {formData.sections.length} seção(ões) • {formData.sections.reduce((acc, s) => acc + s.blocks.length, 0)} bloco(s)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Select
            value={formData.status}
            onValueChange={(value: "ativo" | "inativo" | "rascunho") =>
              setFormData((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rascunho">Rascunho</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setShowSidebar(!showSidebar)}>
                  <PanelLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showSidebar ? "Ocultar" : "Mostrar"} painel</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setShowPreview(true)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Visualizar</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button onClick={() => onSave(formData)}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Section navigation */}
        {showSidebar && (
          <div className="w-72 border-r bg-muted/20 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Seções
                </h3>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={addSection}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="sections" type="section">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="p-2 space-y-1">
                      {formData.sections.map((section, index) => (
                        <Draggable key={section.id} draggableId={section.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
                                activeSection === index
                                  ? "bg-primary/10 border border-primary/30"
                                  : "hover:bg-muted",
                                snapshot.isDragging && "shadow-lg bg-background"
                              )}
                              onClick={() => setActiveSection(index)}
                            >
                              <div {...provided.dragHandleProps} className="cursor-grab">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{section.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {section.blocks.length} bloco(s)
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => duplicateSection(index)}>
                                    <Copy className="h-4 w-4 mr-2" />
                                    Duplicar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => deleteSection(index)}
                                    disabled={formData.sections.length === 1}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </ScrollArea>

            {/* Settings panel */}
            <div className="border-t p-4 space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configurações
              </h3>

              <div className="space-y-3">
                {/* Seleção de empresa para master */}
                {user?.role === "master" && (
                  <div className="space-y-2">
                    <Label className="text-xs flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      Empresa
                    </Label>
                    <Select
                      value={formData.empresa_id || ""}
                      onValueChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          empresa_id: value,
                          departamento: "", // Limpar departamento ao mudar empresa
                        }));
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Selecione a empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {empresas.map((empresa) => (
                          <SelectItem key={empresa.id} value={empresa.id}>
                            {empresa.nome_fantasia || empresa.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs">Categoria</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, categoria: value }))}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Onboarding">Onboarding</SelectItem>
                      <SelectItem value="Segurança">Segurança</SelectItem>
                      <SelectItem value="Compliance">Compliance</SelectItem>
                      <SelectItem value="Vendas">Vendas</SelectItem>
                      <SelectItem value="Atendimento">Atendimento</SelectItem>
                      <SelectItem value="Liderança">Liderança</SelectItem>
                      <SelectItem value="Técnico">Técnico</SelectItem>
                      <SelectItem value="Soft Skills">Soft Skills</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Departamento</Label>
                  <Select
                    value={formData.departamento}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, departamento: value }))}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentosFiltrados.length > 0 ? (
                        departamentosFiltrados.map((dep) => (
                          <SelectItem key={dep.id} value={dep.nome}>
                            {dep.nome}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="Todos">Todos</SelectItem>
                          <SelectItem value="TI">TI</SelectItem>
                          <SelectItem value="RH">RH</SelectItem>
                          <SelectItem value="Vendas">Vendas</SelectItem>
                          <SelectItem value="Financeiro">Financeiro</SelectItem>
                          <SelectItem value="Marketing">Marketing</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Duração estimada</Label>
                  <Input
                    value={formData.duracao}
                    onChange={(e) => setFormData((prev) => ({ ...prev, duracao: e.target.value }))}
                    placeholder="Ex: 30min, 1h"
                    className="h-8 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Capa do treinamento</Label>
                  <div className="relative">
                    {formData.capa ? (
                      <div className="relative group">
                        <img
                          src={formData.capa}
                          alt="Capa"
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setFormData((prev) => ({ ...prev, capa: undefined }))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <label className="block border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                        <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">Clique para upload</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs">Instrutor</Label>
                  <Input
                    value={formData.instrutor}
                    onChange={(e) => setFormData((prev) => ({ ...prev, instrutor: e.target.value }))}
                    placeholder="Nome do instrutor"
                    className="h-8 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main editor area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Section header */}
          <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/20">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                disabled={activeSection === 0}
                onClick={() => setActiveSection(activeSection - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-medium">
                  Seção {activeSection + 1}
                </span>
                <span className="text-muted-foreground">•</span>
                <Input
                  value={formData.sections[activeSection]?.title || ""}
                  onChange={(e) => updateSectionTitle(activeSection, e.target.value)}
                  className="border-none shadow-none focus-visible:ring-0 font-medium text-lg h-auto p-0 bg-transparent max-w-[300px]"
                  placeholder="Nome da seção"
                />
              </div>

              <Button
                variant="ghost"
                size="icon"
                disabled={activeSection === formData.sections.length - 1}
                onClick={() => setActiveSection(activeSection + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar bloco
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => addBlock(activeSection, "text")}>
                    <Type className="h-4 w-4 mr-2" /> Texto
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(activeSection, "heading")}>
                    <Heading2 className="h-4 w-4 mr-2" /> Título
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => addBlock(activeSection, "image")}>
                    <ImageIcon className="h-4 w-4 mr-2" /> Imagem
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(activeSection, "video")}>
                    <Video className="h-4 w-4 mr-2" /> Vídeo
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => addBlock(activeSection, "quote")}>
                    <Quote className="h-4 w-4 mr-2" /> Citação
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(activeSection, "list")}>
                    <List className="h-4 w-4 mr-2" /> Marcadores
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(activeSection, "numbered-list")}>
                    <ListOrdered className="h-4 w-4 mr-2" /> Numeração
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(activeSection, "checklist")}>
                    <CheckSquare className="h-4 w-4 mr-2" /> Checklist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock(activeSection, "divider")}>
                    <Minus className="h-4 w-4 mr-2" /> Divisor
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Editor content */}
          <ScrollArea className="flex-1">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="max-w-3xl mx-auto py-8 px-12">
                <Droppable droppableId={`section-${activeSection}`} type="block">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[500px]">
                      {formData.sections[activeSection]?.blocks.map((block, blockIndex) =>
                        renderBlock(block, activeSection, blockIndex)
                      )}
                      {provided.placeholder}

                      {/* Empty state */}
                      {formData.sections[activeSection]?.blocks.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Esta seção está vazia</p>
                          <p className="text-sm">Clique em "Adicionar bloco" para começar</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            </DragDropContext>
          </ScrollArea>

          {/* Bottom navigation */}
          <div className="flex items-center justify-between px-6 py-3 border-t bg-muted/20">
            <Button
              variant="outline"
              disabled={activeSection === 0}
              onClick={() => setActiveSection(activeSection - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Seção anterior
            </Button>

            <div className="flex items-center gap-1">
              {formData.sections.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSection(index)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    activeSection === index ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>

            <Button
              variant="outline"
              disabled={activeSection === formData.sections.length - 1}
              onClick={() => setActiveSection(activeSection + 1)}
            >
              Próxima seção
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden file input - aceita todos tipos de imagem */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={uploadContext?.type === "image" ? "image/*" : "video/*"}
        onChange={handleFileUpload}
      />

      {/* Preview dialog */}
      {renderPreviewContent()}
    </div>
  );
}
