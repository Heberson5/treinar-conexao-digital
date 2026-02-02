import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  ArrowLeft, 
  Target, 
  Eye, 
  Heart, 
  Award, 
  Users, 
  TrendingUp, 
  Shield,
  Lightbulb,
  Rocket
} from "lucide-react"

export default function SobreNos() {
  const valores = [
    {
      icon: Lightbulb,
      title: "Inovação",
      description: "Buscamos constantemente novas formas de melhorar a experiência de aprendizado corporativo"
    },
    {
      icon: Users,
      title: "Colaboração",
      description: "Acreditamos que o sucesso vem do trabalho em equipe e da parceria com nossos clientes"
    },
    {
      icon: Shield,
      title: "Confiança",
      description: "Protegemos os dados dos nossos clientes com os mais altos padrões de segurança"
    },
    {
      icon: Heart,
      title: "Excelência",
      description: "Nos comprometemos a entregar sempre a melhor qualidade em tudo que fazemos"
    }
  ]

  const diferenciais = [
    {
      number: "10+",
      label: "Anos de Experiência",
      description: "Atuando no mercado de educação corporativa"
    },
    {
      number: "500+",
      label: "Empresas Atendidas",
      description: "Em diversos segmentos da indústria"
    },
    {
      number: "50K+",
      label: "Profissionais Capacitados",
      description: "Através da nossa plataforma"
    },
    {
      number: "98%",
      label: "Satisfação",
      description: "Dos nossos clientes recomendam"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary via-primary to-primary-dark py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Transformando o Futuro da Educação Corporativa
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
            Somos a Sauberlich System, uma empresa dedicada a revolucionar a forma como as organizações capacitam seus colaboradores, combinando tecnologia de ponta com metodologias pedagógicas inovadoras.
          </p>
        </div>
      </section>

      {/* Nossa História */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">Nossa História</h2>
              <p className="text-muted-foreground leading-relaxed">
                Fundada com a visão de democratizar o acesso à educação de qualidade no ambiente corporativo, a Sauberlich System nasceu da percepção de que as empresas precisavam de uma solução moderna, eficiente e acessível para capacitar suas equipes.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Ao longo dos anos, desenvolvemos uma plataforma robusta que combina as melhores práticas de aprendizado com tecnologia de última geração, permitindo que empresas de todos os tamanhos ofereçam treinamentos de alto impacto para seus colaboradores.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Hoje, somos referência no mercado brasileiro de educação corporativa, atendendo centenas de empresas e impactando milhares de profissionais em suas jornadas de desenvolvimento.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6">
                {diferenciais.map((item, index) => (
                  <div key={index} className="text-center p-4">
                    <div className="text-3xl font-bold text-primary">{item.number}</div>
                    <div className="font-medium text-foreground">{item.label}</div>
                    <div className="text-sm text-muted-foreground">{item.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Missão, Visão */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Nossa Missão</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Empoderar organizações através de soluções de treinamento inovadoras, acessíveis e eficazes, contribuindo para o desenvolvimento contínuo de profissionais e o crescimento sustentável das empresas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Eye className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">Nossa Visão</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Ser a plataforma líder em educação corporativa na América Latina, reconhecida pela excelência, inovação e pelo impacto positivo na transformação de pessoas e organizações.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Nossos Valores */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Nossos Valores</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Os princípios que guiam todas as nossas decisões e relacionamentos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {valores.map((valor, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow text-center">
                <CardContent className="p-6">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                    <valor.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">{valor.title}</h4>
                  <p className="text-muted-foreground text-sm">{valor.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Por que nos escolher */}
      <section className="py-16 bg-accent/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Por que escolher a Sauberlich System?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Implementação Rápida</h4>
              <p className="text-muted-foreground">
                Configure sua plataforma em minutos e comece a treinar sua equipe imediatamente
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Resultados Mensuráveis</h4>
              <p className="text-muted-foreground">
                Acompanhe o progresso e o impacto dos treinamentos com relatórios detalhados
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="p-4 rounded-full bg-primary/10 mb-4">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Suporte Especializado</h4>
              <p className="text-muted-foreground">
                Nossa equipe está pronta para ajudar você em cada etapa da jornada
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary via-primary to-primary-dark">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Pronto para transformar sua equipe?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Junte-se às centenas de empresas que já confiam na Sauberlich System
          </p>
          <Link to="/login">
            <Button size="lg" className="bg-background text-primary hover:bg-background/90 shadow-lg">
              Comece Agora Gratuitamente
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} Sauberlich System. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
