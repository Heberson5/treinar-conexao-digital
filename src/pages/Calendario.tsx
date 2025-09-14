import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Clock, 
  Users, 
  MapPin, 
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useBrazilianDate } from "@/hooks/use-brazilian-date"

interface CalendarEvent {
  id: number
  title: string
  description: string
  date: string
  time: string
  duration: string
  type: "treinamento" | "prova" | "certificacao" | "evento"
  participants?: number
  instructor?: string
  location?: string
  status: "agendado" | "em-andamento" | "concluido" | "cancelado"
}

const eventos: CalendarEvent[] = [
  {
    id: 1,
    title: "Treinamento de Segurança",
    description: "Treinamento obrigatório de segurança no trabalho para novos funcionários",
    date: "2024-01-25",
    time: "09:00",
    duration: "4h",
    type: "treinamento",
    participants: 15,
    instructor: "Carlos Silva",
    location: "Sala de Treinamento A",
    status: "agendado"
  },
  {
    id: 2,
    title: "Avaliação Final - Vendas",
    description: "Prova final do módulo de técnicas de vendas",
    date: "2024-01-26",
    time: "14:00",
    duration: "2h",
    type: "prova",
    participants: 8,
    instructor: "Ana Santos",
    location: "Laboratório 1",
    status: "agendado"
  },
  {
    id: 3,
    title: "Certificação em Liderança",
    description: "Cerimônia de entrega de certificados do curso de liderança",
    date: "2024-01-28",
    time: "16:00",
    duration: "1h",
    type: "certificacao",
    participants: 12,
    location: "Auditório Principal",
    status: "agendado"
  },
  {
    id: 4,
    title: "Workshop de Inovação",
    description: "Workshop sobre metodologias ágeis e inovação corporativa",
    date: "2024-01-30",
    time: "08:30",
    duration: "6h",
    type: "evento",
    participants: 25,
    instructor: "Pedro Costa",
    location: "Centro de Convenções",
    status: "agendado"
  }
]

