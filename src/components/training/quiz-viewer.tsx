import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, XCircle, Award, Clock, ArrowRight, ArrowLeft } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

type QuestionType = "quiz" | "verdadeiro-falso" | "resposta-curta" | "slider" | "puzzle" | "escala"

interface Questao {
  id: string
  tipo: QuestionType
  pergunta: string
  opcoes: string[]
  resposta_correta: string
  ordem: number
  valor_minimo?: number
  valor_maximo?: number
  passo?: number
}

interface QuizViewerProps {
  treinamentoId: string
  notaMinima?: number
  tempoLimite?: number
  onAprovado?: () => void
}

const TIPO_COLORS: Record<string, string> = {
  "quiz": "from-blue-500 to-blue-600",
  "verdadeiro-falso": "from-green-500 to-green-600",
  "resposta-curta": "from-orange-500 to-orange-600",
  "slider": "from-purple-500 to-purple-600",
  "puzzle": "from-pink-500 to-pink-600",
  "escala": "from-cyan-500 to-cyan-600",
}

const KAHOOT_COLORS = [
  "bg-red-500 hover:bg-red-600",
  "bg-blue-500 hover:bg-blue-600",
  "bg-yellow-500 hover:bg-yellow-600",
  "bg-green-500 hover:bg-green-600",
  "bg-purple-500 hover:bg-purple-600",
  "bg-orange-500 hover:bg-orange-600",
]

