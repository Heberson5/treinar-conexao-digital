import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

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
} from "lucide-react"

type PapelUsuario = "master" | "admin" | "instrutor" | "colaborador"

interface Usuario {
  id: number
  nome: string
  email: string
  empresa: string
  departamento: string
  cargo: string
  papel: PapelUsuario
  status: "ativo" | "inativo"
  ultimoAcesso: string
  treinamentosConcluidos: number
}

const LIMITE_USUARIOS_POR_EMPRESA: Record<string, number> = {
  "UNIVIDA Santa Cruz": 10,
  "UNIVIDA Campo Novo": 5,
  "Empresa Demo": 15,
  "Indústria ABC": 3,
}

const USUARIOS_INICIAIS: Usuario[] = [
  {
    id: 1,
    nome: "Angela Maria",
    email: "angela.maria@unividasantacruz.com.br",
    empresa: "UNIVIDA Santa Cruz",
    departamento: "Comercial",
    cargo: "Coordenadora Comercial",
    papel: "master",
    status: "ativo",
    ultimoAcesso: "Hoje às 09:12",
    treinamentosConcluidos: 18,
  },
  {
    id: 2,
    nome: "João Silva",
    email: "joao.silva@unividasantacruz.com.br",
    empresa: "UNIVIDA Santa Cruz",
    departamento: "Atendimento",
    cargo: "Assistente",
    papel: "colaborador",
    status: "ativo",
    ultimoAcesso: "Ontem às 17:40",
    treinamentosConcluidos: 6,
  },
  {
    id: 3,
    nome: "Maria Santos",
    email: "maria.santos@unividacamponovo.com.br",
    empresa: "UNIVIDA Campo Novo",
    departamento: "Administrativo",
    cargo: "Assistente",
    papel: "admin",
    status: "inativo",
    ultimoAcesso: "Há 7 dias",
    treinamentosConcluidos: 9,
  },
]

const validarSenhaForte = (senha: string) => {
  if (senha.length < 8) return false
  if (!/[A-Z]/.test(senha)) return false
  if (!/[a-z]/.test(senha)) return false
  if (!/[0-9]/.test(senha)) return false
  if (!/[^A-Za-z0-9]/.test(senha)) return false
  return true
}

const getPapelClasses = (papel: PapelUsuario) => {
  switch (papel) {
    case "master":
      return "bg-purple-100 text-purple-700 border border-purple-200"
    case "admin":
      return "bg-blue-100 text-blue-700 border border-blue-200"
    case "instrutor":
      return "bg-emerald-100 text-emerald-700 border border-emerald-200"
    case "colaborador":
    default:
      return "bg-slate-100 text-slate-700 border border-slate-200"
  }
}

const getPapelIcon = (papel: PapelUsuario) => {
  switch (papel) {
    case "master":
      return <Crown className="h-3 w-3 text-purple-600" />
    case "admin":
      return <UserCheck className="h-3 w-3 text-blue-600" />
    case "instrutor":
      return <UserCheck className="h-3 w-3 text-emerald-600" />
    case "colaborador":
    default:
      return <Users className="h-3 w-3 text-slate-600" />
  }
}

const getStatusClasses = (status: Usuario["status"]) => {
  if (status === "ativo") {
    return "bg-green-100 text-green-700 border border-green-200"
  }
  return "bg-red-100 text-red-700 border border-red-200"
}

