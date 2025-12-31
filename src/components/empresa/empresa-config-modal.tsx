import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  CreditCard, 
  Users, 
  Settings, 
  Shield, 
  Calendar,
  Building2,
  AlertCircle,
  Check,
  X,
  ExternalLink,
  UserCheck,
  Crown,
  User
} from "lucide-react"
import { usePlans } from "@/contexts/plans-context"
import { toast } from "@/hooks/use-toast"

interface Usuario {
  id: number
  nome: string
  email: string
  cargo: string
  permissao: "admin" | "gestor" | "usuario"
  status: "ativo" | "inativo"
  avatar?: string
}

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

interface EmpresaConfigModalProps {
  empresa: Empresa | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (empresa: Empresa) => void
}

// Mock de usuários para demonstração
const mockUsuarios: Usuario[] = [
  { id: 1, nome: "Heber Sohas", email: "heber@empresa.com", cargo: "Diretor", permissao: "admin", status: "ativo" },
  { id: 2, nome: "Maria Silva", email: "maria@empresa.com", cargo: "Gerente RH", permissao: "gestor", status: "ativo" },
  { id: 3, nome: "João Santos", email: "joao@empresa.com", cargo: "Analista", permissao: "usuario", status: "ativo" },
  { id: 4, nome: "Ana Costa", email: "ana@empresa.com", cargo: "Coordenadora", permissao: "gestor", status: "inativo" },
]

