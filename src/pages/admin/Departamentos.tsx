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
  Building2,
  Users
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Departamento {
  id: number
  nome: string
  descricao: string
  responsavel: string
  ativo: boolean
}

const departamentosIniciais: Departamento[] = [
  { id: 1, nome: "TI", descricao: "Tecnologia da Informação", responsavel: "Heber Sohas", ativo: true },
  { id: 2, nome: "RH", descricao: "Recursos Humanos", responsavel: "Maria Silva", ativo: true },
  { id: 3, nome: "Vendas", descricao: "Equipe de Vendas", responsavel: "João Santos", ativo: true },
  { id: 4, nome: "Financeiro", descricao: "Setor Financeiro", responsavel: "Ana Costa", ativo: true },
  { id: 5, nome: "Marketing", descricao: "Marketing e Comunicação", responsavel: "Pedro Lima", ativo: true }
]

export default function Departamentos() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>(departamentosIniciais)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingDepartamento, setEditingDepartamento] = useState<Departamento | null>(null)
  const { toast } = useToast()

  const [newDepartamento, setNewDepartamento] = useState({
    nome: "",
    descricao: "",
    responsavel: ""
  })

  const resetForm = () => {
    setNewDepartamento({
      nome: "",
      descricao: "",
      responsavel: ""
    })
    setEditingDepartamento(null)
  }

  const handleCreate = () => {
    if (!newDepartamento.nome) {
      toast({
        title: "Campo obrigatório",
        description: "Nome do departamento é obrigatório",
        variant: "destructive"
      })
      return
    }

    const departamento: Departamento = {
      id: Date.now(),
      ...newDepartamento,
      ativo: true
    }

    setDepartamentos([...departamentos, departamento])
    setIsCreateOpen(false)
    resetForm()
    
    toast({
      title: "Departamento criado!",
      description: "O departamento foi criado com sucesso."
    })
  }

  const handleEdit = (departamento: Departamento) => {
    setEditingDepartamento(departamento)
    setNewDepartamento({
      nome: departamento.nome,
      descricao: departamento.descricao,
      responsavel: departamento.responsavel
    })
    setIsCreateOpen(true)
  }

  const handleUpdate = () => {
    if (!editingDepartamento) return

    setDepartamentos(departamentos.map(d => 
      d.id === editingDepartamento.id 
        ? { ...editingDepartamento, ...newDepartamento }
        : d
    ))
    
    setIsCreateOpen(false)
    resetForm()
    
    toast({
      title: "Departamento atualizado!",
      description: "O departamento foi atualizado com sucesso."
    })
  }

  const handleDelete = (id: number) => {
    setDepartamentos(departamentos.filter(d => d.id !== id))
    toast({
      title: "Departamento excluído",
      description: "O departamento foi removido com sucesso."
    })
  }

  const toggleStatus = (id: number) => {
    setDepartamentos(departamentos.map(departamento => 
      departamento.id === id 
        ? { ...departamento, ativo: !departamento.ativo }
        : departamento
    ))
  }

  const filteredDepartamentos = departamentos.filter(departamento =>
    departamento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    departamento.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    departamento.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Departamentos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie os departamentos da organização
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={(open) => {
          setIsCreateOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary">
              <Plus className="mr-2 h-4 w-4" />
              Novo Departamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDepartamento ? "Editar Departamento" : "Criar Novo Departamento"}
              </DialogTitle>
              <DialogDescription>
                {editingDepartamento ? "Atualize as informações do departamento." : "Preencha as informações do novo departamento."}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Departamento *</Label>
                <Input
                  id="nome"
                  value={newDepartamento.nome}
                  onChange={(e) => setNewDepartamento({...newDepartamento, nome: e.target.value})}
                  placeholder="Ex: Recursos Humanos"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={newDepartamento.descricao}
                  onChange={(e) => setNewDepartamento({...newDepartamento, descricao: e.target.value})}
                  placeholder="Descrição do departamento"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  value={newDepartamento.responsavel}
                  onChange={(e) => setNewDepartamento({...newDepartamento, responsavel: e.target.value})}
                  placeholder="Nome do responsável"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={editingDepartamento ? handleUpdate : handleCreate} className="bg-gradient-primary">
                {editingDepartamento ? "Atualizar" : "Criar Departamento"}
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
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{departamentos.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Building2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-bold">{departamentos.filter(d => d.ativo).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Com Responsável</p>
                <p className="text-2xl font-bold">{departamentos.filter(d => d.responsavel).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar departamentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Departamentos List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Departamentos</CardTitle>
          <CardDescription>
            Gerencie todos os departamentos cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredDepartamentos.map((departamento) => (
              <div key={departamento.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{departamento.nome}</h4>
                      <Badge variant={departamento.ativo ? "default" : "secondary"}>
                        {departamento.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{departamento.descricao}</p>
                    {departamento.responsavel && (
                      <p className="text-sm text-muted-foreground">
                        Responsável: {departamento.responsavel}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => toggleStatus(departamento.id)}
                  >
                    {departamento.ativo ? "Desativar" : "Ativar"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(departamento)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(departamento.id)}
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