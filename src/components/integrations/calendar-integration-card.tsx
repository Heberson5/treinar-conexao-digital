import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calendar, 
  RefreshCw, 
  Unlink, 
  Check, 
  ExternalLink,
  AlertTriangle,
  Mail
} from "lucide-react"
import { useIntegrations } from "@/contexts/integration-context"
import { useToast } from "@/hooks/use-toast"
import { useBrazilianDate } from "@/hooks/use-brazilian-date"

export function CalendarIntegrationCard() {
  const { 
    calendarIntegrations, 
    connectCalendar, 
    disconnectCalendar, 
    syncCalendar,
    notificationSettings,
    updateNotificationSettings,
    isLoading 
  } = useIntegrations()
  const { toast } = useToast()
  const { formatDate } = useBrazilianDate()
  const [connecting, setConnecting] = useState<'google' | 'outlook' | null>(null)

  const handleConnect = async (provider: 'google' | 'outlook') => {
    setConnecting(provider)
    try {
      await connectCalendar(provider)
      toast({
        title: "Calendário conectado!",
        description: `Seu ${provider === 'google' ? 'Google Calendar' : 'Outlook'} foi conectado com sucesso.`
      })
    } catch (error) {
      toast({
        title: "Erro ao conectar",
        description: "Não foi possível conectar o calendário. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setConnecting(null)
    }
  }

  const handleSync = async (id: string) => {
    try {
      await syncCalendar(id)
      toast({
        title: "Sincronizado!",
        description: "Os eventos foram sincronizados com sucesso."
      })
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os eventos.",
        variant: "destructive"
      })
    }
  }

  const handleDisconnect = (id: string, name: string) => {
    disconnectCalendar(id)
    toast({
      title: "Calendário desconectado",
      description: `${name} foi desconectado.`
    })
  }

  const googleConnected = calendarIntegrations.find(c => c.provider === 'google')
  const outlookConnected = calendarIntegrations.find(c => c.provider === 'outlook')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Integração com Calendário
        </CardTitle>
        <CardDescription>
          Conecte seu Google Calendar ou Outlook para sincronizar eventos de treinamento automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> Para ativar esta funcionalidade, é necessário configurar o backend com as credenciais OAuth do Google e Microsoft.
          </AlertDescription>
        </Alert>

        {/* Google Calendar */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border">
              <svg viewBox="0 0 24 24" className="w-8 h-8">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Google Calendar</h3>
              {googleConnected ? (
                <div className="text-sm text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {googleConnected.email}
                  </p>
                  {googleConnected.lastSync && (
                    <p className="text-xs">Última sync: {formatDate(googleConnected.lastSync)}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Não conectado</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {googleConnected ? (
              <>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Check className="h-3 w-3 mr-1" />
                  Conectado
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSync(googleConnected.id)}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Sincronizar
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDisconnect(googleConnected.id, 'Google Calendar')}
                >
                  <Unlink className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => handleConnect('google')}
                disabled={connecting === 'google'}
              >
                {connecting === 'google' ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Conectar
              </Button>
            )}
          </div>
        </div>

        {/* Outlook Calendar */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border">
              <svg viewBox="0 0 24 24" className="w-8 h-8">
                <path fill="#0078D4" d="M24 7.387v10.478c0 .23-.08.424-.238.576-.159.152-.357.23-.595.23h-8.16v-6.5l1.18.856c.112.08.244.12.396.12.152 0 .284-.04.396-.12l6.81-4.64h.21zm0-1.387v.68l-7.42 5.06-1.58-1.14V5h8.6c.23 0 .424.08.576.238.152.159.23.357.23.595l-.006.167zM14.993 5v6.18l-2.98-2.16v-4.02h2.98zm-9.99 0h5.99v1.52L7.4 9.27 1 5.78V5.6c0-.23.08-.424.238-.576.159-.152.357-.23.595-.23h3.17zm-.003 13.67V7.56l6.4 4.64c.18.13.392.195.636.195s.456-.065.636-.195l2.328-1.68v8.15H5c-.662 0-.996-.332-.996-.996l-.003-.004z"/>
              </svg>
            </div>
            <div>
              <h3 className="font-medium">Outlook Calendar</h3>
              {outlookConnected ? (
                <div className="text-sm text-muted-foreground">
                  <p className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {outlookConnected.email}
                  </p>
                  {outlookConnected.lastSync && (
                    <p className="text-xs">Última sync: {formatDate(outlookConnected.lastSync)}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Não conectado</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {outlookConnected ? (
              <>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Check className="h-3 w-3 mr-1" />
                  Conectado
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSync(outlookConnected.id)}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Sincronizar
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDisconnect(outlookConnected.id, 'Outlook Calendar')}
                >
                  <Unlink className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => handleConnect('outlook')}
                disabled={connecting === 'outlook'}
              >
                {connecting === 'outlook' ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Conectar
              </Button>
            )}
          </div>
        </div>

        {/* Configurações de Sincronização */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-4">Configurações de Sincronização</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Sincronizar eventos automaticamente</Label>
                <p className="text-sm text-muted-foreground">
                  Adicionar eventos de treinamento ao calendário automaticamente
                </p>
              </div>
              <Switch 
                checked={notificationSettings.calendarSync}
                onCheckedChange={(checked) => updateNotificationSettings({ calendarSync: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Lembrete antes do curso</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar notificação {notificationSettings.reminderHoursBefore}h antes do início
                </p>
              </div>
              <Switch 
                checked={notificationSettings.reminderBeforeCourse}
                onCheckedChange={(checked) => updateNotificationSettings({ reminderBeforeCourse: checked })}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
