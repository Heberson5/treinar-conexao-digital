import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarIntegrationCard } from "@/components/integrations/calendar-integration-card"
import { PaymentIntegrationCard } from "@/components/integrations/payment-integration-card"
import { NotificationSettingsCard } from "@/components/integrations/notification-settings-card"
import { AIIntegrationCard } from "@/components/integrations/ai-integration-card"
import { Calendar, CreditCard, Bell, Zap, Sparkles, Building2 } from "lucide-react"
import { useEmpresaFilter } from "@/contexts/empresa-filter-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function Integracoes() {
  const { empresas, empresaSelecionada, setEmpresaSelecionada, empresaSelecionadaNome, isMaster, isLoading } = useEmpresaFilter()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrações</h1>
          <p className="text-muted-foreground mt-2">
            Configure integrações com calendários, pagamentos, notificações e recursos de IA
          </p>
        </div>
        
        {/* Filtro de Empresa para Master */}
        {isMaster && (
          <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Empresa:</span>
            <Select
              value={empresaSelecionada || "todas"}
              onValueChange={(value) => setEmpresaSelecionada(value === "todas" ? null : value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">
                  <span className="font-medium">Todas as empresas</span>
                </SelectItem>
                {empresas.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id}>
                    {empresa.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant="outline" className="ml-2">Master</Badge>
          </div>
        )}
      </div>

      {/* Status Geral */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Calendários</p>
              <p className="font-medium">Não conectado</p>
            </div>
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pagamentos</p>
              <p className="font-medium">Não conectado</p>
            </div>
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Bell className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Notificações</p>
              <p className="font-medium">Configurado</p>
            </div>
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">IA</p>
              <p className="font-medium">Configurável</p>
            </div>
          </div>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Zap className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Automações</p>
              <p className="font-medium">3 ativas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Integrações */}
      <Tabs defaultValue="calendar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <CalendarIntegrationCard />
        </TabsContent>

        <TabsContent value="payment">
          <PaymentIntegrationCard />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettingsCard />
        </TabsContent>

        <TabsContent value="ai">
          <AIIntegrationCard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
