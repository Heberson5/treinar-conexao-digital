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

  const formatLastAccessed = (lastAccessed: string | Date) => {
    if (typeof lastAccessed === 'string') {
      // Se for uma string como "Há 2 dias", "Nunca acessado", etc, retornar como está
      if (lastAccessed.includes('Há') || lastAccessed.includes('Nunca') || lastAccessed.includes('Concluído')) {
        return lastAccessed;
      }
      // Caso contrário, tentar converter para data
      try {
        const dateObj = parseISO(lastAccessed);
        return format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      } catch {
        return lastAccessed;
      }
    }
    try {
      return format(lastAccessed, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return "Data inválida";
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

  const formatRelativeTime = (date: string | Date): string => {
    const now = new Date()
    const targetDate = typeof date === 'string' ? new Date(date) : date
    const diffMs = now.getTime() - targetDate.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return "Agora"
    if (diffMinutes < 60) return `${diffMinutes}m atrás`
    if (diffHours < 24) return `${diffHours}h atrás`
    if (diffDays < 7) return `${diffDays}d atrás`
    return formatDateOnly(targetDate)
  }

  return {
    formatDate,
    formatDateOnly,
    formatDateTime,
    formatLastAccessed,
    getCurrentBrazilianDateTime,
    formatRelativeTime
  }
}