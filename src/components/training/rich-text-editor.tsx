// Editor de texto rico estilo Word para criação de treinamentos
import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Video,
  Link2,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Minus,
  Plus,
  Trash2,
  GripVertical,
  Type,
  FileText,
  Sparkles,
  Loader2,
} from "lucide-react";
import { useAIRewrite } from "@/hooks/use-ai-rewrite";
import { useAuth } from "@/contexts/auth-context";

export interface RichTextBlock {
  id: string;
  type: "text" | "heading" | "image" | "video" | "divider" | "quote";
  content: string;
  level?: 1 | 2 | 3; // Para headings
  align?: "left" | "center" | "right";
  mediaUrl?: string;
  caption?: string;
}

interface RichTextEditorProps {
  blocks: RichTextBlock[];
  onBlocksChange: (blocks: RichTextBlock[]) => void;
}

export function RichTextEditor({ blocks, onBlocksChange }: RichTextEditorProps) {
  const { user } = useAuth();
  const { rewriteText, checkAIAccess } = useAIRewrite();
  const [showAIButton, setShowAIButton] = useState(false);
  const [rewritingBlockId, setRewritingBlockId] = useState<string | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuPosition, setAddMenuPosition] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<"image" | "video" | null>(null);

  // Verificar acesso à IA
  useState(() => {
    const check = async () => {
      if (user?.role === "master" || user?.role === "admin" || user?.role === "instrutor") {
        const { enabled } = await checkAIAccess();
        setShowAIButton(enabled);
      }
    };
    check();
  });

  const generateId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addBlock = (type: RichTextBlock["type"], position?: number) => {
    const newBlock: RichTextBlock = {
      id: generateId(),
      type,
      content: type === "divider" ? "" : "",
      align: "left",
      level: type === "heading" ? 2 : undefined,
    };

    const newBlocks = [...blocks];
    const insertAt = position !== undefined ? position + 1 : blocks.length;
    newBlocks.splice(insertAt, 0, newBlock);
    onBlocksChange(newBlocks);
    setShowAddMenu(false);
    setAddMenuPosition(null);
    
    // Focar no novo bloco após adicionar
    setTimeout(() => setActiveBlockId(newBlock.id), 100);
  };

  const updateBlock = (id: string, updates: Partial<RichTextBlock>) => {
    const newBlocks = blocks.map(block =>
      block.id === id ? { ...block, ...updates } : block
    );
    onBlocksChange(newBlocks);
  };

  const deleteBlock = (id: string) => {
    if (blocks.length === 1) {
      // Se for o último bloco, apenas limpa o conteúdo
      updateBlock(id, { content: "" });
      return;
    }
    const newBlocks = blocks.filter(block => block.id !== id);
    onBlocksChange(newBlocks);
  };

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = blocks.findIndex(b => b.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === blocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...blocks];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
    onBlocksChange(newBlocks);
  };

  const handleKeyDown = (e: React.KeyboardEvent, block: RichTextBlock, index: number) => {
    if (e.key === "Enter" && !e.shiftKey && block.type !== "text") {
      e.preventDefault();
      addBlock("text", index);
    }
    
    if (e.key === "Backspace" && block.content === "" && blocks.length > 1) {
      e.preventDefault();
      deleteBlock(block.id);
      // Focar no bloco anterior
      if (index > 0) {
        setActiveBlockId(blocks[index - 1].id);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      const newBlock: RichTextBlock = {
        id: generateId(),
        type: uploadType === "image" ? "image" : "video",
        content: file.name,
        mediaUrl: result,
        align: "center",
      };
      
      const insertAt = addMenuPosition !== null ? addMenuPosition + 1 : blocks.length;
      const newBlocks = [...blocks];
      newBlocks.splice(insertAt, 0, newBlock);
      onBlocksChange(newBlocks);
    };
    reader.readAsDataURL(file);
    
    setUploadType(null);
    setShowAddMenu(false);
    setAddMenuPosition(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAIRewrite = async (blockId: string, content: string) => {
    if (!content.trim()) return;
    
    setRewritingBlockId(blockId);
    const rewritten = await rewriteText(content);
    if (rewritten) {
      updateBlock(blockId, { content: rewritten });
    }
    setRewritingBlockId(null);
  };

  const renderBlockToolbar = (block: RichTextBlock) => {
    if (block.type === "divider") return null;

    return (
      <div className="flex items-center gap-1 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 cursor-grab"
        >
          <GripVertical className="h-4 w-4" />
        </Button>

        {block.type === "text" && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => updateBlock(block.id, { type: "heading", level: 2 })}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => updateBlock(block.id, { type: "quote" })}
            >
              <Quote className="h-4 w-4" />
            </Button>
          </>
        )}

        {block.type === "heading" && (
          <>
            <Button
              type="button"
              variant={block.level === 1 ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => updateBlock(block.id, { level: 1 })}
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={block.level === 2 ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => updateBlock(block.id, { level: 2 })}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={block.level === 3 ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => updateBlock(block.id, { level: 3 })}
            >
              <Heading3 className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => updateBlock(block.id, { type: "text", level: undefined })}
            >
              <Type className="h-4 w-4" />
            </Button>
          </>
        )}

        {(block.type === "image" || block.type === "video") && (
          <>
            <Button
              type="button"
              variant={block.align === "left" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => updateBlock(block.id, { align: "left" })}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={block.align === "center" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => updateBlock(block.id, { align: "center" })}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant={block.align === "right" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => updateBlock(block.id, { align: "right" })}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {showAIButton && (block.type === "text" || block.type === "quote") && block.content.trim() && (
          <>
            <Separator orientation="vertical" className="h-5" />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => handleAIRewrite(block.id, block.content)}
              disabled={rewritingBlockId === block.id}
            >
              {rewritingBlockId === block.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
          </>
        )}

        <div className="flex-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-destructive hover:text-destructive"
          onClick={() => deleteBlock(block.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const renderBlock = (block: RichTextBlock, index: number) => {
    const alignClass = {
      left: "text-left",
      center: "text-center mx-auto",
      right: "text-right ml-auto",
    }[block.align || "left"];

    switch (block.type) {
      case "heading":
        const HeadingTag = `h${block.level || 2}` as "h1" | "h2" | "h3";
        const headingSize = {
          1: "text-3xl font-bold",
          2: "text-2xl font-semibold",
          3: "text-xl font-medium",
        }[block.level || 2];

        return (
          <div key={block.id} className="group relative">
            {renderBlockToolbar(block)}
            <Input
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, block, index)}
              placeholder={`Título ${block.level || 2}`}
              className={`border-none shadow-none focus-visible:ring-0 ${headingSize} ${alignClass} px-0`}
            />
          </div>
        );

      case "text":
        return (
          <div key={block.id} className="group relative">
            {renderBlockToolbar(block)}
            <Textarea
              value={block.content}
              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
              onKeyDown={(e) => handleKeyDown(e, block, index)}
              placeholder="Digite o texto aqui..."
              className={`min-h-[100px] border-none shadow-none focus-visible:ring-0 resize-none ${alignClass} px-0`}
            />
          </div>
        );

      case "quote":
        return (
          <div key={block.id} className="group relative">
            {renderBlockToolbar(block)}
            <div className="border-l-4 border-primary pl-4 py-2">
              <Textarea
                value={block.content}
                onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                onKeyDown={(e) => handleKeyDown(e, block, index)}
                placeholder="Digite a citação..."
                className="min-h-[80px] border-none shadow-none focus-visible:ring-0 resize-none italic px-0"
              />
            </div>
          </div>
        );

      case "image":
        return (
          <div key={block.id} className="group relative">
            {renderBlockToolbar(block)}
            <div className={`${alignClass} max-w-full`}>
              {block.mediaUrl ? (
                <div className="space-y-2">
                  <img
                    src={block.mediaUrl}
                    alt={block.content || "Imagem"}
                    className="max-w-full h-auto rounded-lg"
                  />
                  <Input
                    value={block.caption || ""}
                    onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                    placeholder="Legenda da imagem (opcional)"
                    className="text-center text-sm text-muted-foreground border-none shadow-none"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Cole uma URL ou faça upload de uma imagem</p>
                  <Input
                    value={block.mediaUrl || ""}
                    onChange={(e) => updateBlock(block.id, { mediaUrl: e.target.value })}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="mt-2 max-w-md mx-auto"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case "video":
        return (
          <div key={block.id} className="group relative">
            {renderBlockToolbar(block)}
            <div className={`${alignClass} max-w-full`}>
              {block.mediaUrl ? (
                <div className="space-y-2">
                  {block.mediaUrl.includes("youtube") || block.mediaUrl.includes("vimeo") ? (
                    <div className="aspect-video">
                      <iframe
                        src={block.mediaUrl.replace("watch?v=", "embed/")}
                        className="w-full h-full rounded-lg"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <video
                      src={block.mediaUrl}
                      controls
                      className="max-w-full rounded-lg"
                    />
                  )}
                  <Input
                    value={block.caption || ""}
                    onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                    placeholder="Legenda do vídeo (opcional)"
                    className="text-center text-sm text-muted-foreground border-none shadow-none"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Cole uma URL do YouTube, Vimeo ou vídeo direto</p>
                  <Input
                    value={block.mediaUrl || ""}
                    onChange={(e) => updateBlock(block.id, { mediaUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                    className="mt-2 max-w-md mx-auto"
                  />
                </div>
              )}
            </div>
          </div>
        );

      case "divider":
        return (
          <div key={block.id} className="group relative py-4">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-destructive hover:text-destructive"
                onClick={() => deleteBlock(block.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Separator className="my-4" />
          </div>
        );

      default:
        return null;
    }
  };

  const renderAddButton = (index: number) => (
    <div className="relative py-2 group/add">
      <div className="absolute left-1/2 -translate-x-1/2 opacity-0 group-hover/add:opacity-100 transition-opacity">
        <Popover open={showAddMenu && addMenuPosition === index} onOpenChange={(open) => {
          setShowAddMenu(open);
          if (open) setAddMenuPosition(index);
        }}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 rounded-full"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2" align="center">
            <div className="grid gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => addBlock("text", index)}
              >
                <Type className="h-4 w-4 mr-2" />
                Texto
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => addBlock("heading", index)}
              >
                <Heading2 className="h-4 w-4 mr-2" />
                Título
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  setUploadType("image");
                  fileInputRef.current?.click();
                }}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Imagem
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => addBlock("video", index)}
              >
                <Video className="h-4 w-4 mr-2" />
                Vídeo
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => addBlock("quote", index)}
              >
                <Quote className="h-4 w-4 mr-2" />
                Citação
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => addBlock("divider", index)}
              >
                <Minus className="h-4 w-4 mr-2" />
                Divisor
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept={uploadType === "image" ? "image/*" : "video/*"}
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="border rounded-lg p-4 min-h-[400px] bg-background">
        {blocks.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Comece a criar seu treinamento
            </p>
            <div className="flex justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => addBlock("heading")}
              >
                <Heading2 className="h-4 w-4 mr-2" />
                Adicionar título
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => addBlock("text")}
              >
                <Type className="h-4 w-4 mr-2" />
                Adicionar texto
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {blocks.map((block, index) => (
              <div key={block.id}>
                {renderBlock(block, index)}
                {renderAddButton(index)}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Passe o mouse entre os blocos para adicionar novos elementos (texto, imagens, vídeos)
      </p>
    </div>
  );
}
