import { useState, useEffect, useRef } from "react"
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
  GripVertical, LayoutGrid, Columns, Type, Pencil, Check, X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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

const sectionLabels: Record<string, string> = {
  main: "Menu Principal",
  admin: "Administração",
  master: "Master"
}

export default function ArquiteturaSistema() {
  const { toast } = useToast()
  const [menuItems, setMenuItems] = useState<MenuItemConfig[]>(defaultMenuItems)
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>(defaultFieldConfigs)
  const [reportLayout, setReportLayout] = useState<ReportLayoutConfig>({
    orientation: "portrait", showLogo: true, showDate: true,
    showPageNumbers: true, headerColor: "#3b82f6", fontSize: 12
  })

  // Drag state
  const [dragItem, setDragItem] = useState<MenuItemConfig | null>(null)
  const [dragOverSection, setDragOverSection] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  // Inline editing
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const editInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    if (editingItemId && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [editingItemId])

  // --- Drag & Drop handlers ---
  const handleDragStart = (e: React.DragEvent, item: MenuItemConfig) => {
    setDragItem(item)
    e.dataTransfer.effectAllowed = "move"
    // Make drag image semi-transparent
    const el = e.currentTarget as HTMLElement
    el.style.opacity = "0.5"
  }

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = "1"
    setDragItem(null)
    setDragOverSection(null)
    setDragOverIndex(null)
  }

  const handleDragOver = (e: React.DragEvent, section: string, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverSection(section)
    setDragOverIndex(index)
  }

  const handleSectionDragOver = (e: React.DragEvent, section: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverSection(section)
  }

  const handleDrop = (e: React.DragEvent, targetSection: string, targetIndex: number) => {
    e.preventDefault()
    if (!dragItem) return

    setMenuItems(prev => {
      const updated = prev.filter(m => m.id !== dragItem.id)
      const sectionItems = updated.filter(m => m.section === targetSection).sort((a, b) => a.order - b.order)
      const otherItems = updated.filter(m => m.section !== targetSection)

      // Insert at target index
      const movedItem = { ...dragItem, section: targetSection as any }
      sectionItems.splice(targetIndex, 0, movedItem)

      // Recalculate orders
      sectionItems.forEach((item, i) => { item.order = i + 1 })

      return [...otherItems, ...sectionItems]
    })

    setDragItem(null)
    setDragOverSection(null)
    setDragOverIndex(null)
  }

  const handleSectionDrop = (e: React.DragEvent, targetSection: string) => {
    e.preventDefault()
    if (!dragItem) return

    setMenuItems(prev => {
      const updated = prev.filter(m => m.id !== dragItem.id)
      const sectionItems = updated.filter(m => m.section === targetSection).sort((a, b) => a.order - b.order)
      const otherItems = updated.filter(m => m.section !== targetSection)

      const movedItem = { ...dragItem, section: targetSection as any }
      sectionItems.push(movedItem)
      sectionItems.forEach((item, i) => { item.order = i + 1 })

      return [...otherItems, ...sectionItems]
    })

    setDragItem(null)
    setDragOverSection(null)
    setDragOverIndex(null)
  }

  // --- Inline rename ---
  const startEditing = (item: MenuItemConfig) => {
    setEditingItemId(item.id)
    setEditingTitle(item.title)
  }

  const confirmEdit = () => {
    if (!editingItemId || !editingTitle.trim()) return
    setMenuItems(prev => prev.map(m => m.id === editingItemId ? { ...m, title: editingTitle.trim() } : m))
    setEditingItemId(null)
    setEditingTitle("")
  }

  const cancelEdit = () => {
    setEditingItemId(null)
    setEditingTitle("")
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") confirmEdit()
    if (e.key === "Escape") cancelEdit()
  }

  const renderMenuSection = (section: string, title: string) => {
    const items = menuItems.filter(m => m.section === section).sort((a, b) => a.order - b.order)
    const isOverThisSection = dragOverSection === section

    return (
      <div
        className={`space-y-1 p-3 rounded-lg border-2 border-dashed transition-colors ${
          isOverThisSection && dragItem?.section !== section
            ? "border-primary bg-primary/5"
            : "border-transparent"
        }`}
        onDragOver={(e) => handleSectionDragOver(e, section)}
        onDrop={(e) => handleSectionDrop(e, section)}
      >
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">{title}</h3>
        {items.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, section, index)}
            onDrop={(e) => handleDrop(e, section, index)}
            className={`flex items-center justify-between p-2 sm:p-3 border rounded-lg bg-card cursor-grab active:cursor-grabbing transition-all ${
              dragOverSection === section && dragOverIndex === index && dragItem?.id !== item.id
                ? "border-t-2 border-t-primary"
                : ""
            } ${dragItem?.id === item.id ? "opacity-50" : ""}`}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
              {editingItemId === item.id ? (
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <Input
                    ref={editInputRef}
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    className="h-7 text-sm"
                  />
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={confirmEdit}>
                    <Check className="h-3 w-3 text-green-600" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={cancelEdit}>
                    <X className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-xs sm:text-sm font-medium truncate">{item.title}</span>
                  <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">{sectionLabels[item.section]}</Badge>
                </>
              )}
            </div>
            {editingItemId !== item.id && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => startEditing(item)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
        {items.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground border rounded-lg border-dashed">
            Arraste itens para esta seção
          </div>
        )}
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
                Clique e arraste os itens para reordenar ou mover entre seções. Clique no ícone de lápis para renomear.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
