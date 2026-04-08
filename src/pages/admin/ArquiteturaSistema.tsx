import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Settings2, Layout, Menu, FileText, Palette, Eye, Save,
  GripVertical, ChevronUp, ChevronDown, LayoutGrid, Columns, Type
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface MenuItemConfig {
  id: string
  title: string
  url: string
  icon: string
  visible: boolean
  order: number
  section: "main" | "admin" | "master"
}

interface FieldConfig {
  id: string
  label: string
  table: string
  field: string
  visible: boolean
  required: boolean
  order: number
}

interface ReportLayoutConfig {
  orientation: "portrait" | "landscape"
  showLogo: boolean
  showDate: boolean
  showPageNumbers: boolean
  headerColor: string
  fontSize: number
}

const defaultMenuItems: MenuItemConfig[] = [
  { id: "dashboard", title: "Dashboard", url: "/dashboard", icon: "LayoutDashboard", visible: true, order: 1, section: "main" },
  { id: "meus-treinamentos", title: "Meus Treinamentos", url: "/meus-treinamentos", icon: "GraduationCap", visible: true, order: 2, section: "main" },
  { id: "catalogo", title: "Catálogo", url: "/catalogo", icon: "BookOpen", visible: true, order: 3, section: "main" },
  { id: "relatorios", title: "Relatórios", url: "/relatorios", icon: "FileText", visible: true, order: 4, section: "main" },
  { id: "calendario", title: "Calendário", url: "/calendario", icon: "Calendar", visible: true, order: 5, section: "main" },
  { id: "executivo", title: "Dashboard Executivo", url: "/admin/executivo", icon: "Sparkles", visible: true, order: 1, section: "admin" },
  { id: "treinamentos", title: "Gestão de Treinamentos", url: "/admin/treinamentos", icon: "BookOpen", visible: true, order: 2, section: "admin" },
  { id: "usuarios", title: "Usuários", url: "/admin/usuarios", icon: "Users", visible: true, order: 3, section: "admin" },
  { id: "cargos", title: "Cargos", url: "/admin/cargos", icon: "Briefcase", visible: true, order: 4, section: "admin" },
  { id: "departamentos", title: "Departamentos", url: "/admin/departamentos", icon: "Building2", visible: true, order: 5, section: "admin" },
  { id: "categorias", title: "Categorias", url: "/admin/categorias", icon: "Tag", visible: true, order: 6, section: "admin" },
  { id: "empresas", title: "Empresas", url: "/admin/empresas", icon: "Building2", visible: true, order: 7, section: "admin" },
  { id: "planos", title: "Planos", url: "/admin/planos", icon: "CreditCard", visible: true, order: 8, section: "admin" },
  { id: "integracoes", title: "Integrações", url: "/admin/integracoes", icon: "Zap", visible: true, order: 9, section: "admin" },
  { id: "analytics", title: "Analytics", url: "/admin/analytics", icon: "BarChart3", visible: true, order: 10, section: "admin" },
  { id: "permissoes", title: "Permissões", url: "/admin/permissoes", icon: "Shield", visible: true, order: 11, section: "admin" },
  { id: "configuracoes", title: "Configurações", url: "/admin/configuracoes", icon: "Settings", visible: true, order: 12, section: "admin" },
  { id: "landing-page", title: "Editor Landing Page", url: "/admin/landing-page", icon: "Palette", visible: true, order: 1, section: "master" },
  { id: "financeiro", title: "Financeiro", url: "/admin/financeiro", icon: "DollarSign", visible: true, order: 2, section: "master" },
  { id: "arquitetura", title: "Arquitetura do Sistema", url: "/admin/arquitetura", icon: "Settings2", visible: true, order: 3, section: "master" },
]

const defaultFieldConfigs: FieldConfig[] = [
  { id: "treino-titulo", label: "Título", table: "treinamentos", field: "titulo", visible: true, required: true, order: 1 },
  { id: "treino-descricao", label: "Descrição", table: "treinamentos", field: "descricao", visible: true, required: false, order: 2 },
  { id: "treino-categoria", label: "Categoria", table: "treinamentos", field: "categoria", visible: true, required: false, order: 3 },
  { id: "treino-nivel", label: "Nível", table: "treinamentos", field: "nivel", visible: true, required: false, order: 4 },
  { id: "treino-duracao", label: "Duração (min)", table: "treinamentos", field: "duracao_minutos", visible: true, required: false, order: 5 },
  { id: "treino-obrigatorio", label: "Obrigatório", table: "treinamentos", field: "obrigatorio", visible: true, required: false, order: 6 },
  { id: "user-nome", label: "Nome", table: "perfis", field: "nome", visible: true, required: true, order: 1 },
  { id: "user-email", label: "E-mail", table: "perfis", field: "email", visible: true, required: true, order: 2 },
  { id: "user-cargo", label: "Cargo", table: "perfis", field: "cargo", visible: true, required: false, order: 3 },
  { id: "user-telefone", label: "Telefone", table: "perfis", field: "telefone", visible: true, required: false, order: 4 },
  { id: "user-departamento", label: "Departamento", table: "perfis", field: "departamento_id", visible: true, required: false, order: 5 },
]

