import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Briefcase,
  Building2
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Cargo {
  id: number
  nome: string
  descricao: string
  departamento: string
  ativo: boolean
}

const cargosIniciais: Cargo[] = [
  { id: 1, nome: "Administrador Master", descricao: "Controle total do sistema", departamento: "TI", ativo: true },
  { id: 2, nome: "Analista de RH", descricao: "Gestão de recursos humanos", departamento: "RH", ativo: true },
  { id: 3, nome: "Vendedor", descricao: "Vendas e atendimento", departamento: "Vendas", ativo: true },
  { id: 4, nome: "Gerente de Vendas", descricao: "Gestão da equipe de vendas", departamento: "Vendas", ativo: true },
  { id: 5, nome: "Analista Financeiro", descricao: "Análise financeira", departamento: "Financeiro", ativo: true }
]

export default function Cargos() {
  const [cargos, setCargos] = useState<Cargo[]>(cargosIniciais)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCargo, setEditingCargo] = useState<Cargo | null>(null)
  const { toast } = useToast()

  const [newCargo, setNewCargo] = useState({
    nome: "",
    descricao: "",
    departamento: ""
  })

  const resetForm = () => {
    setNewCargo({
      nome: "",
      descricao: "",
      departamento: ""
    })
    setEditingCargo(null)
  }

  const handleCreate = () => {
    if (!newCargo.nome || !newCargo.departamento) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e departamento são obrigatórios",
        variant: "destructive"
      })
      return
    }

    const cargo: Cargo = {
      id: Date.now(),
      ...newCargo,
      ativo: true
    }

    setCargos([...cargos, cargo])
    setIsCreateOpen(false)
    resetForm()
    
    toast({
      title: "Cargo criado!",
      description: "O cargo foi criado com sucesso."
    })
  }

  const handleEdit = (cargo: Cargo) => {
    setEditingCargo(cargo)
    setNewCargo({
      nome: cargo.nome,
      descricao: cargo.descricao,
      departamento: cargo.departamento
    })
    setIsCreateOpen(true)
  }

  const handleUpdate = () => {
    if (!editingCargo) return

    setCargos(cargos.map(c => 
      c.id === editingCargo.id 
        ? { ...editingCargo, ...newCargo }
        : c
    ))
    
    setIsCreateOpen(false)
    resetForm()
    
    toast({
      title: "Cargo atualizado!",
      description: "O cargo foi atualizado com sucesso."
    })
  }

  const handleDelete = (id: number) => {
    setCargos(cargos.filter(c => c.id !== id))
    toast({
      title: "Cargo excluído",
      description: "O cargo foi removido com sucesso."
    })
  }

  const toggleStatus = (id: number) => {
    setCargos(cargos.map(cargo => 
      cargo.id === id 
        ? { ...cargo, ativo: !cargo.ativo }
        : cargo
    ))
  }

  const filteredCargos = cargos.filter(cargo =>
    cargo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cargo.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cargo.departamento.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <Button className="bg-gradient-primary">
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
              
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento *</Label>
                <Input
                  id="departamento"
                  value={newCargo.departamento}
                  onChange={(e) => setNewCargo({...newCargo, departamento: e.target.value})}
                  placeholder="Ex: Vendas, RH, TI"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={editingCargo ? handleUpdate : handleCreate} className="bg-gradient-primary">
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
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
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
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
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
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departamentos</p>
                <p className="text-2xl font-bold">{new Set(cargos.map(c => c.departamento)).size}</p>
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
                    </div>
                    <p className="text-sm text-muted-foreground">{cargo.descricao}</p>
                    <p className="text-sm text-muted-foreground">
                      Departamento: {cargo.departamento}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleStatus(cargo.id)}
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
        </CardContent>
      </Card>
    </div>
  )
}