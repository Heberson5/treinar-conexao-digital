import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Users, 
  Building2, 
  UserCheck,
  UserX,
  Crown,
  User
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface Usuario {
  id: number
  nome: string
  email: string
  empresa: string
  departamento: string
  cargo: string
  status: "ativo" | "inativo"
  papel: "master" | "admin" | "usuario"
  ultimoAcesso: string
  treinamentosConcluidos: number
}

// Dados mocados para Cargos e Departamentos
const cargosDisponiveis = [
  "Administrador Master", "Analista de RH", "Vendedor", "Gerente de Vendas", 
  "Analista Financeiro", "Coordenador de TI", "Assistente Administrativo"
]

const departamentosDisponiveis = [
  "TI", "RH", "Vendas", "Financeiro", "Marketing", "Operações", "Qualidade"
]

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    {
      id: 1,
      nome: "Heber Sohas",
      email: "hebersohas@gmail.com",
      empresa: "Portal Treinamentos",
      departamento: "TI",
      cargo: "Administrador Master",
      status: "ativo",
      papel: "master",
      ultimoAcesso: "Agora",
      treinamentosConcluidos: 0
    },
    {
      id: 2,
      nome: "Maria Silva",
      email: "maria.silva@empresa.com",
      empresa: "Empresa Demo",
      departamento: "RH",
      cargo: "Analista de RH",
      status: "ativo",
      papel: "admin",
      ultimoAcesso: "Há 2 horas",
      treinamentosConcluidos: 5
    },
    {
      id: 3,
      nome: "João Santos",
      email: "joao.santos@empresa.com",
      empresa: "Empresa Demo",
      departamento: "Vendas",
      cargo: "Vendedor",
      status: "ativo",
      papel: "usuario",
      ultimoAcesso: "Ontem",
      treinamentosConcluidos: 3
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { toast } = useToast()
  const { canCreateMaster, canCreateAdmin, canCreateUser, user } = useAuth()

  const [newUser, setNewUser] = useState<{
    nome: string
    email: string
    empresa: string
    departamento: string
    cargo: string
    papel: "master" | "admin" | "usuario"
  }>({
    nome: "",
    email: "",
    empresa: "",
    departamento: "",
    cargo: "",
    papel: "usuario"
  })

  const resetForm = () => {
    setNewUser({
      nome: "",
      email: "",
      empresa: "",
      departamento: "",
      cargo: "",
      papel: "usuario"
    })
  }

  const handleCreate = () => {
    if (!newUser.nome || !newUser.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são obrigatórios",
        variant: "destructive"
      })
      return
    }

    // Verificar permissões para criar o tipo de usuário
    if (newUser.papel === "master" && !canCreateMaster()) {
      toast({
        title: "Permissão negada",
        description: "Apenas Masters podem criar outros Masters",
        variant: "destructive"
      })
      return
    }

    if (newUser.papel === "admin" && !canCreateAdmin()) {
      toast({
        title: "Permissão negada", 
        description: "Apenas Masters e Administradores podem criar Administradores",
        variant: "destructive"
      })
      return
    }

    if (!canCreateUser()) {
      toast({
        title: "Permissão negada",
        description: "Você não tem permissão para criar usuários",
        variant: "destructive"
      })
      return
    }

    const usuario: Usuario = {
      id: Date.now(),
      ...newUser,
      status: "ativo",
      ultimoAcesso: "Nunca",
      treinamentosConcluidos: 0
    }

    setUsuarios([...usuarios, usuario])
    setIsCreateOpen(false)
    resetForm()
    
    toast({
      title: "Usuário criado!",
      description: "O usuário foi criado com sucesso."
    })
  }

  const handleDelete = (id: number) => {
    const usuario = usuarios.find(u => u.id === id)
    
    // Não permitir deletar o próprio usuário
    if (usuario?.email === user?.email) {
      toast({
        title: "Ação não permitida",
        description: "Você não pode excluir seu próprio usuário",
        variant: "destructive"
      })
      return
    }

    setUsuarios(usuarios.filter(u => u.id !== id))
    toast({
      title: "Usuário excluído",
      description: "O usuário foi removido com sucesso."
    })
  }

  const toggleStatus = (id: number) => {
    setUsuarios(usuarios.map(user => 
      user.id === id 
        ? { ...user, status: user.status === "ativo" ? "inativo" : "ativo" }
        : user
    ))
  }

  const getPapelIcon = (papel: string) => {
    switch (papel) {
      case "master": return <Crown className="h-4 w-4 text-yellow-500" />
      case "admin": return <UserCheck className="h-4 w-4 text-blue-500" />
      case "usuario": return <User className="h-4 w-4 text-gray-500" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getPapelColor = (papel: string) => {
    switch (papel) {
      case "master": return "bg-yellow-500"
      case "admin": return "bg-blue-500"
      case "usuario": return "bg-gray-500"
      default: return "bg-gray-500"
    }
  }

  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const filteredUsers = usuarios.filter(user =>
    user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.departamento.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie usuários, permissões e acessos do sistema
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha as informações do usuário para dar acesso ao sistema.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <Input
                    id="nome"
                    value={newUser.nome}
                    onChange={(e) => setNewUser({...newUser, nome: e.target.value})}
                    placeholder="Nome do usuário"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="email@empresa.com"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa</Label>
                  <Input
                    id="empresa"
                    value={newUser.empresa}
                    onChange={(e) => setNewUser({...newUser, empresa: e.target.value})}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Select value={newUser.departamento} onValueChange={(value) => setNewUser({...newUser, departamento: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentosDisponiveis.map((dept) => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Select value={newUser.cargo} onValueChange={(value) => setNewUser({...newUser, cargo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {cargosDisponiveis.map((cargo) => (
                        <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="papel">Papel no Sistema</Label>
                  <Select value={newUser.papel} onValueChange={(value: any) => setNewUser({...newUser, papel: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usuario">Usuário</SelectItem>
                      {canCreateAdmin() && <SelectItem value="admin">Administrador</SelectItem>}
                      {canCreateMaster() && <SelectItem value="master">Master</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} className="bg-gradient-primary">
                Criar Usuário
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{usuarios.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{usuarios.filter(u => u.status === "ativo").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Crown className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{usuarios.filter(u => u.papel === "admin" || u.papel === "master").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Empresas</p>
                <p className="text-2xl font-bold">{new Set(usuarios.map(u => u.empresa)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar usuários..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Gerencie todos os usuários cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" alt={user.nome} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user.nome)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{user.nome}</h4>
                      {getPapelIcon(user.papel)}
                      <Badge 
                        className={`${getPapelColor(user.papel)} text-white text-xs`}
                      >
                        {user.papel}
                      </Badge>
                      <Badge 
                        variant={user.status === "ativo" ? "default" : "secondary"}
                      >
                        {user.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.empresa} • {user.departamento} • {user.cargo}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{user.treinamentosConcluidos} treinamentos</p>
                    <p className="text-xs text-muted-foreground">Último acesso: {user.ultimoAcesso}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleStatus(user.id)}
                    >
                      {user.status === "ativo" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    {user.papel !== "master" && user.id !== 1 && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}