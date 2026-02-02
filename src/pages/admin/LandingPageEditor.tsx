import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Save,
  Eye,
  Palette,
  Type,
  LayoutGrid,
  TrendingUp,
  Building2,
  ArrowLeft,
  Loader2,
  RefreshCw,
  Image,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/integrations/supabase/client"

interface LandingPageConfig {
  id: string
  hero_title: string
  hero_subtitle: string
  hero_badge: string
  hero_cta_primary: string
  hero_cta_secondary: string
  hero_background_color: string
  stats_section: any[]
  features_section: any[]
  cta_title: string
  cta_subtitle: string
  company_name: string
  company_description: string
  logo_url: string | null
  show_annual_toggle: boolean
  featured_trainings_enabled: boolean
  custom_css: string | null
}

const defaultConfig: Omit<LandingPageConfig, 'id'> = {
  hero_title: 'A Plataforma de Treinamentos do Futuro',
  hero_subtitle: 'Capacite sua equipe com treinamentos interativos, gamificados e com certificação.',
  hero_badge: '🚀 Transforme sua equipe hoje mesmo',
  hero_cta_primary: 'Comece Agora Grátis',
  hero_cta_secondary: 'Ver Demonstração',
  hero_background_color: 'from-primary via-primary-glow to-primary-darker',
  stats_section: [
    { value: "50,000+", label: "Funcionários Treinados", icon: "Users", color: "text-blue-600" },
    { value: "1,500+", label: "Empresas Atendidas", icon: "Building", color: "text-green-600" },
    { value: "300+", label: "Cursos Disponíveis", icon: "BookOpen", color: "text-purple-600" },
    { value: "98%", label: "Taxa de Satisfação", icon: "Star", color: "text-yellow-600" }
  ],
  features_section: [
    { title: "Plataforma Segura", description: "Seus dados protegidos com criptografia de ponta", icon: "Shield", color: "bg-blue-100 text-blue-600" },
    { title: "Aprendizado Rápido", description: "Metodologia otimizada para máxima retenção", icon: "Zap", color: "bg-yellow-100 text-yellow-600" },
    { title: "Certificação", description: "Certificados reconhecidos pelo mercado", icon: "Award", color: "bg-green-100 text-green-600" }
  ],
  cta_title: 'Pronto para transformar sua equipe?',
  cta_subtitle: 'Junte-se a milhares de empresas que já revolucionaram seus treinamentos conosco',
  company_name: 'Sauberlich System',
  company_description: 'A plataforma mais avançada para treinamentos corporativos.',
  logo_url: null,
  show_annual_toggle: false,
  featured_trainings_enabled: true,
  custom_css: null
}

