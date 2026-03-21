import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calendar as CalendarIcon, Plus, Clock, Users, MapPin, BookOpen,
  ChevronLeft, ChevronRight, Filter, Bell, Download
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useBrazilianDate } from "@/hooks/use-brazilian-date"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/integrations/supabase/client"
import { AddToCalendarButton } from "@/components/training/AddToCalendarButton"
import { registrarAuditoria } from "@/lib/audit-utils"

interface CalendarEvent {
  id: number
  title: string
  description: string
  date: string
  time: string
  duration: string
  type: "treinamento" | "prova" | "certificacao" | "evento" | "revisao"
  participants?: number
  instructor?: string
  location?: string
  status: "agendado" | "em-andamento" | "concluido" | "cancelado"
}

const eventos: CalendarEvent[] = [
  { id: 1, title: "Treinamento de Segurança", description: "Treinamento obrigatório de segurança no trabalho", date: "2024-01-25", time: "09:00", duration: "4h", type: "treinamento", participants: 15, instructor: "Carlos Silva", location: "Sala A", status: "agendado" },
  { id: 2, title: "Avaliação Final - Vendas", description: "Prova final do módulo de vendas", date: "2024-01-26", time: "14:00", duration: "2h", type: "prova", participants: 8, instructor: "Ana Santos", location: "Lab 1", status: "agendado" },
  { id: 3, title: "Certificação em Liderança", description: "Cerimônia de entrega de certificados", date: "2024-01-28", time: "16:00", duration: "1h", type: "certificacao", participants: 12, location: "Auditório", status: "agendado" },
  { id: 4, title: "Workshop de Inovação", description: "Workshop sobre metodologias ágeis", date: "2024-01-30", time: "08:30", duration: "6h", type: "evento", participants: 25, instructor: "Pedro Costa", location: "Centro de Convenções", status: "agendado" },
]

