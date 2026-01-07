// src/pages/admin/Usuarios.tsx
import { useEffect, useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Users,
  Shield,
  Building2,
  Search,
  Filter,
  UserPlus,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type PapelUsuario = "master" | "admin" | "gestor" | "usuario"
type StatusUsuario = "ativo" | "inativo"

interface Usuario {
  id: number
  nome: string
  email: string
  empresa: string
  departamento?: string
  cargo?: string
  papel: PapelUsuario
  status: StatusUsuario
}

type PlanoEmpresa = "basico" | "plus" | "premium" | "enterprise"

interface EmpresaContrato {
  id: number
  nome: string
  plano: PlanoEmpresa
  usuariosTotal: number
  pacotesAdicionais?: number
}

const EMPRESAS_STORAGE_KEY = "portal_treinamentos_empresas"

// Estes valores são os mesmos usados na tela de empresas
const LIMITE_USUARIOS_POR_PLANO: Record<PlanoEmpresa, number> = {
  basico: 3,
  plus: 5,
  premium: 15,
  enterprise: 50,
}

const USUARIOS_POR_PACOTE = 5

const calcularUsuariosTotalContrato = (
  plano: PlanoEmpresa,
  pacotesAdicionais?: number
): number => {
  const base = LIMITE_USUARIOS_POR_PLANO[plano] ?? 0
  const adicionais =
    plano === "enterprise" ? (pacotesAdicionais || 0) * USUARIOS_POR_PACOTE : 0

  return base + adicionais
}

const carregarEmpresasContratos = (): EmpresaContrato[] => {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(EMPRESAS_STORAGE_KEY)
    if (!raw) return []

    const data = JSON.parse(raw) as any[]
    if (!Array.isArray(data)) return []

    return data.map((item, index) => {
      const plano = (item.plano || "basico") as PlanoEmpresa
      const pacotes =
        typeof item.pacotesAdicionais === "number" ? item.pacotesAdicionais : 0

      const usuariosTotal =
        typeof item.usuariosTotal === "number" && item.usuariosTotal > 0
          ? item.usuariosTotal
          : calcularUsuariosTotalContrato(plano, pacotes)

      return {
        id: typeof item.id === "number" ? item.id : index + 1,
        nome: String(item.nome || "Empresa sem nome"),
        plano,
        usuariosTotal,
        pacotesAdicionais: pacotes,
      }
    })
  } catch (error) {
    console.error("Erro ao carregar empresas do storage em Usuários", error)
    return []
  }
}

