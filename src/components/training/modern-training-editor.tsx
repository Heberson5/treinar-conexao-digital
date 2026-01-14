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
} from "lucide-react";
import { useAIRewrite } from "@/hooks/use-ai-rewrite";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

// Types
export interface ContentBlock {
  id: string;
  type: "text" | "heading" | "image" | "video" | "divider" | "quote" | "list" | "checklist";
  content: string;
  level?: 1 | 2 | 3;
  align?: "left" | "center" | "right";
  mediaUrl?: string;
  caption?: string;
  listItems?: string[];
  checkItems?: { text: string; checked: boolean }[];
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
  listItems: type === "list" ? [""] : undefined,
  checkItems: type === "checklist" ? [{ text: "", checked: false }] : undefined,
});

const createEmptySection = (title = "Nova Seção"): TrainingSection => ({
  id: generateId(),
  title,
  blocks: [createEmptyBlock("text")],
});

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
    capa: initialData?.capa,
    sections: initialData?.sections || [createEmptySection("Introdução")],
  });

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

  // File upload
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

  // Render block
  const renderBlock = (block: ContentBlock, sectionIndex: number, blockIndex: number) => {
    const alignClass = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    }[block.align || "left"];

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
              className={cn("border-none shadow-none focus-visible:ring-0 bg-transparent", headingClass, alignClass)}
            />
          );

        case "text":
          return (
            <Textarea
              value={block.content}
              onChange={(e) => updateBlock(sectionIndex, block.id, { content: e.target.value })}
              placeholder="Comece a digitar seu conteúdo aqui..."
              className={cn("min-h-[120px] border-none shadow-none focus-visible:ring-0 resize-none bg-transparent", alignClass)}
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
            <div className={cn("space-y-2", alignClass === "center" ? "mx-auto" : alignClass === "right" ? "ml-auto" : "")}>
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
            <div className={cn("space-y-2", alignClass === "center" ? "mx-auto" : alignClass === "right" ? "ml-auto" : "")}>
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

            {/* Block type toolbar */}
            <div className="absolute -right-2 top-0 translate-x-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2">
              {block.type === "heading" && (
                <div className="flex items-center gap-0.5 bg-background border rounded-md p-0.5">
                  {[1, 2, 3].map((level) => (
                    <Button
                      key={level}
                      variant={block.level === level ? "secondary" : "ghost"}
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateBlock(sectionIndex, block.id, { level: level as 1 | 2 | 3 })}
                    >
                      <span className="text-xs font-bold">H{level}</span>
                    </Button>
                  ))}
                </div>
              )}

              {(block.type === "text" || block.type === "heading" || block.type === "quote") && (
                <div className="flex items-center gap-0.5 bg-background border rounded-md p-0.5">
                  <Button
                    variant={block.align === "left" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => updateBlock(sectionIndex, block.id, { align: "left" })}
                  >
                    <AlignLeft className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={block.align === "center" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => updateBlock(sectionIndex, block.id, { align: "center" })}
                  >
                    <AlignCenter className="h-3 w-3" />
                  </Button>
                  <Button
                    variant={block.align === "right" ? "secondary" : "ghost"}
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => updateBlock(sectionIndex, block.id, { align: "right" })}
                  >
                    <AlignRight className="h-3 w-3" />
                  </Button>
                </div>
              )}

              {showAIButton && (block.type === "text" || block.type === "quote") && block.content.trim() && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleAIRewrite(sectionIndex, block.id, block.content)}
                        disabled={rewritingBlockId === block.id}
                      >
                        {rewritingBlockId === block.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Reescrever com IA</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                    <List className="h-4 w-4 mr-2" /> Lista
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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <Input
              value={formData.titulo}
              onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
              placeholder="Título do treinamento"
              className="text-xl font-semibold border-none shadow-none focus-visible:ring-0 h-auto p-0 bg-transparent"
            />
            <p className="text-xs text-muted-foreground">
              {formData.sections.length} seção(ões) • {formData.sections.reduce((acc, s) => acc + s.blocks.length, 0)} bloco(s)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
                <Button variant="outline" size="icon" onClick={() => setShowPreview(!showPreview)}>
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
          <div className="w-64 border-r bg-muted/30 flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-semibold text-sm mb-2">Seções</h3>
              <Button variant="outline" size="sm" className="w-full" onClick={addSection}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Seção
              </Button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="sections" type="section">
                {(provided) => (
                  <ScrollArea className="flex-1">
                    <div ref={provided.innerRef} {...provided.droppableProps} className="p-2 space-y-1">
                      {formData.sections.map((section, index) => (
                        <Draggable key={section.id} draggableId={section.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                                activeSection === index
                                  ? "bg-primary text-primary-foreground"
                                  : "hover:bg-muted",
                                snapshot.isDragging && "shadow-lg"
                              )}
                              onClick={() => setActiveSection(index)}
                            >
                              <div {...provided.dragHandleProps} className="cursor-grab">
                                <GripVertical className="h-4 w-4 opacity-50" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{section.title}</p>
                                <p className={cn(
                                  "text-xs",
                                  activeSection === index ? "text-primary-foreground/70" : "text-muted-foreground"
                                )}>
                                  {section.blocks.length} bloco(s)
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                      "h-6 w-6 opacity-0 group-hover:opacity-100",
                                      activeSection === index && "text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10"
                                    )}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => duplicateSection(index)}>
                                    <Copy className="h-4 w-4 mr-2" /> Duplicar
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => deleteSection(index)}
                                    disabled={formData.sections.length === 1}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </ScrollArea>
                )}
              </Droppable>
            </DragDropContext>

            {/* Training settings */}
            <div className="p-4 border-t space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">Configurações</h4>
              
              <div className="space-y-2">
                <Label className="text-xs">Categoria</Label>
                <Input
                  value={formData.categoria}
                  onChange={(e) => setFormData((prev) => ({ ...prev, categoria: e.target.value }))}
                  placeholder="Ex: Segurança"
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Duração</Label>
                <Input
                  value={formData.duracao}
                  onChange={(e) => setFormData((prev) => ({ ...prev, duracao: e.target.value }))}
                  placeholder="Ex: 2h 30min"
                  className="h-8 text-sm"
                />
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
                <Badge variant="outline">
                  {activeSection + 1} / {formData.sections.length}
                </Badge>
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
                    <List className="h-4 w-4 mr-2" /> Lista
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

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept={uploadContext?.type === "image" ? "image/*" : "video/*"}
        onChange={handleFileUpload}
      />
    </div>
  );
}