export function QuizViewer({ treinamentoId, notaMinima = 7, tempoLimite = 0, onAprovado }: QuizViewerProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [respostas, setRespostas] = useState<Record<string, string>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [resultado, setResultado] = useState<{ nota: number; aprovado: boolean; detalhes: Record<string, boolean> } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [jaAprovado, setJaAprovado] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [puzzleOrders, setPuzzleOrders] = useState<Record<string, number[]>>({})

  useEffect(() => { loadData() }, [treinamentoId])

  // Timer
  useEffect(() => {
    if (!quizStarted || tempoLimite <= 0 || resultado) return
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          handleSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [quizStarted, tempoLimite, resultado])

  const loadData = async () => {
    setIsLoading(true)
    const [questoesRes, tentativasRes] = await Promise.all([
      supabase.from("questoes_treinamento").select("*").eq("treinamento_id", treinamentoId).order("ordem"),
      user ? supabase.from("tentativas_avaliacao").select("*").eq("treinamento_id", treinamentoId).eq("usuario_id", user.id).eq("aprovado", true).limit(1) : null
    ])

    if (questoesRes.data) {
      setQuestoes(questoesRes.data.map(q => ({
        id: q.id,
        tipo: ((q as any).tipo || "quiz") as QuestionType,
        pergunta: q.pergunta,
        opcoes: (q as any).opcoes?.length ? (q as any).opcoes : [q.opcao_a, q.opcao_b, q.opcao_c, q.opcao_d].filter(Boolean),
        resposta_correta: q.resposta_correta,
        ordem: q.ordem,
        valor_minimo: (q as any).valor_minimo,
        valor_maximo: (q as any).valor_maximo,
        passo: (q as any).passo,
      })))
    }
    if (tentativasRes?.data?.length) setJaAprovado(true)
    setIsLoading(false)
  }

  const startQuiz = () => {
    setQuizStarted(true)
    if (tempoLimite > 0) setTimeLeft(tempoLimite * 60)
    // Init puzzle orders
    const puzzles: Record<string, number[]> = {}
    questoes.forEach(q => {
      if (q.tipo === "puzzle") {
        const indices = q.opcoes.map((_, i) => i)
        // Shuffle
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]]
        }
        puzzles[q.id] = indices
      }
    })
    setPuzzleOrders(puzzles)
  }

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true)
    const letterKeys = "abcdefghij".split("")
    const detalhes: Record<string, boolean> = {}
    let acertos = 0

    questoes.forEach(q => {
      const resposta = respostas[q.id] || ""
      let correta = false

      switch (q.tipo) {
        case "quiz":
        case "verdadeiro-falso":
          correta = resposta === q.resposta_correta
          break
        case "resposta-curta":
          correta = resposta.trim().toLowerCase() === q.resposta_correta.trim().toLowerCase()
          break
        case "slider":
        case "escala":
          correta = resposta === q.resposta_correta
          break
        case "puzzle":
          correta = resposta === q.resposta_correta
          break
      }

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
    } catch (e) { console.error(e) }

    setResultado({ nota, aprovado, detalhes })

    if (aprovado) {
      toast({ title: "Parabéns! Você foi aprovado! 🎉", description: `Nota: ${nota.toFixed(1)}` })
      setJaAprovado(true)
      onAprovado?.()
    } else {
      toast({ title: "Não aprovado", description: `Nota: ${nota.toFixed(1)} - Mínimo: ${notaMinima}`, variant: "destructive" })
    }

    setIsSubmitting(false)
  }, [questoes, respostas, notaMinima, user, treinamentoId, onAprovado, toast])

  const handleRetry = () => {
    // Redirecionar de volta ao conteúdo para re-estudo
    setRespostas({})
    setResultado(null)
    setCurrentIndex(0)
    setQuizStarted(false)
    toast({
      title: "Estude novamente",
      description: "Revise o conteúdo do treinamento antes de tentar novamente.",
    })
  }

  const movePuzzleItem = (qId: string, from: number, to: number) => {
    const order = [...(puzzleOrders[qId] || [])]
    const [item] = order.splice(from, 1)
    order.splice(to, 0, item)
    setPuzzleOrders({ ...puzzleOrders, [qId]: order })
    setRespostas({ ...respostas, [qId]: order.join(",") })
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Carregando avaliação...</div>
  if (questoes.length === 0) return null

  if (jaAprovado && !resultado) {
    return (
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
        <CardContent className="p-6 text-center">
          <Award className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Avaliação Aprovada!</h3>
          <p className="text-muted-foreground">Certificado disponível.</p>
        </CardContent>
      </Card>
    )
  }

  // Start screen
  if (!quizStarted && !resultado) {
    return (
      <Card className="overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500" />
        <CardContent className="p-8 text-center space-y-6">
          <div className="inline-flex p-4 rounded-full bg-primary/10">
            <HelpCircle className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Avaliação do Treinamento</h2>
            <p className="text-muted-foreground">
              {questoes.length} questão(ões) • Nota mínima: {notaMinima}
              {tempoLimite > 0 && ` • Tempo: ${tempoLimite} min`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.entries(questoes.reduce((acc, q) => {
              acc[q.tipo] = (acc[q.tipo] || 0) + 1
              return acc
            }, {} as Record<string, number>)).map(([tipo, count]) => (
              <Badge key={tipo} variant="secondary">{count}x {tipo}</Badge>
            ))}
          </div>
          <Button size="lg" onClick={startQuiz} className="gap-2">
            Iniciar Avaliação <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    )
  }

  const currentQ = questoes[currentIndex]
  const pontoPorQuestao = (10 / questoes.length).toFixed(2)
  const letterKeys = "abcdefghij".split("")
  const respondida = resultado !== null

  // Results screen
  if (resultado) {
    return (
      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className={`h-2 ${resultado.aprovado ? "bg-green-500" : "bg-red-500"}`} />
          <CardContent className="p-8 text-center space-y-4">
            <div className={`inline-flex p-4 rounded-full ${resultado.aprovado ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
              {resultado.aprovado ? <Award className="h-12 w-12 text-green-600" /> : <XCircle className="h-12 w-12 text-red-600" />}
            </div>
            <h2 className="text-3xl font-bold">{resultado.nota.toFixed(1)}</h2>
            <p className={`text-lg font-semibold ${resultado.aprovado ? "text-green-600" : "text-red-600"}`}>
              {resultado.aprovado ? "Aprovado! ✅" : "Reprovado ❌"}
            </p>
            <p className="text-muted-foreground">
              {Object.values(resultado.detalhes).filter(Boolean).length} de {questoes.length} corretas
            </p>
            {!resultado.aprovado && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Você precisa revisar o conteúdo antes de tentar novamente.
                </p>
                <Button onClick={handleRetry} size="lg" variant="outline">
                  Voltar ao Estudo e Tentar Novamente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review questions */}
        {questoes.map((q, i) => {
          const correta = resultado.detalhes[q.id]
          return (
            <Card key={q.id} className={correta ? "border-green-300 dark:border-green-800" : "border-red-300 dark:border-red-800"}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{i + 1}</Badge>
                  <span className="font-medium flex-1">{q.pergunta}</span>
                  {correta ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Sua resposta: <strong>{respostas[q.id] || "—"}</strong> | Correta: <strong>{q.resposta_correta}</strong>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  // Quiz in progress - Kahoot style
  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <Badge variant="outline">{currentIndex + 1} / {questoes.length}</Badge>
        <Progress value={((currentIndex + 1) / questoes.length) * 100} className="flex-1 mx-4 h-2" />
        {tempoLimite > 0 && (
          <Badge variant={timeLeft < 60 ? "destructive" : "outline"} className="gap-1 tabular-nums">
            <Clock className="h-3 w-3" />
            {formatTime(timeLeft)}
          </Badge>
        )}
      </div>

      {/* Question card - Kahoot style */}
      <Card className="overflow-hidden">
        <div className={`h-2 bg-gradient-to-r ${TIPO_COLORS[currentQ.tipo] || TIPO_COLORS.quiz}`} />
        <CardHeader className="text-center pb-4">
          <Badge variant="secondary" className="w-fit mx-auto mb-2">{currentQ.tipo}</Badge>
          <CardTitle className="text-xl">{currentQ.pergunta}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quiz / Multiple choice - Kahoot grid */}
          {(currentQ.tipo === "quiz" || currentQ.tipo === "verdadeiro-falso") && (
            <div className={cn("grid gap-2 sm:gap-3", currentQ.opcoes.length <= 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
              {currentQ.opcoes.map((opt, oi) => (
                <button
                  key={oi}
                  onClick={() => setRespostas({ ...respostas, [currentQ.id]: letterKeys[oi] })}
                  className={cn(
                    "p-3 sm:p-4 rounded-xl text-white font-semibold text-sm sm:text-lg transition-all transform hover:scale-[1.02] active:scale-95 text-left break-words min-h-[48px]",
                    KAHOOT_COLORS[oi % KAHOOT_COLORS.length],
                    respostas[currentQ.id] === letterKeys[oi] && "ring-4 ring-white shadow-lg scale-[1.02]"
                  )}
                >
                  <span className="text-white/70 text-xs sm:text-sm mr-2">{letterKeys[oi].toUpperCase()}</span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {/* Short answer */}
          {currentQ.tipo === "resposta-curta" && (
            <Input
              value={respostas[currentQ.id] || ""}
              onChange={(e) => setRespostas({ ...respostas, [currentQ.id]: e.target.value })}
              placeholder="Digite sua resposta..."
              className="text-center text-lg h-14"
            />
          )}

          {/* Slider */}
          {currentQ.tipo === "slider" && (
            <div className="space-y-4 px-4">
              <div className="text-center text-4xl font-bold text-primary">
                {respostas[currentQ.id] || currentQ.valor_minimo || 0}
              </div>
              <Slider
                value={[Number(respostas[currentQ.id]) || currentQ.valor_minimo || 0]}
                min={currentQ.valor_minimo || 0}
                max={currentQ.valor_maximo || 10}
                step={currentQ.passo || 1}
                onValueChange={([v]) => setRespostas({ ...respostas, [currentQ.id]: String(v) })}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{currentQ.valor_minimo || 0}</span>
                <span>{currentQ.valor_maximo || 10}</span>
              </div>
            </div>
          )}

          {/* Scale */}
          {currentQ.tipo === "escala" && (
            <div className="flex justify-center gap-3">
              {Array.from({ length: (currentQ.valor_maximo || 5) - (currentQ.valor_minimo || 1) + 1 }, (_, i) => {
                const val = (currentQ.valor_minimo || 1) + i
                return (
                  <button
                    key={val}
                    onClick={() => setRespostas({ ...respostas, [currentQ.id]: String(val) })}
                    className={cn(
                      "w-14 h-14 rounded-xl font-bold text-lg transition-all",
                      respostas[currentQ.id] === String(val)
                        ? "bg-primary text-primary-foreground shadow-lg scale-110"
                        : "bg-muted hover:bg-muted-foreground/20"
                    )}
                  >
                    {val}
                  </button>
                )
              })}
            </div>
          )}

          {/* Puzzle */}
          {currentQ.tipo === "puzzle" && (
            <div className="space-y-2">
              {(puzzleOrders[currentQ.id] || currentQ.opcoes.map((_, i) => i)).map((origIndex, displayIndex) => (
                <div key={origIndex} className="flex items-center gap-2">
                  <Badge variant="outline" className="w-8 justify-center">{displayIndex + 1}</Badge>
                  <div className="flex-1 p-3 bg-muted rounded-lg font-medium">
                    {currentQ.opcoes[origIndex]}
                  </div>
                  <div className="flex flex-col gap-1">
                    {displayIndex > 0 && (
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => movePuzzleItem(currentQ.id, displayIndex, displayIndex - 1)}>
                        <ArrowLeft className="h-3 w-3 rotate-90" />
                      </Button>
                    )}
                    {displayIndex < (puzzleOrders[currentQ.id]?.length || currentQ.opcoes.length) - 1 && (
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => movePuzzleItem(currentQ.id, displayIndex, displayIndex + 1)}>
                        <ArrowRight className="h-3 w-3 rotate-90" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Anterior
        </Button>
        
        {currentIndex < questoes.length - 1 ? (
          <Button onClick={() => setCurrentIndex(currentIndex + 1)}>
            Próxima <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || Object.keys(respostas).length < questoes.length}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? "Enviando..." : "Finalizar Avaliação"}
          </Button>
        )}
      </div>
    </div>
  )
}

function HelpCircle(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <path d="M12 17h.01"></path>
    </svg>
  )
}
