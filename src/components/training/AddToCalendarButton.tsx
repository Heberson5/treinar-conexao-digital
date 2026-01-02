import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  CalendarEvent,
  generateGoogleCalendarLink,
  generateOutlookCalendarLink,
  downloadICSFile
} from '@/lib/calendar-utils'
import { toast } from '@/hooks/use-toast'

interface AddToCalendarButtonProps {
  courseName: string
  courseDescription: string
  startDate: Date
  endDate: Date
  location?: string
  url?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}

export function AddToCalendarButton({
  courseName,
  courseDescription,
  startDate,
  endDate,
  location,
  url,
  variant = 'outline',
  size = 'default',
  className
}: AddToCalendarButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const event: CalendarEvent = {
    title: `Treinamento: ${courseName}`,
    description: courseDescription,
    startDate,
    endDate,
    location,
    url
  }

  const handleGoogleCalendar = () => {
    const link = generateGoogleCalendarLink(event)
    window.open(link, '_blank', 'noopener,noreferrer')
    toast({
      title: 'Abrindo Google Calendar',
      description: 'O evento será adicionado ao seu calendário Google.'
    })
    setIsOpen(false)
  }

  const handleOutlookCalendar = () => {
    const link = generateOutlookCalendarLink(event)
    window.open(link, '_blank', 'noopener,noreferrer')
    toast({
      title: 'Abrindo Outlook Calendar',
      description: 'O evento será adicionado ao seu calendário Outlook.'
    })
    setIsOpen(false)
  }

  const handleDownloadICS = () => {
    downloadICSFile(event)
    toast({
      title: 'Download iniciado',
      description: 'O arquivo .ics foi baixado. Abra-o para adicionar ao seu calendário.'
    })
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Calendar className="h-4 w-4 mr-2" />
          Adicionar ao Calendário
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleGoogleCalendar} className="cursor-pointer">
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-9 15H6v-4.5h4.5V18zm0-6H6v-4.5h4.5V12zm6 6h-4.5v-4.5H16.5V18zm0-6h-4.5v-4.5H16.5V12z"/>
          </svg>
          Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOutlookCalendar} className="cursor-pointer">
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 3H3a1 1 0 00-1 1v16a1 1 0 001 1h18a1 1 0 001-1V4a1 1 0 00-1-1zM9 17H5v-4h4v4zm0-6H5V7h4v4zm6 6h-4v-4h4v4zm0-6h-4V7h4v4zm4 6h-4v-4h4v4zm0-6h-4V7h4v4z"/>
          </svg>
          Outlook Calendar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadICS} className="cursor-pointer">
          <Calendar className="h-4 w-4 mr-2" />
          Baixar arquivo .ics
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
