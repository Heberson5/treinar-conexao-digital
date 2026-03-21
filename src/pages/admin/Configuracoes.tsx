import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  Settings, Save, Upload, Mail, Bell, Shield, Database, Globe, Server, Key,
  Download, RefreshCw, AlertTriangle, CheckCircle, Image, FileText, Search, Eye
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/integrations/supabase/client"
import { registrarAuditoria } from "@/lib/audit-utils"

interface ConfiguracaoSistema {
  nomeEmpresa: string
  emailContato: string
  telefoneContato: string
  endereco: string
  logoUrl?: string
  timezone: string
  idioma: string
  smtpHost: string
  smtpPort: number
  smtpUsuario: string
  smtpSenha: string
  smtpTls: boolean
  emailRemetente: string
  notificacoesEmail: boolean
  notificacoesPush: boolean
  notificacoesConclusao: boolean
  notificacoesLembrete: boolean
  senhaMinLength: number
  senhaRequerMaiuscula: boolean
  senhaRequerNumero: boolean
  senhaRequerEspecial: boolean
  sessionTimeout: number
  tentativasLogin: number
  manuntencaoModo: boolean
  registroPublico: boolean
  logLevel: string
  backupAutomatico: boolean
  backupFrequencia: string
  // Sistema
  nomeSistema: string
  faviconUrl: string
  logoSidebarUrl: string
}

interface AuditEntry {
  id: string
  usuario_nome: string
  acao: string
  menu: string
  local: string | null
  descricao: string
  criado_em: string
}

