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

  return {
    formatDate,
    formatDateOnly,
    formatDateTime,
    formatLastAccessed,
    getCurrentBrazilianDateTime
  }
}