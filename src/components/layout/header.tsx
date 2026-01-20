import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Bell, LogOut, Settings, User, Building2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useEmpresaFilter } from "@/contexts/empresa-filter-context"

interface HeaderProps {
  onLogout?: () => void
}

export function Header({ onLogout }: HeaderProps) {
  const { user } = useAuth()
  const { empresas, empresaSelecionada, setEmpresaSelecionada, isMaster, isLoading } = useEmpresaFilter()

  const currentUser = {
    name: user?.nome || "Usuário",
    email: user?.email || "",
    role: user?.role === "master" ? "Master" : 
          user?.role === "admin" ? "Administrador" : 
          user?.role === "instrutor" ? "Instrutor" : "Usuário",
    avatar: user?.nome?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "US"
  }

  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-lg font-semibold">Sauberlich System</h1>
          <p className="text-sm text-muted-foreground">Plataforma de Treinamentos</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Filtro de Empresa (apenas para Master) */}
        {isMaster && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select
              value={empresaSelecionada || "todas"}
              onValueChange={(value) => setEmpresaSelecionada(value === "todas" ? null : value)}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">
                  <span className="font-medium">Todas as empresas</span>
                </SelectItem>
                {empresas.map((empresa) => (
                  <SelectItem key={empresa.id} value={empresa.id}>
                    {empresa.nome_fantasia || empresa.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Notificações */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
            3
          </Badge>
        </Button>

        {/* Toggle de tema */}
        <ThemeToggle />

        {/* Menu do usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.avatar_url || ""} alt={currentUser.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {currentUser.avatar}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                <Badge variant="secondary" className="w-fit text-xs">
                  {currentUser.role}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              Meu Perfil
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Configurações
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}