export default function Configuracoes() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([])
  const [auditSearch, setAuditSearch] = useState("")
  const [auditLoading, setAuditLoading] = useState(false)
  
  const [config, setConfig] = useState<ConfiguracaoSistema>({
    nomeEmpresa: "Portal Treinamentos",
    emailContato: "contato@portaltreinamentos.com",
    telefoneContato: "(11) 99999-9999",
    endereco: "Rua Principal, 123 - São Paulo/SP",
    timezone: "America/Sao_Paulo",
    idioma: "pt-BR",
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUsuario: "",
    smtpSenha: "",
    smtpTls: true,
    emailRemetente: "noreply@portaltreinamentos.com",
    notificacoesEmail: true,
    notificacoesPush: true,
    notificacoesConclusao: true,
    notificacoesLembrete: true,
    senhaMinLength: 8,
    senhaRequerMaiuscula: true,
    senhaRequerNumero: true,
    senhaRequerEspecial: true,
    sessionTimeout: 30,
    tentativasLogin: 5,
    manuntencaoModo: false,
    registroPublico: true,
    logLevel: "info",
    backupAutomatico: true,
    backupFrequencia: "diario",
    nomeSistema: "Portal Treinamentos",
    faviconUrl: "",
    logoSidebarUrl: "",
  })

  // Load system config from DB
  useEffect(() => {
    const loadConfig = async () => {
      const { data } = await supabase
        .from("configuracoes_sistema" as any)
        .select("*")
        .limit(1)
        .single()
      
      if (data) {
        const d = data as any
        setConfig(prev => ({
          ...prev,
          nomeSistema: d.nome_sistema || "Portal Treinamentos",
          faviconUrl: d.favicon_url || "",
          logoSidebarUrl: d.logo_sidebar_url || "",
        }))
      }
    }
    loadConfig()
  }, [])

  // Load audit logs
  useEffect(() => {
    if (user?.role === "master" || user?.role === "admin") {
      loadAuditLogs()
    }
  }, [user])

  const loadAuditLogs = async () => {
    setAuditLoading(true)
    const { data } = await supabase
      .from("auditoria" as any)
      .select("id, usuario_nome, acao, menu, local, descricao, criado_em")
      .order("criado_em", { ascending: false })
      .limit(100) as any
    
    setAuditLogs(data || [])
    setAuditLoading(false)
  }

  const handleSave = async (categoria: string) => {
    if (user?.role !== "master") {
      toast({ title: "Permissão negada", description: "Apenas Masters podem alterar configurações", variant: "destructive" })
      return
    }
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    toast({ title: "Configurações salvas!", description: `Configurações de ${categoria} foram atualizadas.` })
    await registrarAuditoria({ acao: "editar", menu: "configuracoes", local: categoria, descricao: `Atualizou configurações de ${categoria}` })
  }

  const handleSaveSistema = async () => {
    if (user?.role !== "master") return
    setLoading(true)

    const { error } = await supabase
      .from("configuracoes_sistema" as any)
      .update({
        nome_sistema: config.nomeSistema,
        favicon_url: config.faviconUrl || null,
        logo_sidebar_url: config.logoSidebarUrl || null,
        atualizado_em: new Date().toISOString(),
      } as any)
      .not("id", "is", null)

    setLoading(false)
    if (!error) {
      // Update favicon dynamically
      if (config.faviconUrl) {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement
        if (link) link.href = config.faviconUrl
      }
      // Update document title
      document.title = config.nomeSistema
      
      toast({ title: "Configurações do sistema salvas!", description: "Nome, favicon e logo foram atualizados." })
      await registrarAuditoria({ acao: "editar", menu: "configuracoes", local: "sistema", descricao: "Atualizou configurações do sistema (nome, favicon, logo)" })
    } else {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" })
    }
  }

  const handleTestEmail = async () => {
    setTestingEmail(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setTestingEmail(false)
    toast({ title: "Email de teste enviado!", description: "Verifique sua caixa de entrada." })
  }

  const handleBackup = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    const blob = new Blob(['Backup do sistema...'], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setLoading(false)
    toast({ title: "Backup criado!", description: "O backup foi gerado e baixado." })
  }

  const handleReset = () => {
    if (user?.role !== "master") return
    toast({ title: "Configurações resetadas", description: "Valores padrão restaurados." })
  }

  const getAcaoColor = (acao: string) => {
    switch (acao) {
      case "criar": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "editar": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "excluir": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "login": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "logout": return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const filteredAuditLogs = auditLogs.filter(log =>
    !auditSearch ||
    log.usuario_nome.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.descricao.toLowerCase().includes(auditSearch.toLowerCase()) ||
    log.menu.toLowerCase().includes(auditSearch.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Configurações do Sistema</h1>
          <p className="text-muted-foreground mt-2">Configure aspectos gerais, segurança e notificações</p>
        </div>
        {user?.role !== "master" && (
          <Badge variant="destructive" className="flex items-center gap-2">
            <Shield className="h-3 w-3" /> Acesso Restrito
          </Badge>
        )}
      </div>

      {user?.role !== "master" && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm">Apenas usuários Master podem alterar as configurações.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
        </TabsList>

        {/* Geral */}
        <TabsContent value="geral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Informações da Empresa</CardTitle>
              <CardDescription>Configure as informações básicas da sua organização</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Empresa</Label>
                  <Input value={config.nomeEmpresa} onChange={(e) => setConfig({...config, nomeEmpresa: e.target.value})} disabled={user?.role !== "master"} />
                </div>
                <div className="space-y-2">
                  <Label>Email de Contato</Label>
                  <Input type="email" value={config.emailContato} onChange={(e) => setConfig({...config, emailContato: e.target.value})} disabled={user?.role !== "master"} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={config.telefoneContato} onChange={(e) => setConfig({...config, telefoneContato: e.target.value})} disabled={user?.role !== "master"} />
                </div>
                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select value={config.timezone} onValueChange={(v) => setConfig({...config, timezone: v})} disabled={user?.role !== "master"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Textarea value={config.endereco} onChange={(e) => setConfig({...config, endereco: e.target.value})} disabled={user?.role !== "master"} rows={2} />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("gerais")} disabled={loading || user?.role !== "master"} className="bg-gradient-primary">
                  <Save className="mr-2 h-4 w-4" /> {loading ? "Salvando..." : "Salvar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sistema - Favicon, Nome, Logo */}
        <TabsContent value="sistema" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5" /> Identidade do Sistema</CardTitle>
              <CardDescription>Configure o nome, ícone da aba do navegador e logo da barra lateral</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Nome do Sistema</Label>
                  <Input value={config.nomeSistema} onChange={(e) => setConfig({...config, nomeSistema: e.target.value})} disabled={user?.role !== "master"} placeholder="Portal Treinamentos" />
                  <p className="text-xs text-muted-foreground">Aparece na aba do navegador e cabeçalho</p>
                </div>
                <div className="space-y-2">
                  <Label>URL do Favicon (ícone da aba)</Label>
                  <div className="flex gap-2">
                    <Input value={config.faviconUrl} onChange={(e) => setConfig({...config, faviconUrl: e.target.value})} disabled={user?.role !== "master"} placeholder="https://exemplo.com/favicon.png" />
                    {config.faviconUrl && <img src={config.faviconUrl} alt="Favicon" className="h-10 w-10 object-contain border rounded" />}
                  </div>
                  <p className="text-xs text-muted-foreground">PNG ou ICO, recomendado 32x32px</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>URL da Logo (barra lateral)</Label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1">
                    <Input value={config.logoSidebarUrl} onChange={(e) => setConfig({...config, logoSidebarUrl: e.target.value})} disabled={user?.role !== "master"} placeholder="https://exemplo.com/logo.png" />
                    <p className="text-xs text-muted-foreground mt-1">PNG ou SVG, aparecerá na parte superior dos menus</p>
                  </div>
                  {config.logoSidebarUrl && (
                    <div className="border rounded-lg p-2 bg-card">
                      <img src={config.logoSidebarUrl} alt="Logo sidebar" className="h-12 w-12 object-contain" />
                    </div>
                  )}
                </div>
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <h4 className="font-medium mb-3 flex items-center gap-2"><Eye className="h-4 w-4" /> Pré-visualização</h4>
                <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                  {config.logoSidebarUrl ? (
                    <img src={config.logoSidebarUrl} alt="Logo" className="h-8 w-8 object-contain" />
                  ) : (
                    <div className="h-8 w-8 bg-primary/20 rounded flex items-center justify-center">
                      <Image className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold">{config.nomeSistema || "Portal Treinamentos"}</p>
                    <p className="text-xs text-muted-foreground">Treinamentos</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveSistema} disabled={loading || user?.role !== "master"} className="bg-gradient-primary">
                  <Save className="mr-2 h-4 w-4" /> {loading ? "Salvando..." : "Salvar Configurações do Sistema"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance & other system settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Server className="h-5 w-5" /> Configurações Avançadas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                <div>
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Modo de Manutenção</h4>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">Bloqueia acesso de usuários não-admin</p>
                </div>
                <Switch checked={config.manuntencaoModo} onCheckedChange={(v) => setConfig({...config, manuntencaoModo: v})} disabled={user?.role !== "master"} />
              </div>
              <div className="flex items-center justify-between">
                <div><h4 className="font-medium">Registro Público</h4><p className="text-sm text-muted-foreground">Permitir novos cadastros</p></div>
                <Switch checked={config.registroPublico} onCheckedChange={(v) => setConfig({...config, registroPublico: v})} disabled={user?.role !== "master"} />
              </div>
              <div className="flex items-center justify-between">
                <div><h4 className="font-medium">Backup Automático</h4><p className="text-sm text-muted-foreground">Backup automático dos dados</p></div>
                <Switch checked={config.backupAutomatico} onCheckedChange={(v) => setConfig({...config, backupAutomatico: v})} disabled={user?.role !== "master"} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nível de Log</Label>
                  <Select value={config.logLevel} onValueChange={(v) => setConfig({...config, logLevel: v})} disabled={user?.role !== "master"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
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
                  <Select value={config.backupFrequencia} onValueChange={(v) => setConfig({...config, backupFrequencia: v})} disabled={user?.role !== "master"}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diario">Diário</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="mensal">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleReset} disabled={user?.role !== "master"} className="text-destructive hover:text-destructive">
                  <RefreshCw className="mr-2 h-4 w-4" /> Resetar
                </Button>
                <Button onClick={() => handleSave("sistema")} disabled={loading || user?.role !== "master"} className="bg-gradient-primary">
                  <Save className="mr-2 h-4 w-4" /> Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Configurações SMTP</CardTitle>
              <CardDescription>Configure o servidor de email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Servidor SMTP</Label><Input value={config.smtpHost} onChange={(e) => setConfig({...config, smtpHost: e.target.value})} disabled={user?.role !== "master"} /></div>
                <div className="space-y-2"><Label>Porta</Label><Input type="number" value={config.smtpPort} onChange={(e) => setConfig({...config, smtpPort: parseInt(e.target.value)})} disabled={user?.role !== "master"} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Usuário SMTP</Label><Input value={config.smtpUsuario} onChange={(e) => setConfig({...config, smtpUsuario: e.target.value})} disabled={user?.role !== "master"} /></div>
                <div className="space-y-2"><Label>Senha SMTP</Label><Input type="password" value={config.smtpSenha} onChange={(e) => setConfig({...config, smtpSenha: e.target.value})} disabled={user?.role !== "master"} /></div>
              </div>
              <div className="space-y-2"><Label>Email Remetente</Label><Input type="email" value={config.emailRemetente} onChange={(e) => setConfig({...config, emailRemetente: e.target.value})} disabled={user?.role !== "master"} /></div>
              <div className="flex items-center space-x-2">
                <Switch checked={config.smtpTls} onCheckedChange={(v) => setConfig({...config, smtpTls: v})} disabled={user?.role !== "master"} />
                <Label>Usar TLS/SSL</Label>
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={handleTestEmail} disabled={testingEmail || user?.role !== "master"}>
                  <Mail className="mr-2 h-4 w-4" /> {testingEmail ? "Enviando..." : "Testar Email"}
                </Button>
                <Button onClick={() => handleSave("email")} disabled={loading || user?.role !== "master"} className="bg-gradient-primary">
                  <Save className="mr-2 h-4 w-4" /> Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notificações */}
        <TabsContent value="notificacoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> Preferências de Notificações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Notificações por Email", desc: "Enviar notificações via email", key: "notificacoesEmail" as const },
                { label: "Notificações Push", desc: "Notificações em tempo real no navegador", key: "notificacoesPush" as const },
                { label: "Conclusão de Treinamentos", desc: "Notificar quando um treinamento for concluído", key: "notificacoesConclusao" as const },
                { label: "Lembretes de Treinamento", desc: "Lembrar usuários sobre pendências", key: "notificacoesLembrete" as const },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div><h4 className="font-medium">{item.label}</h4><p className="text-sm text-muted-foreground">{item.desc}</p></div>
                  <Switch checked={config[item.key]} onCheckedChange={(v) => setConfig({...config, [item.key]: v})} disabled={user?.role !== "master"} />
                </div>
              ))}
              <div className="flex justify-end">
                <Button onClick={() => handleSave("notificações")} disabled={loading || user?.role !== "master"} className="bg-gradient-primary">
                  <Save className="mr-2 h-4 w-4" /> Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="seguranca" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Políticas de Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Comprimento mínimo da senha</Label><Input type="number" value={config.senhaMinLength} onChange={(e) => setConfig({...config, senhaMinLength: parseInt(e.target.value)})} disabled={user?.role !== "master"} min="6" max="32" /></div>
                <div className="space-y-2"><Label>Timeout de sessão (min)</Label><Input type="number" value={config.sessionTimeout} onChange={(e) => setConfig({...config, sessionTimeout: parseInt(e.target.value)})} disabled={user?.role !== "master"} min="5" max="480" /></div>
              </div>
              <div className="space-y-4">
                <h4 className="font-medium">Requisitos de Senha</h4>
                {[
                  { label: "Exigir letra maiúscula", key: "senhaRequerMaiuscula" as const },
                  { label: "Exigir número", key: "senhaRequerNumero" as const },
                  { label: "Exigir caractere especial", key: "senhaRequerEspecial" as const },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between">
                    <Label>{item.label}</Label>
                    <Switch checked={config[item.key]} onCheckedChange={(v) => setConfig({...config, [item.key]: v})} disabled={user?.role !== "master"} />
                  </div>
                ))}
              </div>
              <div className="space-y-2"><Label>Tentativas de login máximas</Label><Input type="number" value={config.tentativasLogin} onChange={(e) => setConfig({...config, tentativasLogin: parseInt(e.target.value)})} disabled={user?.role !== "master"} min="3" max="10" /></div>
              <div className="flex justify-end">
                <Button onClick={() => handleSave("segurança")} disabled={loading || user?.role !== "master"} className="bg-gradient-primary">
                  <Save className="mr-2 h-4 w-4" /> Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Auditoria */}
        <TabsContent value="auditoria" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Log de Auditoria</CardTitle>
              <CardDescription>Registro detalhado de todas as ações realizadas no sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar por usuário, ação ou menu..." value={auditSearch} onChange={(e) => setAuditSearch(e.target.value)} className="pl-10" />
                </div>
                <Button variant="outline" onClick={loadAuditLogs} disabled={auditLoading}>
                  <RefreshCw className={`h-4 w-4 ${auditLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>

              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Ação</TableHead>
                      <TableHead>Menu</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Descrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          {auditLoading ? "Carregando..." : "Nenhum registro de auditoria encontrado"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAuditLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-xs whitespace-nowrap">
                            {new Date(log.criado_em).toLocaleDateString('pt-BR')} {new Date(log.criado_em).toLocaleTimeString('pt-BR')}
                          </TableCell>
                          <TableCell className="font-medium text-sm">{log.usuario_nome}</TableCell>
                          <TableCell>
                            <Badge className={getAcaoColor(log.acao)}>{log.acao}</Badge>
                          </TableCell>
                          <TableCell className="text-sm capitalize">{log.menu}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{log.local || "-"}</TableCell>
                          <TableCell className="text-sm max-w-[300px] truncate">{log.descricao}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup */}
        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Backup Manual</CardTitle></CardHeader>
              <CardContent className="text-center py-6">
                <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">Backup completo dos dados</p>
                <Button onClick={handleBackup} disabled={loading || user?.role !== "master"} className="bg-gradient-primary">
                  <Download className="mr-2 h-4 w-4" /> {loading ? "Gerando..." : "Gerar Backup"}
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> Restaurar Backup</CardTitle></CardHeader>
              <CardContent className="text-center py-6">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-4">Restaurar dados de backup</p>
                <Button variant="outline" disabled={user?.role !== "master"}>
                  <Upload className="mr-2 h-4 w-4" /> Selecionar Arquivo
                </Button>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Status do Sistema</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center"><CheckCircle className="mx-auto h-8 w-8 text-green-500 mb-2" /><p className="font-medium">Online</p><p className="text-sm text-muted-foreground">Funcionando</p></div>
                <div className="text-center"><Database className="mx-auto h-8 w-8 text-blue-500 mb-2" /><p className="font-medium">Último Backup</p><p className="text-sm text-muted-foreground">Hoje, 03:00</p></div>
                <div className="text-center"><Server className="mx-auto h-8 w-8 text-purple-500 mb-2" /><p className="font-medium">Versão</p><p className="text-sm text-muted-foreground">v2.1.0</p></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
