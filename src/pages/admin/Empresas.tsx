// src/pages/admin/Empresas.tsx
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
  Building2,
  Users,
  PlayCircle,
  PauseCircle,
  XCircle,
  Filter,
  Search,
  Plus,
  Settings,
  Calendar,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useBrazilianDate } from "@/hooks/use-brazilian-date"
import { EmpresaConfigModal } from "@/components/empresa/empresa-config-modal"

interface Empresa {
  id: number
  nome: string
  razaoSocial: string
  cnpj: string
  email: string
  telefone: string
  endereco: string
  responsavel: string
  plano: "basico" | "plus" | "premium" | "enterprise"
  status: "ativa" | "inativa" | "suspensa"
  usuariosAtivos: number
  usuariosTotal: number
  treinamentosAtivos: number
  dataContratacao: string
  proximoVencimento: string
  logo?: string
  pacotesAdicionais?: number
  tipoFaturamento?: "mensal" | "anual"
  statusPagamento?: "ativo" | "pendente" | "cancelado"
}

type PlanoEmpresa = Empresa["plano"]

const EMPRESAS_STORAGE_KEY = "portal_treinamentos_empresas"

// Limites base por plano
const LIMITE_USUARIOS_POR_PLANO: Record<PlanoEmpresa, number> = {
  basico: 3,
  plus: 5,
  premium: 15,
  enterprise: 50,
}

// Cadastros extras por pacote
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

const ajustarEmpresaContrato = (empresa: Empresa): Empresa => {
  const pacotes = typeof empresa.pacotesAdicionais === "number" ? empresa.pacotesAdicionais : 0
  const usuariosTotal =
    typeof empresa.usuariosTotal === "number" && empresa.usuariosTotal > 0
      ? empresa.usuariosTotal
      : calcularUsuariosTotalContrato(empresa.plano, pacotes)

  return {
    ...empresa,
    pacotesAdicionais: pacotes,
    usuariosTotal,
  }
}

const empresasIniciais: Empresa[] = [
  {
    id: 1,
    nome: "Univida Santa Cruz",
    razaoSocial: "Univida Santa Cruz Assistência Familiar Ltda",
    cnpj: "00.000.000/0001-00",
    email: "contato@unividasantacruz.com.br",
    telefone: "(65) 0000-0000",
    endereco: "Rua Exemplo, 123 - Campo Novo do Parecis/MT",
    responsavel: "Angela Maria",
    plano: "premium",
    status: "ativa",
    usuariosAtivos: 8,
    pacotesAdicionais: 1,
    usuariosTotal: calcularUsuariosTotalContrato("premium", 1),
    treinamentosAtivos: 12,
    dataContratacao: "2024-01-15",
    proximoVencimento: "2025-01-15",
    logo: "",
    tipoFaturamento: "anual",
    statusPagamento: "ativo",
  },
  {
    id: 2,
    nome: "Cliente Plus",
    razaoSocial: "Cliente Plus Comercial Ltda",
    cnpj: "11.111.111/0001-11",
    email: "contato@clienteplus.com",
    telefone: "(11) 1111-1111",
    endereco: "Av. Central, 456 - São Paulo/SP",
    responsavel: "João Silva",
    plano: "plus",
    status: "ativa",
    usuariosAtivos: 3,
    pacotesAdicionais: 0,
    usuariosTotal: calcularUsuariosTotalContrato("plus", 0),
    treinamentosAtivos: 5,
    dataContratacao: "2024-03-10",
    proximoVencimento: "2025-03-10",
    logo: "",
    tipoFaturamento: "mensal",
    statusPagamento: "ativo",
  },
  {
    id: 3,
    nome: "Cliente Básico",
    razaoSocial: "Cliente Básico Serviços Ltda",
    cnpj: "22.222.222/0001-22",
    email: "contato@clientebasico.com",
    telefone: "(21) 2222-2222",
    endereco: "Rua Secundária, 789 - Rio de Janeiro/RJ",
    responsavel: "Maria Souza",
    plano: "basico",
    status: "inativa",
    usuariosAtivos: 0,
    pacotesAdicionais: 0,
    usuariosTotal: calcularUsuariosTotalContrato("basico", 0),
    treinamentosAtivos: 0,
    dataContratacao: "2023-11-05",
    proximoVencimento: "2024-11-05",
    logo: "",
    tipoFaturamento: "mensal",
    statusPagamento: "pendente",
  },
]

