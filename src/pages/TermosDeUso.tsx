import { useLandingConfig } from "@/hooks/use-landing-config"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function TermosDeUso() {
  const { config, isLoading } = useLandingConfig()

  const renderMarkdown = (text: string) => {
    // Conversão simples de Markdown para HTML
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
      // Bold and Italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary underline hover:no-underline">$1</a>')
      // Code
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      // Horizontal Rule
      .replace(/^---$/gim, '<hr class="my-6 border-border" />')
      // Blockquote
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground">$1</blockquote>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="my-4">')
      .replace(/\n/g, '<br />')

    return `<div class="prose dark:prose-invert max-w-none"><p class="my-4">${html}</p></div>`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  // Conteúdo padrão caso não exista no banco
  const defaultContent = `# Termos de Uso

## 1. Aceitação dos Termos
Ao acessar e utilizar a plataforma ${config.company_name}, você concorda em cumprir estes Termos de Uso.

## 2. Definições
- **Plataforma**: Sistema de gestão de treinamentos corporativos
- **Usuário**: Pessoa física ou jurídica que utiliza os serviços
- **Conteúdo**: Materiais de treinamento, vídeos, textos e avaliações

## 3. Uso da Plataforma
3.1. O acesso é restrito a usuários autorizados pela empresa contratante.
3.2. É proibido compartilhar credenciais de acesso.
3.3. O conteúdo é protegido por direitos autorais.

## 4. Responsabilidades
4.1. O usuário é responsável por manter suas credenciais seguras.
4.2. A plataforma não se responsabiliza por uso indevido.
4.3. Conteúdos gerados por usuários são de responsabilidade do criador.

## 5. Privacidade e LGPD
5.1. Coletamos apenas dados necessários para funcionamento do serviço.
5.2. Seus dados são protegidos conforme a Lei Geral de Proteção de Dados.
5.3. Você pode solicitar a exclusão de seus dados a qualquer momento.

## 6. Pagamentos
6.1. Os planos são cobrados conforme contrato firmado.
6.2. O não pagamento pode resultar em suspensão do acesso.
6.3. Reembolsos seguem a política vigente no momento da contratação.

## 7. Cancelamento
7.1. O cancelamento pode ser solicitado a qualquer momento.
7.2. Os dados serão mantidos por 30 dias após o cancelamento.
7.3. Após este período, todos os dados serão excluídos permanentemente.

## 8. Alterações nos Termos
8.1. Estes termos podem ser alterados a qualquer momento.
8.2. Alterações significativas serão comunicadas por e-mail.
8.3. O uso continuado implica aceitação das alterações.

## 9. Contato
Para dúvidas sobre estes termos, entre em contato através dos canais oficiais da plataforma.`

  const content = config.termos_de_uso || defaultContent

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">{config.company_name}</span>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      </main>

      {/* Footer */}
      <footer className="bg-background border-t py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {config.company_name}. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
