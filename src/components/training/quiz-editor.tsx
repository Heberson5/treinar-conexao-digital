import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, GripVertical, HelpCircle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Questao {
  id?: string
  pergunta: string
  opcao_a: string
  opcao_b: string
  opcao_c: string
  opcao_d: string
  resposta_correta: string
  ordem: number
}

interface QuizEditorProps {
  treinamentoId: string
  avaliacaoObrigatoria?: boolean
  notaMinima?: number
  onSettingsChange?: (settings: { avaliacao_obrigatoria: boolean; nota_minima: number }) => void
}

export function QuizEditor({ treinamentoId, avaliacaoObrigatoria = false, notaMinima = 7, onSettingsChange }: QuizEditorProps) {
  const { toast } = useToast()
  const [questoes, setQuestoes] = useState<Questao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [obrigatoria, setObrigatoria] = useState(avaliacaoObrigatoria)

  useEffect(() => {
    loadQuestoes()
  }, [treinamentoId])

  const loadQuestoes = async () => {
    setIsLoading(true)
    const { data, error } = await supabase
      .from("questoes_treinamento")
      .select("*")
      .eq("treinamento_id", treinamentoId)
      .order("ordem")

    if (!error && data) {
      setQuestoes(data.map(q => ({
        id: q.id,
        pergunta: q.pergunta,
        opcao_a: q.opcao_a,
        opcao_b: q.opcao_b,
        opcao_c: q.opcao_c || "",
        opcao_d: q.opcao_d || "",
        resposta_correta: q.resposta_correta,
        ordem: q.ordem
      })))
    }
    setIsLoading(false)
  }

  const addQuestao = () => {
    setQuestoes([...questoes, {
      pergunta: "",
      opcao_a: "",
      opcao_b: "",
      opcao_c: "",
      opcao_d: "",
      resposta_correta: "a",
      ordem: questoes.length
    }])
  }

  const removeQuestao = (index: number) => {
    setQuestoes(questoes.filter((_, i) => i !== index))
  }

  const updateQuestao = (index: number, field: keyof Questao, value: string) => {
    setQuestoes(questoes.map((q, i) => i === index ? { ...q, [field]: value } : q))
  }

  const pontoPorQuestao = questoes.length > 0 ? (10 / questoes.length).toFixed(2) : "0"

  const handleSave = async () => {
    const invalidas = questoes.filter(q => !q.pergunta.trim() || !q.opcao_a.trim() || !q.opcao_b.trim())
    if (invalidas.length > 0) {
      toast({ title: "Preencha todas as questões", description: "Pergunta e pelo menos 2 opções são obrigatórias.", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      // Delete existing questions
      await supabase.from("questoes_treinamento").delete().eq("treinamento_id", treinamentoId)

      // Insert new questions
      if (questoes.length > 0) {
        const { error } = await supabase.from("questoes_treinamento").insert(
          questoes.map((q, i) => ({
            treinamento_id: treinamentoId,
            pergunta: q.pergunta,
            opcao_a: q.opcao_a,
            opcao_b: q.opcao_b,
            opcao_c: q.opcao_c || null,
            opcao_d: q.opcao_d || null,
            resposta_correta: q.resposta_correta,
            ordem: i
          }))
        )
        if (error) throw error
      }

      onSettingsChange?.({ avaliacao_obrigatoria: obrigatoria, nota_minima: notaMinima })

      toast({ title: "Avaliação salva!", description: `${questoes.length} questão(ões) salva(s). Valor de cada: ${pontoPorQuestao} pontos.` })
      await loadQuestoes()
    } catch (error) {
      console.error(error)
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar a avaliação.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Carregando avaliação...</div>

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Avaliação do Treinamento
          </CardTitle>
          <CardDescription>
            Crie questões de múltipla escolha. A nota é distribuída automaticamente (10 pontos / nº de questões).
            Nota mínima para aprovação: <strong>7,0</strong>. O certificado só é emitido após aprovação.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-3">
              <Switch checked={obrigatoria} onCheckedChange={(v) => { setObrigatoria(v); onSettingsChange?.({ avaliacao_obrigatoria: v, nota_minima: notaMinima }) }} />
              <Label>Avaliação obrigatória para certificado</Label>
            </div>
            {questoes.length > 0 && (
              <Badge variant="outline">
                {questoes.length} questão(ões) • {pontoPorQuestao} pts cada
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {questoes.map((q, index) => (
        <Card key={index} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Questão {index + 1}</CardTitle>
                <Badge variant="secondary">{pontoPorQuestao} pts</Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeQuestao(index)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Pergunta *</Label>
              <Input value={q.pergunta} onChange={(e) => updateQuestao(index, "pergunta", e.target.value)} placeholder="Digite a pergunta..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">A) *</Label>
                <Input value={q.opcao_a} onChange={(e) => updateQuestao(index, "opcao_a", e.target.value)} placeholder="Opção A" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">B) *</Label>
                <Input value={q.opcao_b} onChange={(e) => updateQuestao(index, "opcao_b", e.target.value)} placeholder="Opção B" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">C)</Label>
                <Input value={q.opcao_c} onChange={(e) => updateQuestao(index, "opcao_c", e.target.value)} placeholder="Opção C (opcional)" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">D)</Label>
                <Input value={q.opcao_d} onChange={(e) => updateQuestao(index, "opcao_d", e.target.value)} placeholder="Opção D (opcional)" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Resposta correta</Label>
              <Select value={q.resposta_correta} onValueChange={(v) => updateQuestao(index, "resposta_correta", v)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a">A</SelectItem>
                  <SelectItem value="b">B</SelectItem>
                  {q.opcao_c && <SelectItem value="c">C</SelectItem>}
                  {q.opcao_d && <SelectItem value="d">D</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={addQuestao}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Questão
        </Button>
        <Button onClick={handleSave} disabled={isSaving || questoes.length === 0}>
          {isSaving ? "Salvando..." : "Salvar Avaliação"}
        </Button>
      </div>
    </div>
  )
}