export default function ArquiteturaSistema() {
  const { toast } = useToast()
  const [menuItems, setMenuItems] = useState<MenuItemConfig[]>(defaultMenuItems)
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>(defaultFieldConfigs)
  const [reportLayout, setReportLayout] = useState<ReportLayoutConfig>({
    orientation: "portrait", showLogo: true, showDate: true,
    showPageNumbers: true, headerColor: "#3b82f6", fontSize: 12
  })

  const moveMenuItem = (index: number, direction: "up" | "down", section: string) => {
    const sectionItems = menuItems.filter(m => m.section === section).sort((a, b) => a.order - b.order)
    const itemIndex = sectionItems.findIndex((_, i) => i === index)
    if (direction === "up" && itemIndex === 0) return
    if (direction === "down" && itemIndex === sectionItems.length - 1) return
    
    const swapIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1
    const tempOrder = sectionItems[itemIndex].order
    sectionItems[itemIndex].order = sectionItems[swapIndex].order
    sectionItems[swapIndex].order = tempOrder

    setMenuItems(prev => {
      const others = prev.filter(m => m.section !== section)
      return [...others, ...sectionItems]
    })
  }

  const toggleMenuVisibility = (id: string) => {
    setMenuItems(prev => prev.map(m => m.id === id ? { ...m, visible: !m.visible } : m))
  }

  const toggleFieldVisibility = (id: string) => {
    setFieldConfigs(prev => prev.map(f => f.id === id ? { ...f, visible: !f.visible } : f))
  }

  const toggleFieldRequired = (id: string) => {
    setFieldConfigs(prev => prev.map(f => f.id === id ? { ...f, required: !f.required } : f))
  }

  const saveConfig = () => {
    localStorage.setItem("sistema_menu_config", JSON.stringify(menuItems))
    localStorage.setItem("sistema_field_config", JSON.stringify(fieldConfigs))
    localStorage.setItem("sistema_report_layout", JSON.stringify(reportLayout))
    toast({ title: "Configuração salva", description: "As alterações na arquitetura do sistema foram salvas com sucesso." })
  }

  useEffect(() => {
    const savedMenu = localStorage.getItem("sistema_menu_config")
    const savedFields = localStorage.getItem("sistema_field_config")
    const savedReport = localStorage.getItem("sistema_report_layout")
    if (savedMenu) try { setMenuItems(JSON.parse(savedMenu)) } catch {}
    if (savedFields) try { setFieldConfigs(JSON.parse(savedFields)) } catch {}
    if (savedReport) try { setReportLayout(JSON.parse(savedReport)) } catch {}
  }, [])

  const renderMenuSection = (section: string, title: string) => {
    const items = menuItems.filter(m => m.section === section).sort((a, b) => a.order - b.order)
    return (
      <div className="space-y-2">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">{title}</h3>
        {items.map((item, index) => (
          <div key={item.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg bg-card">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className={`text-xs sm:text-sm font-medium truncate ${!item.visible ? 'line-through text-muted-foreground' : ''}`}>
                {item.title}
              </span>
              <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">{item.url}</Badge>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveMenuItem(index, "up", section)}>
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveMenuItem(index, "down", section)}>
                <ChevronDown className="h-3 w-3" />
              </Button>
              <Switch checked={item.visible} onCheckedChange={() => toggleMenuVisibility(item.id)} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderFieldSection = (table: string, title: string) => {
    const fields = fieldConfigs.filter(f => f.table === table).sort((a, b) => a.order - b.order)
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg">{title}</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Configure a visibilidade e obrigatoriedade dos campos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {fields.map((field) => (
              <div key={field.id} className="flex items-center justify-between p-2 sm:p-3 border rounded-lg">
                <span className="text-xs sm:text-sm font-medium">{field.label}</span>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Label className="text-[10px] sm:text-xs text-muted-foreground">Visível</Label>
                    <Switch checked={field.visible} onCheckedChange={() => toggleFieldVisibility(field.id)} />
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Label className="text-[10px] sm:text-xs text-muted-foreground">Obrigatório</Label>
                    <Switch checked={field.required} onCheckedChange={() => toggleFieldRequired(field.id)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Settings2 className="h-6 w-6 sm:h-8 sm:w-8" /> Arquitetura do Sistema
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Personalize menus, campos, layouts e estrutura do sistema
          </p>
        </div>
        <Button onClick={saveConfig}>
          <Save className="mr-2 h-4 w-4" /> Salvar Alterações
        </Button>
      </div>

      <Tabs defaultValue="menus" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="menus" className="text-xs sm:text-sm"><Menu className="mr-1 h-4 w-4" /> Menus</TabsTrigger>
          <TabsTrigger value="campos" className="text-xs sm:text-sm"><LayoutGrid className="mr-1 h-4 w-4" /> Campos</TabsTrigger>
          <TabsTrigger value="relatorios" className="text-xs sm:text-sm"><FileText className="mr-1 h-4 w-4" /> Relatórios PDF</TabsTrigger>
        </TabsList>

        {/* Menus Tab */}
        <TabsContent value="menus" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Menu className="h-5 w-5" /> Organização dos Menus
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Reordene, oculte ou exiba itens de menu. Use as setas para alterar a ordem.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderMenuSection("main", "Menu Principal")}
              <Separator />
              {renderMenuSection("admin", "Administração")}
              <Separator />
              {renderMenuSection("master", "Master")}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campos Tab */}
        <TabsContent value="campos" className="space-y-6">
          {renderFieldSection("treinamentos", "Campos de Treinamentos")}
          {renderFieldSection("perfis", "Campos de Usuários")}
        </TabsContent>

        {/* Relatórios PDF Tab */}
        <TabsContent value="relatorios" className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <FileText className="h-5 w-5" /> Layout dos Relatórios em PDF
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure o layout padrão dos relatórios exportados em PDF
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm">Orientação</Label>
                    <Select value={reportLayout.orientation} onValueChange={(v) => setReportLayout(prev => ({ ...prev, orientation: v as any }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Retrato</SelectItem>
                        <SelectItem value="landscape">Paisagem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Tamanho da Fonte</Label>
                    <Input 
                      type="number" min={8} max={18} value={reportLayout.fontSize}
                      onChange={(e) => setReportLayout(prev => ({ ...prev, fontSize: parseInt(e.target.value) || 12 }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Cor do Cabeçalho</Label>
                    <div className="flex gap-2 items-center">
                      <Input 
                        type="color" value={reportLayout.headerColor}
                        onChange={(e) => setReportLayout(prev => ({ ...prev, headerColor: e.target.value }))}
                        className="w-12 h-10 p-1"
                      />
                      <Input 
                        value={reportLayout.headerColor}
                        onChange={(e) => setReportLayout(prev => ({ ...prev, headerColor: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label className="text-sm">Exibir Logo</Label>
                    <Switch checked={reportLayout.showLogo} onCheckedChange={(v) => setReportLayout(prev => ({ ...prev, showLogo: v }))} />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label className="text-sm">Exibir Data</Label>
                    <Switch checked={reportLayout.showDate} onCheckedChange={(v) => setReportLayout(prev => ({ ...prev, showDate: v }))} />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label className="text-sm">Numeração de Páginas</Label>
                    <Switch checked={reportLayout.showPageNumbers} onCheckedChange={(v) => setReportLayout(prev => ({ ...prev, showPageNumbers: v }))} />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6">
                <Label className="text-sm font-semibold mb-2 block">Pré-visualização</Label>
                <div className={`border rounded-lg p-4 bg-card ${reportLayout.orientation === "landscape" ? "aspect-[1.41/1] max-w-md" : "aspect-[1/1.41] max-w-[300px]"}`}>
                  <div className="h-6 rounded" style={{ backgroundColor: reportLayout.headerColor, opacity: 0.8 }} />
                  <div className="mt-2 flex justify-between text-[8px] sm:text-[10px] text-muted-foreground">
                    {reportLayout.showLogo && <span>📋 Logo</span>}
                    {reportLayout.showDate && <span>{new Date().toLocaleDateString('pt-BR')}</span>}
                  </div>
                  <div className="mt-3 space-y-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-2 bg-muted rounded" style={{ width: `${80 - i * 10}%` }} />
                    ))}
                  </div>
                  {reportLayout.showPageNumbers && (
                    <div className="text-[8px] text-muted-foreground text-center mt-auto pt-4">Página 1 de 1</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