const carregarEmpresas = (): Empresa[] => {
  if (typeof window === "undefined") {
    return empresasIniciais
  }

  try {
    const raw = window.localStorage.getItem(EMPRESAS_STORAGE_KEY)
    if (!raw) return empresasIniciais

    const data = JSON.parse(raw) as Empresa[]
    if (!Array.isArray(data) || data.length === 0) {
      return empresasIniciais
    }

    return data.map(ajustarEmpresaContrato)
  } catch {
    return empresasIniciais
  }
}

export default function Empresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>(carregarEmpresas)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<Empresa["status"] | "todas">("todas")
  const [planoFilter, setPlanoFilter] = useState<PlanoEmpresa | "todos">("todos")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [configEmpresa, setConfigEmpresa] = useState<Empresa | null>(null)

  // Campos do formulário de criação
  const [novoNome, setNovoNome] = useState("")
  const [novoRazaoSocial, setNovoRazaoSocial] = useState("")
  const [novoCnpj, setNovoCnpj] = useState("")
  const [novoEmail, setNovoEmail] = useState("")
  const [novoTelefone, setNovoTelefone] = useState("")
  const [novoEndereco, setNovoEndereco] = useState("")
  const [novoResponsavel, setNovoResponsavel] = useState("")
  const [novoPlano, setNovoPlano] = useState<PlanoEmpresa>("basico")
  const [novoPacotesAdicionais, setNovoPacotesAdicionais] = useState<number>(0)
  const [novoTipoFaturamento, setNovoTipoFaturamento] = useState<"mensal" | "anual">("mensal")

  const { toast } = useToast()
  const { formatDate } = useBrazilianDate()

  // Persistência em localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(
        EMPRESAS_STORAGE_KEY,
        JSON.stringify(empresas.map(ajustarEmpresaContrato))
      )
    } catch (error) {
      console.error("Erro ao salvar empresas no localStorage", error)
    }
  }, [empresas])

  const totalEmpresas = empresas.length
  const totalAtivas = empresas.filter((e) => e.status === "ativa").length
  const totalUsuariosAtivos = empresas.reduce(
    (acc, e) => acc + e.usuariosAtivos,
    0
  )
  const totalTreinamentos = empresas.reduce(
    (acc, e) => acc + e.treinamentosAtivos,
    0
  )

  const empresasFiltradas = useMemo(() => {
    return empresas.filter((empresa) => {
      const termo =
        searchTerm.trim().length > 0
          ? searchTerm.toLowerCase()
          : ""

      const matchSearch =
        termo.length === 0 ||
        empresa.nome.toLowerCase().includes(termo) ||
        empresa.razaoSocial.toLowerCase().includes(termo) ||
        empresa.cnpj.toLowerCase().includes(termo)

      const matchStatus =
        statusFilter === "todas" || empresa.status === statusFilter

      const matchPlano =
        planoFilter === "todos" || empresa.plano === planoFilter

      return matchSearch && matchStatus && matchPlano
    })
  }, [empresas, searchTerm, statusFilter, planoFilter])

  const resetForm = () => {
    setNovoNome("")
    setNovoRazaoSocial("")
    setNovoCnpj("")
    setNovoEmail("")
    setNovoTelefone("")
    setNovoEndereco("")
    setNovoResponsavel("")
    setNovoPlano("basico")
    setNovoPacotesAdicionais(0)
    setNovoTipoFaturamento("mensal")
  }

  const handleCreateEmpresa = () => {
    if (!novoNome.trim() || !novoCnpj.trim() || !novoEmail.trim()) {
      toast({
        title: "Dados obrigatórios",
        description: "Nome, CNPJ e e-mail são obrigatórios.",
        variant: "destructive",
      })
      return
    }

    const usuariosTotal = calcularUsuariosTotalContrato(
      novoPlano,
      novoPlano === "enterprise" ? novoPacotesAdicionais : 0
    )

    const novoId =
      empresas.length > 0 ? Math.max(...empresas.map((e) => e.id)) + 1 : 1

    const hoje = new Date()
    const daquiUmMes = new Date()
    daquiUmMes.setMonth(daquiUmMes.getMonth() + 1)

    const novaEmpresa: Empresa = ajustarEmpresaContrato({
      id: novoId,
      nome: novoNome.trim(),
      razaoSocial: novoRazaoSocial.trim() || novoNome.trim(),
      cnpj: novoCnpj.trim(),
      email: novoEmail.trim(),
      telefone: novoTelefone.trim(),
      endereco: novoEndereco.trim(),
      responsavel: novoResponsavel.trim() || "Responsável não informado",
      plano: novoPlano,
      status: "ativa",
      usuariosAtivos: 0,
      usuariosTotal,
      treinamentosAtivos: 0,
      dataContratacao: hoje.toISOString().slice(0, 10),
      proximoVencimento: daquiUmMes.toISOString().slice(0, 10),
      logo: "",
      pacotesAdicionais: novoPlano === "enterprise" ? novoPacotesAdicionais : 0,
      tipoFaturamento: novoTipoFaturamento,
      statusPagamento: "ativo",
    })

    setEmpresas((prev) => [...prev, novaEmpresa])
    toast({
      title: "Empresa cadastrada",
      description: "A empresa foi cadastrada com sucesso.",
    })
    resetForm()
    setIsCreateOpen(false)
  }

  const atualizarEmpresa = (empresaAtualizada: Empresa) => {
    setEmpresas((prev) =>
      prev.map((e) =>
        e.id === empresaAtualizada.id
          ? ajustarEmpresaContrato(empresaAtualizada)
          : e
      )
    )
  }

  const handleToggleStatus = (empresaId: number, novoStatus: Empresa["status"]) => {
    setEmpresas((prev) =>
      prev.map((empresa) =>
        empresa.id === empresaId
          ? { ...empresa, status: novoStatus }
          : empresa
      )
    )
    toast({
      title: "Status atualizado",
      description: "O status da empresa foi atualizado.",
    })
  }

  const handleDelete = (empresaId: number) => {
    setEmpresas((prev) => prev.filter((empresa) => empresa.id !== empresaId))
    toast({
      title: "Empresa removida",
      description: "A empresa foi removida da gestão.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            Gestão de Empresas
          </h1>
          <p className="text-muted-foreground">
            Cadastre e gerencie as empresas contratantes, planos, limites e
            status de utilização da plataforma.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova empresa
        </Button>
      </div>

      {/* Cards de métricas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Empresas ativas
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAtivas}</div>
            <p className="text-xs text-muted-foreground">
              De {totalEmpresas} empresas cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuários ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsuariosAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Soma dos usuários ativos em todas as empresas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Treinamentos ativos
            </CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTreinamentos}</div>
            <p className="text-xs text-muted-foreground">
              Total de treinamentos publicados pelas empresas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contratos ativos
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                empresas.filter(
                  (e) => e.statusPagamento === "ativo" && e.status === "ativa"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Considerando status da empresa e do pagamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex-1 flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, razão social ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as Empresa["status"] | "todas")
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todos status</SelectItem>
                  <SelectItem value="ativa">Ativas</SelectItem>
                  <SelectItem value="inativa">Inativas</SelectItem>
                  <SelectItem value="suspensa">Suspensas</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={planoFilter}
                onValueChange={(value) =>
                  setPlanoFilter(value as PlanoEmpresa | "todos")
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos planos</SelectItem>
                  <SelectItem value="basico">Básico</SelectItem>
                  <SelectItem value="plus">Plus</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Empresas */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {empresasFiltradas.map((empresa) => (
          <Card key={empresa.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {empresa.nome}
                  {empresa.status === "ativa" && (
                    <Badge className="bg-emerald-500 text-white">Ativa</Badge>
                  )}
                  {empresa.status === "inativa" && (
                    <Badge variant="outline" className="border-slate-300">
                      Inativa
                    </Badge>
                  )}
                  {empresa.status === "suspensa" && (
                    <Badge className="bg-amber-500 text-white">Suspensa</Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-1">
                  {empresa.razaoSocial} • CNPJ: {empresa.cnpj}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Plano</p>
                  <p className="font-medium capitalize">{empresa.plano}</p>
                  <p className="text-xs text-muted-foreground">
                    Tipo de faturamento:{" "}
                    {empresa.tipoFaturamento === "anual" ? "Anual" : "Mensal"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Limite de cadastros
                  </p>
                  <p className="font-medium">
                    {empresa.usuariosAtivos}/{empresa.usuariosTotal} usuários
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Limite considera todos os cadastros (ativos + inativos).
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Treinamentos</p>
                  <p className="font-medium">
                    {empresa.treinamentosAtivos} ativos
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Contrato</p>
                  <p className="font-medium">
                    Desde {formatDate(empresa.dataContratacao)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Próx. vencimento: {formatDate(empresa.proximoVencimento)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t mt-2">
                <div className="flex flex-col text-xs text-muted-foreground">
                  <span>{empresa.email}</span>
                  <span>
                    {empresa.telefone} • Resp.: {empresa.responsavel}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setConfigEmpresa(empresa)}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Configurar
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      handleToggleStatus(
                        empresa.id,
                        empresa.status === "ativa" ? "inativa" : "ativa"
                      )
                    }
                  >
                    {empresa.status === "ativa" ? (
                      <PauseCircle className="h-4 w-4 text-amber-600" />
                    ) : (
                      <PlayCircle className="h-4 w-4 text-emerald-600" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(empresa.id)}
                  >
                    <XCircle className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de criação de empresa */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova empresa</DialogTitle>
            <DialogDescription>
              Cadastre uma nova empresa cliente e defina o plano e o limite
              inicial de cadastros de usuários.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome fantasia</Label>
                <Input
                  id="nome"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex.: Univida Santa Cruz"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="razaoSocial">Razão social</Label>
                <Input
                  id="razaoSocial"
                  value={novoRazaoSocial}
                  onChange={(e) => setNovoRazaoSocial(e.target.value)}
                  placeholder="Razão social da empresa"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={novoCnpj}
                  onChange={(e) => setNovoCnpj(e.target.value)}
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  placeholder="contato@empresa.com.br"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={novoTelefone}
                  onChange={(e) => setNovoTelefone(e.target.value)}
                  placeholder="(65) 0000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={novoResponsavel}
                  onChange={(e) => setNovoResponsavel(e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={novoEndereco}
                onChange={(e) => setNovoEndereco(e.target.value)}
                placeholder="Endereço completo"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Plano</Label>
                <Select
                  value={novoPlano}
                  onValueChange={(value) =>
                    setNovoPlano(value as PlanoEmpresa)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basico">Básico</SelectItem>
                    <SelectItem value="plus">Plus</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipoFaturamento">Faturamento</Label>
                <Select
                  value={novoTipoFaturamento}
                  onValueChange={(value) =>
                    setNovoTipoFaturamento(value as "mensal" | "anual")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de faturamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensal">Mensal</SelectItem>
                    <SelectItem value="anual">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pacotesAdicionais">
                  Pacotes adicionais (Enterprise)
                </Label>
                <Input
                  id="pacotesAdicionais"
                  type="number"
                  min={0}
                  disabled={novoPlano !== "enterprise"}
                  value={novoPacotesAdicionais}
                  onChange={(e) =>
                    setNovoPacotesAdicionais(
                      Math.max(0, Number(e.target.value) || 0)
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Cada pacote adiciona {USUARIOS_POR_PACOTE} cadastros.
                </p>
              </div>
            </div>

            <div className="rounded-md border p-3 text-xs text-muted-foreground">
              <p>
                Limite estimado de cadastros de usuários para esta empresa:{" "}
                <strong>
                  {calcularUsuariosTotalContrato(
                    novoPlano,
                    novoPlano === "enterprise" ? novoPacotesAdicionais : 0
                  )}
                </strong>{" "}
                (contando usuários ativos e inativos).
              </p>
              <p className="mt-1">
                Alterações futuras nos planos mestres não alterarão
                automaticamente os limites já contratados pelas empresas.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              onClick={() => {
                resetForm()
                setIsCreateOpen(false)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateEmpresa}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de configuração da empresa */}
      <EmpresaConfigModal
        empresa={configEmpresa}
        open={configEmpresa !== null}
        onOpenChange={(open) => {
          if (!open) setConfigEmpresa(null)
        }}
        onUpdate={atualizarEmpresa}
      />
    </div>
  )
}
