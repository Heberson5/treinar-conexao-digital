import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
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
  User as UserIcon,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

interface Usuario {
  id: number
  nome: string
  email: string
  empresa: string
  departamento: string
  cargo: string
  papel: "master" | "admin" | "usuario"
  status: "ativo" | "inativo"
  ultimoAcesso: string
  treinamentosConcluidos: number
}

// Limites de usuários por EMPRESA (ativos + inativos contam)
// Ajuste estes valores conforme os planos/empresas reais
const LIMITE_USUARIOS_POR_EMPRESA: Record<string, number> = {
  "Portal Treinamentos": 50, // Ex.: Enterprise base
  "TechCorp Soluções": 15,   // Ex.: Premium
  "Indústria ABC": 3,        // Ex.: Básico
}

const departamentosDisponiveis = [
  "RH",
  "Financeiro",
  "Comercial",
  "Operações",
  "TI",
  "Outros",
]

const cargosDisponiveis = [
  "Administrador Master",
  "Administrador",
  "Gestor",
  "Colaborador",
]

const papeisDisponiveis: { value: Usuario["papel"]; label: string; description: string }[] = [
  {
    value: "master",
    label: "Master",
    description: "Acesso total ao sistema e configurações",
  },
  {
    value: "admin",
    label: "Administrador",
    description: "Gerencia usuários e treinamentos da empresa",
  },
  {
    value: "usuario",
    label: "Usuário",
    description: "Acessa e realiza treinamentos",
  },
]

