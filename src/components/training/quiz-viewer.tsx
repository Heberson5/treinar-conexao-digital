import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Award } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface Questao {
  id: string
  pergunta: string
  opcao_a: string
  opcao_b: string
  opcao_c: string | null
  opcao_d: string | null
  resposta_correta: string
  ordem: number
}

interface QuizViewerProps {
  treinamentoId: string
  notaMinima?: number
  onAprovado?: () => void
}

export function QuizViewer({ treinamentoId, notaMinima = 7, onAprovado }: QuizViewerProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [resultado, setResultado] = useState<{ nota: number; aprovado: boolean; detalhes: Record<string, boolean> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jaAprovado, setJaAprovado] = useState(false)

  useEffect(() => {
    loadData()
  }, [treinamentoId])

  const loadData = async () => {
    setIsLoading(true)
    
    const [questoesRes, tentativasRes] = await Promise.all([
      supabase.from("questoes_treinamento").select("*").eq("treinamento_id", treinamentoId).order("ordem"),
      user ? supabase.from("tentativas_avaliacao").select("*").eq("treinamento_id", treinamentoId).eq("usuario_id", user.id).eq("aprovado", true).limit(1) : null
    ])

    if (questoesRes.data) setQuestoes(questoesRes.data)
    if (tentativasRes?.data && tentativasRes.data.length > 0) setJaAprovado(true)
    
    setIsLoading(false)
  }

  const handleSubmit = async () => {
    if (Object.keys(respostas).length < questoes.length) {
      toast({ title: "Responda todas as questões", variant: "destructive" })
      return
    }

    setIsSubmitting(true)

    const detalhes: Record<string, boolean> = {}
    let acertos = 0

    questoes.forEach(q => {
      const correta = respostas[q.id] === q.resposta_correta
      detalhes[q.id] = correta
      if (correta) acertos++
    })

    const nota = questoes.length > 0 ? (acertos / questoes.length) * 10 : 0
    const aprovado = nota >= notaMinima

    try {
      if (user) {
        await supabase.from("tentativas_avaliacao").insert({
          treinamento_id: treinamentoId,
          usuario_id: user.id,
          respostas: Object.entries(respostas).map(([questao_id, resposta]) => ({ questao_id, resposta })),
          nota,
          aprovado
        })
      }
    } catch (e) {
      console.error(e)
    }

    setResultado({ nota, aprovado, detalhes })

    if (aprovado) {
      toast({ title: "Parabéns! Você foi aprovado! 🎉", description: `Nota: ${nota.toFixed(1)} - Certificado liberado!` })
      setJaAprovado(true)
      onAprovado?.()
    } else {
      toast({ title: "Não aprovado", description: `Nota: ${nota.toFixed(1)} - Mínimo: ${notaMinima}. Tente novamente!`, variant: "destructive" })
    }

    setIsSubmitting(false)
  }

  const handleRetry = () => {
    setRespostas({})
    setResultado(null)
  }

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Carregando avaliação...</div>
  if (questoes.length === 0) return null

  if (jaAprovado && !resultado) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
        <CardContent className="p-6 text-center">
          <Award className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Avaliação Aprovada!</h3>
          <p className="text-muted-foreground">Você já foi aprovado nesta avaliação. O certificado está disponível.</p>
        </CardContent>
      </Card>
    )
  }

  const pontoPorQuestao = (10 / questoes.length).toFixed(2)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Avaliação</CardTitle>
          <CardDescription>
            {questoes.length} questão(ões) • {pontoPorQuestao} pts cada • Nota mínima: {notaMinima}
          </CardDescription>
        </CardHeader>
      </Card>

      {questoes.map((q, index) => {
        const respondida = resultado !== null
        const correta = resultado?.detalhes[q.id]

        return (
          <Card key={q.id} className={respondida ? (correta ? "border-green-300" : "border-red-300") : ""}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{index + 1}</Badge>
                <CardTitle className="text-base">{q.pergunta}</CardTitle>
                {respondida && (correta ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />)}
              </div>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={respostas[q.id] || ""}
                onValueChange={(v) => !respondida && setRespostas({ ...respostas, [q.id]: v })}
                disabled={respondida}
              >
                {[
                  { key: "a", label: q.opcao_a },
                  { key: "b", label: q.opcao_b },
                  ...(q.opcao_c ? [{ key: "c", label: q.opcao_c }] : []),
                  ...(q.opcao_d ? [{ key: "d", label: q.opcao_d }] : []),
                ].map(opt => (
                  <div key={opt.key} className={`flex items-center space-x-2 p-2 rounded ${
                    respondida && opt.key === q.resposta_correta ? "bg-green-100 dark:bg-green-900/30" : 
                    respondida && respostas[q.id] === opt.key && !correta ? "bg-red-100 dark:bg-red-900/30" : ""
                  }`}>
                    <RadioGroupItem value={opt.key} id={`${q.id}-${opt.key}`} />
                    <Label htmlFor={`${q.id}-${opt.key}`} className="cursor-pointer flex-1">
                      {opt.key.toUpperCase()}) {opt.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )
      })}

      <div className="flex justify-end gap-3">
        {resultado ? (
          <>
            <div className="flex items-center gap-2 mr-auto">
              <Badge variant={resultado.aprovado ? "default" : "destructive"} className="text-lg px-4 py-1">
                Nota: {resultado.nota.toFixed(1)}
              </Badge>
              {resultado.aprovado ? (
                <span className="text-green-600 font-semibold">Aprovado! ✅</span>
              ) : (
                <span className="text-red-600 font-semibold">Reprovado ❌</span>
              )}
            </div>
            {!resultado.aprovado && (
              <Button onClick={handleRetry}>Tentar Novamente</Button>
            )}
          </>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting || Object.keys(respostas).length < questoes.length}>
            {isSubmitting ? "Enviando..." : "Enviar Avaliação"}
          </Button>
        )}
      </div>
    </div>
  )
}
