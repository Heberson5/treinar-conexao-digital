import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Clock, 
  User, 
  Calendar, 
  PlayCircle, 
  Star, 
  Award,
  FileText,
  Eye,
  Play
} from "lucide-react"
import { Training } from "@/contexts/training-context"
import { useBrazilianDate } from "@/hooks/use-brazilian-date"
import { getVideoInfo } from "@/lib/video-utils"

interface TrainingViewerProps {
  training: Training | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStartTraining?: (trainingId: number) => void
  onContinueTraining?: (trainingId: number) => void
}

export function TrainingViewer({ 
  training, 
  open, 
  onOpenChange, 
  onStartTraining,
  onContinueTraining 
}: TrainingViewerProps) {
  const { formatDate, formatDateOnly } = useBrazilianDate()

  if (!training) return null

  const handleStartContinue = () => {
    if (training.progress === 0) {
      onStartTraining?.(training.id)
    } else {
      onContinueTraining?.(training.id)
    }
  }

  const getActionButtonText = () => {
    if (training.progress === 0) return "Iniciar Treinamento"
    if (training.completed) return "Revisar Treinamento"
    return "Continuar Treinamento"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{training.titulo}</DialogTitle>
          {training.subtitulo && (
            <p className="text-lg text-muted-foreground">{training.subtitulo}</p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Capa do treinamento */}
          {training.capa && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <img 
                src={training.capa} 
                alt={training.titulo}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Informações básicas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Duração</p>
                <p className="font-semibold">{training.duracao}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <User className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Instrutor</p>
                <p className="font-semibold">{training.instrutor}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Criado em</p>
                <p className="font-semibold">{formatDateOnly(training.criadoEm)}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Categoria</p>
                <Badge variant="secondary">{training.categoria}</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Progresso do usuário */}
          {training.progress !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Seu Progresso
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{training.progress}%</span>
                  </div>
                  <Progress value={training.progress} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Último acesso:</span>
                    <p className="font-semibold">{training.lastAccessed}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Prazo:</span>
                    <p className="font-semibold">{training.deadline ? formatDateOnly(training.deadline) : "Sem prazo"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="conteudo" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
              <TabsTrigger value="video">Vídeo</TabsTrigger>
              <TabsTrigger value="arquivos">Arquivos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="conteudo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {training.descricao}
                  </p>
                </CardContent>
              </Card>
              
              {training.texto && (
                <Card>
                  <CardHeader>
                    <CardTitle>Conteúdo Detalhado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      {training.texto.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="video" className="space-y-4">
              {training.videoUrl ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PlayCircle className="h-5 w-5" />
                      Vídeo do Treinamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const videoInfo = getVideoInfo(training.videoUrl);
                      if (videoInfo.isYoutube && videoInfo.embedUrl) {
                        return (
                          <div className="aspect-video rounded-lg overflow-hidden">
                            <iframe
                              src={videoInfo.embedUrl}
                              className="w-full h-full"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        );
                      } else {
                        return (
                          <div className="aspect-video rounded-lg overflow-hidden">
                            <video 
                              controls 
                              className="w-full h-full"
                              poster={training.capa}
                            >
                              <source src={training.videoUrl} type="video/mp4" />
                              Seu navegador não suporta o elemento de vídeo.
                            </video>
                          </div>
                        );
                      }
                    })()}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <PlayCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Nenhum vídeo disponível para este treinamento</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="arquivos" className="space-y-4">
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Nenhum arquivo disponível para este treinamento</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex gap-4 pt-4">
            <Button 
              onClick={handleStartContinue}
              className="flex-1"
              size="lg"
            >
              <PlayCircle className="mr-2 h-5 w-5" />
              {getActionButtonText()}
            </Button>
            {training.completed && (
              <Button variant="outline" size="lg">
                <Award className="mr-2 h-5 w-5" />
                Certificado
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}