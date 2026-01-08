import React, { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import {
  Building2,
  Filter,
  Search,
  Shield,
  Users,
  UserPlus,
  PauseCircle,
  PlayCircle,
  XCircle,
  Crown,
  User as UserIcon,
  Check,
  X,
  UserCheck,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

type StatusUsuario = "ativo" | "inativo"
type PapelUsuario = "master" | "admin" | "gestor" | "usuario"

interface Usuario {
  id: number
  nome: string
  email: string
  empresa: string
  departamento?: string
  cargo?: string
  status: StatusUsuario
  papel: PapelUsuario
  ultimoAcesso: string
  treinamentosConcluidos: number
}

type PlanoEmpresa = "basico" | "plus" | "premium" | "enterprise"

interface EmpresaContrato {
  id: number
  nome: string
  plano: PlanoEmpresa
  usuariosAtivos: number
  usuariosTotal: number
  pacotesAdicionais?: number
}

const EMPRESAS_STORAGE_KEY = "portal_treinamentos_empresas"
const USUARIOS_POR_PACOTE = 5

const LIMITE_USUARIOS_POR_PLANO: Record<PlanoEmpresa, number> = {
  basico: 3,
  plus: 5,
  premium: 15,
  enterprise: 50,
}

const calcularUsuariosTotalContrato = (
  plano: PlanoEmpresa,
  pacotesAdicionais = 0
): number => {
  const limiteBase = LIMITE_USUARIOS_POR_PLANO[plano] ?? 3

  if (plano === "enterprise") {
    return limiteBase + pacotesAdicionais * USUARIOS_POR_PACOTE
  }

  return limiteBase
}

const carregarEmpresasContratos = (): EmpresaContrato[] => {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(EMPRESAS_STORAGE_KEY)
    if (!raw) return []

    const data = JSON.parse(raw) as any[]

    return data.map((empresa, index) => {
      const plano: PlanoEmpresa =
        empresa.plano && ["basico", "plus", "premium", "enterprise"].includes(empresa.plano)
          ? empresa.plano
          : "basico"

      const pacotes =
        typeof empresa.pacotesAdicionais === "number" && empresa.pacotesAdicionais > 0
          ? empresa.pacotesAdicionais
          : 0

      const usuariosTotal: number =
        typeof empresa.usuariosTotal === "number" && empresa.usuariosTotal > 0
          ? empresa.usuariosTotal
          : calcularUsuariosTotalContrato(plano, pacotes)

      return {
        id: typeof empresa.id === "number" ? empresa.id : index + 1,
        nome: empresa.nome ?? "",
        plano,
        usuariosAtivos: typeof empresa.usuariosAtivos === "number" ? empresa.usuariosAtivos : 0,
        usuariosTotal,
        pacotesAdicionais: pacotes,
      }
    })
  } catch {
    return []
  }
}

const usuariosIniciais: Usuario[] = [
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
    treinamentosConcluidos: 0,
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
    treinamentosConcluidos: 5,
  },
  {
    id: 3,
    nome: "João Santos",
    email: "joao.santos@empresa.com",
    empresa: "Indústria ABC",
    departamento: "Vendas",
    cargo: "Vendedor",
    status: "ativo",
    papel: "usuario",
    ultimoAcesso: "Ontem",
    treinamentosConcluidos: 3,
  },
]

const getPapelLabel = (papel: PapelUsuario): string => {
  switch (papel) {
    case "master":
      return "Master"
    case "admin":
      return "Admin"
    case "gestor":
      return "Gestor"
    default:
      return "Usuário"
  }
}

const getPapelIcon = (papel: PapelUsuario): LucideIcon => {
  switch (papel) {
    case "master":
      return Crown
    case "admin":
      return Shield
    case "gestor":
      return UserCheck
    default:
      return UserIcon
  }
}

const getPapelColor = (papel: PapelUsuario): string => {
  switch (papel) {
    case "master":
      return "bg-amber-500"
    case "admin":
      return "bg-blue-500"
    case "gestor":
      return "bg-emerald-500"
    default:
      return "bg-slate-500"
  }
}

