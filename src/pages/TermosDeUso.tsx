import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermosDeUso() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-8">Termos de Uso</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <p className="text-muted-foreground text-lg leading-relaxed">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar e utilizar a plataforma Sauberlich System ("Plataforma"), você ("Usuário") concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá acessar ou utilizar a Plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              A Sauberlich System é uma plataforma de gestão de treinamentos corporativos que oferece ferramentas para criação, distribuição e monitoramento de cursos online. Nossos serviços incluem:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Criação e gerenciamento de treinamentos personalizados</li>
              <li>Acompanhamento de progresso e desempenho dos colaboradores</li>
              <li>Emissão de certificados de conclusão</li>
              <li>Relatórios analíticos e indicadores de performance</li>
              <li>Gestão de usuários e departamentos</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">3. Cadastro e Conta</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para utilizar a Plataforma, você deve criar uma conta fornecendo informações precisas, completas e atualizadas. Você é responsável por manter a confidencialidade de sua senha e por todas as atividades realizadas em sua conta. Compromete-se a notificar imediatamente qualquer uso não autorizado de sua conta.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">4. Propriedade Intelectual</h2>
            <p className="text-muted-foreground leading-relaxed">
              Todo o conteúdo disponível na Plataforma, incluindo textos, gráficos, logotipos, ícones, imagens, clipes de áudio e vídeo, downloads digitais e compilações de dados, é propriedade da Sauberlich System ou de seus licenciadores e é protegido por leis de propriedade intelectual.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              O conteúdo criado pelos Usuários permanece de propriedade do respectivo Usuário ou empresa, sendo concedida à Plataforma licença limitada para hospedagem e distribuição conforme as funcionalidades do serviço.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">5. Uso Aceitável</h2>
            <p className="text-muted-foreground leading-relaxed">Ao utilizar a Plataforma, você concorda em não:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Violar qualquer lei ou regulamento aplicável</li>
              <li>Infringir direitos de propriedade intelectual de terceiros</li>
              <li>Transmitir conteúdo ilegal, difamatório, obsceno ou prejudicial</li>
              <li>Interferir ou interromper a integridade ou o desempenho da Plataforma</li>
              <li>Tentar obter acesso não autorizado a sistemas ou redes</li>
              <li>Coletar informações de outros usuários sem consentimento</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">6. Planos e Pagamentos</h2>
            <p className="text-muted-foreground leading-relaxed">
              A Plataforma oferece diferentes planos de assinatura com recursos e limites específicos. Os pagamentos são processados de forma segura através de parceiros certificados. O cancelamento da assinatura pode ser realizado a qualquer momento, sendo os serviços mantidos até o final do período já pago.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">7. Proteção de Dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estamos comprometidos com a proteção de seus dados pessoais em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018). Coletamos apenas os dados necessários para a prestação dos serviços e implementamos medidas técnicas e organizacionais apropriadas para garantir a segurança das informações.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">8. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              A Sauberlich System não será responsável por danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo perda de lucros, dados ou uso, resultantes do acesso ou uso da Plataforma. Nossa responsabilidade máxima será limitada ao valor pago pelo Usuário nos últimos 12 meses.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">9. Disponibilidade do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              Nos esforçamos para manter a Plataforma disponível 24 horas por dia, 7 dias por semana. No entanto, não garantimos que o serviço será ininterrupto ou livre de erros. Poderemos realizar manutenções programadas com aviso prévio aos Usuários.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">10. Modificações dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor imediatamente após sua publicação na Plataforma. O uso continuado após as modificações constitui aceitação dos novos termos.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">11. Rescisão</h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos suspender ou encerrar seu acesso à Plataforma imediatamente, sem aviso prévio, por qualquer motivo, incluindo violação destes Termos. Após a rescisão, seu direito de usar a Plataforma cessará imediatamente.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">12. Lei Aplicável</h2>
            <p className="text-muted-foreground leading-relaxed">
              Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer disputa decorrente destes termos será submetida ao foro da comarca de Santa Catarina, Brasil.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">13. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para questões relacionadas a estes Termos de Uso, entre em contato conosco através dos canais oficiais disponíveis na Plataforma.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">
            &copy; {new Date().getFullYear()} Sauberlich System. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
