import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

export function useBrazilianDate() {
  const formatDate = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    } catch {
      return "Data inválida"
    }
  }

  const formatDateOnly = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      return format(dateObj, "dd/MM/yyyy", { locale: ptBR })
    } catch {
      return "Data inválida"
    }
  }

  const formatDateTime = (date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      return format(dateObj, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })
    } catch {
      return "Data inválida"
    }
  }

  const getCurrentBrazilianDateTime = () => {
    return new Date().toISOString()
  }

  return {
    formatDate,
    formatDateOnly,
    formatDateTime,
    getCurrentBrazilianDateTime
  }
}