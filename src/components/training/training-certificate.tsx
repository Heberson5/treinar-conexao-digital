import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Award, Download, Share, Calendar, User, CheckCircle, Star, Building2, BookOpen } from "lucide-react"
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

export function TrainingCertificate({ training, userProgress, userName, userCompany = "Sauberlich System", userDepartment }: TrainingCertificateProps) {
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
        text: `Concluí o treinamento "${training.titulo}" na plataforma Sauberlich System!`,
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
        <Button variant="outline" className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 hover:from-amber-600 hover:to-amber-700">
          <Award className="mr-2 h-4 w-4" />
          Ver Certificado
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500" />
            Certificado de Conclusão
          </DialogTitle>
          <DialogDescription>
            Parabéns! Você concluiu este treinamento com sucesso.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          {/* Certificate Preview - A4 Landscape Format */}
          <div 
            ref={certificateRef} 
            className="relative bg-white rounded-lg shadow-2xl overflow-hidden"
            style={{ aspectRatio: '297/210' }} // A4 landscape aspect ratio
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-amber-50" />
            
            {/* Border Design */}
            <div className="absolute inset-3 border-4 border-double border-amber-400/60 rounded-lg" />
            <div className="absolute inset-6 border border-amber-200/50 rounded-lg" />
            
            {/* Corner Decorations */}
            <div className="absolute top-8 left-8 w-24 h-24 border-t-4 border-l-4 border-amber-500 rounded-tl-lg" />
            <div className="absolute top-8 right-8 w-24 h-24 border-t-4 border-r-4 border-amber-500 rounded-tr-lg" />
            <div className="absolute bottom-8 left-8 w-24 h-24 border-b-4 border-l-4 border-amber-500 rounded-bl-lg" />
            <div className="absolute bottom-8 right-8 w-24 h-24 border-b-4 border-r-4 border-amber-500 rounded-br-lg" />
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-between p-12">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                </div>
                <h1 className="text-4xl font-serif font-bold text-slate-800 tracking-wider">
                  CERTIFICADO
                </h1>
                <p className="text-xl font-light text-slate-600 tracking-widest uppercase">
                  de Conclusão
                </p>
              </div>
              
              {/* Main Content */}
              <div className="text-center space-y-6 max-w-2xl">
                <p className="text-lg text-slate-600">
                  Certificamos que
                </p>
                <h2 className="text-4xl font-serif font-bold text-amber-700 border-b-2 border-amber-200 pb-2 px-8">
                  {userName}
                </h2>
                <p className="text-lg text-slate-600">
                  concluiu com êxito o treinamento
                </p>
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                  <h3 className="text-2xl font-bold text-slate-800 mb-3">
                    {training.titulo}
                  </h3>
                  <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {training.categoria}
                    </span>
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
              </div>
              
              {/* Footer */}
              <div className="w-full">
                {/* Stats */}
                <div className="flex justify-center gap-12 mb-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{userProgress.completionRate}%</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Aproveitamento</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {Math.floor(userProgress.totalTime / 60)}h {userProgress.totalTime % 60}m
                    </p>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Tempo Dedicado</p>
                  </div>
                  {userProgress.score && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{userProgress.score}%</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wide">Nota Final</p>
                    </div>
                  )}
                </div>
                
                {/* Signatures & Info */}
                <div className="flex justify-between items-end px-8">
                  <div className="text-left">
                    <p className="text-sm text-slate-500">Data de Conclusão</p>
                    <p className="font-semibold text-slate-700">{formatDate(completionDate)}</p>
                    <p className="text-xs text-slate-400 mt-1">ID: {certificateId}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="border-t border-slate-300 pt-2 px-16">
                      <p className="font-semibold text-slate-700">Sauberlich System</p>
                      <p className="text-xs text-slate-500">Plataforma de Treinamentos</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {userCompany && (
                      <>
                        <p className="text-sm text-slate-500">Empresa</p>
                        <p className="font-semibold text-slate-700">{userCompany}</p>
                      </>
                    )}
                    {userDepartment && (
                      <p className="text-xs text-slate-400 mt-1">Dept: {userDepartment}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Watermark Pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-9xl font-bold text-slate-900 rotate-[-30deg]">
                SAUBERLICH
              </div>
            </div>
          </div>
          
          {/* Achievement Stats Card */}
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
              Baixar Certificado (PDF)
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