const usuariosIniciais: Usuario[] = [
  {
    id: 1,
    nome: "Administrador Master",
    email: "admin@portal.com",
    empresa: "Portal Treinamentos",
    departamento: "TI",
    cargo: "Administrador Master",
    papel: "master",
    status: "ativo",
    ultimoAcesso: "Hoje, 08:30",
    treinamentosConcluidos: 12,
  },
  {
    id: 2,
    nome: "Maria Souza",
    email: "maria.souza@empresa.com",
    empresa: "Portal Treinamentos",
    departamento: "RH",
    cargo: "Gestor",
    papel: "admin",
    status: "ativo",
    ultimoAcesso: "Ontem, 17:10",
    treinamentosConcluidos: 7,
  },
  {
    id: 3,
    nome: "João Oliveira",
    email: "joao.oliveira@empresa.com",
    empresa: "Portal Treinamentos",
    departamento: "Operações",
    cargo: "Colaborador",
    papel: "usuario",
    status: "ativo",
    ultimoAcesso: "Há 3 dias",
    treinamentosConcluidos: 3,
  },
  {
    id: 4,
    nome: "Usuário Inativo",
    email: "inativo@empresa.com",
    empresa: "Portal Treinamentos",
    departamento: "Comercial",
    cargo: "Colaborador",
    papel: "usuario",
    status: "inativo",
    ultimoAcesso: "Há 30 dias",
    treinamentosConcluidos: 1,
  },
]

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciais)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [newUser, setNewUser] = useState<{
    nome: string
    email: string
    senha: string
    empresa: string
    departamento: string
    cargo: string
    papel: Usuario["papel"]
    status: Usuario["status"]
  }>({
    nome: "",
    email: "",
    senha: "",
    empresa: "",
    departamento: "",
    cargo: "",
    papel: "usuario",
    status: "ativo",
  })

  const { toast } = useToast()
  const { canCreateMaster, canCreateAdmin, canCreateUser } = useAuth() as any

  const resetForm = () => {
    setNewUser({
      nome: "",
      email: "",
      senha: "",
      empresa: "",
      departamento: "",
      cargo: "",
      papel: "usuario",
      status: "ativo",
    })
  }

  const validatePassword = (senha: string) => {
    // Pelo menos 8 caracteres, 1 maiúscula, 1 minúscula e 1 número
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return regex.test(senha)
  }

  const getLimiteUsuariosEmpresa = (empresaNome: string | undefined) => {
    if (!empresaNome) return undefined
    return LIMITE_USUARIOS_POR_EMPRESA[empresaNome] ?? undefined
  }

  const handleCreate = () => {
    if (!newUser.nome || !newUser.email || !newUser.senha || !newUser.empresa) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome, email, senha e empresa são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    if (!validatePassword(newUser.senha)) {
      toast({
        title: "Senha fraca",
        description:
          "A senha deve ter pelo menos 8 caracteres, incluindo letra maiúscula, minúscula e número.",
        variant: "destructive",
      })
      return
    }

    // Regras de permissão de criação por papel
    if (newUser.papel === "master" && typeof canCreateMaster === "function" && !canCreateMaster()) {
      toast({
        title: "Permissão insuficiente",
        description: "Apenas administradores master podem criar novos usuários master.",
        variant: "destructive",
      })
      return
    }

    if (newUser.papel === "admin" && typeof canCreateAdmin === "function" && !canCreateAdmin()) {
      toast({
        title: "Permissão insuficiente",
        description: "Você não tem permissão para criar novos administradores.",
        variant: "destructive",
      })
      return
    }

    if (newUser.papel === "usuario" && typeof canCreateUser === "function" && !canCreateUser()) {
      toast({
        title: "Permissão insuficiente",
        description: "Você não tem permissão para criar novos usuários.",
        variant: "destructive",
      })
      return
    }

    // CONTROLE DE LIMITE POR EMPRESA (conta ativos + inativos)
    const limiteEmpresa = getLimiteUsuariosEmpresa(newUser.empresa)
    if (limiteEmpresa !== undefined) {
      const totalEmpresa = usuarios.filter(
        (u) => u.empresa === newUser.empresa
      ).length

      if (totalEmpresa >= limiteEmpresa) {
        toast({
          title: "Limite de usuários atingido",
          description: `O plano da empresa "${newUser.empresa}" permite até ${limiteEmpresa} cadastros de usuários (ativos ou inativos). 
Para cadastrar um novo usuário, é necessário contratar um plano com mais usuários ou reutilizar um cadastro existente (alterando os dados do usuário atual, mantendo o histórico).`,
          variant: "destructive",
        })
        return
      }
    }

    const novoUsuario: Usuario = {
      id: usuarios.length ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1,
      nome: newUser.nome,
      email: newUser.email,
      empresa: newUser.empresa,
      departamento: newUser.departamento || "Não informado",
      cargo: newUser.cargo || "Colaborador",
      papel: newUser.papel,
      status: newUser.status,
      ultimoAcesso: "Nunca acessou",
      treinamentosConcluidos: 0,
    }

    setUsuarios([...usuarios, novoUsuario])
    setIsCreateOpen(false)
    resetForm()

    toast({
      title: "Usuário cadastrado!",
      description: "O usuário foi cadastrado com sucesso.",
    })
  }

  const handleDelete = (id: number) => {
    const usuario = usuarios.find((u) => u.id === id)
    if (!usuario) return

    // Proteção simples para não remover o master inicial
    if (usuario.id === 1 && usuario.papel === "master") {
      toast({
        title: "Operação não permitida",
        description: "O usuário master principal não pode ser excluído.",
        variant: "destructive",
      })
      return
    }

    setUsuarios(usuarios.filter((u) => u.id !== id))

    toast({
      title: "Usuário removido",
      description: `O usuário ${usuario.nome} foi removido.`,
    })
  }

  const toggleStatus = (id: number) => {
    setUsuarios((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              status: u.status === "ativo" ? "inativo" : "ativo",
            }
          : u
      )
    )
  }

  const getPapelIcon = (papel: Usuario["papel"]) => {
    switch (papel) {
      case "master":
        return <Crown className="h-3 w-3" />
      case "admin":
        return <UserCheck className="h-3 w-3" />
      default:
        return <UserIcon className="h-3 w-3" />
    }
  }

  const getPapelColor = (papel: Usuario["papel"]) => {
    switch (papel) {
      case "master":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "admin":
        return "bg-blue-100 text-blue-700 border-blue-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  const getInitials = (nome: string) => {
    const partes = nome.trim().split(" ")
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase()
    return `${partes[0].charAt(0)}${partes[partes.length - 1].charAt(0)}`.toUpperCase()
  }

  const filteredUsers = usuarios.filter((user) => {
    const term = searchTerm.toLowerCase()
    return (
      user.nome.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.empresa.toLowerCase().includes(term)
    )
  })

  const totalUsuarios = usuarios.length
  const usuariosAtivos = usuarios.filter((u) => u.status === "ativo").length
  const totalAdmins = usuarios.filter((u) => u.papel !== "usuario").length
  const totalEmpresas = new Set(usuarios.map((u) => u.empresa)).size

  const empresaSelecionada = newUser.empresa.trim()
  const limiteEmpresaSelecionada = getLimiteUsuariosEmpresa(empresaSelecionada)
  const totalEmpresaSelecionada = empresaSelecionada
    ? usuarios.filter((u) => u.empresa === empresaSelecionada).length
    : 0
  const vagasRestantes =
    limiteEmpresaSelecionada !== undefined
      ? Math.max(limiteEmpresaSelecionada - totalEmpresaSelecionada, 0)
      : undefined

  return (
    <div className="space-y-6">
      {/* Header e botão Novo Usuário */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie os acessos ao portal de treinamentos da sua empresa.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Usuário</DialogTitle>
              <DialogDescription>
                Cadastre um novo acesso ao portal. Lembre-se: o limite é por
                cadastro, incluindo usuários inativos.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-[auto,1fr] gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>
                    {newUser.nome ? getInitials(newUser.nome) : <UserIcon className="h-6 w-6" />}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome completo *</Label>
                  <Input
                    id="nome"
                    value={newUser.nome}
                    onChange={(e) =>
                      setNewUser({ ...newUser, nome: e.target.value })
                    }
                    placeholder="Nome do colaborador"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email corporativo *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) =>
                      setNewUser({ ...newUser, email: e.target.value })
                    }
                    placeholder="usuario@empresa.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="senha">Senha inicial *</Label>
                  <Input
                    id="senha"
                    type="password"
                    value={newUser.senha}
                    onChange={(e) =>
                      setNewUser({ ...newUser, senha: e.target.value })
                    }
                    placeholder="Defina uma senha forte"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mínimo 8 caracteres, com letra maiúscula, minúscula e número.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa *</Label>
                  <Input
                    id="empresa"
                    value={newUser.empresa}
                    onChange={(e) =>
                      setNewUser({ ...newUser, empresa: e.target.value })
                    }
                    placeholder="Nome da empresa"
                  />
                  {empresaSelecionada && limiteEmpresaSelecionada !== undefined && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {totalEmpresaSelecionada} de {limiteEmpresaSelecionada} cadastros utilizados
                      para <span className="font-medium">{empresaSelecionada}</span>.{" "}
                      Usuários inativos também contam para o limite.
                      {vagasRestantes !== undefined && vagasRestantes <= 0 && (
                        <>
                          <br />
                          <span className="text-red-600">
                            Nenhuma vaga disponível para novos usuários neste plano.
                          </span>
                        </>
                      )}
                    </p>
                  )}
                  {empresaSelecionada && limiteEmpresaSelecionada === undefined && (
                    <p className="text-xs text-amber-600 mt-1">
                      Esta empresa ainda não tem limite configurado. Ajuste o plano na
                      Gestão de Empresas para ativar o controle de usuários.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Select
                    value={newUser.departamento}
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, departamento: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentosDisponiveis.map((dep) => (
                        <SelectItem key={dep} value={dep}>
                          {dep}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Select
                    value={newUser.cargo}
                    onValueChange={(value) =>
                      setNewUser({ ...newUser, cargo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cargo" />
                    </SelectTrigger>
                    <SelectContent>
                      {cargosDisponiveis.map((cargo) => (
                        <SelectItem key={cargo} value={cargo}>
                          {cargo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Papel no sistema</Label>
                  <Select
                    value={newUser.papel}
                    onValueChange={(value) =>
                      setNewUser({
                        ...newUser,
                        papel: value as Usuario["papel"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {papeisDisponiveis.map((papel) => (
                        <SelectItem key={papel.value} value={papel.value}>
                          <div className="flex flex-col">
                            <span>{papel.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {papel.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status inicial</Label>
                  <Select
                    value={newUser.status}
                    onValueChange={(value) =>
                      setNewUser({
                        ...newUser,
                        status: value as Usuario["status"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Mesmo inativos, os usuários continuam contando no limite do plano.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} className="bg-gradient-primary">
                Cadastrar Usuário
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de usuários</p>
                <p className="text-2xl font-bold">{totalUsuarios}</p>
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
                <p className="text-2xl font-bold">{usuariosAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Crown className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Admins / Master</p>
                <p className="text-2xl font-bold">{totalAdmins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg">
                <Building2 className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Empresas</p>
                <p className="text-2xl font-bold">{totalEmpresas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtro de busca */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por nome, email ou empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de usuários */}
      <div className="space-y-2">
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Nenhum usuário encontrado com o filtro informado.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card
                key={user.id}
                className="hover:border-primary/40 transition-colors"
              >
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{getInitials(user.nome)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{user.nome}</span>
                        <Badge
                          variant="outline"
                          className={getPapelColor(user.papel)}
                        >
                          {getPapelIcon(user.papel)}
                          <span className="ml-1">
                            {user.papel === "master"
                              ? "Master"
                              : user.papel === "admin"
                              ? "Administrador"
                              : "Usuário"}
                          </span>
                        </Badge>
                        <Badge
                          variant={user.status === "ativo" ? "default" : "outline"}
                          className={
                            user.status === "ativo"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }
                        >
                          {user.status === "ativo" ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {user.empresa} • {user.departamento} • {user.cargo}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 text-right">
                    <div className="text-sm">
                      <span className="font-medium">
                        {user.treinamentosConcluidos}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        treinamentos concluídos
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Último acesso: {user.ultimoAcesso}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => toggleStatus(user.id)}
                        disabled={user.id === 1 && user.papel === "master"}
                        title={
                          user.status === "ativo"
                            ? "Inativar usuário"
                            : "Reativar usuário"
                        }
                      >
                        {user.status === "ativo" ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        title="Editar (em breve)"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="text-destructive border-destructive/40 hover:bg-destructive/10"
                        onClick={() => handleDelete(user.id)}
                        disabled={user.id === 1 && user.papel === "master"}
                        title="Excluir usuário"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
