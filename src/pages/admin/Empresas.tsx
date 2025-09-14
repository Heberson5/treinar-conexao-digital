import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Building2, 
  Users, 
  UserCheck,
  Building,
  Calendar,
  Settings,
  TrendingUp
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useBrazilianDate } from "@/hooks/use-brazilian-date"

interface Empresa {
  id: number
  nome: string
  razaoSocial: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
  responsavel: string
  plano: "basico" | "premium" | "enterprise"
  status: "ativa" | "inativa" | "suspensa"
  usuariosAtivos: number
  usuariosTotal: number
  treinamentosAtivos: number
  dataContratacao: string
  proximoVencimento: string
  logo?: string
}

const empresasIniciais: Empresa[] = [
  {
    id: 1,
    nome: "Portal Treinamentos",
    razaoSocial: "Portal Treinamentos LTDA",
    cnpj: "12.345.678/0001-90",
    email: "contato@portaltreinamentos.com",
    telefone: "(11) 99999-9999",
    endereco: "Rua Principal, 123 - São Paulo/SP",
    responsavel: "Heber Sohas",
    plano: "enterprise",
    status: "ativa",
    usuariosAtivos: 1,
    usuariosTotal: 5,
    treinamentosAtivos: 15,
    dataContratacao: "2024-01-01",
    proximoVencimento: "2025-01-01"
  },
  {
    id: 2,
    nome: "TechCorp Soluções",
    razaoSocial: "TechCorp Soluções em TI LTDA",
    cnpj: "98.765.432/0001-10",
    email: "admin@techcorp.com.br",
    telefone: "(11) 88888-8888",
    endereco: "Av. Paulista, 1000 - São Paulo/SP",
    responsavel: "Maria Silva",
    plano: "premium",
    status: "ativa",
    usuariosAtivos: 45,
    usuariosTotal: 50,
    treinamentosAtivos: 8,
    dataContratacao: "2023-06-15",
    proximoVencimento: "2024-06-15"
  },
  {
    id: 3,
    nome: "Indústria ABC",
    razaoSocial: "ABC Indústria e Comércio S.A.",
    cnpj: "11.222.333/0001-44",
    email: "rh@industriaabc.com",
    telefone: "(11) 77777-7777",
    endereco: "Distrito Industrial, 500 - São Bernardo/SP",
    responsavel: "Carlos Santos",
    plano: "basico",
    status: "ativa",
    usuariosAtivos: 12,
    usuariosTotal: 15,
    treinamentosAtivos: 3,
    dataContratacao: "2023-12-01",
    proximoVencimento: "2024-12-01"
  }
]

