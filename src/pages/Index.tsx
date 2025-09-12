import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Play, 
  BookOpen, 
  Users, 
  Award, 
  Star, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  Search,
  ArrowRight,
  Building,
  Shield,
  Zap
} from "lucide-react"

export default function Index() {
  const [email, setEmail] = useState("")

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

  const stats = [
    {
      value: "50,000+",
      label: "Funcionários Treinados",
      icon: Users,
      color: "text-blue-600"
    },
    {
      value: "1,500+",
      label: "Empresas Atendidas",
      icon: Building,
      color: "text-green-600"
    },
    {
      value: "300+",
      label: "Cursos Disponíveis",
      icon: BookOpen,
      color: "text-purple-600"
    },
    {
      value: "98%",
      label: "Taxa de Satisfação",
      icon: Star,
      color: "text-yellow-600"
    }
  ]

  const features = [
    {
      title: "Plataforma Segura",
      description: "Seus dados protegidos com criptografia de ponta",
      icon: Shield,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Aprendizado Rápido",
      description: "Metodologia otimizada para máxima retenção",
      icon: Zap,
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      title: "Certificação",
      description: "Certificados reconhecidos pelo mercado",
      icon: Award,
      color: "bg-green-100 text-green-600"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-glow to-primary-darker">
        <div className="absolute inset-0 bg-grid-white/10 bg-grid" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge className="bg-white/20 text-white border-white/30 mb-4">
                  🚀 Transforme sua equipe hoje mesmo
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
                  A Plataforma de
                  <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    Treinamentos
                  </span>
                  do Futuro
                </h1>
                <p className="text-xl text-white/90 mt-6 leading-relaxed">
                  Capacite sua equipe com treinamentos interativos, gamificados e com certificação.
                  Resultados mensuráveis em semanas, não meses.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/login">
                  <Button size="lg" className="bg-white text-primary hover:bg-white/90 shadow-lg">
                    <Play className="mr-2 h-5 w-5" />
                    Comece Agora Grátis
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Ver Demonstração
                </Button>
              </div>
              
              <div className="flex items-center gap-6 text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Setup em 5 minutos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span>Suporte 24/7</span>
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
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`inline-flex p-3 rounded-full bg-background mb-4`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
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
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center">
                  <div className={`inline-flex p-4 rounded-full ${feature.color} mb-4`}>
                    <feature.icon className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Trainings */}
      <section className="py-20 bg-accent/30">
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-glow">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para transformar sua equipe?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Junte-se a milhares de empresas que já revolucionaram seus treinamentos conosco
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
              <h3 className="text-lg font-semibold text-foreground">Portal Treinamentos</h3>
              <p className="text-muted-foreground">
                A plataforma mais avançada para treinamentos corporativos.
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
            <p>&copy; 2024 Portal Treinamentos. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}