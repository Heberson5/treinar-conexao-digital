import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Award, Download, Share, Calendar, User, CheckCircle, Star } from "lucide-react"
import { useBrazilianDate } from "@/hooks/use-brazilian-date"

interface TrainingCertificateProps {
  training: {
    id: string | number
    titulo: string
    categoria: string
    duracao: string
    instrutor?: string
    completedAt?: string
    rating?: number
  }
  userProgress: {
    totalTime: number
    completionRate: number
    score?: number
  }
  userName: string
  userCompany?: string
  userDepartment?: string
}

export function TrainingCertificate({ training, userProgress, userName, userCompany = "Portal Treinamentos Ltda", userDepartment }: TrainingCertificateProps) {
  const [isOpen, setIsOpen] = useState(false)
  const certificateRef = useRef<HTMLDivElement>(null)
  const { formatDate } = useBrazilianDate()

  const certificateId = `CERT-${training.id}-${Date.now().toString().slice(-6)}`
  const completionDate = training.completedAt || new Date().toISOString()

  const downloadCertificate = () => {
    // Em uma implementação real, você geraria um PDF aqui
    const element = certificateRef.current
    if (element) {
      // Simular download
      const link = document.createElement('a')
      link.download = `certificado-${training.titulo.replace(/\s+/g, '-').toLowerCase()}.pdf`
      link.href = '#'
      link.click()
    }
  }

  const shareCertificate = () => {
    if (navigator.share) {
      navigator.share({
        title: `Certificado - ${training.titulo}`,
        text: `Concluí o treinamento "${training.titulo}" na plataforma Portal Treinamentos!`,
        url: window.location.href
      })
    } else {
      // Fallback para copiar link
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-0 hover:from-yellow-500 hover:to-yellow-700">
          <Award className="mr-2 h-4 w-4" />
          Ver Certificado
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            Certificado de Conclusão
          </DialogTitle>
          <DialogDescription>
            Parabéns! Você concluiu este treinamento com sucesso.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Certificate Preview */}
          <div ref={certificateRef} className="bg-gradient-to-br from-white to-gray-50 p-8 border-2 border-yellow-200 rounded-lg relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
            <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"></div>
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">CERTIFICADO DE CONCLUSÃO</h1>
              <p className="text-lg text-gray-600">{userCompany}</p>
              {userDepartment && (
                <p className="text-sm text-gray-500">Departamento: {userDepartment}</p>
              )}
            </div>
            
            {/* Content */}
            <div className="text-center space-y-6">
              <div>
                <p className="text-lg text-gray-700 mb-2">Certificamos que</p>
                <h2 className="text-4xl font-bold text-primary mb-4">{userName}</h2>
                <p className="text-lg text-gray-700">concluiu com sucesso o treinamento</p>
              </div>
              
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{training.titulo}</h3>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <Badge variant="secondary">{training.categoria}</Badge>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {training.duracao}
                  </span>
                  {training.instrutor && (
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {training.instrutor}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{userProgress.completionRate}%</div>
                  <div className="text-sm text-gray-600">Taxa de Conclusão</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{Math.floor(userProgress.totalTime / 60)}h {userProgress.totalTime % 60}m</div>
                  <div className="text-sm text-gray-600">Tempo Total</div>
                </div>
                {userProgress.score && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{userProgress.score}%</div>
                    <div className="text-sm text-gray-600">Pontuação</div>
                  </div>
                )}
              </div>
              
              {/* Date and Certificate ID */}
              <div className="border-t pt-6 mt-8">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <div>
                    <p>Data de Conclusão: {formatDate(completionDate)}</p>
                    <p>Certificado ID: {certificateId}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-yellow-600">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-4 w-4 ${i < (training.rating || 5) ? 'fill-current' : ''}`} 
                        />
                      ))}
                    </div>
                    <p className="text-xs">Avaliação do Curso</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Achievement Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Conquistas do Treinamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-sm text-muted-foreground">{userProgress.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${userProgress.completionRate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Tempo Investido</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.floor(userProgress.totalTime / 60)}h {userProgress.totalTime % 60}m
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full w-full"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <Button onClick={downloadCertificate} className="bg-green-600 hover:bg-green-700">
              <Download className="mr-2 h-4 w-4" />
              Baixar Certificado
            </Button>
            <Button variant="outline" onClick={shareCertificate}>
              <Share className="mr-2 h-4 w-4" />
              Compartilhar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}