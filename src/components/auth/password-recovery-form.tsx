import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Mail, ArrowLeft, Check } from "lucide-react"

interface PasswordRecoveryFormProps {
  onBack: () => void
}

export function PasswordRecoveryForm({ onBack }: PasswordRecoveryFormProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, informe seu email",
        variant: "destructive"
      })
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, informe um email válido",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`
      })
      
      if (error) {
        toast({
          title: "Erro ao enviar email",
          description: error.message,
          variant: "destructive"
        })
      } else {
        setEmailSent(true)
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para redefinir sua senha"
        })
      }
    } catch {
      toast({
        title: "Erro inesperado",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Email Enviado!</CardTitle>
          <CardDescription>
            Enviamos um link de recuperação para <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <p>Verifique sua caixa de entrada e spam.</p>
            <p>O link expira em 1 hora.</p>
          </div>
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setEmailSent(false)
                setEmail("")
              }}
            >
              Enviar Novamente
            </Button>
            
            <Button variant="ghost" className="w-full" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Login
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Recuperar Senha</CardTitle>
        <CardDescription>
          Informe seu email para receber um link de recuperação
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="pl-10"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
            </Button>
            
            <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}