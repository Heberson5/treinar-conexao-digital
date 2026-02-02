import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Play, 
  BookOpen, 
  Users, 
  Award, 
  Star, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  ArrowRight,
  Building,
  Shield,
  Zap,
  Check
} from "lucide-react"
import { usePlans, ICONES_PLANOS } from "@/contexts/plans-context"
import { useLandingConfig } from "@/hooks/use-landing-config"

// Mapeamento de ícones por nome
const ICON_MAP: Record<string, React.ElementType> = {
  Users,
  Building,
  BookOpen,
  Star,
  Shield,
  Zap,
  Award,
  TrendingUp,
  Clock
}

export default function Index() {
  const [email, setEmail] = useState("")
  const [pagamentoAnual, setPagamentoAnual] = useState(false)
  const { planosAtivos, descontoAnual, calcularPrecoAnual } = usePlans()
  const { config, isLoading } = useLandingConfig()

  const featuredTrainings = [
    {
      id: 1,
      title: "Segurança no Trabalho",
      description: "Aprenda as melhores práticas de segurança no ambiente corporativo",
      duration: "2h 30min",
      rating: 4.8,
      students: 1234,
      category: "Segurança",
      level: "Básico",
      thumbnail: "/api/placeholder/400/250"
    },
    {
      id: 2,
      title: "Liderança Transformacional",
      description: "Desenvolva suas habilidades de liderança para o século XXI",
      duration: "4h 15min",
      rating: 4.9,
      students: 856,
      category: "Liderança",
      level: "Avançado",
      thumbnail: "/api/placeholder/400/250"
    },
    {
      id: 3,
      title: "Atendimento Excepcional",
      description: "Técnicas avançadas para um atendimento que encanta clientes",
      duration: "1h 45min",
      rating: 4.7,
      students: 2156,
      category: "Vendas",
      level: "Intermediário",
      thumbnail: "/api/placeholder/400/250"
    }
  ]

  const getIconComponent = (iconName: string) => {
    return ICON_MAP[iconName] || ICONES_PLANOS[iconName] || Users
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-glow to-primary-darker">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <Skeleton className="h-12 w-3/4 bg-white/20" />
                <Skeleton className="h-24 w-full bg-white/20" />
                <Skeleton className="h-12 w-1/2 bg-white/20" />
              </div>
              <Skeleton className="h-96 w-full bg-white/20 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Inject custom CSS */}
      {config.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: config.custom_css }} />
      )}

      {/* Hero Section */}
      <section className={`relative overflow-hidden bg-gradient-to-r ${config.hero_background_color}`}>
        <div className="absolute inset-0 bg-grid-white/10 bg-grid" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge className="bg-white/20 text-white border-white/30 mb-4">
                  {config.hero_badge}
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                  {config.hero_title.split('\n').map((line, i) => (
                    <span key={i} className={i > 0 ? "block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent" : ""}>
                      {line}
                    </span>
                  ))}
                </h1>
                <p className="text-xl text-white/90 mt-6 leading-relaxed">
                  {config.hero_subtitle}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
                    <Play className="mr-2 h-5 w-5" />
                    {config.hero_cta_primary}
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  <BookOpen className="mr-2 h-5 w-5" />
                  {config.hero_cta_secondary}
                </Button>
              </div>
              
              <div className="flex items-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Setup em 5 minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Suporte especializado</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">
                      Comece sua jornada de aprendizado
                    </h3>
                    <div className="space-y-4">
                      <Input
                        type="email"
                        placeholder="Seu email profissional"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      />
                      <Link to="/login">
                        <Button className="w-full bg-white text-primary hover:bg-white/90">
                          Criar Conta Gratuita
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                  
                  <div className="text-center text-white/60 text-sm">
                    Já tem uma conta? <Link to="/login" className="text-white hover:underline">Faça login</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {config.stats_section.map((stat, index) => {
              const IconComponent = getIconComponent(stat.icon)
              return (
                <div key={index} className="text-center">
                  <div className={`inline-flex p-3 rounded-full bg-background mb-4`}>
                    <IconComponent className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Por que escolher nossa plataforma?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Tecnologia de ponta, conteúdo de qualidade e resultados comprovados
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {config.features_section.map((feature, index) => {
              const IconComponent = getIconComponent(feature.icon)
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center">
                    <div className={`inline-flex p-4 rounded-full ${feature.color} mb-4`}>
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section - Dynamic from PlansContext */}
      {planosAtivos.length > 0 && (
        <section className="py-20 bg-accent/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Planos e Preços
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Escolha o plano ideal para sua empresa
              </p>
              
              {/* Toggle Mensal/Anual */}
              {config.show_annual_toggle && descontoAnual.habilitado && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Label htmlFor="pagamentoAnual" className={`text-sm ${!pagamentoAnual ? 'font-semibold' : 'text-muted-foreground'}`}>
                    Mensal
                  </Label>
                  <Switch
                    id="pagamentoAnual"
                    checked={pagamentoAnual}
                    onCheckedChange={setPagamentoAnual}
                  />
                  <Label htmlFor="pagamentoAnual" className={`text-sm ${pagamentoAnual ? 'font-semibold' : 'text-muted-foreground'}`}>
                    Anual
                  </Label>
                  {pagamentoAnual && (
                    <Badge className="bg-green-500 text-white">
                      Economize {descontoAnual.percentual}%
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <div className={`grid gap-6 ${
              planosAtivos.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' :
              planosAtivos.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' :
              planosAtivos.length === 3 ? 'md:grid-cols-3 max-w-4xl mx-auto' :
              'md:grid-cols-2 lg:grid-cols-4'
            }`}>
              {planosAtivos.map((plano) => {
                const IconComponent = getIconComponent(plano.icon)
                const { precoAnual, precoComDesconto, economia } = calcularPrecoAnual(plano.preco)
                const precoExibido = pagamentoAnual ? precoComDesconto : plano.preco
                const periodoExibido = pagamentoAnual ? "/ano" : plano.periodo
                
                return (
                  <Card 
                    key={plano.id} 
                    className={`relative flex flex-col ${plano.popular ? 'border-primary shadow-xl scale-105' : 'hover:shadow-lg'} transition-all`}
                  >
                    {plano.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                        Mais Popular
                      </Badge>
                    )}
                    
                    <CardHeader className="text-center pb-2">
                      <div className={`mx-auto p-3 rounded-full ${plano.cor} text-white mb-3`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl">{plano.nome}</CardTitle>
                      <CardDescription className="min-h-[40px]">{plano.descricao}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col">
                      <div className="text-center mb-6">
                        {pagamentoAnual && (
                          <span className="text-sm text-muted-foreground line-through block">
                            R$ {precoAnual.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                        <span className="text-4xl font-bold">
                          R$ {precoExibido.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-muted-foreground">{periodoExibido}</span>
                        {pagamentoAnual && (
                          <p className="text-sm text-green-600 mt-1">
                            Economia de R$ {economia.toFixed(2).replace('.', ',')}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-center gap-2 p-2 bg-muted rounded-lg">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">
                            Até {plano.limiteUsuarios} usuários
                          </span>
                        </div>
                        {plano.limiteTreinamentos && (
                          <div className="flex items-center justify-center gap-2 p-2 bg-muted rounded-lg">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium text-sm">
                              Até {plano.limiteTreinamentos} treinamentos
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <ul className="space-y-2 flex-1">
                        {plano.recursos
                          .filter(r => r.habilitado)
                          .slice(0, 5)
                          .map((recurso, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>{recurso.descricaoCustomizada || recurso.recursoId}</span>
                            </li>
                          ))}
                        {plano.recursos.filter(r => r.habilitado).length > 5 && (
                          <li className="text-sm text-muted-foreground text-center">
                            + {plano.recursos.filter(r => r.habilitado).length - 5} recursos adicionais
                          </li>
                        )}
                      </ul>
                      
                      <Link to="/login" className="mt-6">
                        <Button 
                          className={`w-full ${plano.popular ? '' : ''}`}
                          variant={plano.popular ? "default" : "outline"}
                        >
                          Escolher {plano.nome}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Enterprise additional info */}
            {planosAtivos.some(p => p.nome.toLowerCase().includes('enterprise')) && (
              <div className="mt-12 max-w-2xl mx-auto">
                <Card className="bg-muted/50">
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      <strong>Plano Enterprise:</strong> Precisa de mais treinamentos? 
                      Contrate pacotes adicionais de treinamentos extras por um valor adicional mensal.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Trainings */}
      {config.featured_trainings_enabled && (
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Treinamentos em Destaque
              </h2>
              <p className="text-xl text-muted-foreground">
                Conheça alguns dos nossos cursos mais populares
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {featuredTrainings.map((training) => (
                <Card key={training.id} className="hover:shadow-lg transition-shadow group">
                  <div className="aspect-video bg-gradient-primary rounded-t-lg flex items-center justify-center relative overflow-hidden">
                    <Play className="h-12 w-12 text-white group-hover:scale-110 transition-transform" />
                    <Badge className="absolute top-3 left-3 bg-white/20 text-white border-white/30">
                      {training.category}
                    </Badge>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {training.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {training.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {training.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {training.rating}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="secondary">
                        {training.level}
                      </Badge>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {training.students}
                      </span>
                    </div>
                    
                    <Link to="/login">
                      <Button className="w-full group-hover:bg-primary/90 transition-colors">
                        <Play className="mr-2 h-4 w-4" />
                        Iniciar Treinamento
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center mt-12">
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Ver Todos os Treinamentos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-glow">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {config.cta_title}
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {config.cta_subtitle}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
                <TrendingUp className="mr-2 h-5 w-5" />
                Começar Gratuitamente
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
              Falar com Especialista
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">{config.company_name}</h3>
              <p className="text-muted-foreground">
                {config.company_description}
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Produto</h4>
              <div className="space-y-2 text-muted-foreground">
                <div>Funcionalidades</div>
                <div>Preços</div>
                <div>Integrações</div>
                <div>API</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Empresa</h4>
              <div className="space-y-2 text-muted-foreground">
                <div>Sobre nós</div>
                <div>Carreiras</div>
                <div>Blog</div>
                <div>Contato</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-foreground">Suporte</h4>
              <div className="space-y-2 text-muted-foreground">
                <div>Central de Ajuda</div>
                <div>Documentação</div>
                <div>Status</div>
                <div>Termos de Uso</div>
              </div>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} {config.company_name}. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
