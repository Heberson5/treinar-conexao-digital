import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Save, 
  Upload, 
  Mail, 
  Bell, 
  Shield, 
  Database,
  Palette,
  Globe,
  Server,
  Key,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface ConfiguracaoSistema {
  // Gerais
  nomeEmpresa: string
  emailContato: string
  telefoneContato: string
  endereco: string
  logoUrl?: string
  timezone: string
  idioma: string
  
  // Email
  smtpHost: string
  smtpPort: number
  smtpUsuario: string
  smtpSenha: string
  smtpTls: boolean
  emailRemetente: string
  
  // Notificações
  notificacoesEmail: boolean
  notificacoesPush: boolean
  notificacoesConclusao: boolean
  notificacoesLembrete: boolean
  
  // Segurança
  senhaMinLength: number
  senhaRequerMaiuscula: boolean
  senhaRequerNumero: boolean
  senhaRequerEspecial: boolean
  sessionTimeout: number
  tentativasLogin: number
  
  // Sistema
  manuntencaoModo: boolean
  registroPublico: boolean
  logLevel: string
  backupAutomatico: boolean
  backupFrequencia: string
}

export default function Configuracoes() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  
  const [config, setConfig] = useState<ConfiguracaoSistema>({
    // Gerais
    nomeEmpresa: "Portal Treinamentos",
    emailContato: "contato@portaltreinamentos.com",
    telefoneContato: "(11) 99999-9999",
    endereco: "Rua Principal, 123 - São Paulo/SP",
    timezone: "America/Sao_Paulo",
    idioma: "pt-BR",
    
    // Email
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUsuario: "",
    smtpSenha: "",
    smtpTls: true,
    emailRemetente: "noreply@portaltreinamentos.com",
    
    // Notificações
    notificacoesEmail: true,
    notificacoesPush: true,
    notificacoesConclusao: true,
    notificacoesLembrete: true,
    
    // Segurança
    senhaMinLength: 8,
    senhaRequerMaiuscula: true,
    senhaRequerNumero: true,
    senhaRequerEspecial: true,
    sessionTimeout: 30,
    tentativasLogin: 5,
    
    // Sistema
    manuntencaoModo: false,
    registroPublico: true,
    logLevel: "info",
    backupAutomatico: true,
    backupFrequencia: "diario"
  })

  const handleSave = async (categoria: string) => {
    if (user?.papel !== "master") {
      toast({
        title: "Permissão negada",
        description: "Apenas Masters podem alterar configurações do sistema",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    // Simular salvamento
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setLoading(false)
    toast({
      title: "Configurações salvas!",
      description: `Configurações de ${categoria} foram atualizadas com sucesso.`
    })
  }

  const handleTestEmail = async () => {
    setTestingEmail(true)
    
    // Simular teste de email
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setTestingEmail(false)
    toast({
      title: "Email de teste enviado!",
      description: "Verifique sua caixa de entrada para confirmar as configurações."
    })
  }

  const handleBackup = async () => {
    setLoading(true)
    
    // Simular backup
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const blob = new Blob(['Backup do sistema...'], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    setLoading(false)
    toast({
      title: "Backup criado!",
      description: "O backup foi gerado e baixado com sucesso."
    })
  }

  const handleReset = () => {
    if (user?.papel !== "master") {
      toast({
        title: "Permissão negada",
        description: "Apenas Masters podem resetar configurações",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "Configurações resetadas",
      description: "Todas as configurações foram restauradas para os valores padrão."
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
          <p className="text-muted-foreground mt-2">
            Configure aspectos gerais, segurança e notificações da plataforma
          </p>
        </div>
        
        {user?.papel !== "master" && (
          <Badge variant="destructive" className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            Acesso Restrito
          </Badge>
        )}
      </div>

      {/* Permission Warning */}
      {user?.papel !== "master" && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm">
                Você tem acesso apenas para visualização. Apenas usuários Master podem alterar as configurações do sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* Configurações Gerais */}
        <TabsContent value="geral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Informações da Empresa
              </CardTitle>
              <CardDescription>
                Configure as informações básicas da sua organização
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeEmpresa">Nome da Empresa</Label>
                  <Input
                    id="nomeEmpresa"
                    value={config.nomeEmpresa}
                    onChange={(e) => setConfig({...config, nomeEmpresa: e.target.value})}
                    disabled={user?.papel !== "master"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailContato">Email de Contato</Label>
                  <Input
                    id="emailContato"
                    type="email"
                    value={config.emailContato}
                    onChange={(e) => setConfig({...config, emailContato: e.target.value})}
                    disabled={user?.papel !== "master"}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={config.telefoneContato}
                    onChange={(e) => setConfig({...config, telefoneContato: e.target.value})}
                    disabled={user?.papel !== "master"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select 
                    value={config.timezone} 
                    onValueChange={(value) => setConfig({...config, timezone: value})}
                    disabled={user?.papel !== "master"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Textarea
                  id="endereco"
                  value={config.endereco}
                  onChange={(e) => setConfig({...config, endereco: e.target.value})}
                  disabled={user?.papel !== "master"}
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Logo da Empresa</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <Button variant="outline" disabled={user?.papel !== "master"}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload de Logo
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      PNG, JPG até 2MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSave("gerais")} 
                  disabled={loading || user?.papel !== "master"}
                  className="bg-gradient-primary"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Email */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configurações SMTP
              </CardTitle>
              <CardDescription>
                Configure o servidor de email para envio de notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">Servidor SMTP</Label>
                  <Input
                    id="smtpHost"
                    value={config.smtpHost}
                    onChange={(e) => setConfig({...config, smtpHost: e.target.value})}
                    disabled={user?.papel !== "master"}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Porta</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={config.smtpPort}
                    onChange={(e) => setConfig({...config, smtpPort: parseInt(e.target.value)})}
                    disabled={user?.papel !== "master"}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUsuario">Usuário SMTP</Label>
                  <Input
                    id="smtpUsuario"
                    value={config.smtpUsuario}
                    onChange={(e) => setConfig({...config, smtpUsuario: e.target.value})}
                    disabled={user?.papel !== "master"}
                    placeholder="usuario@gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpSenha">Senha SMTP</Label>
                  <Input
                    id="smtpSenha"
                    type="password"
                    value={config.smtpSenha}
                    onChange={(e) => setConfig({...config, smtpSenha: e.target.value})}
                    disabled={user?.papel !== "master"}
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emailRemetente">Email Remetente</Label>
                <Input
                  id="emailRemetente"
                  type="email"
                  value={config.emailRemetente}
                  onChange={(e) => setConfig({...config, emailRemetente: e.target.value})}
                  disabled={user?.papel !== "master"}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={config.smtpTls}
                  onCheckedChange={(checked) => setConfig({...config, smtpTls: checked})}
                  disabled={user?.papel !== "master"}
                />
                <Label>Usar TLS/SSL</Label>
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleTestEmail} 
                  disabled={testingEmail || user?.papel !== "master"}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  {testingEmail ? "Enviando..." : "Testar Email"}
                </Button>
                
                <Button 
                  onClick={() => handleSave("email")} 
                  disabled={loading || user?.papel !== "master"}
                  className="bg-gradient-primary"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Notificações */}
        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificações
              </CardTitle>
              <CardDescription>
                Configure quando e como os usuários recebem notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações por Email</h4>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações via email para eventos importantes
                    </p>
                  </div>
                  <Switch
                    checked={config.notificacoesEmail}
                    onCheckedChange={(checked) => setConfig({...config, notificacoesEmail: checked})}
                    disabled={user?.papel !== "master"}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações Push</h4>
                    <p className="text-sm text-muted-foreground">
                      Notificações em tempo real no navegador
                    </p>
                  </div>
                  <Switch
                    checked={config.notificacoesPush}
                    onCheckedChange={(checked) => setConfig({...config, notificacoesPush: checked})}
                    disabled={user?.papel !== "master"}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Conclusão de Treinamentos</h4>
                    <p className="text-sm text-muted-foreground">
                      Notificar quando um treinamento for concluído
                    </p>
                  </div>
                  <Switch
                    checked={config.notificacoesConclusao}
                    onCheckedChange={(checked) => setConfig({...config, notificacoesConclusao: checked})}
                    disabled={user?.papel !== "master"}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Lembretes de Treinamento</h4>
                    <p className="text-sm text-muted-foreground">
                      Lembrar usuários sobre treinamentos pendentes
                    </p>
                  </div>
                  <Switch
                    checked={config.notificacoesLembrete}
                    onCheckedChange={(checked) => setConfig({...config, notificacoesLembrete: checked})}
                    disabled={user?.papel !== "master"}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSave("notificações")} 
                  disabled={loading || user?.papel !== "master"}
                  className="bg-gradient-primary"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Segurança */}
        <TabsContent value="seguranca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Políticas de Segurança
              </CardTitle>
              <CardDescription>
                Configure requisitos de senha e segurança do sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Comprimento mínimo da senha</Label>
                  <Input
                    type="number"
                    value={config.senhaMinLength}
                    onChange={(e) => setConfig({...config, senhaMinLength: parseInt(e.target.value)})}
                    disabled={user?.papel !== "master"}
                    min="6"
                    max="32"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timeout de sessão (minutos)</Label>
                  <Input
                    type="number"
                    value={config.sessionTimeout}
                    onChange={(e) => setConfig({...config, sessionTimeout: parseInt(e.target.value)})}
                    disabled={user?.papel !== "master"}
                    min="5"
                    max="480"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium">Requisitos de Senha</h4>
                
                <div className="flex items-center justify-between">
                  <Label>Exigir letra maiúscula</Label>
                  <Switch
                    checked={config.senhaRequerMaiuscula}
                    onCheckedChange={(checked) => setConfig({...config, senhaRequerMaiuscula: checked})}
                    disabled={user?.papel !== "master"}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Exigir número</Label>
                  <Switch
                    checked={config.senhaRequerNumero}
                    onCheckedChange={(checked) => setConfig({...config, senhaRequerNumero: checked})}
                    disabled={user?.papel !== "master"}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Exigir caractere especial</Label>
                  <Switch
                    checked={config.senhaRequerEspecial}
                    onCheckedChange={(checked) => setConfig({...config, senhaRequerEspecial: checked})}
                    disabled={user?.papel !== "master"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tentativas de login máximas</Label>
                <Input
                  type="number"
                  value={config.tentativasLogin}
                  onChange={(e) => setConfig({...config, tentativasLogin: parseInt(e.target.value)})}
                  disabled={user?.papel !== "master"}
                  min="3"
                  max="10"
                />
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => handleSave("segurança")} 
                  disabled={loading || user?.papel !== "master"}
                  className="bg-gradient-primary"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações do Sistema */}
        <TabsContent value="sistema" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Configurações do Sistema
              </CardTitle>
              <CardDescription>
                Configurações avançadas e modo de manutenção
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Modo de Manutenção</h4>
                    <p className="text-sm text-yellow-600 dark:text-yellow-300">
                      Bloqueia o acesso de usuários não-admin ao sistema
                    </p>
                  </div>
                  <Switch
                    checked={config.manuntencaoModo}
                    onCheckedChange={(checked) => setConfig({...config, manuntencaoModo: checked})}
                    disabled={user?.papel !== "master"}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Registro Público</h4>
                    <p className="text-sm text-muted-foreground">
                      Permitir que novos usuários se cadastrem
                    </p>
                  </div>
                  <Switch
                    checked={config.registroPublico}
                    onCheckedChange={(checked) => setConfig({...config, registroPublico: checked})}
                    disabled={user?.papel !== "master"}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Backup Automático</h4>
                    <p className="text-sm text-muted-foreground">
                      Fazer backup automático dos dados
                    </p>
                  </div>
                  <Switch
                    checked={config.backupAutomatico}
                    onCheckedChange={(checked) => setConfig({...config, backupAutomatico: checked})}
                    disabled={user?.papel !== "master"}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nível de Log</Label>
                  <Select 
                    value={config.logLevel} 
                    onValueChange={(value) => setConfig({...config, logLevel: value})}
                    disabled={user?.papel !== "master"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="warn">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="debug">Debug</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Frequência do Backup</Label>
                  <Select 
                    value={config.backupFrequencia} 
                    onValueChange={(value) => setConfig({...config, backupFrequencia: value})}
                    disabled={user?.papel !== "master"}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diario">Diário</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  disabled={user?.papel !== "master"}
                  className="text-destructive hover:text-destructive"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resetar Configurações
                </Button>
                
                <Button 
                  onClick={() => handleSave("sistema")} 
                  disabled={loading || user?.papel !== "master"}
                  className="bg-gradient-primary"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup e Restore */}
        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backup Manual
                </CardTitle>
                <CardDescription>
                  Gerar backup completo dos dados do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-6">
                  <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Crie um backup completo de todos os dados, configurações e usuários
                  </p>
                  <Button 
                    onClick={handleBackup} 
                    disabled={loading || user?.papel !== "master"}
                    className="bg-gradient-primary"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {loading ? "Gerando..." : "Gerar Backup"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Restaurar Backup
                </CardTitle>
                <CardDescription>
                  Restaurar dados de um arquivo de backup
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-6">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Selecione um arquivo de backup para restaurar os dados
                  </p>
                  <Button 
                    variant="outline" 
                    disabled={user?.papel !== "master"}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Selecionar Arquivo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
              <CardDescription>
                Informações sobre o estado atual do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" />
                  <p className="font-medium">Sistema Online</p>
                  <p className="text-sm text-muted-foreground">Funcionando normalmente</p>
                </div>
                
                <div className="text-center">
                  <Database className="mx-auto h-8 w-8 text-blue-500 mb-2" />
                  <p className="font-medium">Último Backup</p>
                  <p className="text-sm text-muted-foreground">Hoje, 03:00</p>
                </div>
                
                <div className="text-center">
                  <Server className="mx-auto h-8 w-8 text-purple-500 mb-2" />
                  <p className="font-medium">Versão</p>
                  <p className="text-sm text-muted-foreground">v2.1.0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}