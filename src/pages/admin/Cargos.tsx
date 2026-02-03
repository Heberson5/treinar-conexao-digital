import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Briefcase,
  Building2,
  Loader2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useEmpresaFilter } from "@/contexts/empresa-filter-context"

interface Cargo {
  id: string
  nome: string
  descricao: string | null
  empresa_id: string | null
  empresa_nome?: string
  ativo: boolean
}

interface Empresa {
  id: string
  nome: string
  nome_fantasia: string | null
}

export default function Cargos() {
  const { toast } = useToast()
  const { user } = useAuth()
  const { isMaster } = useEmpresaFilter()
  
  const [cargos, setCargos] = useState<Cargo[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [newCargo, setNewCargo] = useState({
    nome: "",
    descricao: "",
    empresa_id: ""
  })

  // Carregar dados
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Carregar cargos
        const { data: cargosData, error: cargosError } = await supabase
          .from("cargos")
          .select("*")
          .order("nome")

        if (cargosError) {
          console.error("Erro ao carregar cargos:", cargosError)
          toast({
            title: "Erro",
            description: "Não foi possível carregar os cargos.",
            variant: "destructive"
          })
        }

        // Carregar empresas
        const { data: empresasData, error: empresasError } = await supabase
          .from("empresas")
          .select("id, nome, nome_fantasia")
          .eq("ativo", true)

        if (empresasError) {
          console.error("Erro ao carregar empresas:", empresasError)
        }

        if (empresasData) setEmpresas(empresasData)

        // Montar lista de cargos com nome da empresa
        const cargosList: Cargo[] = (cargosData || []).map((cargo) => {
          const empresa = empresasData?.find((e) => e.id === cargo.empresa_id)
          return {
            ...cargo,
            empresa_nome: empresa?.nome_fantasia || empresa?.nome || "Global (todas empresas)"
          }
        })

        setCargos(cargosList)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [toast])

  const resetForm = () => {
    setNewCargo({
      nome: "",
      descricao: "",
      empresa_id: isMaster ? "" : (user?.empresa_id || "")
    })
    setEditingCargo(null)
  }

  const handleOpenCreate = () => {
    resetForm()
    if (!isMaster && user?.empresa_id) {
      setNewCargo(prev => ({ ...prev, empresa_id: user.empresa_id || "" }))
    }
    setIsCreateOpen(true)
  }

  const handleCreate = async () => {
    if (!newCargo.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do cargo é obrigatório.",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)

    try {
      const { data, error } = await supabase
        .from("cargos")
        .insert({
          nome: newCargo.nome.trim(),
          descricao: newCargo.descricao.trim() || null,
          empresa_id: newCargo.empresa_id || null
        })
        .select()
        .single()

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível criar o cargo.",
          variant: "destructive"
        })
        return
      }

      const empresa = empresas.find((e) => e.id === newCargo.empresa_id)
      setCargos([...cargos, {
        ...data,
        empresa_nome: empresa?.nome_fantasia || empresa?.nome || "Global (todas empresas)"
      }])

      setIsCreateOpen(false)
      resetForm()
      
      toast({
        title: "Cargo criado!",
        description: "O cargo foi criado com sucesso."
      })
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o cargo.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (cargo: Cargo) => {
    setEditingCargo(cargo)
    setNewCargo({
      nome: cargo.nome,
      descricao: cargo.descricao || "",
      empresa_id: cargo.empresa_id || ""
    })
    setIsCreateOpen(true)
  }

  const handleUpdate = async () => {
    if (!editingCargo || !newCargo.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome do cargo é obrigatório.",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)

    try {
      const { error } = await supabase
        .from("cargos")
        .update({
          nome: newCargo.nome.trim(),
          descricao: newCargo.descricao.trim() || null,
          empresa_id: newCargo.empresa_id || null
        })
        .eq("id", editingCargo.id)

      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o cargo.",
          variant: "destructive"
        })
        return
      }

      const empresa = empresas.find((e) => e.id === newCargo.empresa_id)
      setCargos(cargos.map(c => 
        c.id === editingCargo.id 
          ? { 
              ...c, 
              nome: newCargo.nome.trim(),
              descricao: newCargo.descricao.trim() || null,
              empresa_id: newCargo.empresa_id || null,
              empresa_nome: empresa?.nome_fantasia || empresa?.nome || "Global (todas empresas)"
            }
          : c
      ))
      
      setIsCreateOpen(false)
      resetForm()
      
      toast({
        title: "Cargo atualizado!",
        description: "O cargo foi atualizado com sucesso."
      })
    } catch (error) {
      console.error("Erro:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o cargo.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("cargos")
      .delete()
      .eq("id", id)

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o cargo.",
        variant: "destructive"
      })
      return
    }

    setCargos(cargos.filter(c => c.id !== id))
    toast({
      title: "Cargo excluído",
      description: "O cargo foi removido com sucesso."
    })
  }

  const toggleStatus = async (cargo: Cargo) => {
    const novoStatus = !cargo.ativo

    const { error } = await supabase
      .from("cargos")
      .update({ ativo: novoStatus })
      .eq("id", cargo.id)

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status.",
        variant: "destructive"
      })
      return
    }

    setCargos(cargos.map(c => 
      c.id === cargo.id 
        ? { ...c, ativo: novoStatus }
        : c
    ))

    toast({
      title: "Status atualizado",
      description: `Cargo ${novoStatus ? "ativado" : "desativado"} com sucesso.`
    })
  }

  const filteredCargos = cargos.filter(cargo =>
    cargo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cargo.descricao?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (cargo.empresa_nome?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Cargos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os cargos disponíveis no sistema
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary" onClick={handleOpenCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cargo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCargo ? "Editar Cargo" : "Criar Novo Cargo"}
              </DialogTitle>
              <DialogDescription>
                {editingCargo ? "Atualize as informações do cargo." : "Preencha as informações do novo cargo."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Cargo *</Label>
                <Input
                  id="nome"
                  value={newCargo.nome}
                  onChange={(e) => setNewCargo({...newCargo, nome: e.target.value})}
                  placeholder="Ex: Analista de Vendas"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={newCargo.descricao}
                  onChange={(e) => setNewCargo({...newCargo, descricao: e.target.value})}
                  placeholder="Descrição das responsabilidades"
                />
              </div>
              
              {isMaster && (
                <div className="space-y-2">
                  <Label htmlFor="empresa">Empresa</Label>
                  <Select
                    value={newCargo.empresa_id}
                    onValueChange={(value) => setNewCargo({...newCargo, empresa_id: value})}
                  >
                    <SelectTrigger id="empresa">
                      <SelectValue placeholder="Global (todas empresas)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Global (todas empresas)</SelectItem>
                      {empresas.map((empresa) => (
                        <SelectItem key={empresa.id} value={empresa.id}>
                          {empresa.nome_fantasia || empresa.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Cargos globais ficam disponíveis para todas as empresas.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSaving}>
                Cancelar
              </Button>
              <Button 
                onClick={editingCargo ? handleUpdate : handleCreate} 
                className="bg-gradient-primary"
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingCargo ? "Atualizar" : "Criar Cargo"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{cargos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Briefcase className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{cargos.filter(c => c.ativo).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Globais</p>
                <p className="text-2xl font-bold">{cargos.filter(c => !c.empresa_id).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cargos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Cargos List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Cargos</CardTitle>
          <CardDescription>
            Gerencie todos os cargos cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCargos.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum cargo encontrado.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredCargos.map((cargo) => (
                <div key={cargo.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{cargo.nome}</h4>
                        <Badge variant={cargo.ativo ? "default" : "secondary"}>
                          {cargo.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                        {!cargo.empresa_id && (
                          <Badge variant="outline" className="border-purple-500 text-purple-600">
                            Global
                          </Badge>
                        )}
                      </div>
                      {cargo.descricao && (
                        <p className="text-sm text-muted-foreground">{cargo.descricao}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {cargo.empresa_nome}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toggleStatus(cargo)}
                    >
                      {cargo.ativo ? "Desativar" : "Ativar"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(cargo)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(cargo.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}