export default function Calendario() {
  const [events, setEvents] = useState<CalendarEvent[]>(eventos)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isReminderOpen, setIsReminderOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const [filterType, setFilterType] = useState<string>("todos")
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const { toast } = useToast()
  const { formatDate } = useBrazilianDate()
  const { user } = useAuth()

  const [newEvent, setNewEvent] = useState({
    title: "", description: "", date: "", time: "", duration: "",
    type: "treinamento" as CalendarEvent["type"], participants: 0, instructor: "", location: ""
  })

  const [newReminder, setNewReminder] = useState({
    titulo: "", descricao: "", data: "", hora: "", tipo: "revisao"
  })

  const resetForm = () => setNewEvent({ title: "", description: "", date: "", time: "", duration: "", type: "treinamento", participants: 0, instructor: "", location: "" })

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      toast({ title: "Campos obrigatórios", description: "Título, data e horário são obrigatórios", variant: "destructive" })
      return
    }
    const event: CalendarEvent = { id: Date.now(), ...newEvent, status: "agendado" }
    setEvents([...events, event])
    setIsCreateOpen(false)
    resetForm()
    toast({ title: "Evento criado!", description: "Evento adicionado ao calendário." })
    registrarAuditoria({ acao: "criar", menu: "calendario", descricao: `Criou evento: ${newEvent.title}` })
  }

  const handleCreateReminder = async () => {
    if (!newReminder.titulo || !newReminder.data || !newReminder.hora) {
      toast({ title: "Campos obrigatórios", description: "Título, data e hora são obrigatórios", variant: "destructive" })
      return
    }

    const dataLembrete = new Date(`${newReminder.data}T${newReminder.hora}`)
    
    // Save to DB
    if (user) {
      await supabase.from("lembretes" as any).insert({
        usuario_id: user.id,
        titulo: newReminder.titulo,
        descricao: newReminder.descricao || null,
        data_lembrete: dataLembrete.toISOString(),
        tipo: newReminder.tipo,
      } as any)
    }

    // Also add to calendar view
    const reminderEvent: CalendarEvent = {
      id: Date.now(),
      title: `🔔 ${newReminder.titulo}`,
      description: newReminder.descricao || "Alerta de revisão",
      date: newReminder.data,
      time: newReminder.hora,
      duration: "30min",
      type: "revisao",
      status: "agendado",
    }
    setEvents([...events, reminderEvent])
    setIsReminderOpen(false)
    setNewReminder({ titulo: "", descricao: "", data: "", hora: "", tipo: "revisao" })
    toast({ title: "Lembrete criado!", description: "Salvo no sistema. Use o botão de calendário para adicionar ao seu dispositivo." })
    registrarAuditoria({ acao: "criar", menu: "calendario", local: "lembretes", descricao: `Criou lembrete de revisão: ${newReminder.titulo}` })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "treinamento": return "bg-blue-500"
      case "prova": return "bg-red-500"
      case "certificacao": return "bg-green-500"
      case "evento": return "bg-purple-500"
      case "revisao": return "bg-amber-500"
      default: return "bg-gray-500"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "treinamento": return "Treinamento"
      case "prova": return "Prova"
      case "certificacao": return "Certificação"
      case "evento": return "Evento"
      case "revisao": return "Revisão"
      default: return "Outro"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "em-andamento": return "bg-yellow-100 text-yellow-800"
      case "concluido": return "bg-green-100 text-green-800"
      case "cancelado": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredEvents = filterType === "todos" ? events : events.filter(e => e.type === filterType)

  const generateCalendar = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    const calendar = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      const dayEvents = filteredEvents.filter(e => new Date(e.date).toDateString() === date.toDateString())
      calendar.push({ date, isCurrentMonth: date.getMonth() === month, events: dayEvents })
    }
    return calendar
  }

  const calendar = generateCalendar()
  const changeMonth = (dir: number) => { const d = new Date(selectedDate); d.setMonth(d.getMonth() + dir); setSelectedDate(d) }

  const parseDuration = (dur: string): number => {
    const hMatch = dur.match(/(\d+)\s*h/)
    const mMatch = dur.match(/(\d+)\s*m/)
    return (hMatch ? parseInt(hMatch[1]) * 60 : 0) + (mMatch ? parseInt(mMatch[1]) : 0) || 60
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calendário</h1>
          <p className="text-muted-foreground mt-2">Gerencie eventos, treinamentos e lembretes de revisão</p>
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]"><Filter className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="treinamento">Treinamentos</SelectItem>
              <SelectItem value="prova">Provas</SelectItem>
              <SelectItem value="certificacao">Certificações</SelectItem>
              <SelectItem value="evento">Eventos</SelectItem>
              <SelectItem value="revisao">Revisões</SelectItem>
            </SelectContent>
          </Select>

          {/* Reminder button */}
          <Dialog open={isReminderOpen} onOpenChange={setIsReminderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Bell className="mr-2 h-4 w-4" /> Lembrete</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Lembrete de Revisão</DialogTitle>
                <DialogDescription>Crie um alerta que será salvo no sistema e poderá ser adicionado ao calendário do seu dispositivo.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Título *</Label><Input value={newReminder.titulo} onChange={(e) => setNewReminder({...newReminder, titulo: e.target.value})} placeholder="Ex: Revisar Segurança do Trabalho" /></div>
                <div className="space-y-2"><Label>Descrição</Label><Textarea value={newReminder.descricao} onChange={(e) => setNewReminder({...newReminder, descricao: e.target.value})} rows={2} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Data *</Label><Input type="date" value={newReminder.data} onChange={(e) => setNewReminder({...newReminder, data: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Hora *</Label><Input type="time" value={newReminder.hora} onChange={(e) => setNewReminder({...newReminder, hora: e.target.value})} /></div>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select value={newReminder.tipo} onValueChange={(v) => setNewReminder({...newReminder, tipo: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revisao">Revisão</SelectItem>
                      <SelectItem value="treinamento">Treinamento</SelectItem>
                      <SelectItem value="evento">Evento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsReminderOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateReminder} className="bg-gradient-primary">Criar Lembrete</Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* New event */}
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild><Button className="bg-gradient-primary"><Plus className="mr-2 h-4 w-4" /> Novo Evento</Button></DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle>Criar Novo Evento</DialogTitle><DialogDescription>Adicione um evento ao calendário.</DialogDescription></DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Título *</Label><Input value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} /></div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={newEvent.type} onValueChange={(v: any) => setNewEvent({...newEvent, type: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="treinamento">Treinamento</SelectItem>
                        <SelectItem value="prova">Prova</SelectItem>
                        <SelectItem value="certificacao">Certificação</SelectItem>
                        <SelectItem value="evento">Evento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2"><Label>Descrição</Label><Textarea value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} rows={3} /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Data *</Label><Input type="date" value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Horário *</Label><Input type="time" value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Duração</Label><Input value={newEvent.duration} onChange={(e) => setNewEvent({...newEvent, duration: e.target.value})} placeholder="2h 30min" /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2"><Label>Participantes</Label><Input type="number" value={newEvent.participants || ""} onChange={(e) => setNewEvent({...newEvent, participants: parseInt(e.target.value) || 0})} /></div>
                  <div className="space-y-2"><Label>Instrutor</Label><Input value={newEvent.instructor} onChange={(e) => setNewEvent({...newEvent, instructor: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Local</Label><Input value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} /></div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreateEvent} className="bg-gradient-primary">Criar Evento</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => changeMonth(-1)}><ChevronLeft className="h-4 w-4" /></Button>
          <h2 className="text-xl font-semibold">{selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
          <Button variant="outline" onClick={() => changeMonth(1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>
        <div className="flex gap-2">
          {(["month", "week", "day"] as const).map(m => (
            <Button key={m} variant={viewMode === m ? "default" : "outline"} size="sm" onClick={() => setViewMode(m)}>
              {m === "month" ? "Mês" : m === "week" ? "Semana" : "Dia"}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                <div key={d} className="p-2 text-center text-sm font-medium text-muted-foreground">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendar.map((day, i) => (
                <div key={i} className={`min-h-[100px] p-1 border rounded-lg ${day.isCurrentMonth ? 'bg-background' : 'bg-muted/20'} ${day.date.toDateString() === new Date().toDateString() ? 'ring-2 ring-primary' : ''}`}>
                  <div className="text-sm font-medium mb-1">{day.date.getDate()}</div>
                  <div className="space-y-1">
                    {day.events.slice(0, 2).map(e => (
                      <div key={e.id} className={`text-xs p-1 rounded text-white truncate cursor-pointer ${getTypeColor(e.type)}`} onClick={() => setSelectedEvent(e)}>
                        {e.title}
                      </div>
                    ))}
                    {day.events.length > 2 && <div className="text-xs text-muted-foreground">+{day.events.length - 2} mais</div>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Próximos Eventos</CardTitle><CardDescription>Eventos agendados</CardDescription></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEvents.filter(e => new Date(e.date) >= new Date()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5).map(event => (
                <div key={event.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge className={`${getTypeColor(event.type)} text-white`}>{getTypeLabel(event.type)}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                  </div>
                  <h4 className="font-medium text-sm">{event.title}</h4>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2"><Clock className="h-3 w-3" /> {event.time} {event.duration && `(${event.duration})`}</div>
                    {event.location && <div className="flex items-center gap-2"><MapPin className="h-3 w-3" /> {event.location}</div>}
                  </div>
                  {/* Add to calendar button */}
                  <AddToCalendarButton
                    courseName={event.title}
                    courseDescription={event.description}
                    startDate={new Date(`${event.date}T${event.time}`)}
                    endDate={new Date(new Date(`${event.date}T${event.time}`).getTime() + parseDuration(event.duration) * 60000)}
                    location={event.location}
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs h-7"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader><CardTitle>Todos os Eventos</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.map(event => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${getTypeColor(event.type)} flex items-center justify-center`}>
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge className={`${getTypeColor(event.type)} text-white`}>{getTypeLabel(event.type)}</Badge>
                      <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {formatDate(event.date)} às {event.time}</span>
                      {event.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {event.duration}</span>}
                      {event.participants && <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {event.participants}</span>}
                      {event.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <AddToCalendarButton
                    courseName={event.title}
                    courseDescription={event.description}
                    startDate={new Date(`${event.date}T${event.time}`)}
                    endDate={new Date(new Date(`${event.date}T${event.time}`).getTime() + parseDuration(event.duration) * 60000)}
                    location={event.location}
                    variant="outline"
                    size="sm"
                  />
                  <Button variant="outline" size="sm">Editar</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event detail dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
                <DialogDescription>{selectedEvent.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Badge className={`${getTypeColor(selectedEvent.type)} text-white`}>{getTypeLabel(selectedEvent.type)}</Badge>
                  <Badge className={getStatusColor(selectedEvent.status)}>{selectedEvent.status}</Badge>
                </div>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p className="flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> {formatDate(selectedEvent.date)} às {selectedEvent.time}</p>
                  {selectedEvent.duration && <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> Duração: {selectedEvent.duration}</p>}
                  {selectedEvent.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {selectedEvent.location}</p>}
                  {selectedEvent.instructor && <p className="flex items-center gap-2"><Users className="h-4 w-4" /> Instrutor: {selectedEvent.instructor}</p>}
                </div>
                <AddToCalendarButton
                  courseName={selectedEvent.title}
                  courseDescription={selectedEvent.description}
                  startDate={new Date(`${selectedEvent.date}T${selectedEvent.time}`)}
                  endDate={new Date(new Date(`${selectedEvent.date}T${selectedEvent.time}`).getTime() + parseDuration(selectedEvent.duration) * 60000)}
                  location={selectedEvent.location}
                  className="w-full"
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
