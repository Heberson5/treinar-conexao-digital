import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { 
  Check, 
  Users, 
  Zap, 
  Crown, 
  Building2, 
  Pencil, 
  X, 
  Plus, 
  Trash2,
  Save,
  Eye,
  EyeOff
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { usePlans, ICONES_PLANOS, Plano } from "@/contexts/plans-context"
import { toast } from "@/hooks/use-toast"

export default function Planos() {
  const { planos, atualizarPlano, adicionarRecurso, removerRecurso } = usePlans()
  const [editandoPlano, setEditandoPlano] = useState<Plano | null>(null)
  const [novoRecurso, setNovoRecurso] = useState("")
  const [formData, setFormData] = useState<Partial<Plano>>({})

  const handleEdit = (plano: Plano) => {
    setEditandoPlano(plano)
    setFormData({ ...plano })
    setNovoRecurso("")
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

  const handleAddRecurso = () => {
    if (novoRecurso.trim() && editandoPlano) {
      setFormData(prev => ({
        ...prev,
        recursos: [...(prev.recursos || []), novoRecurso.trim()]
      }))
      setNovoRecurso("")
    }
  }

  const handleRemoveRecurso = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recursos: (prev.recursos || []).filter((_, i) => i !== index)
    }))
  }

  const getIconComponent = (iconName: string) => {
    return ICONES_PLANOS[iconName] || Users
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuração de Planos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os planos, valores e configurações. As alterações são refletidas automaticamente na página inicial.
          </p>
        </div>
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

      {/* Planos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {planos.map((plano) => {
          const IconComponent = getIconComponent(plano.icon)
          
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

                {plano.id === "enterprise" && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg text-sm">
                    <p className="font-medium text-amber-800 dark:text-amber-200">Pacotes Adicionais</p>
                    <p className="text-amber-700 dark:text-amber-300">
                      R$ {plano.precoPacoteAdicional?.toFixed(2).replace('.', ',')}/mês por pacote de {plano.usuariosPorPacote} usuários
                    </p>
                  </div>
                )}
                
                <ul className="space-y-1.5 max-h-40 overflow-y-auto">
                  {plano.recursos.map((recurso, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{recurso}</span>
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Plano - {editandoPlano?.nome}</DialogTitle>
            <DialogDescription>
              Altere as configurações do plano. As mudanças serão refletidas na página inicial.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
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
                <Label htmlFor="limiteUsuarios">Limite de Usuários</Label>
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

            <div className="space-y-3">
              <Label>Recursos do Plano</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar novo recurso..."
                  value={novoRecurso}
                  onChange={(e) => setNovoRecurso(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddRecurso()}
                />
                <Button type="button" onClick={handleAddRecurso} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <ul className="space-y-2 max-h-48 overflow-y-auto">
                {(formData.recursos || []).map((recurso, index) => (
                  <li key={index} className="flex items-center justify-between gap-2 p-2 bg-muted rounded">
                    <span className="text-sm">{recurso}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => handleRemoveRecurso(index)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex justify-end gap-3">
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
