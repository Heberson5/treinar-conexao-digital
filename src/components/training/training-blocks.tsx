import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  GripVertical, 
  FileText, 
  Video, 
  Image, 
  Download,
  CheckCircle,
  Clock,
  Play,
  Pause,
  SkipForward
} from "lucide-react";

export interface TrainingBlock {
  id: string;
  type: "text" | "video" | "image" | "file" | "quiz";
  title: string;
  content: string;
  completed?: boolean;
  duration?: string;
  order: number;
}

interface TrainingBlocksProps {
  blocks: TrainingBlock[];
  onBlockComplete?: (blockId: string) => void;
  onProgressUpdate?: (progress: number) => void;
  readonly?: boolean;
}

export function TrainingBlocks({ 
  blocks, 
  onBlockComplete, 
  onProgressUpdate,
  readonly = false 
}: TrainingBlocksProps) {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set());

  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
  const totalBlocks = sortedBlocks.length;
  const completedCount = completedBlocks.size;
  const progress = totalBlocks > 0 ? (completedCount / totalBlocks) * 100 : 0;

  const handleCompleteBlock = (blockId: string) => {
    if (!readonly) {
      setCompletedBlocks(prev => {
        const newCompleted = new Set(prev);
        newCompleted.add(blockId);
        
        const newProgress = (newCompleted.size / totalBlocks) * 100;
        onProgressUpdate?.(newProgress);
        onBlockComplete?.(blockId);
        
        return newCompleted;
      });
    }
  };

  const getBlockIcon = (type: string) => {
    switch (type) {
      case "text": return <FileText className="h-5 w-5" />;
      case "video": return <Video className="h-5 w-5" />;
      case "image": return <Image className="h-5 w-5" />;
      case "file": return <Download className="h-5 w-5" />;
      case "quiz": return <CheckCircle className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getBlockTypeLabel = (type: string) => {
    switch (type) {
      case "text": return "Conteúdo";
      case "video": return "Vídeo";
      case "image": return "Imagem";
      case "file": return "Arquivo";
      case "quiz": return "Exercício";
      default: return "Conteúdo";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Progresso do Treinamento
            </CardTitle>
            <Badge variant="secondary">
              {completedCount} de {totalBlocks} blocos concluídos
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Training Blocks */}
      <div className="space-y-4">
        {sortedBlocks.map((block, index) => {
          const isCompleted = completedBlocks.has(block.id);
          const isCurrent = index === currentBlock;
          const isAccessible = index === 0 || completedBlocks.has(sortedBlocks[index - 1]?.id);

          return (
            <Card 
              key={block.id} 
              className={`transition-all duration-300 ${
                isCurrent ? "ring-2 ring-primary shadow-elegant" : ""
              } ${!isAccessible && !readonly ? "opacity-50" : ""}`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      isCompleted ? "bg-success text-success-foreground" : "bg-muted"
                    }`}>
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : getBlockIcon(block.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">
                          {getBlockTypeLabel(block.type)}
                        </Badge>
                        {block.duration && (
                          <Badge variant="secondary">
                            <Clock className="h-3 w-3 mr-1" />
                            {block.duration}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{block.title}</CardTitle>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!readonly && isAccessible && !isCompleted && (
                      <Button
                        size="sm"
                        onClick={() => setCurrentBlock(index)}
                        variant={isCurrent ? "default" : "outline"}
                      >
                        {isCurrent ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                        {isCurrent ? "Em Andamento" : "Iniciar"}
                      </Button>
                    )}
                    {isCompleted && (
                      <Badge variant="secondary" className="bg-success text-success-foreground">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Concluído
                      </Badge>
                    )}
                    {!readonly && (
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {(isCurrent || isCompleted || readonly) && (
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  
                  {/* Block Content */}
                  <div className="space-y-4">
                    {block.type === "text" && (
                      <div className="prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: block.content }} />
                      </div>
                    )}
                    
                    {block.type === "video" && (
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Video className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-muted-foreground">Player de vídeo em desenvolvimento</p>
                          <p className="text-sm text-muted-foreground mt-1">URL: {block.content}</p>
                        </div>
                      </div>
                    )}
                    
                    {block.type === "image" && (
                      <div className="rounded-lg overflow-hidden">
                        <img 
                          src={block.content} 
                          alt={block.title}
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                    
                    {block.type === "file" && (
                      <Card className="border-dashed">
                        <CardContent className="p-4 text-center">
                          <Download className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="font-medium">{block.title}</p>
                          <p className="text-sm text-muted-foreground mb-3">{block.content}</p>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Baixar Arquivo
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                    
                    {block.type === "quiz" && (
                      <Card className="border-primary/20">
                        <CardContent className="p-4 text-center">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <p className="font-medium">{block.title}</p>
                          <p className="text-sm text-muted-foreground mb-3">{block.content}</p>
                          <Button variant="outline" size="sm">
                            Iniciar Exercício
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  {!readonly && isAccessible && !isCompleted && isCurrent && (
                    <div className="flex justify-between items-center mt-6 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentBlock(Math.max(0, index - 1))}
                        disabled={index === 0}
                      >
                        Anterior
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCompleteBlock(block.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Marcar como Concluído
                        </Button>
                        
                        {index < totalBlocks - 1 && (
                          <Button
                            variant="outline"
                            onClick={() => setCurrentBlock(index + 1)}
                          >
                            Próximo
                            <SkipForward className="h-4 w-4 ml-1" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}