export default function Empresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>(empresasIniciais)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null)
  const { toast } = useToast()
  const { formatDate } = useBrazilianDate()

  const [newEmpresa, setNewEmpresa] = useState<{
    nome: string
    razaoSocial: string
    cnpj: string
    email: string
    telefone: string
    endereco: string
    responsavel: string
    plano: "basico" | "premium" | "enterprise"
  }>({
    nome: "",
    razaoSocial: "",
    cnpj: "",
    email: "",
    telefone: "",
    endereco: "",
    responsavel: "",
    plano: "basico"
  })

  const resetForm = () => {
    setNewEmpresa({
      nome: "",
      razaoSocial: "",
      cnpj: "",
      email: "",
      telefone: "",
      endereco: "",
      responsavel: "",
      plano: "basico"
    })
    setEditingEmpresa(null)
  }

  const handleCreate = () => {
    if (!newEmpresa.nome || !newEmpresa.email || !newEmpresa.cnpj) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome, email e CNPJ são obrigatórios",
        variant: "destructive"
      })
      return
    }

    const empresa: Empresa = {
      id: Date.now(),
      ...newEmpresa,
      status: "ativa",
      usuariosAtivos: 0,
      usuariosTotal: 0,
      treinamentosAtivos: 0,
      dataContratacao: new Date().toISOString().split('T')[0],
      proximoVencimento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }

    setEmpresas([...empresas, empresa])
    setIsCreateOpen(false)
    resetForm()
    
    toast({
      title: "Empresa cadastrada!",
      description: "A empresa foi cadastrada com sucesso."
    })
  }

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa)
    setNewEmpresa({
      nome: empresa.nome,
      razaoSocial: empresa.razaoSocial,
      cnpj: empresa.cnpj,
      email: empresa.email,
      telefone: empresa.telefone,
      endereco: empresa.endereco,
      responsavel: empresa.responsavel,
      plano: empresa.plano
    })
    setIsCreateOpen(true)
  }

  const handleUpdate = () => {
    if (!editingEmpresa) return

    setEmpresas(empresas.map(e => 
      e.id === editingEmpresa.id 
        ? { ...editingEmpresa, ...newEmpresa }
        : e
    ))
    
    setIsCreateOpen(false)
    resetForm()
    
    toast({
      title: "Empresa atualizada!",
      description: "A empresa foi atualizada com sucesso."
    })
  }

  const handleDelete = (id: number) => {
    setEmpresas(empresas.filter(e => e.id !== id))
    toast({
      title: "Empresa excluída",
      description: "A empresa foi removida com sucesso."
    })
  }

  const toggleStatus = (id: number) => {
    setEmpresas(empresas.map(empresa => 
      empresa.id === id 
        ? { 
            ...empresa, 
            status: empresa.status === "ativa" ? "inativa" : "ativa"
          }
        : empresa
    ))
  }

  const getPlanoColor = (plano: string) => {
    switch (plano) {
      case "basico": return "bg-gray-500"
      case "premium": return "bg-blue-500"
      case "enterprise": return "bg-purple-500"
      default: return "bg-gray-500"
    }
  }

  const getPlanoLabel = (plano: string) => {
    switch (plano) {
      case "basico": return "Básico"
      case "premium": return "Premium"
      case "enterprise": return "Enterprise"
      default: return "Básico"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativa": return "bg-green-500"
      case "inativa": return "bg-gray-500"
      case "suspensa": return "bg-red-500"
      default: return "bg-gray-500"
    }
  }

  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.cnpj.includes(searchTerm) ||
    empresa.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Empresas</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie empresas clientes e seus planos de assinatura
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEmpresa ? "Editar Empresa" : "Cadastrar Nova Empresa"}
              </DialogTitle>
              <DialogDescription>
                {editingEmpresa ? "Atualize as informações da empresa." : "Preencha os dados da nova empresa cliente."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Fantasia *</Label>
                  <Input
                    id="nome"
                    value={newEmpresa.nome}
                    onChange={(e) => setNewEmpresa({...newEmpresa, nome: e.target.value})}
                    placeholder="Nome da empresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="razaoSocial">Razão Social</Label>
                  <Input
                    id="razaoSocial"
                    value={newEmpresa.razaoSocial}
                    onChange={(e) => setNewEmpresa({...newEmpresa, razaoSocial: e.target.value})}
                    placeholder="Razão social completa"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ *</Label>
                  <Input
                    id="cnpj"
                    value={newEmpresa.cnpj}
                    onChange={(e) => setNewEmpresa({...newEmpresa, cnpj: e.target.value})}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plano">Plano de Assinatura</Label>
                  <Select value={newEmpresa.plano} onValueChange={(value: any) => setNewEmpresa({...newEmpresa, plano: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basico">Básico (até 20 usuários)</SelectItem>
                      <SelectItem value="premium">Premium (até 100 usuários)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (usuários ilimitados)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newEmpresa.email}
                    onChange={(e) => setNewEmpresa({...newEmpresa, email: e.target.value})}
                    placeholder="contato@empresa.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={newEmpresa.telefone}
                    onChange={(e) => setNewEmpresa({...newEmpresa, telefone: e.target.value})}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Textarea
                  id="endereco"
                  value={newEmpresa.endereco}
                  onChange={(e) => setNewEmpresa({...newEmpresa, endereco: e.target.value})}
                  placeholder="Endereço completo da empresa"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={newEmpresa.responsavel}
                  onChange={(e) => setNewEmpresa({...newEmpresa, responsavel: e.target.value})}
                  placeholder="Nome do responsável técnico"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={editingEmpresa ? handleUpdate : handleCreate} className="bg-gradient-primary">
                {editingEmpresa ? "Atualizar" : "Cadastrar Empresa"}
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
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{empresas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Building className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativas</p>
                <p className="text-2xl font-bold">{empresas.filter(e => e.status === "ativa").length}</p>
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
                <p className="text-2xl font-bold">{empresas.reduce((acc, e) => acc + e.usuariosTotal, 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue MRR</p>
                <p className="text-2xl font-bold">R$ 12,5k</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar empresas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Empresas List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEmpresas.map((empresa) => (
          <Card key={empresa.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={empresa.logo} alt={empresa.nome} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(empresa.nome)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{empresa.nome}</CardTitle>
                    <CardDescription>{empresa.razaoSocial}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={`${getPlanoColor(empresa.plano)} text-white`}>
                    {getPlanoLabel(empresa.plano)}
                  </Badge>
                  <Badge className={`${getStatusColor(empresa.status)} text-white`}>
                    {empresa.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">CNPJ:</p>
                  <p className="font-medium">{empresa.cnpj}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Responsável:</p>
                  <p className="font-medium">{empresa.responsavel || "Não informado"}</p>
                </div>
              </div>
              
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{empresa.usuariosAtivos}/{empresa.usuariosTotal} usuários</span>
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span>{empresa.treinamentosAtivos} treinamentos</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <p>Contratação:</p>
                  <p>{formatDate(empresa.dataContratacao)}</p>
                </div>
                <div>
                  <p>Vencimento:</p>
                  <p>{formatDate(empresa.proximoVencimento)}</p>
                </div>
              </div>
              
              <div className="flex justify-between pt-2">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleStatus(empresa.id)}
                  >
                    {empresa.status === "ativa" ? "Suspender" : "Ativar"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(empresa)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(empresa.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}