export default function Usuarios() {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()

  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS_INICIAIS)

  const [searchTerm, setSearchTerm] = useState("")
  const [filtroPapel, setFiltroPapel] = useState<string>("todos")
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>("todas")

  const [modalAberto, setModalAberto] = useState(false)
  const [novoNome, setNovoNome] = useState("")
  const [novoEmail, setNovoEmail] = useState("")
  const [novoEmpresa, setNovoEmpresa] = useState("")
  const [novoPapel, setNovoPapel] = useState<PapelUsuario>("colaborador")
  const [novaSenha, setNovaSenha] = useState("")
  const [novaSenhaConfirmacao, setNovaSenhaConfirmacao] = useState("")

  const papelAtual = (currentUser?.role?.toLowerCase() as PapelUsuario) ?? "master"

  const mapaPermissoes: Record<PapelUsuario, PapelUsuario[]> = {
    master: ["master", "admin", "instrutor", "colaborador"],
    admin: ["instrutor", "colaborador"],
    instrutor: ["colaborador"],
    colaborador: [],
  }

  const podeCriarPapel = (papel: PapelUsuario) => {
    const permitidos = mapaPermissoes[papelAtual] ?? []
    return permitidos.includes(papel)
  }

  const getLimiteEmpresa = (empresa: string) => {
    const limite = LIMITE_USUARIOS_POR_EMPRESA[empresa]
    if (!limite || limite <= 0) {
      // se não houver configuração, tratamos como ilimitado por enquanto
      return Infinity
    }
    return limite
  }

  const totalUsuarios = usuarios.length
  const usuariosAtivos = usuarios.filter((u) => u.status === "ativo").length
  const mastersAdmins = usuarios.filter((u) => u.papel === "master" || u.papel === "admin").length
  const empresasAtendidas = new Set(usuarios.map((u) => u.empresa)).size

  const empresasDisponiveis = Array.from(new Set(usuarios.map((u) => u.empresa))).sort()

  const usuariosFiltrados = usuarios.filter((u) => {
    if (searchTerm) {
      const termo = searchTerm.toLowerCase()
      if (
        !u.nome.toLowerCase().includes(termo) &&
        !u.email.toLowerCase().includes(termo) &&
        !u.empresa.toLowerCase().includes(termo)
      ) {
        return false
      }
    }

    if (filtroPapel !== "todos" && u.papel !== filtroPapel) {
      return false
    }

    if (filtroStatus !== "todos" && u.status !== filtroStatus) {
      return false
    }

    if (filtroEmpresa !== "todas" && u.empresa !== filtroEmpresa) {
      return false
    }

    return true
  })

  const limparFormulario = () => {
    setNovoNome("")
    setNovoEmail("")
    setNovoEmpresa("")
    setNovoPapel("colaborador")
    setNovaSenha("")
    setNovaSenhaConfirmacao("")
  }

  const handleCriarUsuario = () => {
    if (!novoNome.trim() || !novoEmail.trim() || !novoEmpresa.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, e-mail e empresa para criar o usuário.",
        variant: "destructive",
      })
      return
    }

    if (!validarSenhaForte(novaSenha)) {
      toast({
        title: "Senha fraca",
        description:
          "A senha deve ter pelo menos 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.",
        variant: "destructive",
      })
      return
    }

    if (novaSenha !== novaSenhaConfirmacao) {
      toast({
        title: "Confirmação de senha inválida",
        description: "A confirmação de senha deve ser igual à senha informada.",
        variant: "destructive",
      })
      return
    }

    if (!podeCriarPapel(novoPapel)) {
      toast({
        title: "Permissão insuficiente",
        description:
          "Seu papel atual não permite criar usuários com este nível de acesso. Ajuste o papel ou solicite a um usuário master.",
        variant: "destructive",
      })
      return
    }

    const limite = getLimiteEmpresa(novoEmpresa)
    const usuariosDaEmpresa = usuarios.filter((u) => u.empresa === novoEmpresa).length

    if (usuariosDaEmpresa >= limite && limite !== Infinity) {
      toast({
        title: "Limite de usuários atingido",
        description:
          "O plano contratado para esta empresa já atingiu o limite de cadastros. Para cadastrar novos usuários, será necessário contratar um plano com capacidade maior.",
        variant: "destructive",
      })
      return
    }

    const novoId = usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1

    const novoUsuario: Usuario = {
      id: novoId,
      nome: novoNome.trim(),
      email: novoEmail.trim(),
      empresa: novoEmpresa.trim(),
      departamento: "-",
      cargo: "-",
      papel: novoPapel,
      status: "ativo",
      ultimoAcesso: "Criado agora",
      treinamentosConcluidos: 0,
    }

    setUsuarios((prev) => [...prev, novoUsuario])

    toast({
      title: "Usuário criado com sucesso",
      description: `O usuário ${novoUsuario.nome} foi cadastrado e já conta para o limite do plano.`,
    })

    limparFormulario()
    setModalAberto(false)
  }

  const handleDelete = (id: number) => {
    const usuario = usuarios.find((u) => u.id === id)
    if (!usuario) return

    // impede excluir a si mesmo (padrão de segurança mínimo)
    if (currentUser?.email && currentUser.email === usuario.email) {
      toast({
        title: "Ação não permitida",
        description: "Você não pode excluir seu próprio usuário.",
        variant: "destructive",
      })
      return
    }

    // NÃO remove o registro para não liberar vaga de plano
    toast({
      title: "Exclusão não permitida",
      description:
        "Cadastros de usuários não podem ser excluídos. Use a opção de inativar para bloquear o acesso, mantendo o histórico e o consumo do limite do plano.",
      variant: "destructive",
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
          : u,
      ),
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-sm text-muted-foreground">
            Controle de acessos e permissões por empresa, alinhado ao plano contratado.
          </p>
        </div>

        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo usuário</DialogTitle>
              <DialogDescription>
                Cadastre um novo usuário. Este cadastro passa a contar imediatamente no limite do plano da empresa.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label>Nome completo</Label>
                <Input
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Nome do usuário"
                />
              </div>

              <div className="space-y-1">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  placeholder="email@empresa.com.br"
                />
              </div>

              <div className="space-y-1">
                <Label>Empresa</Label>
                <Input
                  value={novoEmpresa}
                  onChange={(e) => setNovoEmpresa(e.target.value)}
                  placeholder="Nome da empresa"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Papel</Label>
                  <Select
                    value={novoPapel}
                    onValueChange={(v) => setNovoPapel(v as PapelUsuario)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o papel" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="master">Master</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="instrutor">Instrutor</SelectItem>
                      <SelectItem value="colaborador">Colaborador</SelectItem>
                    </SelectContent>
                  </Select>
                  {!podeCriarPapel(novoPapel) && (
                    <p className="text-xs text-destructive">
                      Seu papel atual não permite criar este tipo de usuário.
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label>Senha</Label>
                  <Input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    placeholder="Senha forte"
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <Label>Confirmar senha</Label>
                <Input
                  type="password"
                  value={novaSenhaConfirmacao}
                  onChange={(e) => setNovaSenhaConfirmacao(e.target.value)}
                  placeholder="Repita a senha"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setModalAberto(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCriarUsuario}>Salvar usuário</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários cadastrados</CardTitle>
            <div className="rounded-full bg-blue-50 p-2 text-blue-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsuarios}</div>
            <p className="text-xs text-muted-foreground">
              Todos os usuários que contam para o limite dos planos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <div className="rounded-full bg-green-50 p-2 text-green-600">
              <UserCheck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usuariosAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Usuários com acesso liberado no momento.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Master / Admin</CardTitle>
            <div className="rounded-full bg-purple-50 p-2 text-purple-600">
              <Crown className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mastersAdmins}</div>
            <p className="text-xs text-muted-foreground">
              Usuários com poder de gestão e configuração.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Empresas atendidas</CardTitle>
            <div className="rounded-full bg-slate-50 p-2 text-slate-600">
              <Building2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{empresasAtendidas}</div>
            <p className="text-xs text-muted-foreground">
              Empresas com pelo menos um usuário cadastrado.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de usuários</CardTitle>
          <CardDescription>
            Pesquise, filtre por empresa, papel e status. Lembre-se: inativos continuam contando para o limite.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:w-72">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Buscar por nome, e-mail ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Select
                value={filtroEmpresa}
                onValueChange={setFiltroEmpresa}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Empresa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as empresas</SelectItem>
                  {empresasDisponiveis.map((empresa) => (
                    <SelectItem key={empresa} value={empresa}>
                      {empresa}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filtroPapel}
                onValueChange={setFiltroPapel}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os papéis</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="instrutor">Instrutor</SelectItem>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filtroStatus}
                onValueChange={setFiltroStatus}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              • O limite é por <strong>cadastro</strong>. Mesmo inativos continuam contando para o plano.
            </p>
            <p>
              • Para reaproveitar uma vaga, altere os dados do usuário existente (nome, e-mail), preservando o histórico.
            </p>
          </div>

          <div className="mt-4 space-y-2">
            {usuariosFiltrados.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum usuário encontrado com os filtros atuais.
              </p>
            ) : (
              <div className="space-y-2">
                {usuariosFiltrados.map((u) => (
                  <Card key={u.id} className="border border-slate-100">
                    <CardContent className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-1 items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {u.nome
                              .split(" ")
                              .map((p) => p[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium leading-none">{u.nome}</span>
                            <Badge
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold ${getPapelClasses(
                                u.papel,
                              )}`}
                            >
                              {getPapelIcon(u.papel)}
                              <span className="capitalize">{u.papel}</span>
                            </Badge>
                            <Badge
                              className={`px-2 py-0.5 text-[11px] font-semibold ${getStatusClasses(
                                u.status,
                              )}`}
                            >
                              {u.status === "ativo" ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground">{u.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {u.empresa} • {u.departamento || "-"} • {u.cargo || "-"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3 md:w-[280px] md:justify-end">
                        <div className="text-right text-xs text-muted-foreground">
                          <p>Último acesso: {u.ultimoAcesso}</p>
                          <p>Treinamentos concluídos: {u.treinamentosConcluidos}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatus(u.id)}
                            title={u.status === "ativo" ? "Inativar usuário" : "Reativar usuário"}
                          >
                            {u.status === "ativo" ? (
                              <UserX className="h-4 w-4" />
                            ) : (
                              <UserCheck className="h-4 w-4" />
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            title="Editar (em breve)"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>

                          {u.id !== 1 && u.papel !== "master" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(u.id)}
                              className="text-destructive hover:text-destructive"
                              title="Exclusão bloqueada – use inativação"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
