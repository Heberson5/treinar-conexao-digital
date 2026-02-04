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
  Sparkles,
  Palette,
  DollarSign,
} from "lucide-react"
import logoImage from "@/assets/logo.png"
import { useAuth } from "@/contexts/auth-context"

// Menu principal - visível para todos usuários autenticados
const mainMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Meus Treinamentos", url: "/meus-treinamentos", icon: GraduationCap },
  { title: "Catálogo", url: "/catalogo", icon: BookOpen },
  { title: "Relatórios", url: "/relatorios", icon: FileText },
  { title: "Calendário", url: "/calendario", icon: Calendar },
]

// Menu administrativo - com controle de permissão por item
const getAdminMenuItems = (role: string) => {
  const items = [
    { title: "Dashboard Executivo", url: "/admin/executivo", icon: Sparkles, roles: ["master", "admin"] },
    { title: "Gestão de Treinamentos", url: "/admin/treinamentos", icon: BookOpen, roles: ["master", "admin", "instrutor"] },
    { title: "Usuários", url: "/admin/usuarios", icon: Users, roles: ["master", "admin"] },
    { title: "Cargos", url: "/admin/cargos", icon: Briefcase, roles: ["master", "admin"] },
    { title: "Departamentos", url: "/admin/departamentos", icon: Building2, roles: ["master", "admin"] },
    { title: "Empresas", url: "/admin/empresas", icon: Building2, roles: ["master"] },
    { title: "Planos", url: "/admin/planos", icon: CreditCard, roles: ["master"] },
    { title: "Integrações", url: "/admin/integracoes", icon: Zap, roles: ["master", "admin"] },
    { title: "Analytics", url: "/admin/analytics", icon: BarChart3, roles: ["master", "admin"] },
    { title: "Permissões", url: "/admin/permissoes", icon: Shield, roles: ["master"] },
    { title: "Configurações", url: "/admin/configuracoes", icon: Settings, roles: ["master"] },
  ]

  return items.filter(item => item.roles.includes(role))
}

// Itens exclusivos para Master
const masterMenuItems = [
  { title: "Editor Landing Page", url: "/admin/landing-page", icon: Palette },
  { title: "Financeiro", url: "/admin/financeiro", icon: DollarSign },
]

export function AppSidebar() {
  const { open } = useSidebar()
  const location = useLocation()
  const { user } = useAuth()
  const userRole = user?.role || 'usuario'
  const isMaster = userRole === 'master'
  const isAdminOrHigher = ['master', 'admin', 'instrutor'].includes(userRole)
  
  const adminMenuItems = getAdminMenuItems(userRole)

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

        {/* Menu Administrativo - apenas para admin, instrutor e master */}
        {isAdminOrHigher && adminMenuItems.length > 0 && (
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
        )}

        {/* Menu Master (apenas para usuários Master) */}
        {isMaster && (
          <SidebarGroup>
            <SidebarGroupLabel>Master</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {masterMenuItems.map((item) => (
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
        )}
      </SidebarContent>
    </Sidebar>
  )
}