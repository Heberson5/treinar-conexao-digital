import { ReactNode, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { Header } from "@/components/layout/header"
import { useCompanyTheme } from "@/hooks/use-company-theme"

interface MainLayoutProps {
  children: ReactNode
  onLogout?: () => void
}

export function MainLayout({ children, onLogout }: MainLayoutProps) {
  // Hook para aplicar tema da empresa quando Master filtra
  const { theme } = useCompanyTheme();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header onLogout={onLogout} />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}