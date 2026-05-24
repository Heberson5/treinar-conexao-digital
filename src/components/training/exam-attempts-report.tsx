import { useState, useEffect, useMemo, useCallback } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useEmpresaFilter } from "@/contexts/empresa-filter-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Download, FileText, Settings2, BarChart3, AlertTriangle, RefreshCw, Clock, Award, Users,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  LineChart, Line,
} from "recharts"
import { exportData } from "@/lib/export-utils"
import { useToast } from "@/hooks/use-toast"
import { PeriodFilter, PeriodValue, getStartDateFromPeriod } from "@/components/shared/PeriodFilter"

interface AttemptRow {
  id: string
  usuario_id: string
  usuario_nome: string
  treinamento_id: string
  treinamento_titulo: string
  numero_tentativa: number
  nota: number
  aprovado: boolean
  duracao_segundos: number
  tempo_estudo_segundos: number
  criado_em: string
  violacoes: number
  reinicios: number
  pausas: number
}

const ALL_COLUMNS = [
  { key: "usuario_nome", header: "Usuário" },
  { key: "treinamento_titulo", header: "Treinamento" },
  { key: "numero_tentativa", header: "Tentativa" },
  { key: "nota", header: "Nota" },
  { key: "aprovado_str", header: "Resultado" },
  { key: "data_str", header: "Data/Hora" },
  { key: "duracao_str", header: "Duração Avaliação" },
  { key: "estudo_str", header: "Tempo Estudo" },
  { key: "violacoes", header: "Violações" },
  { key: "reinicios", header: "Reinícios" },
  { key: "pausas", header: "Pausas" },
]

