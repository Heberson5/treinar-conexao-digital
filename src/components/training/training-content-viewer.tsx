import { useBrazilianDate } from "@/hooks/use-brazilian-date";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  FileText, 
  Image, 
  Download,
  Clock,
  Eye
} from "lucide-react";

export interface TrainingContentBlock {
  id: string;
  type: "text" | "video" | "image" | "file" | "document";
  title: string;
  content: string;
  order: number;
  duration?: string;
  thumbnail?: string;
  fileSize?: string;
  fileType?: string;
}

interface TrainingContentViewerProps {
  blocks: TrainingContentBlock[];
  progress: number;
  onContentRead?: (blockId: string) => void;
}

export function TrainingContentViewer({ blocks, progress, onContentRead }: TrainingContentViewerProps) {
  const sortedBlocks = [...blocks].sort((a, b) => a.order - b.order);
  
  const getVideoThumbnail = (videoUrl: string) => {
    // Extract YouTube video ID and create thumbnail
    const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      return `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`;
    }
    return null;
  };

  const renderBlock = (block: TrainingContentBlock) => {
    switch (block.type) {
      case "text":
        return (
          <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground">
            <div dangerouslySetInnerHTML={{ __html: block.content }} />
          </div>
        );
        
      case "video":
        const thumbnail = getVideoThumbnail(block.content);
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative group cursor-pointer">
              {thumbnail ? (
                <>
                  <img 
                    src={thumbnail} 
                    alt={block.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="h-8 w-8 text-black ml-1" fill="currentColor" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Play className="h-16 w-16 mx-auto mb-4 text-primary" />
                    <p className="text-lg font-medium">Vídeo Disponível</p>
                    <p className="text-muted-foreground">Clique para reproduzir</p>
                  </div>
                </div>
              )}
              <Badge className="absolute top-2 right-2 bg-black/50 text-white">
                <Eye className="h-3 w-3 mr-1" />
                Vídeo
              </Badge>
            </div>
            {block.duration && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                Duração: {block.duration}
              </div>
            )}
          </div>
        );
        
      case "image":
        return (
          <div className="space-y-2">
            <div className="rounded-lg overflow-hidden">
              <img 
                src={block.content} 
                alt={block.title}
                className="w-full h-auto max-h-[500px] object-contain bg-muted"
              />
            </div>
          </div>
        );
        
      case "file":
      case "document":
        return (
          <Card className="border-dashed border-primary/30 bg-primary/5">
            <CardContent className="p-6 text-center space-y-3">
              <Download className="h-12 w-12 mx-auto text-primary" />
              <div>
                <p className="font-medium text-lg">{block.title}</p>
                <p className="text-muted-foreground">{block.content}</p>
              </div>
              {(block.fileSize || block.fileType) && (
                <div className="flex justify-center gap-2 text-sm text-muted-foreground">
                  {block.fileType && (
                    <Badge variant="outline">{block.fileType.toUpperCase()}</Badge>
                  )}
                  {block.fileSize && (
                    <Badge variant="outline">{block.fileSize}</Badge>
                  )}
                </div>
              )}
              <div className="text-primary hover:text-primary/80 cursor-pointer font-medium">
                Clique para baixar o arquivo
              </div>
            </CardContent>
          </Card>
        );
        
      default:
        return (
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: block.content }} />
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress indicator */}
      <div className="sticky top-20 z-40 bg-background/95 backdrop-blur p-4 rounded-lg border shadow-sm mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progresso do Estudo</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Continuous content flow - no separators between blocks */}
      <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-strong:text-foreground">
        {sortedBlocks.map((block, index) => (
          <div key={block.id} className="scroll-mt-24">
            {renderBlock(block)}
          </div>
        ))}
      </div>

      {/* Completion message */}
      {progress >= 100 && (
        <Card className="border-success bg-success/5">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-success mb-2">Conteúdo Concluído!</h3>
            <p className="text-muted-foreground">
              Você concluiu a leitura de todo o conteúdo do treinamento.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}