export default function Calendario() {
  const [events, setEvents] = useState<CalendarEvent[]>(eventos)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month")
  const [filterType, setFilterType] = useState<string>("todos")
  const { toast } = useToast()
  const { formatDate } = useBrazilianDate()

  const [newEvent, setNewEvent] = useState<{
    title: string
    description: string
    date: string
    time: string
    duration: string
    type: "treinamento" | "prova" | "certificacao" | "evento"
    participants: number
    instructor: string
    location: string
  }>({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "",
    type: "treinamento",
    participants: 0,
    instructor: "",
    location: ""
  })

  const resetForm = () => {
    setNewEvent({
      title: "",
      description: "",
      date: "",
      time: "",
      duration: "",
      type: "treinamento",
      participants: 0,
      instructor: "",
      location: ""
    })
  }

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      toast({
        title: "Campos obrigatórios",
        description: "Título, data e horário são obrigatórios",
        variant: "destructive"
      })
      return
    }

    const event: CalendarEvent = {
      id: Date.now(),
      ...newEvent,
      status: "agendado"
    }

    setEvents([...events, event])
    setIsCreateOpen(false)
    resetForm()
    
    toast({
      title: "Evento criado!",
      description: "O evento foi adicionado ao calendário."
    })
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "treinamento": return "bg-blue-500"
      case "prova": return "bg-red-500"
      case "certificacao": return "bg-green-500"
      case "evento": return "bg-purple-500"
      default: return "bg-gray-500"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "treinamento": return "Treinamento"
      case "prova": return "Prova"
      case "certificacao": return "Certificação"
      case "evento": return "Evento"
      default: return "Outro"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "agendado": return "bg-blue-100 text-blue-800"
      case "em-andamento": return "bg-yellow-100 text-yellow-800"
      case "concluido": return "bg-green-100 text-green-800"
      case "cancelado": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredEvents = filterType === "todos" 
    ? events 
    : events.filter(event => event.type === filterType)

  // Função para gerar o calendário do mês
  const generateCalendar = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const calendar = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      
      const dayEvents = filteredEvents.filter(event => 
        new Date(event.date).toDateString() === date.toDateString()
      )

      calendar.push({
        date: date,
        isCurrentMonth: date.getMonth() === month,
        events: dayEvents
      })
    }
    return calendar
  }

  const calendar = generateCalendar()

  const changeMonth = (direction: number) => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setSelectedDate(newDate)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Calendário</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie eventos, treinamentos e certificações
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="treinamento">Treinamentos</SelectItem>
              <SelectItem value="prova">Provas</SelectItem>
              <SelectItem value="certificacao">Certificações</SelectItem>
              <SelectItem value="evento">Eventos</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary">
                <Plus className="mr-2 h-4 w-4" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Evento</DialogTitle>
                <DialogDescription>
                  Adicione um novo evento ao calendário de treinamentos.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      placeholder="Nome do evento"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Evento</Label>
                    <Select value={newEvent.type} onValueChange={(value: any) => setNewEvent({...newEvent, type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="treinamento">Treinamento</SelectItem>
                        <SelectItem value="prova">Prova</SelectItem>
                        <SelectItem value="certificacao">Certificação</SelectItem>
                        <SelectItem value="evento">Evento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder="Descrição do evento"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Data *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Horário *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duração</Label>
                    <Input
                      id="duration"
                      value={newEvent.duration}
                      onChange={(e) => setNewEvent({...newEvent, duration: e.target.value})}
                      placeholder="Ex: 2h 30min"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="participants">Participantes</Label>
                    <Input
                      id="participants"
                      type="number"
                      value={newEvent.participants || ""}
                      onChange={(e) => setNewEvent({...newEvent, participants: parseInt(e.target.value) || 0})}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instrutor</Label>
                    <Input
                      id="instructor"
                      value={newEvent.instructor}
                      onChange={(e) => setNewEvent({...newEvent, instructor: e.target.value})}
                      placeholder="Nome do instrutor"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Local</Label>
                    <Input
                      id="location"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                      placeholder="Local do evento"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateEvent} className="bg-gradient-primary">
                  Criar Evento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => changeMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">
            {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" onClick={() => changeMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant={viewMode === "month" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("month")}
          >
            Mês
          </Button>
          <Button 
            variant={viewMode === "week" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("week")}
          >
            Semana
          </Button>
          <Button 
            variant={viewMode === "day" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("day")}
          >
            Dia
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendar.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[100px] p-1 border rounded-lg ${
                    day.isCurrentMonth 
                      ? 'bg-background' 
                      : 'bg-muted/20'
                  } ${
                    day.date.toDateString() === new Date().toDateString()
                      ? 'ring-2 ring-primary'
                      : ''
                  }`}
                >
                  <div className="text-sm font-medium mb-1">
                    {day.date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {day.events.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs p-1 rounded text-white truncate ${getTypeColor(event.type)}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {day.events.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{day.events.length - 2} mais
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Events Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
            <CardDescription>
              Eventos agendados para os próximos dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEvents
                .filter(event => new Date(event.date) >= new Date())
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .slice(0, 5)
                .map((event) => (
                  <div key={event.id} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getTypeColor(event.type)} text-white`}>
                        {getTypeLabel(event.type)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    
                    <h4 className="font-medium text-sm">{event.title}</h4>
                    
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {event.time} {event.duration && `(${event.duration})`}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </div>
                      )}
                      {event.participants && (
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3" />
                          {event.participants} participantes
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Todos os Eventos</CardTitle>
          <CardDescription>
            Lista completa de eventos cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${getTypeColor(event.type)} flex items-center justify-center`}>
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{event.title}</h4>
                      <Badge className={`${getTypeColor(event.type)} text-white`}>
                        {getTypeLabel(event.type)}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {formatDate(event.date)} às {event.time}
                      </span>
                      {event.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.duration}
                        </span>
                      )}
                      {event.participants && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {event.participants} participantes
                        </span>
                      )}
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    Excluir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}