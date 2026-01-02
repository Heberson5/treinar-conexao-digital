/**
 * Serviço de e-mail - Preparado para integração com Lovable Cloud + Resend
 * 
 * IMPORTANTE: Este serviço requer:
 * 1. Lovable Cloud ativo
 * 2. Conta Resend.com configurada
 * 3. Secret RESEND_API_KEY configurada
 * 
 * As funções abaixo são mock até a ativação do Cloud.
 */

import { 
  CourseEmailData, 
  CertificateEmailData,
  generateNewCourseEmailHTML,
  generateCertificateEmailHTML 
} from '@/lib/calendar-utils'

export interface EmailRecipient {
  email: string
  name: string
  department?: string
}

export interface SendEmailOptions {
  to: EmailRecipient[]
  subject: string
  html: string
  replyTo?: string
}

export interface CourseNotificationOptions {
  course: CourseEmailData
  recipients: EmailRecipient[]
  baseUrl: string
}

export interface CertificateNotificationOptions {
  certificate: CertificateEmailData
  recipient: EmailRecipient
}

/**
 * Envia e-mail genérico
 * TODO: Implementar chamada à Edge Function quando Cloud estiver ativo
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  console.log('[EmailService] Preparando envio de e-mail (mock)')
  console.log('[EmailService] Destinatários:', options.to.length)
  console.log('[EmailService] Assunto:', options.subject)
  
  // TODO: Descomentar quando Cloud estiver ativo
  // const supabase = createClient()
  // const { data, error } = await supabase.functions.invoke('send-email', {
  //   body: {
  //     to: options.to.map(r => r.email),
  //     subject: options.subject,
  //     html: options.html,
  //     replyTo: options.replyTo
  //   }
  // })
  // if (error) return { success: false, error: error.message }
  // return { success: true }

  // Mock - simula sucesso
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[EmailService] E-mail enviado com sucesso (mock)')
      resolve({ success: true })
    }, 1000)
  })
}

/**
 * Envia notificação de novo curso para lista de destinatários
 */
export async function sendCourseNotification(
  options: CourseNotificationOptions
): Promise<{ success: boolean; sentCount: number; failedCount: number; error?: string }> {
  console.log('[EmailService] Enviando notificação de novo curso (mock)')
  console.log('[EmailService] Curso:', options.course.courseName)
  console.log('[EmailService] Destinatários:', options.recipients.length)
  
  const html = generateNewCourseEmailHTML(options.course, options.baseUrl)
  
  // TODO: Implementar envio em lote com Edge Function
  // Quando Cloud estiver ativo, criar Edge Function que:
  // 1. Recebe lista de destinatários e dados do curso
  // 2. Gera HTML personalizado para cada destinatário
  // 3. Envia e-mails em lote via Resend
  // 4. Retorna contagem de sucesso/falha

  const result = await sendEmail({
    to: options.recipients,
    subject: `🎓 Novo Treinamento: ${options.course.courseName}`,
    html
  })

  if (!result.success) {
    return { success: false, sentCount: 0, failedCount: options.recipients.length, error: result.error }
  }

  return { success: true, sentCount: options.recipients.length, failedCount: 0 }
}

/**
 * Envia certificado por e-mail
 */
export async function sendCertificateEmail(
  options: CertificateNotificationOptions
): Promise<{ success: boolean; error?: string }> {
  console.log('[EmailService] Enviando certificado por e-mail (mock)')
  console.log('[EmailService] Usuário:', options.recipient.name)
  console.log('[EmailService] Curso:', options.certificate.courseName)
  
  const html = generateCertificateEmailHTML(options.certificate)
  
  // TODO: Implementar com Edge Function que:
  // 1. Gera PDF do certificado
  // 2. Faz upload para Storage
  // 3. Envia e-mail com link para download

  return sendEmail({
    to: [options.recipient],
    subject: `🏆 Parabéns! Seu certificado de "${options.certificate.courseName}" está pronto`,
    html
  })
}

/**
 * Busca usuários elegíveis para receber notificação de curso
 * Filtra por departamentos permitidos
 */
export async function getEligibleRecipients(
  departmentIds: string[]
): Promise<EmailRecipient[]> {
  console.log('[EmailService] Buscando destinatários elegíveis (mock)')
  console.log('[EmailService] Departamentos:', departmentIds)
  
  // TODO: Implementar consulta ao banco de dados quando Cloud estiver ativo
  // const supabase = createClient()
  // const { data: users, error } = await supabase
  //   .from('profiles')
  //   .select('email, name, department_id')
  //   .in('department_id', departmentIds)
  //   .eq('email_notifications_enabled', true)
  
  // Mock - retorna lista vazia
  return []
}

/**
 * Agenda envio de e-mail para data futura
 * Útil para lembretes antes do início do curso
 */
export async function scheduleEmail(
  options: SendEmailOptions,
  sendAt: Date
): Promise<{ success: boolean; scheduledId?: string; error?: string }> {
  console.log('[EmailService] Agendando e-mail (mock)')
  console.log('[EmailService] Data agendada:', sendAt.toISOString())
  
  // TODO: Implementar com pg_cron quando Cloud estiver ativo
  // 1. Salvar e-mail na tabela scheduled_emails
  // 2. Configurar cron job para verificar e-mails pendentes
  // 3. Enviar quando chegar a hora
  
  return { 
    success: true, 
    scheduledId: `scheduled-${Date.now()}` 
  }
}

/**
 * Envia lembrete de curso que vai começar
 */
export async function sendCourseReminder(
  course: CourseEmailData,
  recipients: EmailRecipient[],
  baseUrl: string,
  hoursUntilStart: number
): Promise<{ success: boolean; error?: string }> {
  console.log('[EmailService] Enviando lembrete de curso (mock)')
  console.log('[EmailService] Curso:', course.courseName)
  console.log('[EmailService] Horas até início:', hoursUntilStart)
  
  const subject = hoursUntilStart <= 1 
    ? `⏰ O treinamento "${course.courseName}" começa em breve!`
    : `📅 Lembrete: "${course.courseName}" começa em ${hoursUntilStart} horas`
  
  const html = generateNewCourseEmailHTML(course, baseUrl)
  
  return sendEmail({
    to: recipients,
    subject,
    html
  })
}