const getInitials = (nome: string): string =>
  nome
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciais)
  const [empresasContrato, setEmpresasContrato] = useState<EmpresaContrato[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusUsuario | "todos">("todos")
  const [empresaFilter, setEmpresaFilter] = useState<string>("todas")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [novoNome, setNovoNome] = useState("")
  const [novoEmail, setNovoEmail] = useState("")
  const [novaEmpresa, setNovaEmpresa] = useState("")
  const [novoDepartamento, setNovoDepartamento] = useState("")
  const [novoCargo, setNovoCargo] = useState("")
  const [novoPapel, setNovoPapel] = useState<PapelUsuario>("usuario")

  const { toast } = useToast()

  useEffect(() => {
    setEmpresasContrato(carregarEmpresasContratos())
  }, [])

  const empresasOptions = useMemo(() => {
    const nomesFromContratos = empresasContrato.map((e) => e.nome)
    const nomesFromUsuarios = usuarios.map((u) => u.empresa)
    const unique = Array.from(new Set([...nomesFromContratos, ...nomesFromUsuarios])).filter(
      Boolean
    ) as string[]
    unique.sort((a, b) => a.localeCompare(b))
    return unique
  }, [empresasContrato, usuarios])

  const totalUsuarios = usuarios.length
  const usuariosAtivos = usuarios.filter((u) => u.status === "ativo").length
  const usuariosAdmins = usuarios.filter((u) => u.papel === "admin" || u.papel === "master").length
  const empresasAtendidas = new Set(usuarios.map((u) => u.empresa)).size

  const usuariosFiltrados = useMemo(
    () =>
      usuarios.filter((usuario) => {
        const term = searchTerm.toLowerCase()
        const matchesSearch =
          !term ||
          usuario.nome.toLowerCase().includes(term) ||
          usuario.email.toLowerCase().includes(term) ||
          usuario.empresa.toLowerCase().includes(term)

        const matchesStatus =
          statusFilter === "todos" ? true : usuario.status === statusFilter

        const matchesEmpresa =
          empresaFilter === "todas" ? true : usuario.empresa === empresaFilter

        return matchesSearch && matchesStatus && matchesEmpresa
      }),
    [usuarios, searchTerm, statusFilter, empresaFilter]
  )

  const getContratoEmpresa = (empresaNome: string): EmpresaContrato | undefined =>
    empresasContrato.find((e) => e.nome === empresaNome)

  const verificarLimiteEmpresa = (
    empresaNome: string
  ): { ok: true } | { ok: false; mensagem: string } => {
    const contrato = getContratoEmpresa(empresaNome)

    // Se não houver contrato configurado, não bloqueia (mas você pode optar por bloquear também)
    if (!contrato || !contrato.usuariosTotal) {
      return { ok: true }
    }

    // Conta TODOS os cadastros da empresa (ativos + inativos)
    const totalCadastrados = usuarios.filter((u) => u.empresa === empresaNome).length

    if (totalCadastrados >= contrato.usuariosTotal) {
      return {
        ok: false,
        mensagem: `A empresa "${empresaNome}" atingiu o limite de ${contrato.usuariosTotal} cadastros de usuários (ativos e inativos). Para cadastrar novos usuários, é necessário contratar um plano com mais vagas ou adicionar pacotes.`,
      }
    }

    return { ok: true }
  }

  const resetForm = () => {
    setNovoNome("")
    setNovoEmail("")
    setNovaEmpresa("")
    setNovoDepartamento("")
    setNovoCargo("")
    setNovoPapel("usuario")
  }

  const handleCreateUsuario = () => {
    if (!novoNome.trim() || !novoEmail.trim() || !novaEmpresa.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome, e-mail e empresa são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const emailRegex = /\S+@\S+\.\S+/
    if (!emailRegex.test(novoEmail.trim())) {
      toast({
        title: "E-mail inválido",
        description: "Informe um e-mail válido para o usuário.",
        variant: "destructive",
      })
      return
    }

    const resultadoLimite = verificarLimiteEmpresa(novaEmpresa)
    if (!resultadoLimite.ok) {
      toast({
        title: "Limite de usuários atingido",
        description: "mensagem" in resultadoLimite ? resultadoLimite.mensagem : "Limite de usuários atingido",
        variant: "destructive",
      })
      return
    }

    const novoId = usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1

    const novoUsuario: Usuario = {
      id: novoId,
      nome: novoNome.trim(),
      email: novoEmail.trim(),
      empresa: novaEmpresa,
      departamento: novoDepartamento.trim() || undefined,
      cargo: novoCargo.trim() || undefined,
      papel: novoPapel,
      status: "ativo",
      ultimoAcesso: "Nunca acessou",
      treinamentosConcluidos: 0,
    }

    setUsuarios((prev) => [...prev, novoUsuario])

    toast({
      title: "Usuário cadastrado",
      description:
        "O usuário foi cadastrado com sucesso. O limite é contado por cadastro (ativos + inativos).",
    })

    resetForm()
    setIsCreateOpen(false)
  }

  const handleToggleStatus = (id: number) => {
    setUsuarios((prev) =>
      prev.map((usuario) =>
        usuario.id === id
          ? {
              ...usuario,
              status: usuario.status === "ativo" ? "inativo" : "ativo",
            }
          : usuario
      )
    )

    toast({
      title: "Status atualizado",
      description:
        "O status do usuário foi alterado. Mesmo inativo, ele continua contando no limite de cadastros da empresa.",
    })
  }

  const handleDeleteUsuario = (id: number) => {
    const usuario = usuarios.find((u) => u.id === id)

    toast({
      variant: "destructive",
      title: "Exclusão desabilitada",
      description: usuario
        ? `Por política de negócio, o cadastro de "${usuario.nome}" não é removido. Utilize a opção de inativar para bloquear o acesso sem liberar vaga no contrato.`
        : "Por política de negócio, cadastros de usuários não são removidos. Utilize a opção de inativar.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Gestão de Usuários
          </h1>
          <p className="text-muted-foreground">
            Cadastre, visualize e controle os usuários da plataforma por empresa. O limite é
            contabilizado por cadastro (ativos + inativos).
          </p>
        </div>

        <Button className="flex items-center gap-2" onClick={() => setIsCreateOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Novo usuário
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários cadastrados</CardTitle>
            <div className="rounded-full bg-primary/10 p-2">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsuarios}</div>
            <p className="text-xs text-muted-foreground">
              Contando todos os cadastros (ativos + inativos)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <div className="rounded-full bg-emerald-500/10 p-2">
              <Check className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuariosAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Usuários com acesso liberado à plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <div className="rounded-full bg-sky-500/10 p-2">
              <Shield className="h-4 w-4 text-sky-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuariosAdmins}</div>
            <p className="text-xs text-muted-foreground">
              Masters e Admins em todas as empresas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas atendidas</CardTitle>
            <div className="rounded-full bg-amber-500/10 p-2">
              <Building2 className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{empresasAtendidas}</div>
            <p className="text-xs text-muted-foreground">
              Com pelo menos um usuário cadastrado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
          <CardDescription>
            Refine a lista de usuários por status e empresa.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Buscar por nome, e-mail ou empresa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusUsuario | "todos")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>

          <Select value={empresaFilter} onValueChange={setEmpresaFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as empresas</SelectItem>
              {empresasOptions.map((nome) => (
                <SelectItem key={nome} value={nome}>
                  {nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Lista de usuários */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Lista de usuários
          </CardTitle>
          <CardDescription>
            Visualize os usuários por empresa, papel e status. O limite é sempre por
            cadastro.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {usuariosFiltrados.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum usuário encontrado com os filtros atuais.
            </p>
          ) : (
            <div className="space-y-3">
              {usuariosFiltrados.map((usuario) => {
                const PapelIcon = getPapelIcon(usuario.papel)

                return (
                  <div
                    key={usuario.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src="" alt={usuario.nome} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(usuario.nome)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-medium">{usuario.nome}</h4>

                          <Badge
                            className={`${getPapelColor(
                              usuario.papel
                            )} text-white text-xs flex items-center gap-1`}
                          >
                            <PapelIcon className="h-3 w-3" />
                            {getPapelLabel(usuario.papel)}
                          </Badge>

                          <Badge
                            variant={usuario.status === "ativo" ? "default" : "secondary"}
                            className="text-xs flex items-center gap-1"
                          >
                            {usuario.status === "ativo" ? (
                              <>
                                <Check className="h-3 w-3" />
                                Ativo
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3" />
                                Inativo
                              </>
                            )}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground">{usuario.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {usuario.empresa}
                          {usuario.departamento && ` • ${usuario.departamento}`}
                          {usuario.cargo && ` • ${usuario.cargo}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {usuario.treinamentosConcluidos} treinamentos
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Último acesso: {usuario.ultimoAcesso}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleToggleStatus(usuario.id)}
                          disabled={usuario.id === 1 && usuario.papel === "master"}
                          className={
                            usuario.status === "ativo"
                              ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              : "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          }
                          title={
                            usuario.status === "ativo"
                              ? "Inativar usuário"
                              : "Reativar usuário"
                          }
                        >
                          {usuario.status === "ativo" ? (
                            <PauseCircle className="h-4 w-4" />
                          ) : (
                            <PlayCircle className="h-4 w-4" />
                          )}
                        </Button>

                        {usuario.id !== 1 && usuario.papel !== "master" && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleDeleteUsuario(usuario.id)}
                            className="text-destructive hover:text-destructive"
                            title="Exclusão desabilitada (use inativação)"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de novo usuário */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo usuário. O cadastro irá consumir uma vaga do
              limite contratado da empresa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input
                  id="nome"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Nome completo do usuário"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  placeholder="email@empresa.com.br"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Select value={novaEmpresa} onValueChange={setNovaEmpresa}>
                  <SelectTrigger id="empresa">
                    <SelectValue placeholder="Selecione a empresa" />
                  </SelectTrigger>
                  <SelectContent>
                    {empresasOptions.length === 0 && (
                      <SelectItem value="" disabled>
                        Nenhuma empresa configurada
                      </SelectItem>
                    )}
                    {empresasOptions.map((nome) => (
                      <SelectItem key={nome} value={nome}>
                        {nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  O limite de cadastros será verificado conforme o plano contratado da
                  empresa.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input
                    id="departamento"
                    value={novoDepartamento}
                    onChange={(e) => setNovoDepartamento(e.target.value)}
                    placeholder="Opcional (RH, Vendas, TI...)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    value={novoCargo}
                    onChange={(e) => setNovoCargo(e.target.value)}
                    placeholder="Opcional (Analista, Gestor...)"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="papel">Papel no sistema</Label>
                <Select
                  value={novoPapel}
                  onValueChange={(value) => setNovoPapel(value as PapelUsuario)}
                >
                  <SelectTrigger id="papel">
                    <SelectValue placeholder="Selecione o papel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usuario">Usuário</SelectItem>
                    <SelectItem value="gestor">Gestor</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="master">Master</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Mantenha o papel &quot;Master&quot; restrito. Idealmente só o usuário
                  principal da plataforma deve ter esse nível.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUsuario}>Salvar usuário</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