const usuariosIniciais: Usuario[] = [
  {
    id: 1,
    nome: "Administrador Geral",
    email: "admin@unividasantacruz.com.br",
    empresa: "Univida Santa Cruz",
    papel: "master",
    status: "ativo",
  },
  {
    id: 2,
    nome: "Gestor RH",
    email: "gestor.rh@clienteplus.com",
    empresa: "Cliente Plus",
    papel: "gestor",
    status: "ativo",
  },
  {
    id: 3,
    nome: "Colaborador Básico",
    email: "colaborador@clientebasico.com",
    empresa: "Cliente Básico",
    papel: "usuario",
    status: "inativo",
  },
]

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosIniciais)
  const [empresasContrato, setEmpresasContrato] = useState<EmpresaContrato[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusUsuario | "todos">(
    "todos"
  )
  const [empresaFilter, setEmpresaFilter] = useState<string>("todas")
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [novoNome, setNovoNome] = useState("")
  const [novoEmail, setNovoEmail] = useState("")
  const [novaEmpresa, setNovaEmpresa] = useState("")
  const [novoPapel, setNovoPapel] = useState<PapelUsuario>("usuario")

  const { toast } = useToast()

  useEffect(() => {
    setEmpresasContrato(carregarEmpresasContratos())
  }, [])

  const totalUsuarios = usuarios.length
  const totalAtivos = usuarios.filter((u) => u.status === "ativo").length
  const totalAdmins = usuarios.filter(
    (u) => u.papel === "master" || u.papel === "admin"
  ).length
  const totalEmpresas = new Set(usuarios.map((u) => u.empresa)).size

  const empresasOptions = useMemo(
    () => empresasContrato.map((e) => e.nome),
    [empresasContrato]
  )

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((usuario) => {
      const termo =
        searchTerm.trim().length > 0 ? searchTerm.toLowerCase() : ""

      const matchSearch =
        termo.length === 0 ||
        usuario.nome.toLowerCase().includes(termo) ||
        usuario.email.toLowerCase().includes(termo) ||
        usuario.empresa.toLowerCase().includes(termo)

      const matchStatus =
        statusFilter === "todos" || usuario.status === statusFilter

      const matchEmpresa =
        empresaFilter === "todas" || usuario.empresa === empresaFilter

      return matchSearch && matchStatus && matchEmpresa
    })
  }, [usuarios, searchTerm, statusFilter, empresaFilter])

  const resetForm = () => {
    setNovoNome("")
    setNovoEmail("")
    setNovaEmpresa("")
    setNovoPapel("usuario")
  }

  const verificarLimiteEmpresa = (
    empresaNome: string
  ): { ok: boolean; mensagem?: string } => {
    const contrato = empresasContrato.find((e) => e.nome === empresaNome)

    // Se não existir contrato, por enquanto não bloqueamos
    if (!contrato) {
      return { ok: true }
    }

    // Contabiliza TODOS os cadastros da empresa (ativos + inativos)
    const totalCadastrados = usuarios.filter(
      (u) => u.empresa === empresaNome
    ).length

    if (totalCadastrados >= contrato.usuariosTotal) {
      return {
        ok: false,
        mensagem: `A empresa "${empresaNome}" atingiu o limite de ${contrato.usuariosTotal} cadastros de usuários (ativos e inativos). Para cadastrar novos usuários, é necessário contratar um plano com mais vagas ou adicionar pacotes.`,
      }
    }

    return { ok: true }
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
        description: resultadoLimite.mensagem,
        variant: "destructive",
      })
      return
    }

    const novoId =
      usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1

    const novoUsuario: Usuario = {
      id: novoId,
      nome: novoNome.trim(),
      email: novoEmail.trim(),
      empresa: novaEmpresa,
      papel: novoPapel,
      status: "ativo",
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
        "O status do usuário foi alterado. Lembre-se: mesmo inativo, ele continua contando no limite de cadastros da empresa.",
    })
  }

  const handleDeleteUsuario = (id: number) => {
    setUsuarios((prev) => prev.filter((usuario) => usuario.id !== id))
    toast({
      title: "Usuário removido",
      description:
        "O cadastro foi removido. (Na prática, você pode optar por nunca excluir usuários em produção, apenas inativar.)",
    })
  }

  const getPapelLabel = (papel: PapelUsuario) => {
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

  const getPapelVariant = (papel: PapelUsuario) => {
    switch (papel) {
      case "master":
        return "bg-amber-500 text-white"
      case "admin":
        return "bg-blue-500 text-white"
      case "gestor":
        return "bg-emerald-500 text-white"
      default:
        return "bg-slate-500 text-white"
    }
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
            Cadastre, visualize e controle os usuários da plataforma por
            empresa. O limite é contabilizado por cadastro (ativos + inativos).
          </p>
        </div>

        <Button
          className="flex items-center gap-2"
          onClick={() => setIsCreateOpen(true)}
        >
          <UserPlus className="h-4 w-4" />
          Novo usuário
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários cadastrados
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsuarios}</div>
            <p className="text-xs text-muted-foreground">
              Inclui ativos e inativos (todos contam para o limite)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários ativos
            </CardTitle>
            <ToggleRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Usuários atualmente com acesso à plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Perfis administrativos
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAdmins}</div>
            <p className="text-xs text-muted-foreground">
              Masters e admins cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Empresas com usuários
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmpresas}</div>
            <p className="text-xs text-muted-foreground">
              Empresas diferentes com pelo menos um usuário
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Busque usuários por nome, e-mail, empresa ou status.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail ou empresa"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as StatusUsuario | "todos")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="inativo">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select
              value={empresaFilter}
              onValueChange={(value) => setEmpresaFilter(value)}
            >
              <SelectTrigger>
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
          </div>
        </CardContent>
      </Card>

      {/* Lista de usuários */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>
            Controle centralizado de cadastros por empresa. Mesmo usuários
            inativos permanecem contando para o limite contratado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {usuariosFiltrados.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum usuário encontrado com os filtros atuais.
            </p>
          ) : (
            <div className="space-y-2">
              {usuariosFiltrados.map((usuario) => (
                <div
                  key={usuario.id}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{usuario.nome}</span>
                    <span className="text-muted-foreground text-xs">
                      {usuario.email} • {usuario.empresa}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPapelVariant(usuario.papel)}>
                      {getPapelLabel(usuario.papel)}
                    </Badge>
                    <Badge
                      variant={
                        usuario.status === "ativo" ? "default" : "secondary"
                      }
                    >
                      {usuario.status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStatus(usuario.id)}
                      title="Ativar / inativar"
                    >
                      {usuario.status === "ativo" ? (
                        <ToggleLeft className="h-4 w-4 text-amber-600" />
                      ) : (
                        <ToggleRight className="h-4 w-4 text-emerald-600" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteUsuario(usuario.id)}
                      title="Excluir cadastro"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de criação de usuário */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
            <DialogDescription>
              Cadastre um novo usuário vinculado a uma empresa. O limite de
              usuários é controlado por empresa, contando todos os cadastros
              (ativos + inativos).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
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
                placeholder="usuario@empresa.com.br"
              />
            </div>

            <div className="space-y-2">
              <Label>Empresa</Label>
              <Select
                value={novaEmpresa}
                onValueChange={(value) => setNovaEmpresa(value)}
                disabled={empresasOptions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      empresasOptions.length === 0
                        ? "Cadastre empresas primeiro"
                        : "Selecione a empresa"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {empresasOptions.map((nome) => (
                    <SelectItem key={nome} value={nome}>
                      {nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Apenas empresas configuradas na tela de{" "}
                <strong>Gestão de Empresas</strong> aparecem aqui. O limite de
                cadastros é lido diretamente do contrato de cada empresa.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Perfil de acesso</Label>
              <Select
                value={novoPapel}
                onValueChange={(value) => setNovoPapel(value as PapelUsuario)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usuario">Usuário</SelectItem>
                  <SelectItem value="gestor">Gestor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateUsuario}>Salvar usuário</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
