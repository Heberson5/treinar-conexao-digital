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
import { SupabaseTraining } from "@/hooks/use-supabase-trainings"
import { useBrazilianDate } from "@/hooks/use-brazilian-date"
import { getVideoInfo } from "@/lib/video-utils"

type ViewableTraining = Training | SupabaseTraining | null

interface TrainingViewerProps {
  training: ViewableTraining
  open: boolean
  onOpenChange: (open: boolean) => void
  onStartTraining?: (trainingId: string | number) => void
  onContinueTraining?: (trainingId: string | number) => void
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

  // Helper para determinar se é um treinamento do Supabase
  const isSupabaseTraining = (t: ViewableTraining): t is SupabaseTraining => {
    return t !== null && 'titulo' in t && 'duracao_minutos' in t
  }

  // Normalizar dados para exibição
  const titulo = isSupabaseTraining(training) ? training.titulo : training.titulo
  const subtitulo = isSupabaseTraining(training) ? null : training.subtitulo
  const descricao = isSupabaseTraining(training) ? training.descricao : training.descricao
  const duracao = isSupabaseTraining(training) 
    ? (training.duracao_minutos ? `${Math.floor(training.duracao_minutos / 60)}h ${training.duracao_minutos % 60}min` : "N/A")
    : training.duracao
  const instrutor = isSupabaseTraining(training) ? training.instrutor?.nome : training.instrutor
  const criadoEm = isSupabaseTraining(training) ? training.criado_em : training.criadoEm
  const categoria = isSupabaseTraining(training) ? training.categoria : training.categoria
  const capa = isSupabaseTraining(training) ? training.thumbnail_url : training.capa
  const progress = isSupabaseTraining(training) ? training.progresso?.percentual_concluido : training.progress
  const completed = isSupabaseTraining(training) ? training.progresso?.concluido : training.completed
  const lastAccessed = isSupabaseTraining(training) ? training.progresso?.atualizado_em : training.lastAccessed
  const deadline = isSupabaseTraining(training) ? training.data_limite : training.deadline
  const videoUrl = isSupabaseTraining(training) ? null : training.videoUrl
  const texto = isSupabaseTraining(training) ? null : training.texto

  const handleStartContinue = () => {
    if ((progress || 0) === 0) {
      onStartTraining?.(training.id)
    } else {
      onContinueTraining?.(training.id)
    }
  }

  const getActionButtonText = () => {
    if ((progress || 0) === 0) return "Iniciar Treinamento"
    if (completed) return "Revisar Treinamento"
    return "Continuar Treinamento"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{titulo}</DialogTitle>
          {subtitulo && (
            <p className="text-lg text-muted-foreground">{subtitulo}</p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          {/* Capa do treinamento */}
          {capa && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <img 
                src={capa} 
                alt={titulo}
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
                <p className="font-semibold">{duracao}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <User className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Instrutor</p>
                <p className="font-semibold">{instrutor || "Não definido"}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Criado em</p>
                <p className="font-semibold">{criadoEm ? formatDateOnly(criadoEm) : "N/A"}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Categoria</p>
                <Badge variant="secondary">{categoria || "Geral"}</Badge>
              </CardContent>
            </Card>
          </div>

          {/* Progresso do usuário */}
          {progress !== undefined && progress !== null && (
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
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Último acesso:</span>
                    <p className="font-semibold">{lastAccessed || "Nunca acessado"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Prazo:</span>
                    <p className="font-semibold">{deadline ? formatDateOnly(deadline) : "Sem prazo"}</p>
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
                    {descricao || "Sem descrição disponível"}
                  </p>
                </CardContent>
              </Card>
              
              {texto && (
                <Card>
                  <CardHeader>
                    <CardTitle>Conteúdo Detalhado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      {texto.split('\n').map((paragraph: string, index: number) => (
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
              {videoUrl ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PlayCircle className="h-5 w-5" />
                      Vídeo do Treinamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const videoInfo = getVideoInfo(videoUrl);
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
                              poster={capa || undefined}
                            >
                              <source src={videoUrl} type="video/mp4" />
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
            {completed && (
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
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}