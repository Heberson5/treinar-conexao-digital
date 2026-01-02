import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Bell, 
  Mail, 
  Award, 
  BookOpen,
  Clock,
  AlertTriangle
} from "lucide-react"
import { useIntegrations } from "@/contexts/integration-context"

export function NotificationSettingsCard() {
  const { notificationSettings, updateNotificationSettings } = useIntegrations()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Configurações de Notificações Automáticas
        </CardTitle>
        <CardDescription>
          Configure os alertas automáticos para cursos e certificados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Nota:</strong> As notificações por email requerem configuração do serviço de email (Resend) no Lovable Cloud.
          </AlertDescription>
        </Alert>

        {/* Alerta de Novo Curso */}
        <div className="flex items-start justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <Label className="text-base font-medium">Alerta de Novo Curso</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Enviar notificação automática quando um novo curso estiver disponível para os departamentos autorizados
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                <p>• Respeita as permissões de cada departamento</p>
                <p>• Adiciona automaticamente ao calendário (se integrado)</p>
              </div>
            </div>
          </div>
          <Switch 
            checked={notificationSettings.newCourseAlert}
            onCheckedChange={(checked) => updateNotificationSettings({ newCourseAlert: checked })}
          />
        </div>

        {/* Certificado Automático */}
        <div className="flex items-start justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <Label className="text-base font-medium">Envio Automático de Certificado</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Enviar certificado por email automaticamente quando o usuário concluir um curso
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                <p>• Certificado em PDF anexado ao email</p>
                <p>• Respeita os limites do plano (ilimitado para Premium/Enterprise)</p>
              </div>
            </div>
          </div>
          <Switch 
            checked={notificationSettings.certificateAutoSend}
            onCheckedChange={(checked) => updateNotificationSettings({ certificateAutoSend: checked })}
          />
        </div>

        {/* Lembrete de Curso */}
        <div className="flex items-start justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <Label className="text-base font-medium">Lembrete Antes do Curso</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Enviar lembrete antes do início de treinamentos agendados
              </p>
              <div className="mt-3">
                <Label className="text-sm">Anteced��ncia do lembrete</Label>
                <Select 
                  value={notificationSettings.reminderHoursBefore.toString()}
                  onValueChange={(value) => updateNotificationSettings({ reminderHoursBefore: parseInt(value) })}
                >
                  <SelectTrigger className="w-[180px] mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hora antes</SelectItem>
                    <SelectItem value="2">2 horas antes</SelectItem>
                    <SelectItem value="6">6 horas antes</SelectItem>
                    <SelectItem value="12">12 horas antes</SelectItem>
                    <SelectItem value="24">24 horas antes</SelectItem>
                    <SelectItem value="48">48 horas antes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <Switch 
            checked={notificationSettings.reminderBeforeCourse}
            onCheckedChange={(checked) => updateNotificationSettings({ reminderBeforeCourse: checked })}
          />
        </div>

        {/* Notificações por Email */}
        <div className="flex items-start justify-between p-4 border rounded-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mail className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <Label className="text-base font-medium">Notificações por Email</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Habilitar envio de todas as notificações por email
              </p>
            </div>
          </div>
          <Switch 
            checked={notificationSettings.emailNotifications}
            onCheckedChange={(checked) => updateNotificationSettings({ emailNotifications: checked })}
          />
        </div>

        {/* Resumo de Configurações */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Resumo das Notificações Ativas</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${notificationSettings.newCourseAlert ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={notificationSettings.newCourseAlert ? '' : 'text-muted-foreground'}>
                Alertas de novos cursos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${notificationSettings.certificateAutoSend ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={notificationSettings.certificateAutoSend ? '' : 'text-muted-foreground'}>
                Certificados automáticos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${notificationSettings.reminderBeforeCourse ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={notificationSettings.reminderBeforeCourse ? '' : 'text-muted-foreground'}>
                Lembretes de cursos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${notificationSettings.emailNotifications ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className={notificationSettings.emailNotifications ? '' : 'text-muted-foreground'}>
                Notificações por email
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
