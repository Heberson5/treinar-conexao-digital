import { createContext, useContext, useState, ReactNode } from 'react'

// Tipos para integrações de calendário
export interface CalendarIntegration {
  id: string
  provider: 'google' | 'outlook'
  name: string
  email: string
  connected: boolean
  connectedAt?: string
  syncEnabled: boolean
  lastSync?: string
}

// Tipos para configuração de notificações automáticas
export interface NotificationSettings {
  newCourseAlert: boolean
  certificateAutoSend: boolean
  reminderBeforeCourse: boolean
  reminderHoursBefore: number
  emailNotifications: boolean
  calendarSync: boolean
}

// Tipos para configuração de pagamentos
export interface PaymentIntegration {
  provider: 'mercadopago'
  connected: boolean
  accessToken?: string
  publicKey?: string
  sandboxMode: boolean
  webhookConfigured: boolean
  recurringPaymentsEnabled: boolean
}

// Tipos para alertas de cursos por departamento
export interface CourseAlert {
  id: string
  courseId: number
  courseName: string
  targetDepartments: string[]
  scheduledAt: string
  sentAt?: string
  status: 'pending' | 'sent' | 'failed'
  recipientCount: number
}

interface IntegrationContextType {
  // Calendários
  calendarIntegrations: CalendarIntegration[]
  connectCalendar: (provider: 'google' | 'outlook') => Promise<void>
  disconnectCalendar: (id: string) => void
  syncCalendar: (id: string) => Promise<void>
  
  // Notificações
  notificationSettings: NotificationSettings
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void
  
  // Pagamentos
  paymentIntegration: PaymentIntegration
  connectPayment: (accessToken: string, publicKey: string) => Promise<void>
  disconnectPayment: () => void
  toggleSandboxMode: (enabled: boolean) => void
  
  // Alertas de cursos
  courseAlerts: CourseAlert[]
  createCourseAlert: (alert: Omit<CourseAlert, 'id' | 'status' | 'sentAt'>) => void
  sendCourseAlert: (alertId: string) => Promise<void>
  
  // Certificados automáticos
  sendCertificate: (userId: string, courseId: number) => Promise<void>
  
  // Estado de carregamento
  isLoading: boolean
}

const IntegrationContext = createContext<IntegrationContextType | null>(null)

export function IntegrationProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  
  // Estado dos calendários conectados
  const [calendarIntegrations, setCalendarIntegrations] = useState<CalendarIntegration[]>([])
  
  // Configurações de notificações
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    newCourseAlert: true,
    certificateAutoSend: true,
    reminderBeforeCourse: true,
    reminderHoursBefore: 24,
    emailNotifications: true,
    calendarSync: true
  })
  
  // Configuração de pagamentos
  const [paymentIntegration, setPaymentIntegration] = useState<PaymentIntegration>({
    provider: 'mercadopago',
    connected: false,
    sandboxMode: true,
    webhookConfigured: false,
    recurringPaymentsEnabled: false
  })
  
  // Alertas de cursos
  const [courseAlerts, setCourseAlerts] = useState<CourseAlert[]>([])
  
  // Conectar calendário (mock - será implementado com Cloud)
  const connectCalendar = async (provider: 'google' | 'outlook') => {
    setIsLoading(true)
    try {
      // TODO: Implementar OAuth com Cloud Edge Functions
      // Exemplo: await supabase.functions.invoke('connect-calendar', { body: { provider } })
      
      const mockIntegration: CalendarIntegration = {
        id: `cal-${Date.now()}`,
        provider,
        name: provider === 'google' ? 'Google Calendar' : 'Outlook Calendar',
        email: 'usuario@exemplo.com',
        connected: true,
        connectedAt: new Date().toISOString(),
        syncEnabled: true
      }
      
      setCalendarIntegrations(prev => [...prev, mockIntegration])
      console.log(`Calendário ${provider} conectado (mock)`)
    } finally {
      setIsLoading(false)
    }
  }
  
  const disconnectCalendar = (id: string) => {
    setCalendarIntegrations(prev => prev.filter(cal => cal.id !== id))
  }
  
  const syncCalendar = async (id: string) => {
    setIsLoading(true)
    try {
      // TODO: Implementar sincronização com Cloud
      // Exemplo: await supabase.functions.invoke('sync-calendar', { body: { integrationId: id } })
      
      setCalendarIntegrations(prev => prev.map(cal => 
        cal.id === id ? { ...cal, lastSync: new Date().toISOString() } : cal
      ))
      console.log('Calendário sincronizado (mock)')
    } finally {
      setIsLoading(false)
    }
  }
  
  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => ({ ...prev, ...settings }))
  }
  
  // Conectar Mercado Pago
  const connectPayment = async (accessToken: string, publicKey: string) => {
    setIsLoading(true)
    try {
      // TODO: Validar tokens com Cloud Edge Function
      // Exemplo: await supabase.functions.invoke('validate-mercadopago', { body: { accessToken, publicKey } })
      
      setPaymentIntegration(prev => ({
        ...prev,
        connected: true,
        accessToken,
        publicKey,
        webhookConfigured: true
      }))
      console.log('Mercado Pago conectado (mock)')
    } finally {
      setIsLoading(false)
    }
  }
  
  const disconnectPayment = () => {
    setPaymentIntegration({
      provider: 'mercadopago',
      connected: false,
      sandboxMode: true,
      webhookConfigured: false,
      recurringPaymentsEnabled: false
    })
  }
  
  const toggleSandboxMode = (enabled: boolean) => {
    setPaymentIntegration(prev => ({ ...prev, sandboxMode: enabled }))
  }
  
  // Criar alerta de curso
  const createCourseAlert = (alert: Omit<CourseAlert, 'id' | 'status' | 'sentAt'>) => {
    const newAlert: CourseAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      status: 'pending'
    }
    setCourseAlerts(prev => [...prev, newAlert])
  }
  
  // Enviar alerta de curso
  const sendCourseAlert = async (alertId: string) => {
    setIsLoading(true)
    try {
      // TODO: Implementar envio com Cloud
      // Exemplo: await supabase.functions.invoke('send-course-alert', { body: { alertId } })
      
      setCourseAlerts(prev => prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'sent' as const, sentAt: new Date().toISOString() }
          : alert
      ))
      console.log('Alerta enviado (mock)')
    } catch {
      setCourseAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'failed' as const } : alert
      ))
    } finally {
      setIsLoading(false)
    }
  }
  
  // Enviar certificado automático
  const sendCertificate = async (userId: string, courseId: number) => {
    setIsLoading(true)
    try {
      // TODO: Implementar envio de certificado com Cloud
      // Exemplo: await supabase.functions.invoke('send-certificate', { body: { userId, courseId } })
      
      console.log(`Certificado enviado para usuário ${userId} do curso ${courseId} (mock)`)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <IntegrationContext.Provider value={{
      calendarIntegrations,
      connectCalendar,
      disconnectCalendar,
      syncCalendar,
      notificationSettings,
      updateNotificationSettings,
      paymentIntegration,
      connectPayment,
      disconnectPayment,
      toggleSandboxMode,
      courseAlerts,
      createCourseAlert,
      sendCourseAlert,
      sendCertificate,
      isLoading
    }}>
      {children}
    </IntegrationContext.Provider>
  )
}

export function useIntegrations() {
  const context = useContext(IntegrationContext)
  if (!context) {
    throw new Error('useIntegrations must be used within an IntegrationProvider')
  }
  return context
}
