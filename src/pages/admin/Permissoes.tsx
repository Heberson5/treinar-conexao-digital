import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Shield, 
  Users, 
  Lock,
  Unlock,
  Crown,
  UserCheck,
  User,
  Settings,
  Eye,
  EyeOff
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Permission {
  id: string
  nome: string
  descricao: string
  categoria: string
  ativo: boolean
}

interface Role {
  id: number
  nome: string
  descricao: string
  cor: string
  permissoes: string[]
  usuariosCount: number
  ativo: boolean
}

const permissoesDisponiveis: Permission[] = [
  // Treinamentos
  { id: "trainings.view", nome: "Visualizar Treinamentos", descricao: "Pode visualizar lista de treinamentos", categoria: "Treinamentos", ativo: true },
  { id: "trainings.create", nome: "Criar Treinamentos", descricao: "Pode criar novos treinamentos", categoria: "Treinamentos", ativo: true },
  { id: "trainings.edit", nome: "Editar Treinamentos", descricao: "Pode editar treinamentos existentes", categoria: "Treinamentos", ativo: true },
  { id: "trainings.delete", nome: "Excluir Treinamentos", descricao: "Pode excluir treinamentos", categoria: "Treinamentos", ativo: true },
  { id: "trainings.manage", nome: "Gerenciar Treinamentos", descricao: "Acesso total aos treinamentos", categoria: "Treinamentos", ativo: true },
  
  // Usuários
  { id: "users.view", nome: "Visualizar Usuários", descricao: "Pode visualizar lista de usuários", categoria: "Usuários", ativo: true },
  { id: "users.create", nome: "Criar Usuários", descricao: "Pode criar novos usuários", categoria: "Usuários", ativo: true },
  { id: "users.edit", nome: "Editar Usuários", descricao: "Pode editar dados de usuários", categoria: "Usuários", ativo: true },
  { id: "users.delete", nome: "Excluir Usuários", descricao: "Pode excluir usuários", categoria: "Usuários", ativo: true },
  
  // Relatórios
  { id: "reports.view", nome: "Visualizar Relatórios", descricao: "Pode acessar relatórios", categoria: "Relatórios", ativo: true },
  { id: "reports.export", nome: "Exportar Relatórios", descricao: "Pode exportar dados", categoria: "Relatórios", ativo: true },
  { id: "reports.advanced", nome: "Relatórios Avançados", descricao: "Acesso a relatórios completos", categoria: "Relatórios", ativo: true },
  
  // Sistema
  { id: "system.settings", nome: "Configurações do Sistema", descricao: "Pode alterar configurações", categoria: "Sistema", ativo: true },
  { id: "system.backup", nome: "Backup/Restore", descricao: "Pode fazer backup e restore", categoria: "Sistema", ativo: true },
  { id: "system.logs", nome: "Ver Logs do Sistema", descricao: "Pode visualizar logs", categoria: "Sistema", ativo: true },
  
  // Financeiro
  { id: "financial.view", nome: "Visualizar Financeiro", descricao: "Pode ver dados financeiros", categoria: "Financeiro", ativo: true },
  { id: "financial.manage", nome: "Gerenciar Financeiro", descricao: "Pode gerenciar cobranças", categoria: "Financeiro", ativo: true }
]

const rolesIniciais: Role[] = [
  {
    id: 1,
    nome: "Master",
    descricao: "Acesso total ao sistema",
    cor: "bg-yellow-500",
    permissoes: permissoesDisponiveis.map(p => p.id),
    usuariosCount: 1,
    ativo: true
  },
  {
    id: 2,
    nome: "Administrador",
    descricao: "Acesso administrativo completo exceto configurações críticas",
    cor: "bg-blue-500",
    permissoes: [
      "trainings.view", "trainings.create", "trainings.edit", "trainings.delete", "trainings.manage",
      "users.view", "users.create", "users.edit", "users.delete",
      "reports.view", "reports.export", "reports.advanced"
    ],
    usuariosCount: 3,
    ativo: true
  },
  {
    id: 3,
    nome: "Instrutor",
    descricao: "Pode criar e gerenciar treinamentos",
    cor: "bg-green-500",
    permissoes: [
      "trainings.view", "trainings.create", "trainings.edit",
      "users.view",
      "reports.view"
    ],
    usuariosCount: 8,
    ativo: true
  },
  {
    id: 4,
    nome: "Usuário",
    descricao: "Acesso básico aos treinamentos",
    cor: "bg-gray-500",
    permissoes: [
      "trainings.view"
    ],
    usuariosCount: 156,
    ativo: true
  }
]

