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
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
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

  const addBlock = (type: ContentBlock['type']) => {
    const newBlock: ContentBlock = {
      id: `block-${Date.now()}`,
      type,
      title: getDefaultTitle(type),
      content: getDefaultContent(type),
      order: blocks.length + 1,
      duration: type === "video" ? "5 min" : undefined
    };

    onBlocksChange([...blocks, newBlock]);
    setEditingBlock(newBlock.id);
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
    onBlocksChange(reorderedBlocks);
  };

  const getDefaultTitle = (type: ContentBlock['type']) => {
    switch (type) {
      case "text": return "Novo Conteúdo de Texto";
      case "video": return "Novo Vídeo";
      case "image": return "Nova Imagem";
      case "document": return "Novo Documento";
      default: return "Novo Bloco";
    }
  };

  const getDefaultContent = (type: ContentBlock['type']) => {
    switch (type) {
      case "text": return "<h3>Título do Conteúdo</h3><p>Escreva aqui o conteúdo do treinamento...</p>";
      case "video": return "";
      case "image": return "";
      case "document": return "Descrição do documento";
      default: return "";
    }
  };

  const getBlockIcon = (type: ContentBlock['type']) => {
    switch (type) {
      case "text": return <FileText className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "image": return <ImageIcon className="h-4 w-4" />;
      case "document": return <File className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getBlockTypeLabel = (type: ContentBlock['type']) => {
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
                      className={`transition-shadow ${
                        snapshot.isDragging ? "shadow-lg" : ""
                      }`}
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
                              {editingBlock === block.id ? (
                                <Input
                                  value={block.title}
                                  onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                                  onBlur={() => setEditingBlock(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      setEditingBlock(null);
                                    }
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <h3 
                                  className="font-medium cursor-pointer hover:text-primary"
                                  onClick={() => setEditingBlock(block.id)}
                                >
                                  {block.title}
                                </h3>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingBlock(editingBlock === block.id ? null : block.id)}
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
                      
                      {editingBlock === block.id && (
                        <CardContent className="pt-0 space-y-4">
                          <Separator />
                          
                          {block.type === "text" && (
                            <div className="space-y-2">
                              <Label>Conteúdo</Label>
                              <Textarea
                                value={block.content}
                                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                rows={8}
                                placeholder="Escreva o conteúdo aqui..."
                              />
                            </div>
                          )}
                          
                          {block.type === "video" && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>URL do Vídeo</Label>
                                <Input
                                  value={block.content}
                                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                  placeholder="https://youtube.com/watch?v=..."
                                />
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Duração</Label>
                                  <Input
                                    value={block.duration || ""}
                                    onChange={(e) => updateBlock(block.id, { duration: e.target.value })}
                                    placeholder="Ex: 15 min"
                                  />
                                </div>
                              </div>
                              
                              {block.content && (
                                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                                  <div className="text-center">
                                    <Play className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Prévia do vídeo</p>
                                  </div>
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
                                <Label>Descrição</Label>
                                <Input
                                  value={block.content}
                                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                  placeholder="Descrição do documento"
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
                                variant="outline"
                                onClick={() => {
                                  setUploadType("document");
                                  fileInputRef.current?.click();
                                }}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Alterar Documento
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