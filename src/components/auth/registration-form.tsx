import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Building2, Mail, Lock, User, Phone } from "lucide-react"

interface RegistrationFormProps {
  onBack: () => void
  onSuccess: () => void
}

export function RegistrationForm({ onBack, onSuccess }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    empresa: "",
    telefone: "",
    departamento: "",
    cargo: "",
    termos: false
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()
  const { toast } = useToast()

  const departamentos = [
    "Recursos Humanos", "Tecnologia da Informação", "Vendas", "Marketing", 
    "Financeiro", "Operações", "Qualidade", "Compras", "Jurídico", "Outro"
  ]

  const validatePassword = (password: string): boolean => {
    const minLength = password.length >= 8
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumbers = /\d/.test(password)
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    
    return minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nome || !formData.email || !formData.senha) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, email e senha",
        variant: "destructive"
      })
      return
    }

    if (!validatePassword(formData.senha)) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter no mínimo 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial",
        variant: "destructive"
      })
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      toast({
        title: "Senhas não coincidem",
        description: "As senhas informadas são diferentes",
        variant: "destructive"
      })
      return
    }

    if (!formData.termos) {
      toast({
        title: "Termos não aceitos",
        description: "É necessário aceitar os termos de uso",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    const result = await signup(formData.email, formData.senha, formData.nome)
    
    if (result.success) {
      toast({
        title: "Conta criada com sucesso!",
        description: "Você já pode fazer login"
      })
      onSuccess()
    } else {
      toast({
        title: "Erro ao criar conta",
        description: result.error || "Tente novamente mais tarde",
        variant: "destructive"
      })
    }
    
    setIsLoading(false)
  }

  const updateField = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Criar Nova Conta</CardTitle>
        <CardDescription>
          Preencha seus dados para criar uma conta gratuita
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Pessoais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => updateField("nome", e.target.value)}
                    placeholder="Seu nome completo"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="seu@email.com"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senha">Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    value={formData.senha}
                    onChange={(e) => updateField("senha", e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className="pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Deve conter maiúscula, minúscula, número e símbolo
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmarSenha"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmarSenha}
                    onChange={(e) => updateField("confirmarSenha", e.target.value)}
                    placeholder="Repita sua senha"
                    className="pl-10 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Informações Profissionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informações Profissionais</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="empresa"
                    value={formData.empresa}
                    onChange={(e) => updateField("empresa", e.target.value)}
                    placeholder="Nome da sua empresa"
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => updateField("telefone", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento</Label>
                <Select value={formData.departamento} onValueChange={(value) => updateField("departamento", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => updateField("cargo", e.target.value)}
                  placeholder="Seu cargo atual"
                />
              </div>
            </div>
          </div>

          {/* Termos */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="termos"
                checked={formData.termos}
                onCheckedChange={(checked) => updateField("termos", checked)}
              />
              <Label htmlFor="termos" className="text-sm">
                Aceito os{" "}
                <a href="#" className="text-primary hover:underline">
                  Termos de Uso
                </a>{" "}
                e{" "}
                <a href="#" className="text-primary hover:underline">
                  Política de Privacidade
                </a>
              </Label>
            </div>
          </div>

          {/* Botões */}
          <div className="space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Criando conta..." : "Criar Conta"}
            </Button>
            
            <Button type="button" variant="outline" className="w-full" onClick={onBack}>
              Voltar ao Login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
