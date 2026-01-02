import { format } from 'date-fns'

export interface CalendarEvent {
  title: string
  description: string
  startDate: Date
  endDate: Date
  location?: string
  url?: string
}

/**
 * Gera um arquivo .ics para adicionar evento ao calendário
 */
export function generateICSFile(event: CalendarEvent): string {
  const formatICSDate = (date: Date) => {
    return format(date, "yyyyMMdd'T'HHmmss")
  }

  const escapeICSText = (text: string) => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
  }

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Training Portal//Course Calendar//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDate(event.startDate)}`,
    `DTEND:${formatICSDate(event.endDate)}`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `UID:course-${Date.now()}@trainingportal.com`,
    `SUMMARY:${escapeICSText(event.title)}`,
    `DESCRIPTION:${escapeICSText(event.description)}`,
    event.location ? `LOCATION:${escapeICSText(event.location)}` : '',
    event.url ? `URL:${event.url}` : '',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Lembrete: ${escapeICSText(event.title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n')

  return icsContent
}

/**
 * Faz download do arquivo .ics
 */
export function downloadICSFile(event: CalendarEvent, filename?: string): void {
  const icsContent = generateICSFile(event)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename || `${event.title.replace(/[^a-zA-Z0-9]/g, '-')}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Gera link para adicionar evento ao Google Calendar
 */
export function generateGoogleCalendarLink(event: CalendarEvent): string {
  const formatGoogleDate = (date: Date) => {
    return format(date, "yyyyMMdd'T'HHmmss")
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    dates: `${formatGoogleDate(event.startDate)}/${formatGoogleDate(event.endDate)}`,
    ...(event.location && { location: event.location }),
    ...(event.url && { sprop: `website:${event.url}` })
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Gera link para adicionar evento ao Outlook Calendar (Web)
 */
export function generateOutlookCalendarLink(event: CalendarEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description,
    startdt: event.startDate.toISOString(),
    enddt: event.endDate.toISOString(),
    ...(event.location && { location: event.location })
  })

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Gera links para todos os calendários suportados
 */
export function generateCalendarLinks(event: CalendarEvent) {
  return {
    google: generateGoogleCalendarLink(event),
    outlook: generateOutlookCalendarLink(event),
    ics: generateICSFile(event)
  }
}

/**
 * Gera o HTML para os botões de calendário em e-mails
 */
export function generateCalendarButtonsHTML(event: CalendarEvent, baseUrl: string): string {
  const googleLink = generateGoogleCalendarLink(event)
  const outlookLink = generateOutlookCalendarLink(event)
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px 0;">
      <tr>
        <td style="padding-right: 10px;">
          <a href="${googleLink}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #4285F4; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            📅 Adicionar ao Google Calendar
          </a>
        </td>
        <td style="padding-right: 10px;">
          <a href="${outlookLink}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #0078D4; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            📅 Adicionar ao Outlook
          </a>
        </td>
        <td>
          <a href="${baseUrl}/api/calendar/download?event=${encodeURIComponent(JSON.stringify(event))}" style="display: inline-block; padding: 12px 24px; background-color: #6B7280; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
            📥 Baixar .ics
          </a>
        </td>
      </tr>
    </table>
  `
}

/**
 * Template de e-mail para novo curso
 */
export interface CourseEmailData {
  courseName: string
  courseDescription: string
  startDate: Date
  endDate: Date
  instructorName?: string
  department: string
  enrollmentUrl: string
}

export function generateNewCourseEmailHTML(data: CourseEmailData, baseUrl: string): string {
  const event: CalendarEvent = {
    title: `Treinamento: ${data.courseName}`,
    description: data.courseDescription,
    startDate: data.startDate,
    endDate: data.endDate,
    url: data.enrollmentUrl
  }

  const calendarButtons = generateCalendarButtonsHTML(event, baseUrl)
  const formattedStartDate = format(data.startDate, "dd/MM/yyyy 'às' HH:mm")
  const formattedEndDate = format(data.endDate, "dd/MM/yyyy 'às' HH:mm")

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Novo Curso Disponível</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎓 Novo Treinamento Disponível!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1f2937; margin-top: 0;">${data.courseName}</h2>
    
    <p style="color: #6b7280; font-size: 16px;">${data.courseDescription}</p>
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <table role="presentation" cellspacing="0" cellpadding="8" border="0" width="100%">
        <tr>
          <td style="color: #6b7280; width: 120px;">📅 Início:</td>
          <td style="color: #1f2937; font-weight: bold;">${formattedStartDate}</td>
        </tr>
        <tr>
          <td style="color: #6b7280;">📅 Término:</td>
          <td style="color: #1f2937; font-weight: bold;">${formattedEndDate}</td>
        </tr>
        <tr>
          <td style="color: #6b7280;">🏢 Departamento:</td>
          <td style="color: #1f2937; font-weight: bold;">${data.department}</td>
        </tr>
        ${data.instructorName ? `
        <tr>
          <td style="color: #6b7280;">👨‍🏫 Instrutor:</td>
          <td style="color: #1f2937; font-weight: bold;">${data.instructorName}</td>
        </tr>
        ` : ''}
      </table>
    </div>
    
    <h3 style="color: #1f2937; margin-bottom: 10px;">Adicione ao seu calendário:</h3>
    ${calendarButtons}
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="${data.enrollmentUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Inscrever-se no Treinamento →
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      Você recebeu este e-mail porque está cadastrado no portal de treinamentos da sua empresa.
      <br>
      Caso não queira receber estes alertas, ajuste suas preferências nas configurações do portal.
    </p>
  </div>
</body>
</html>
  `
}

/**
 * Template de e-mail para certificado
 */
export interface CertificateEmailData {
  userName: string
  courseName: string
  completionDate: Date
  certificateUrl: string
  hoursCompleted: number
}

export function generateCertificateEmailHTML(data: CertificateEmailData): string {
  const formattedDate = format(data.completionDate, "dd/MM/yyyy")

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Parabéns! Seu Certificado está Pronto</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🏆 Parabéns, ${data.userName}!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <div style="text-align: center; margin-bottom: 20px;">
      <p style="font-size: 48px; margin: 0;">🎉</p>
    </div>
    
    <h2 style="color: #1f2937; text-align: center; margin-top: 0;">Você concluiu o treinamento!</h2>
    
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bbf7d0;">
      <table role="presentation" cellspacing="0" cellpadding="8" border="0" width="100%">
        <tr>
          <td style="color: #166534; width: 120px;">📚 Curso:</td>
          <td style="color: #166534; font-weight: bold;">${data.courseName}</td>
        </tr>
        <tr>
          <td style="color: #166534;">📅 Conclusão:</td>
          <td style="color: #166534; font-weight: bold;">${formattedDate}</td>
        </tr>
        <tr>
          <td style="color: #166534;">⏱️ Carga horária:</td>
          <td style="color: #166534; font-weight: bold;">${data.hoursCompleted} horas</td>
        </tr>
      </table>
    </div>
    
    <div style="text-align: center; margin-top: 30px;">
      <a href="${data.certificateUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        📜 Baixar Certificado →
      </a>
    </div>
    
    <p style="color: #6b7280; text-align: center; margin-top: 20px;">
      Seu certificado também está disponível para download no portal de treinamentos.
    </p>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    
    <p style="color: #9ca3af; font-size: 12px; text-align: center;">
      Continue aprendendo! Confira outros treinamentos disponíveis no portal.
    </p>
  </div>
</body>
</html>
  `
}
