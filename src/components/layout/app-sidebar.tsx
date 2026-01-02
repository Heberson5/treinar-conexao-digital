import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Building2,
  Settings,
  BarChart3,
  Shield,
  GraduationCap,
  FileText,
  Calendar,
  Briefcase,
  CreditCard,
  Zap,
} from "lucide-react"
import logoImage from "@/assets/logo.png"
import { useAuth } from "@/contexts/auth-context"

const mainMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Meus Treinamentos", url: "/meus-treinamentos", icon: GraduationCap },
  { title: "Catálogo", url: "/catalogo", icon: BookOpen },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
  { title: "Calendário", url: "/calendario", icon: Calendar },
]

const adminMenuItems = [
  { title: "Gestão de Treinamentos", url: "/admin/treinamentos", icon: BookOpen },
  { title: "Usuários", url: "/admin/usuarios", icon: Users },
  { title: "Cargos", url: "/admin/cargos", icon: Briefcase },
  { title: "Departamentos", url: "/admin/departamentos", icon: Building2 },
  { title: "Empresas", url: "/admin/empresas", icon: Building2 },
  { title: "Planos", url: "/admin/planos", icon: CreditCard },
  { title: "Integrações", url: "/admin/integracoes", icon: Zap },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart3 },
  { title: "Permissões", url: "/admin/permissoes", icon: Shield },
  { title: "Configurações", url: "/admin/configuracoes", icon: Settings },
]

export function AppSidebar() {
  const { open } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const { canAccessAdmin, user } = useAuth()
  
  console.log("AppSidebar - user:", user);
  console.log("AppSidebar - canAccessAdmin:", canAccessAdmin());
  
  const isMainExpanded = mainMenuItems.some((item) => currentPath === item.url)
  const isAdminExpanded = adminMenuItems.some((item) => currentPath === item.url)

  const getNavClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground"

  return (
    <Sidebar className={open ? "w-64" : "w-16"} collapsible="icon">
      <SidebarContent className="bg-card border-r">
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <img 
              src={logoImage} 
              alt="Logo" 
              className="h-8 w-8 object-contain"
            />
            {open && (
              <div>
                <h2 className="font-bold text-lg">Portal</h2>
                <p className="text-xs text-muted-foreground">Treinamentos</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu Administrativo */}
        <SidebarGroup>
          <SidebarGroupLabel>Administração</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavClass}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}