export default function LandingPageEditor() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [config, setConfig] = useState<LandingPageConfig | null>(null)

  // Verificar se é master
  useEffect(() => {
    if (user && user.role !== 'master') {
      navigate('/admin')
      toast({
        title: "Acesso negado",
        description: "Apenas usuários Master podem acessar esta página.",
        variant: "destructive"
      })
    }
  }, [user, navigate, toast])

  // Carregar configuração
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from("landing_page_config")
          .select("*")
          .limit(1)
          .maybeSingle()

        if (error) {
          console.error("Erro ao carregar configuração:", error)
          toast({
            title: "Erro",
            description: "Não foi possível carregar as configurações.",
            variant: "destructive"
          })
        } else if (data) {
          setConfig(data as LandingPageConfig)
        } else {
          // Criar configuração padrão se não existir
          const { data: newData, error: insertError } = await supabase
            .from("landing_page_config")
            .insert(defaultConfig)
            .select()
            .single()

          if (insertError) {
            console.error("Erro ao criar configuração:", insertError)
          } else if (newData) {
            setConfig(newData as LandingPageConfig)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadConfig()
  }, [toast])

  const handleSave = async () => {
    if (!config) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("landing_page_config")
        .update({
          hero_title: config.hero_title,
          hero_subtitle: config.hero_subtitle,
          hero_badge: config.hero_badge,
          hero_cta_primary: config.hero_cta_primary,
          hero_cta_secondary: config.hero_cta_secondary,
          hero_background_color: config.hero_background_color,
          stats_section: config.stats_section,
          features_section: config.features_section,
          cta_title: config.cta_title,
          cta_subtitle: config.cta_subtitle,
          company_name: config.company_name,
          company_description: config.company_description,
          logo_url: config.logo_url,
          show_annual_toggle: config.show_annual_toggle,
          featured_trainings_enabled: config.featured_trainings_enabled,
          custom_css: config.custom_css
        })
        .eq("id", config.id)

      if (error) {
        throw error
      }

      toast({
        title: "Configurações salvas",
        description: "As alterações foram salvas com sucesso."
      })
    } catch (error) {
      console.error("Erro ao salvar:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const updateConfig = (key: keyof LandingPageConfig, value: any) => {
    setConfig(prev => prev ? { ...prev, [key]: value } : null)
  }

  const updateStat = (index: number, field: string, value: string) => {
    if (!config) return
    const newStats = [...config.stats_section]
    newStats[index] = { ...newStats[index], [field]: value }
    updateConfig('stats_section', newStats)
  }

  const updateFeature = (index: number, field: string, value: string) => {
    if (!config) return
    const newFeatures = [...config.features_section]
    newFeatures[index] = { ...newFeatures[index], [field]: value }
    updateConfig('features_section', newFeatures)
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Configuração não encontrada</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Palette className="h-8 w-8 text-primary" />
              Editor da Landing Page
            </h1>
            <p className="text-muted-foreground mt-1">
              Personalize a página inicial do seu site
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            <Eye className="mr-2 h-4 w-4" />
            Visualizar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Alterações
          </Button>
        </div>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hero">
            <Type className="h-4 w-4 mr-2" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="stats">
            <TrendingUp className="h-4 w-4 mr-2" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="features">
            <LayoutGrid className="h-4 w-4 mr-2" />
            Recursos
          </TabsTrigger>
          <TabsTrigger value="cta">
            <ExternalLink className="h-4 w-4 mr-2" />
            CTA
          </TabsTrigger>
          <TabsTrigger value="brand">
            <Building2 className="h-4 w-4 mr-2" />
            Marca
          </TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Seção Hero</CardTitle>
              <CardDescription>
                A primeira impressão do seu site - personalize o cabeçalho principal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hero_badge">Badge / Destaque</Label>
                  <Input
                    id="hero_badge"
                    value={config.hero_badge}
                    onChange={(e) => updateConfig('hero_badge', e.target.value)}
                    placeholder="🚀 Transforme sua equipe hoje mesmo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero_title">Título Principal</Label>
                  <Textarea
                    id="hero_title"
                    value={config.hero_title}
                    onChange={(e) => updateConfig('hero_title', e.target.value)}
                    placeholder="A Plataforma de Treinamentos do Futuro"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hero_subtitle">Subtítulo</Label>
                  <Textarea
                    id="hero_subtitle"
                    value={config.hero_subtitle}
                    onChange={(e) => updateConfig('hero_subtitle', e.target.value)}
                    placeholder="Capacite sua equipe com treinamentos interativos..."
                    rows={3}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hero_cta_primary">Botão Principal</Label>
                    <Input
                      id="hero_cta_primary"
                      value={config.hero_cta_primary}
                      onChange={(e) => updateConfig('hero_cta_primary', e.target.value)}
                      placeholder="Comece Agora Grátis"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hero_cta_secondary">Botão Secundário</Label>
                    <Input
                      id="hero_cta_secondary"
                      value={config.hero_cta_secondary}
                      onChange={(e) => updateConfig('hero_cta_secondary', e.target.value)}
                      placeholder="Ver Demonstração"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Section */}
        <TabsContent value="stats" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
              <CardDescription>
                Números que impressionam seus visitantes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {config.stats_section.map((stat, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Valor</Label>
                    <Input
                      value={stat.value}
                      onChange={(e) => updateStat(index, 'value', e.target.value)}
                      placeholder="50,000+"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Descrição</Label>
                    <Input
                      value={stat.label}
                      onChange={(e) => updateStat(index, 'label', e.target.value)}
                      placeholder="Funcionários Treinados"
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Section */}
        <TabsContent value="features" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recursos em Destaque</CardTitle>
              <CardDescription>
                Os principais benefícios da sua plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {config.features_section.map((feature, index) => (
                <div key={index} className="grid gap-4 p-4 border rounded-lg">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      value={feature.title}
                      onChange={(e) => updateFeature(index, 'title', e.target.value)}
                      placeholder="Plataforma Segura"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={feature.description}
                      onChange={(e) => updateFeature(index, 'description', e.target.value)}
                      placeholder="Seus dados protegidos com criptografia de ponta"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CTA Section */}
        <TabsContent value="cta" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Call to Action Final</CardTitle>
              <CardDescription>
                A última chamada para ação antes do rodapé
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="cta_title">Título do CTA</Label>
                <Input
                  id="cta_title"
                  value={config.cta_title}
                  onChange={(e) => updateConfig('cta_title', e.target.value)}
                  placeholder="Pronto para transformar sua equipe?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cta_subtitle">Subtítulo do CTA</Label>
                <Textarea
                  id="cta_subtitle"
                  value={config.cta_subtitle}
                  onChange={(e) => updateConfig('cta_subtitle', e.target.value)}
                  placeholder="Junte-se a milhares de empresas..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brand Section */}
        <TabsContent value="brand" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Identidade da Marca</CardTitle>
              <CardDescription>
                Configure o nome e descrição da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nome da Empresa</Label>
                <Input
                  id="company_name"
                  value={config.company_name}
                  onChange={(e) => updateConfig('company_name', e.target.value)}
                  placeholder="Sauberlich System"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_description">Descrição da Empresa</Label>
                <Textarea
                  id="company_description"
                  value={config.company_description}
                  onChange={(e) => updateConfig('company_description', e.target.value)}
                  placeholder="A plataforma mais avançada para treinamentos corporativos."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo_url">URL do Logo</Label>
                <Input
                  id="logo_url"
                  value={config.logo_url || ''}
                  onChange={(e) => updateConfig('logo_url', e.target.value)}
                  placeholder="https://exemplo.com/logo.png"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Toggle de Planos Anuais</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibir opção de pagamento anual na seção de preços
                    </p>
                  </div>
                  <Switch
                    checked={config.show_annual_toggle}
                    onCheckedChange={(checked) => updateConfig('show_annual_toggle', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Treinamentos em Destaque</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibir seção de treinamentos populares
                    </p>
                  </div>
                  <Switch
                    checked={config.featured_trainings_enabled}
                    onCheckedChange={(checked) => updateConfig('featured_trainings_enabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CSS Personalizado</CardTitle>
              <CardDescription>
                Adicione estilos CSS customizados (avançado)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={config.custom_css || ''}
                onChange={(e) => updateConfig('custom_css', e.target.value)}
                placeholder="/* Seus estilos CSS personalizados aqui */"
                rows={8}
                className="font-mono text-sm"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