function fmtSecs(s: number) {
  if (!s) return "0min"
  const m = Math.floor(s / 60)
  const sec = s % 60
  if (m < 60) return `${m}min ${sec}s`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}min`
}

export default function ExamAttemptsReport() {
  const { user } = useAuth()
  const { empresaSelecionada, isMaster } = useEmpresaFilter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<AttemptRow[]>([])
  const [visibleColumns, setVisibleColumns] = useState<string[]>(ALL_COLUMNS.map(c => c.key))
  const [period, setPeriod] = useState<PeriodValue | "">("")
  const [customStart, setCustomStart] = useState<Date | undefined>()
  const [customEnd, setCustomEnd] = useState<Date | undefined>()
  const [selectedUser, setSelectedUser] = useState<string>("todos")
  const periodSelected = period !== "" && (period !== "custom" || (!!customStart && !!customEnd))

  const fetchData = useCallback(async () => {
    if (!user || !periodSelected) return
    setLoading(true)
    try {
      const empresaFilter = isMaster && empresaSelecionada && empresaSelecionada !== "todas"
        ? empresaSelecionada : null

      const startDate = getStartDateFromPeriod(period as PeriodValue, customStart)
      const endDate = period === "custom" && customEnd ? new Date(customEnd) : new Date()
      endDate.setHours(23, 59, 59, 999)

      let treinQ = supabase.from("treinamentos").select("id, titulo, empresa_id")
      if (empresaFilter) treinQ = treinQ.eq("empresa_id", empresaFilter)
      const { data: treinamentos } = await treinQ
      const trMap = new Map((treinamentos || []).map((t: any) => [t.id, t.titulo]))
      const trIds = (treinamentos || []).map((t: any) => t.id)
      if (trIds.length === 0) { setRows([]); setLoading(false); return }

      const { data: tentativas } = await (supabase as any)
        .from("tentativas_avaliacao")
        .select("*")
        .in("treinamento_id", trIds)
        .gte("criado_em", startDate.toISOString())
        .lte("criado_em", endDate.toISOString())
        .order("criado_em", { ascending: false })

      const userIds: string[] = Array.from(new Set((tentativas || []).map((t: any) => t.usuario_id as string)))
      const { data: perfis } = await supabase
        .from("perfis").select("id, nome").in("id", userIds.length ? userIds : ["00000000-0000-0000-0000-000000000000"])
      const userMap = new Map((perfis || []).map((p: any) => [p.id, p.nome]))

      const { data: eventos } = await (supabase as any)
        .from("tentativas_eventos")
        .select("usuario_id, treinamento_id, tipo_evento")
        .in("treinamento_id", trIds)

      const evtAgg = new Map<string, { violacoes: number; reinicios: number; pausas: number }>()
      ;(eventos || []).forEach((e: any) => {
        const k = `${e.usuario_id}__${e.treinamento_id}`
        const cur = evtAgg.get(k) || { violacoes: 0, reinicios: 0, pausas: 0 }
        if (e.tipo_evento === "avaliacao_violacao") cur.violacoes++
        else if (e.tipo_evento === "avaliacao_reiniciada") cur.reinicios++
        else if (e.tipo_evento === "estudo_pausado") cur.pausas++
        evtAgg.set(k, cur)
      })

      const result: AttemptRow[] = (tentativas || []).map((t: any) => {
        const k = `${t.usuario_id}__${t.treinamento_id}`
        const ag = evtAgg.get(k) || { violacoes: 0, reinicios: 0, pausas: 0 }
        return {
          id: t.id,
          usuario_id: t.usuario_id,
          usuario_nome: userMap.get(t.usuario_id) || "—",
          treinamento_id: t.treinamento_id,
          treinamento_titulo: trMap.get(t.treinamento_id) || "—",
          numero_tentativa: t.numero_tentativa || 1,
          nota: Number(t.nota || 0),
          aprovado: !!t.aprovado,
          duracao_segundos: t.duracao_segundos || 0,
          tempo_estudo_segundos: t.tempo_estudo_segundos || 0,
          criado_em: t.criado_em,
          violacoes: ag.violacoes,
          reinicios: ag.reinicios,
          pausas: ag.pausas,
        }
      })
      setRows(result)
    } catch (e) {
      console.error(e)
      toast({ title: "Erro", description: "Não foi possível carregar tentativas.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [user, isMaster, empresaSelecionada, toast, period, customStart, customEnd, periodSelected])

  useEffect(() => { fetchData() }, [fetchData])

  const availableUsers = useMemo(() => {
    const map = new Map<string, string>()
    rows.forEach(r => { if (!map.has(r.usuario_id)) map.set(r.usuario_id, r.usuario_nome) })
    return Array.from(map.entries()).map(([id, nome]) => ({ id, nome })).sort((a, b) => a.nome.localeCompare(b.nome))
  }, [rows])

  const filteredRows = useMemo(() => {
    if (selectedUser === "todos") return rows
    return rows.filter(r => r.usuario_id === selectedUser)
  }, [rows, selectedUser])

  const enriched = useMemo(() => filteredRows.map(r => ({
    ...r,
    aprovado_str: r.aprovado ? "Aprovado" : "Reprovado",
    data_str: new Date(r.criado_em).toLocaleString("pt-BR"),
    duracao_str: fmtSecs(r.duracao_segundos),
    estudo_str: fmtSecs(r.tempo_estudo_segundos),
  })), [filteredRows])

  // Stats
  const stats = useMemo(() => {
    const total = filteredRows.length
    const aprovados = filteredRows.filter(r => r.aprovado).length
    const violacoes = filteredRows.reduce((s, r) => s + r.violacoes, 0)
    const reinicios = filteredRows.reduce((s, r) => s + r.reinicios, 0)
    const mediaNota = total ? (filteredRows.reduce((s, r) => s + r.nota, 0) / total) : 0
    return { total, aprovados, violacoes, reinicios, mediaNota }
  }, [filteredRows])

  // Chart: notes by attempt number (avg)
  const chartByAttempt = useMemo(() => {
    const map = new Map<number, { tentativa: string; mediaNota: number; n: number }>()
    filteredRows.forEach(r => {
      const cur = map.get(r.numero_tentativa) || { tentativa: `${r.numero_tentativa}ª`, mediaNota: 0, n: 0 }
      cur.mediaNota += r.nota
      cur.n += 1
      map.set(r.numero_tentativa, cur)
    })
    return Array.from(map.values()).map(v => ({ tentativa: v.tentativa, mediaNota: +(v.mediaNota / v.n).toFixed(2) }))
      .sort((a, b) => a.tentativa.localeCompare(b.tentativa))
  }, [filteredRows])

  // Chart: top trainings by avg score
  const chartByTraining = useMemo(() => {
    const map = new Map<string, { titulo: string; nota: number; n: number }>()
    filteredRows.forEach(r => {
      const cur = map.get(r.treinamento_id) || { titulo: r.treinamento_titulo, nota: 0, n: 0 }
      cur.nota += r.nota; cur.n += 1
      map.set(r.treinamento_id, cur)
    })
    return Array.from(map.values())
      .map(v => ({ titulo: v.titulo.length > 18 ? v.titulo.slice(0, 18) + "…" : v.titulo, mediaNota: +(v.nota / v.n).toFixed(2), tentativas: v.n }))
      .slice(0, 10)
  }, [filteredRows])

  const toggleCol = (key: string) => {
    setVisibleColumns(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key])
  }

  const handleExport = (format: "excel" | "pdf") => {
    const cols = ALL_COLUMNS.filter(c => visibleColumns.includes(c.key))
    exportData(format, {
      filename: `relatorio_avaliacoes_${new Date().toISOString().split("T")[0]}`,
      title: "Relatório de Avaliações",
      subtitle: `${filteredRows.length} tentativas`,
      columns: cols,
      data: enriched,
    })
    toast({ title: "Exportação concluída" })
  }

  // Reset selected user when period changes
  useEffect(() => { setSelectedUser("todos") }, [period, customStart, customEnd])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h2 className="text-lg sm:text-xl font-bold">Relatório de Avaliações</h2>
        <div className="flex flex-wrap gap-2">
          <PeriodFilter
            value={(period || "30d") as PeriodValue}
            onChange={(v) => setPeriod(v)}
            customStartDate={customStart}
            customEndDate={customEnd}
            onCustomDateChange={(s, e) => { setCustomStart(s); setCustomEnd(e) }}
          />
          <Select
            value={selectedUser}
            onValueChange={setSelectedUser}
            disabled={!periodSelected || rows.length === 0}
          >
            <SelectTrigger className="w-[200px]">
              <Users className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os usuários</SelectItem>
              {availableUsers.map(u => (
                <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!periodSelected ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Selecione um período acima para visualizar o relatório de avaliações.
          </CardContent>
        </Card>
      ) : loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
      <>
      <div className="flex justify-end gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm"><Settings2 className="mr-1 h-4 w-4" />Colunas</Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-2">
              <p className="text-sm font-medium mb-2">Personalizar colunas</p>
              {ALL_COLUMNS.map(col => (
                <div key={col.key} className="flex items-center gap-2">
                  <Checkbox
                    id={`col-${col.key}`}
                    checked={visibleColumns.includes(col.key)}
                    onCheckedChange={() => toggleCol(col.key)}
                  />
                  <label htmlFor={`col-${col.key}`} className="text-sm cursor-pointer">{col.header}</label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="sm" onClick={() => handleExport("excel")}>
          <Download className="mr-1 h-4 w-4" />Excel
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleExport("pdf")}>
          <FileText className="mr-1 h-4 w-4" />PDF
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { icon: BarChart3, color: "text-blue-600", value: stats.total, label: "Tentativas" },
          { icon: Award, color: "text-green-600", value: stats.aprovados, label: "Aprovações" },
          { icon: Clock, color: "text-purple-600", value: stats.mediaNota.toFixed(1), label: "Média Nota" },
          { icon: AlertTriangle, color: "text-orange-600", value: stats.violacoes, label: "Violações" },
          { icon: RefreshCw, color: "text-red-600", value: stats.reinicios, label: "Reinícios" },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <s.icon className={`h-5 w-5 ${s.color} shrink-0`} />
                <div className="min-w-0">
                  <p className="text-lg font-bold truncate">{s.value}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Nota média por tentativa</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartByAttempt}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="tentativa" stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 10]} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Legend />
                <Line type="monotone" dataKey="mediaNota" stroke="hsl(var(--primary))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Desempenho por treinamento (top 10)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartByTraining}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="titulo" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 10]} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="mediaNota" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhamento das tentativas</CardTitle>
          <CardDescription>{rows.length} registros</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {ALL_COLUMNS.filter(c => visibleColumns.includes(c.key)).map(col => (
                  <TableHead key={col.key} className="whitespace-nowrap">{col.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {enriched.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} className="text-center text-muted-foreground py-8">
                    Nenhuma tentativa registrada
                  </TableCell>
                </TableRow>
              ) : enriched.map(r => (
                <TableRow key={r.id}>
                  {ALL_COLUMNS.filter(c => visibleColumns.includes(c.key)).map(col => (
                    <TableCell key={col.key} className="whitespace-nowrap">
                      {col.key === "aprovado_str" ? (
                        <Badge variant={r.aprovado ? "default" : "destructive"}>{(r as any)[col.key]}</Badge>
                      ) : col.key === "nota" ? (
                        <span className={r.aprovado ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                          {r.nota.toFixed(1)}
                        </span>
                      ) : (
                        String((r as any)[col.key] ?? "")
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
