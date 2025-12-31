import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Check, 
  Users, 
  Pencil, 
  X, 
  Save,
  EyeOff,
  Shield,
  Settings2,
  Infinity,
  Calendar,
  Percent
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { usePlans, ICONES_PLANOS, Plano, RECURSOS_SISTEMA, RecursoPlano, RecursoId } from "@/contexts/plans-context"
import { toast } from "@/hooks/use-toast"

export default function Planos() {
  const { planos, atualizarPlano, recursosSistema, descontoAnual, atualizarDescontoAnual, calcularPrecoAnual } = usePlans()
  const [editandoPlano, setEditandoPlano] = useState<Plano | null>(null)
  const [formData, setFormData] = useState<Partial<Plano>>({})

  const handleEdit = (plano: Plano) => {
    setEditandoPlano(plano)
    setFormData({ ...plano })
  }

  const handleSave = () => {
    if (editandoPlano && formData) {
      atualizarPlano(editandoPlano.id, formData)
      toast({
        title: "Plano atualizado",
        description: `O plano ${formData.nome} foi atualizado com sucesso.`
      })
      setEditandoPlano(null)
      setFormData({})
    }
  }

  const handleToggleAtivo = (plano: Plano) => {
    atualizarPlano(plano.id, { ativo: !plano.ativo })
    toast({
      title: plano.ativo ? "Plano desativado" : "Plano ativado",
      description: plano.ativo 
        ? `O plano ${plano.nome} foi desativado e não aparecerá mais na página inicial.`
        : `O plano ${plano.nome} foi ativado e agora aparecerá na página inicial.`
    })
  }

  const handleToggleRecurso = (recursoId: RecursoId, habilitado: boolean) => {
    setFormData(prev => ({
      ...prev,
      recursos: (prev.recursos || []).map(r => 
        r.recursoId === recursoId ? { ...r, habilitado } : r
      )
    }))
  }

  const handleUpdateRecursoLimite = (recursoId: RecursoId, limite: number | undefined) => {
    setFormData(prev => ({
      ...prev,
      recursos: (prev.recursos || []).map(r => 
        r.recursoId === recursoId ? { ...r, limite } : r
      )
    }))
  }

  const handleUpdateRecursoDescricao = (recursoId: RecursoId, descricaoCustomizada: string) => {
    setFormData(prev => ({
      ...prev,
      recursos: (prev.recursos || []).map(r => 
        r.recursoId === recursoId ? { ...r, descricaoCustomizada } : r
      )
    }))
  }

  const getIconComponent = (iconName: string) => {
    return ICONES_PLANOS[iconName] || Users
  }

  const getRecursoFromForm = (recursoId: RecursoId): RecursoPlano | undefined => {
    return formData.recursos?.find(r => r.recursoId === recursoId)
  }

  const categorias = [
    { id: "usuarios", nome: "Usuários" },
    { id: "treinamento", nome: "Treinamento" },
    { id: "relatorios", nome: "Relatórios" },
    { id: "suporte", nome: "Suporte" },
    { id: "integracao", nome: "Integrações" },
    { id: "enterprise", nome: "Enterprise" }
  ]

  const getRecursosHabilitadosCount = (plano: Plano) => {
    return plano.recursos.filter(r => r.habilitado).length
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuração de Planos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os planos, valores, recursos e permissões. As alterações são refletidas automaticamente na página inicial.
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Shield className="h-4 w-4" />
          Acesso Master
        </Badge>
      </div>

      {/* Alerta sobre planos inativos */}
      <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <EyeOff className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">Sobre planos desativados</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Quando um plano é desativado, ele não aparece mais na página inicial de divulgação, 
                mas as empresas que já estão com esse plano continuam funcionando normalmente.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerta sobre recursos */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Settings2 className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 dark:text-blue-200">Recursos integrados com permissões</p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Os recursos configurados aqui são vinculados às permissões do sistema. Por exemplo, 
                certificados ilimitados só estão disponíveis nos planos Premium e Enterprise, 
                enquanto os planos Básico e Plus possuem limites mensais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuração de Desconto Anual */}
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="space-y-2">
                <p className="font-medium text-green-800 dark:text-green-200">Desconto para Pagamento Anual</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Configure o percentual de desconto para clientes que optarem pelo pagamento anual. 
                  Este desconto será aplicado automaticamente na página de divulgação.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="percentualDesconto" className="text-sm whitespace-nowrap">Desconto:</Label>
                <div className="relative w-20">
                  <Input
                    id="percentualDesconto"
                    type="number"
                    min={0}
                    max={50}
                    value={descontoAnual.percentual}
                    onChange={(e) => atualizarDescontoAnual({ percentual: Math.min(50, Math.max(0, parseInt(e.target.value) || 0)) })}
                    className="pr-7"
                    disabled={!descontoAnual.habilitado}
                  />
                  <Percent className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <Switch
                checked={descontoAnual.habilitado}
                onCheckedChange={(checked) => {
                  atualizarDescontoAnual({ habilitado: checked })
                  toast({
                    title: checked ? "Desconto anual habilitado" : "Desconto anual desabilitado",
                    description: checked 
                      ? `Desconto de ${descontoAnual.percentual}% será exibido na página inicial.`
                      : "A opção de pagamento anual foi removida da página inicial."
                  })
                }}
              />
            </div>
          </div>
          
          {descontoAnual.habilitado && (
            <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
              <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">Prévia dos valores com desconto:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {planos.filter(p => p.ativo).map(plano => {
                  const { precoAnual, precoComDesconto, economia } = calcularPrecoAnual(plano.preco)
                  return (
                    <div key={plano.id} className="p-3 bg-white dark:bg-green-900/30 rounded-lg">
                      <p className="font-medium text-sm">{plano.nome}</p>
                      <p className="text-xs text-muted-foreground line-through">
                        R$ {precoAnual.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        R$ {precoComDesconto.toFixed(2).replace('.', ',')}
                      </p>
                      <p className="text-xs text-green-600">
                        Economia: R$ {economia.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Planos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {planos.map((plano) => {
          const IconComponent = getIconComponent(plano.icon)
          const recursosHabilitados = plano.recursos.filter(r => r.habilitado)
          
          return (
            <Card 
              key={plano.id} 
              className={`relative ${!plano.ativo ? 'opacity-60 border-dashed' : ''} ${plano.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {plano.popular && plano.ativo && (
                <Badge className="absolute -top-3 left-4 bg-primary">
                  Mais Popular
                </Badge>
              )}

              {!plano.ativo && (
                <Badge variant="secondary" className="absolute -top-3 left-4">
                  Desativado
                </Badge>
              )}
              
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${plano.cor} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{plano.nome}</CardTitle>
                      <p className="text-2xl font-bold mt-1">
                        R$ {plano.preco.toFixed(2).replace('.', ',')}
                        <span className="text-sm font-normal text-muted-foreground">{plano.periodo}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={plano.ativo}
                      onCheckedChange={() => handleToggleAtivo(plano)}
                    />
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(plano)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="mt-2">{plano.descricao}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {plano.id === "enterprise" 
                      ? `${plano.limiteUsuarios} usuários + pacotes adicionais` 
                      : `Até ${plano.limiteUsuarios} usuários`}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span>{getRecursosHabilitadosCount(plano)} recursos habilitados</span>
                </div>

                {plano.id === "enterprise" && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">Pacotes Adicionais</p>
                    <p className="text-amber-700 dark:text-amber-300">
                      R$ {plano.precoPacoteAdicional?.toFixed(2).replace('.', ',')}/mês por pacote de {plano.usuariosPorPacote} usuários
                    </p>
                  </div>
                )}
                
                <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                  {recursosHabilitados.map((recurso) => (
                    <li key={recurso.recursoId} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{recurso.descricaoCustomizada || recursosSistema.find(r => r.id === recurso.recursoId)?.nome}</span>
                      {recurso.limite !== undefined && (
                        <Badge variant="secondary" className="text-xs ml-auto">
                          Limite: {recurso.limite}
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={editandoPlano !== null} onOpenChange={(open) => !open && setEditandoPlano(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plano - {editandoPlano?.nome}</DialogTitle>
            <DialogDescription>
              Altere as configurações do plano. As mudanças serão refletidas na página inicial e nas permissões do sistema.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="geral" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="geral">Informações Gerais</TabsTrigger>
              <TabsTrigger value="recursos">Recursos e Permissões</TabsTrigger>
            </TabsList>

            <TabsContent value="geral" className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Plano</Label>
                  <Input
                    id="nome"
                    value={formData.nome || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preco">Preço (R$)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={formData.preco || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, preco: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="limiteUsuarios">Limite de Usuários Base</Label>
                  <Input
                    id="limiteUsuarios"
                    type="number"
                    value={formData.limiteUsuarios || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, limiteUsuarios: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="periodo">Período</Label>
                  <Input
                    id="periodo"
                    value={formData.periodo || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, periodo: e.target.value }))}
                    placeholder="/mês, /ano, etc"
                  />
                </div>
              </div>

              {editandoPlano?.id === "enterprise" && (
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="precoPacote">Preço do Pacote Adicional (R$)</Label>
                    <Input
                      id="precoPacote"
                      type="number"
                      step="0.01"
                      value={formData.precoPacoteAdicional || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, precoPacoteAdicional: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usuariosPacote">Usuários por Pacote</Label>
                    <Input
                      id="usuariosPacote"
                      type="number"
                      value={formData.usuariosPorPacote || 5}
                      onChange={(e) => setFormData(prev => ({ ...prev, usuariosPorPacote: parseInt(e.target.value) || 5 }))}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="popular"
                    checked={formData.popular || false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, popular: checked }))}
                  />
                  <Label htmlFor="popular">Marcar como Popular</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="ativo"
                    checked={formData.ativo !== false}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                  />
                  <Label htmlFor="ativo">Plano Ativo</Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="recursos" className="space-y-6 py-4">
              <div className="space-y-6">
                {categorias.map(categoria => {
                  const recursosCategoria = recursosSistema.filter(r => r.categoria === categoria.id)
                  if (recursosCategoria.length === 0) return null

                  return (
                    <div key={categoria.id} className="space-y-3">
                      <h3 className="font-semibold text-lg border-b pb-2">{categoria.nome}</h3>
                      <div className="space-y-3">
                        {recursosCategoria.map(recurso => {
                          const recursoPlano = getRecursoFromForm(recurso.id)
                          const habilitado = recursoPlano?.habilitado ?? false
                          const limite = recursoPlano?.limite
                          const descricaoCustomizada = recursoPlano?.descricaoCustomizada || ""

                          return (
                            <div key={recurso.id} className="p-4 border rounded-lg space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    id={recurso.id}
                                    checked={habilitado}
                                    onCheckedChange={(checked) => handleToggleRecurso(recurso.id, !!checked)}
                                  />
                                  <div>
                                    <Label htmlFor={recurso.id} className="font-medium cursor-pointer">
                                      {recurso.nome}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">{recurso.descricao}</p>
                                  </div>
                                </div>
                                {habilitado && (
                                  <Badge variant={limite === undefined ? "default" : "secondary"}>
                                    {limite === undefined ? (
                                      <span className="flex items-center gap-1">
                                        <Infinity className="h-3 w-3" /> Ilimitado
                                      </span>
                                    ) : (
                                      `Limite: ${limite}`
                                    )}
                                  </Badge>
                                )}
                              </div>

                              {habilitado && (
                                <div className="pl-7 grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label className="text-sm">Limite (deixe vazio para ilimitado)</Label>
                                    <Input
                                      type="number"
                                      placeholder="Ilimitado"
                                      value={limite ?? ""}
                                      onChange={(e) => handleUpdateRecursoLimite(
                                        recurso.id, 
                                        e.target.value ? parseInt(e.target.value) : undefined
                                      )}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-sm">Descrição para exibição</Label>
                                    <Input
                                      placeholder={recurso.nome}
                                      value={descricaoCustomizada}
                                      onChange={(e) => handleUpdateRecursoDescricao(recurso.id, e.target.value)}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setEditandoPlano(null)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