export default function Permissoes() {
  const [roles, setRoles] = useState<Role[]>(rolesIniciais)
  const [permissions, setPermissions] = useState<Permission[]>(permissoesDisponiveis)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const { toast } = useToast()

  const [newRole, setNewRole] = useState<{
    nome: string
    descricao: string
    cor: string
    permissoes: string[]
  }>({
    nome: "",
    descricao: "",
    cor: "bg-blue-500",
    permissoes: []
  })

  const resetForm = () => {
    setNewRole({
      nome: "",
      descricao: "",
      cor: "bg-blue-500",
      permissoes: []
    })
    setEditingRole(null)
  }

  const handleCreateRole = () => {
    if (!newRole.nome) {
      toast({
        title: "Campo obrigatório",
        description: "Nome do papel é obrigatório",
        variant: "destructive"
      })
      return
    }

    const role: Role = {
      id: Date.now(),
      ...newRole,
      usuariosCount: 0,
      ativo: true
    }

    setRoles([...roles, role])
    setIsCreateRoleOpen(false)
    resetForm()
    
    toast({
      title: "Papel criado!",
      description: "O papel foi criado com sucesso."
    })
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setNewRole({
      nome: role.nome,
      descricao: role.descricao,
      cor: role.cor,
      permissoes: [...role.permissoes]
    })
    setIsCreateRoleOpen(true)
  }

  const handleUpdateRole = () => {
    if (!editingRole) return

    setRoles(roles.map(r => 
      r.id === editingRole.id 
        ? { ...editingRole, ...newRole }
        : r
    ))
    
    setIsCreateRoleOpen(false)
    resetForm()
    
    toast({
      title: "Papel atualizado!",
      description: "O papel foi atualizado com sucesso."
    })
  }

  const handleDeleteRole = (id: number) => {
    const role = roles.find(r => r.id === id)
    if (role && role.usuariosCount > 0) {
      toast({
        title: "Não é possível excluir",
        description: "Este papel possui usuários associados",
        variant: "destructive"
      })
      return
    }

    setRoles(roles.filter(r => r.id !== id))
    toast({
      title: "Papel excluído",
      description: "O papel foi removido com sucesso."
    })
  }

  const togglePermission = (permissionId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissoes: prev.permissoes.includes(permissionId)
        ? prev.permissoes.filter(p => p !== permissionId)
        : [...prev.permissoes, permissionId]
    }))
  }

  const toggleRoleStatus = (id: number) => {
    setRoles(roles.map(role => 
      role.id === id 
        ? { ...role, ativo: !role.ativo }
        : role
    ))
  }

  const getRoleIcon = (nome: string) => {
    switch (nome.toLowerCase()) {
      case "master": return <Crown className="h-4 w-4" />
      case "administrador": return <Shield className="h-4 w-4" />
      case "instrutor": return <UserCheck className="h-4 w-4" />
      case "usuário": return <User className="h-4 w-4" />
      default: return <Shield className="h-4 w-4" />
    }
  }

  const categorias = [...new Set(permissions.map(p => p.categoria))]

  const filteredRoles = roles.filter(role =>
    role.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Permissões</h1>
          <p className="text-muted-foreground mt-2">
            Configure papéis e permissões do sistema
          </p>
        </div>
        
        <Dialog open={isCreateRoleOpen} onOpenChange={(open) => {
          setIsCreateRoleOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Novo Papel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingRole ? "Editar Papel" : "Criar Novo Papel"}
              </DialogTitle>
              <DialogDescription>
                {editingRole ? "Atualize as informações e permissões do papel." : "Configure um novo papel com suas respectivas permissões."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Papel *</Label>
                  <Input
                    id="nome"
                    value={newRole.nome}
                    onChange={(e) => setNewRole({...newRole, nome: e.target.value})}
                    placeholder="Ex: Gerente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cor">Cor</Label>
                  <select 
                    className="w-full p-2 border rounded-md"
                    value={newRole.cor}
                    onChange={(e) => setNewRole({...newRole, cor: e.target.value})}
                  >
                    <option value="bg-blue-500">Azul</option>
                    <option value="bg-green-500">Verde</option>
                    <option value="bg-purple-500">Roxo</option>
                    <option value="bg-red-500">Vermelho</option>
                    <option value="bg-yellow-500">Amarelo</option>
                    <option value="bg-gray-500">Cinza</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={newRole.descricao}
                  onChange={(e) => setNewRole({...newRole, descricao: e.target.value})}
                  placeholder="Descrição das responsabilidades do papel"
                  rows={2}
                />
              </div>
              
              <div className="space-y-4">
                <Label>Permissões</Label>
                <Tabs defaultValue={categorias[0]} className="w-full">
                  <TabsList className="grid grid-cols-5 w-full">
                    {categorias.map((categoria) => (
                      <TabsTrigger key={categoria} value={categoria}>
                        {categoria}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {categorias.map((categoria) => (
                    <TabsContent key={categoria} value={categoria} className="space-y-2">
                      {permissions
                        .filter(p => p.categoria === categoria)
                        .map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium">{permission.nome}</h4>
                              <p className="text-sm text-muted-foreground">{permission.descricao}</p>
                            </div>
                            <Switch
                              checked={newRole.permissoes.includes(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                            />
                          </div>
                        ))}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateRoleOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={editingRole ? handleUpdateRole : handleCreateRole} className="bg-gradient-primary">
                {editingRole ? "Atualizar" : "Criar Papel"}
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
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Papéis</p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Unlock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Papéis Ativos</p>
                <p className="text-2xl font-bold">{roles.filter(r => r.ativo).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Usuários</p>
                <p className="text-2xl font-bold">{roles.reduce((acc, r) => acc + r.usuariosCount, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Lock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Permissões</p>
                <p className="text-2xl font-bold">{permissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="papeis" className="space-y-6">
        <TabsList>
          <TabsTrigger value="papeis">Papéis</TabsTrigger>
          <TabsTrigger value="permissoes">Permissões</TabsTrigger>
        </TabsList>

        {/* Papéis Tab */}
        <TabsContent value="papeis" className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar papéis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Roles List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRoles.map((role) => (
              <Card key={role.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${role.cor} rounded-lg text-white`}>
                        {getRoleIcon(role.nome)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.nome}</CardTitle>
                        <CardDescription>{role.descricao}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={role.ativo ? "default" : "secondary"}>
                      {role.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Usuários:</span>
                    <span className="font-medium">{role.usuariosCount}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Permissões:</span>
                    <span className="font-medium">{role.permissoes.length}</span>
                  </div>
                  
                  <div className="flex justify-between pt-2">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => toggleRoleStatus(role.id)}
                      >
                        {role.ativo ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditRole(role)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-destructive hover:text-destructive"
                      disabled={role.usuariosCount > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Permissões Tab */}
        <TabsContent value="permissoes">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Permissões</CardTitle>
              <CardDescription>
                Todas as permissões disponíveis no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={categorias[0]} className="w-full">
                <TabsList className="grid grid-cols-5 w-full">
                  {categorias.map((categoria) => (
                    <TabsTrigger key={categoria} value={categoria}>
                      {categoria}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {categorias.map((categoria) => (
                  <TabsContent key={categoria} value={categoria} className="space-y-4">
                    {permissions
                      .filter(p => p.categoria === categoria)
                      .map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium">{permission.nome}</h4>
                            <p className="text-sm text-muted-foreground">{permission.descricao}</p>
                            <Badge variant="outline" className="mt-2">
                              {permission.id}
                            </Badge>
                          </div>
                          <Badge variant={permission.ativo ? "default" : "secondary"}>
                            {permission.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}