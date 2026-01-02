import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";
import {
  Plus,
  GripVertical,
  FileText,
  Video,
  Image as ImageIcon,
  File,
  Download,
  X,
  Edit3,
  Upload,
  Play,
  Trash2
} from "lucide-react";

export interface ContentBlock {
  id: string;
  type: "text" | "video" | "image" | "document";
  title: string;
  content: string;
  order: number;
  duration?: string;
  thumbnail?: string;
  fileSize?: string;
  fileType?: string;
}

interface TrainingBlockEditorProps {
  blocks: ContentBlock[];
  onBlocksChange: (blocks: ContentBlock[]) => void;
}

export function TrainingBlockEditor({ blocks, onBlocksChange }: TrainingBlockEditorProps) {
  // Estado para bloco expandido (mostrar/ocultar conteúdo)
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);

  // Estado apenas para edição do título (não deve colapsar o bloco ao perder foco)
  const [titleEditingBlockId, setTitleEditingBlockId] = useState<string | null>(null);

  const [showAddMenu, setShowAddMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<"image" | "document" | null>(null);

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newBlocks = [...sortedBlocks];
    const [reorderedItem] = newBlocks.splice(result.source.index, 1);
    newBlocks.splice(result.destination.index, 0, reorderedItem);

    // Update order based on new positions
    const updatedBlocks = newBlocks.map((block, index) => ({
      ...block,
      order: index + 1
    }));

    onBlocksChange(updatedBlocks);
  };

  const addBlock = (type: ContentBlock["type"]) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      title: getDefaultTitle(type),
      content: getDefaultContent(type),
      order: blocks.length + 1,
      duration: type === "video" ? "5 min" : undefined
    };

    const newBlocks = [...blocks, newBlock];
    onBlocksChange(newBlocks);

    // Use setTimeout to ensure the block is rendered before setting state
    setTimeout(() => {
      setExpandedBlockId(newBlock.id);
      setTitleEditingBlockId(newBlock.id); // inicia editando o título, mas sem risco de colapsar ao focar o conteúdo
    }, 100);

    setShowAddMenu(false);
  };

  const updateBlock = (blockId: string, updates: Partial<ContentBlock>) => {
    const updatedBlocks = blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );
    onBlocksChange(updatedBlocks);
  };

  const deleteBlock = (blockId: string) => {
    const updatedBlocks = blocks.filter(block => block.id !== blockId);

    // Reorder remaining blocks
    const reorderedBlocks = updatedBlocks.map((block, index) => ({
      ...block,
      order: index + 1
    }));

    // Se estava expandido/editando título, limpar estado
    if (expandedBlockId === blockId) setExpandedBlockId(null);
    if (titleEditingBlockId === blockId) setTitleEditingBlockId(null);

    onBlocksChange(reorderedBlocks);
  };

  const getDefaultTitle = (type: ContentBlock["type"]) => {
    switch (type) {
      case "text": return "Novo Conteúdo de Texto";
      case "video": return "Novo Vídeo";
      case "image": return "Nova Imagem";
      case "document": return "Novo Documento";
      default: return "Novo Bloco";
    }
  };

  const getDefaultContent = (type: ContentBlock["type"]) => {
    switch (type) {
      case "text": return "<h3>Título do Conteúdo</h3><p>Escreva aqui o conteúdo do treinamento...</p>";
      case "video": return "";
      case "image": return "";
      case "document": return "Descrição do documento";
      default: return "";
    }
  };

  const getBlockIcon = (type: ContentBlock["type"]) => {
    switch (type) {
      case "text": return <FileText className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "image": return <ImageIcon className="h-4 w-4" />;
      case "document": return <File className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getBlockTypeLabel = (type: ContentBlock["type"]) => {
    switch (type) {
      case "text": return "Texto";
      case "video": return "Vídeo";
      case "image": return "Imagem";
      case "document": return "Documento";
      default: return "Conteúdo";
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !uploadType) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;

      if (uploadType === "image") {
        addBlock("image");
        const newBlock = blocks[blocks.length];
        if (newBlock) {
          updateBlock(newBlock.id, {
            content: result,
            title: file.name
          });
        }
      } else if (uploadType === "document") {
        addBlock("document");
        const newBlock = blocks[blocks.length];
        if (newBlock) {
          updateBlock(newBlock.id, {
            content: `Arquivo: ${file.name}`,
            title: file.name,
            fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            fileType: file.type.split("/")[1] || "unknown"
          });
        }
      }
    };

    if (uploadType === "image") {
      reader.readAsDataURL(file);
    } else {
      reader.readAsDataURL(file);
    }

    setUploadType(null);
  };

  const toggleExpand = (blockId: string) => {
    setExpandedBlockId(prev => (prev === blockId ? null : blockId));
    // Ao expandir/colapsar via botão, não força edição do título.
    // Mantém o comportamento previsível.
  };

  const startTitleEdit = (blockId: string) => {
    setExpandedBlockId(blockId);           // garante que o conteúdo fique visível
    setTitleEditingBlockId(blockId);       // entra em edição do título
  };

  const finishTitleEdit = (blockId: string) => {
    if (titleEditingBlockId === blockId) {
      setTitleEditingBlockId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Block Menu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Blocos de Conteúdo</span>
            <Button
              onClick={() => setShowAddMenu(!showAddMenu)}
              size="sm"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Bloco
            </Button>
          </CardTitle>
        </CardHeader>

        {showAddMenu && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => addBlock("text")}
              >
                <FileText className="h-6 w-6" />
                <span className="text-sm">Texto</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => addBlock("video")}
              >
                <Video className="h-6 w-6" />
                <span className="text-sm">Vídeo</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => {
                  setUploadType("image");
                  fileInputRef.current?.click();
                }}
              >
                <ImageIcon className="h-6 w-6" />
                <span className="text-sm">Imagem</span>
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 flex flex-col gap-2"
                onClick={() => {
                  setUploadType("document");
                  fileInputRef.current?.click();
                }}
              >
                <File className="h-6 w-6" />
                <span className="text-sm">Documento</span>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* File Input (Hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        accept={uploadType === "image" ? "image/*" : "*/*"}
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Blocks List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="blocks">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {sortedBlocks.map((block, index) => (
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`transition-shadow ${snapshot.isDragging ? "shadow-lg" : ""}`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing"
                            >
                              <GripVertical className="h-5 w-5 text-muted-foreground" />
                            </div>

                            <div className="flex items-center gap-2">
                              {getBlockIcon(block.type)}
                              <Badge variant="outline">
                                {getBlockTypeLabel(block.type)}
                              </Badge>
                            </div>

                            <div className="flex-1">
                              {titleEditingBlockId === block.id ? (
                                <Input
                                  value={block.title}
                                  onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                                  onBlur={() => finishTitleEdit(block.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === "Escape") {
                                      finishTitleEdit(block.id);
                                    }
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <h3
                                  className="font-medium cursor-pointer hover:text-primary"
                                  onClick={() => startTitleEdit(block.id)}
                                >
                                  {block.title}
                                </h3>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(block.id)}
                              title="Editar bloco"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteBlock(block.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      {expandedBlockId === block.id && (
                        <CardContent className="pt-0 space-y-4">
                          <Separator />

                          {block.type === "text" && (
                            <div className="space-y-2">
                              <Label htmlFor={`text-content-${block.id}`}>Conteúdo</Label>
                              <Textarea
                                id={`text-content-${block.id}`}
                                value={block.content || ""}
                                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                rows={8}
                                placeholder="Escreva o conteúdo aqui..."
                                autoComplete="off"
                              />
                              <p className="text-xs text-muted-foreground">
                                Você pode usar HTML básico para formatação (h3, p, strong, em)
                              </p>
                            </div>
                          )}

                          {block.type === "video" && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor={`video-url-${block.id}`}>URL do Vídeo</Label>
                                <Input
                                  id={`video-url-${block.id}`}
                                  type="url"
                                  value={block.content || ""}
                                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                  placeholder="https://youtube.com/watch?v=... ou https://vimeo.com/..."
                                  autoComplete="off"
                                />
                                <p className="text-xs text-muted-foreground">
                                  Suporta YouTube, Vimeo e links diretos de vídeo
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor={`video-duration-${block.id}`}>Duração</Label>
                                  <Input
                                    id={`video-duration-${block.id}`}
                                    value={block.duration || ""}
                                    onChange={(e) => updateBlock(block.id, { duration: e.target.value })}
                                    placeholder="Ex: 15 min"
                                    autoComplete="off"
                                  />
                                </div>
                              </div>

                              {block.content && block.content.trim() && (
                                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center border">
                                  {block.content.includes("youtube.com") || block.content.includes("youtu.be") ? (
                                    <div className="text-center">
                                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Play className="h-8 w-8 text-red-600" fill="currentColor" />
                                      </div>
                                      <p className="text-sm font-medium">YouTube Video</p>
                                      <p className="text-xs text-muted-foreground">Prévia será exibida no treinamento</p>
                                    </div>
                                  ) : (
                                    <div className="text-center">
                                      <Play className="h-12 w-12 mx-auto mb-2 text-primary" />
                                      <p className="text-sm font-medium">Vídeo Adicionado</p>
                                      <p className="text-xs text-muted-foreground">Prévia será exibida no treinamento</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {block.type === "image" && (
                            <div className="space-y-4">
                              {block.content && (
                                <div className="text-center">
                                  <img
                                    src={block.content}
                                    alt={block.title}
                                    className="max-w-full h-48 object-contain mx-auto rounded-lg border"
                                  />
                                </div>
                              )}

                              <Button
                                variant="outline"
                                onClick={() => {
                                  setUploadType("image");
                                  fileInputRef.current?.click();
                                }}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {block.content ? "Alterar Imagem" : "Adicionar Imagem"}
                              </Button>
                            </div>
                          )}

                          {block.type === "document" && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor={`document-desc-${block.id}`}>Descrição</Label>
                                <Input
                                  id={`document-desc-${block.id}`}
                                  value={block.content || ""}
                                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                  placeholder="Descrição do documento"
                                  autoComplete="off"
                                />
                              </div>

                              {(block.fileSize || block.fileType) && (
                                <div className="flex gap-2">
                                  {block.fileType && (
                                    <Badge variant="outline">{block.fileType.toUpperCase()}</Badge>
                                  )}
                                  {block.fileSize && (
                                    <Badge variant="outline">{block.fileSize}</Badge>
                                  )}
                                </div>
                              )}

                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setUploadType("document");
                                  fileInputRef.current?.click();
                                }}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {block.fileSize ? "Alterar Documento" : "Adicionar Documento"}
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {blocks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum bloco adicionado ainda.</p>
          <p className="text-sm">Clique em "Adicionar Bloco" para começar.</p>
        </div>
      )}
    </div>
  );
}