export function EmpresaConfigModal({ empresa, open, onOpenChange, onUpdate }: EmpresaConfigModalProps) {
  const { planos, getPlanoById, descontoAnual, calcularPrecoAnual } = usePlans()
  const [planoSelecionado, setPlanoSelecionado] = useState(empresa?.plano || "basico")
  const [tipoFaturamento, setTipoFaturamento] = useState<"mensal" | "anual">(empresa?.tipoFaturamento || "mensal")
  const [pacotesAdicionais, setPacotesAdicionais] = useState(empresa?.pacotesAdicionais || 0)
  const [usuarios] = useState<Usuario[]>(mockUsuarios)
  const [isSaving, setIsSaving] = useState(false)

  if (!empresa) return null

  const planoAtual = getPlanoById(empresa.plano)
  const planoNovo = getPlanoById(planoSelecionado)

  const handleSave = () => {
    setIsSaving(true)
    
    // Simular salvamento
    setTimeout(() => {
      onUpdate({
        ...empresa,
        plano: planoSelecionado as any,
        tipoFaturamento,
        pacotesAdicionais: planoSelecionado === "enterprise" ? pacotesAdicionais : 0
      })
      
      toast({
        title: "Configurações salvas",
        description: "As configurações da empresa foram atualizadas com sucesso."
      })
      
      setIsSaving(false)
      onOpenChange(false)
    }, 1000)
  }

  const handleConfigurarPagamento = () => {
    toast({
      title: "Integração Mercado Pago",
      description: "Redirecionando para configuração de pagamento recorrente...",
    })
    // Aqui seria a integração com Mercado Pago
  }

  const getPermissaoLabel = (permissao: string) => {
    switch (permissao) {
      case "admin": return "Administrador"
      case "gestor": return "Gestor"
      case "usuario": return "Usuário"
      default: return permissao
    }
  }

  const getPermissaoIcon = (permissao: string) => {
    switch (permissao) {
      case "admin": return Crown
      case "gestor": return Shield
      default: return User
    }
  }

  const getPermissaoColor = (permissao: string) => {
    switch (permissao) {
      case "admin": return "bg-amber-500"
      case "gestor": return "bg-blue-500"
      default: return "bg-slate-500"
    }
  }

  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const calcularValor = () => {
    if (!planoNovo) return { mensal: 0, anual: 0 }
    
    let valorBase = planoNovo.preco
    
    if (planoSelecionado === "enterprise" && pacotesAdicionais > 0) {
      valorBase += (planoNovo.precoPacoteAdicional || 150) * pacotesAdicionais
    }
    
    const { precoComDesconto } = calcularPrecoAnual(valorBase)
    
    return {
      mensal: valorBase,
      anual: precoComDesconto
    }
  }

  const valores = calcularValor()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={empresa.logo} alt={empresa.nome} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(empresa.nome)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl">Configurações - {empresa.nome}</DialogTitle>
              <DialogDescription>
                {empresa.razaoSocial} • CNPJ: {empresa.cnpj}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="plano" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plano" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Plano
            </TabsTrigger>
            <TabsTrigger value="faturamento" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Faturamento
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
          </TabsList>

          {/* Aba Plano */}
          <TabsContent value="plano" className="space-y-6 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plano Atual</CardTitle>
                <CardDescription>
                  Gerencie o plano contratado pela empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{planoAtual?.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      {planoAtual?.limiteUsuarios} usuários base
                      {empresa.pacotesAdicionais && empresa.pacotesAdicionais > 0 && 
                        ` + ${empresa.pacotesAdicionais * 5} adicionais`
                      }
                    </p>
                  </div>
                  <Badge className={planoAtual?.cor + " text-white"}>
                    {planoAtual?.nome}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <Label>Alterar Plano</Label>
                  <Select value={planoSelecionado} onValueChange={(value: any) => setPlanoSelecionado(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {planos.filter(p => p.ativo).map(plano => (
                        <SelectItem key={plano.id} value={plano.id}>
                          {plano.nome} - R$ {plano.preco.toFixed(2).replace('.', ',')}/mês ({plano.limiteUsuarios} usuários)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {planoSelecionado === "enterprise" && (
                  <div className="space-y-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                    <Label>Pacotes Adicionais de Usuários</Label>
                    <p className="text-sm text-muted-foreground">
                      Cada pacote adiciona 5 usuários por R$ {planoNovo?.precoPacoteAdicional?.toFixed(2).replace('.', ',')}/mês
                    </p>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min={0}
                        value={pacotesAdicionais}
                        onChange={(e) => setPacotesAdicionais(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-24"
                      />
                      <span className="text-sm">
                        Total: {(planoNovo?.limiteUsuarios || 50) + (pacotesAdicionais * 5)} usuários
                      </span>
                    </div>
                  </div>
                )}

                {planoSelecionado !== empresa.plano && (
                  <Card className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-orange-800 dark:text-orange-200">
                            Alteração de plano
                          </p>
                          <p className="text-sm text-orange-700 dark:text-orange-300">
                            Ao alterar o plano, o novo valor será aplicado no próximo ciclo de faturamento.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Faturamento */}
          <TabsContent value="faturamento" className="space-y-6 py-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tipo de Faturamento</CardTitle>
                <CardDescription>
                  Configure o ciclo de pagamento da empresa
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card 
                    className={`cursor-pointer transition-all ${tipoFaturamento === 'mensal' ? 'border-primary ring-2 ring-primary' : 'hover:border-primary/50'}`}
                    onClick={() => setTipoFaturamento("mensal")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Mensal</span>
                        {tipoFaturamento === 'mensal' && <Check className="h-5 w-5 text-primary" />}
                      </div>
                      <p className="text-2xl font-bold">
                        R$ {valores.mensal.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-sm text-muted-foreground">/mês</p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-all ${tipoFaturamento === 'anual' ? 'border-primary ring-2 ring-primary' : 'hover:border-primary/50'} ${!descontoAnual.habilitado ? 'opacity-50 pointer-events-none' : ''}`}
                    onClick={() => descontoAnual.habilitado && setTipoFaturamento("anual")}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Anual</span>
                        {descontoAnual.habilitado && (
                          <Badge className="bg-green-500 text-white text-xs">
                            -{descontoAnual.percentual}%
                          </Badge>
                        )}
                        {tipoFaturamento === 'anual' && <Check className="h-5 w-5 text-primary" />}
                      </div>
                      <p className="text-2xl font-bold">
                        R$ {valores.anual.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-sm text-muted-foreground">/ano</p>
                      {descontoAnual.habilitado && (
                        <p className="text-xs text-green-600 mt-1">
                          Economia de R$ {((valores.mensal * 12) - valores.anual).toFixed(2).replace('.', ',')}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <CreditCard className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-800 dark:text-blue-200">
                            Pagamento Recorrente
                          </p>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Configure a cobrança automática via Mercado Pago para ativar o plano automaticamente após o pagamento.
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={handleConfigurarPagamento}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Configurar
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Status do Pagamento</p>
                    <p className="text-sm text-muted-foreground">Última cobrança realizada com sucesso</p>
                  </div>
                  <Badge className="bg-green-500 text-white">Ativo</Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Usuários */}
          <TabsContent value="usuarios" className="space-y-6 py-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Usuários Cadastrados</CardTitle>
                    <CardDescription>
                      {usuarios.filter(u => u.status === 'ativo').length} de {empresa.usuariosTotal} usuários ativos
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    <Users className="h-4 w-4 mr-1" />
                    {usuarios.length} total
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {usuarios.map((usuario) => {
                    const PermissaoIcon = getPermissaoIcon(usuario.permissao)
                    
                    return (
                      <div 
                        key={usuario.id} 
                        className={`flex items-center justify-between p-4 rounded-lg border ${usuario.status === 'inativo' ? 'opacity-60 bg-muted' : 'bg-background'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={usuario.avatar} alt={usuario.nome} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(usuario.nome)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{usuario.nome}</p>
                            <p className="text-sm text-muted-foreground">{usuario.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{usuario.cargo}</span>
                          <Badge className={`${getPermissaoColor(usuario.permissao)} text-white`}>
                            <PermissaoIcon className="h-3 w-3 mr-1" />
                            {getPermissaoLabel(usuario.permissao)}
                          </Badge>
                          <Badge variant={usuario.status === 'ativo' ? 'default' : 'secondary'}>
                            {usuario.status === 'ativo' ? (
                              <><Check className="h-3 w-3 mr-1" /> Ativo</>
                            ) : (
                              <><X className="h-3 w-3 mr-1" /> Inativo</>
                            )}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>{empresa.usuariosTotal - usuarios.filter(u => u.status === 'ativo').length}</strong> vagas disponíveis
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Limite do plano: {empresa.usuariosTotal} usuários
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}