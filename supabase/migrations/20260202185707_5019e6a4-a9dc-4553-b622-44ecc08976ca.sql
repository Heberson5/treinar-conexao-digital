-- Add color palette to empresas table
ALTER TABLE public.empresas 
ADD COLUMN IF NOT EXISTS tema_cor TEXT DEFAULT 'purple';

-- Add terms and about content to landing_page_config
ALTER TABLE public.landing_page_config 
ADD COLUMN IF NOT EXISTS termos_de_uso TEXT DEFAULT '# Termos de Uso

## 1. Aceitação dos Termos
Ao acessar e utilizar a plataforma Sauberlich System, você concorda em cumprir estes Termos de Uso.

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
Para dúvidas sobre estes termos, entre em contato através dos canais oficiais da plataforma.',

ADD COLUMN IF NOT EXISTS sobre_nos TEXT DEFAULT '# Sobre Nós

## Nossa Missão
Transformar a forma como empresas capacitam suas equipes, oferecendo uma plataforma de treinamentos moderna, intuitiva e eficaz.

## Quem Somos
A Sauberlich System nasceu da visão de revolucionar o treinamento corporativo. Combinamos tecnologia de ponta com metodologias comprovadas de aprendizagem para entregar resultados mensuráveis.

## Nossa História
Fundada com o objetivo de democratizar o acesso a treinamentos de qualidade, a Sauberlich System tem ajudado empresas de todos os portes a desenvolver suas equipes de forma eficiente e escalável.

## Nossos Valores

### Inovação
Estamos sempre buscando novas formas de melhorar a experiência de aprendizado, incorporando as mais recentes tecnologias e metodologias educacionais.

### Qualidade
Cada treinamento em nossa plataforma passa por rigoroso processo de curadoria, garantindo conteúdo relevante e atualizado.

### Resultados
Nosso foco é no impacto real que os treinamentos geram nas empresas - aumento de produtividade, redução de erros e desenvolvimento profissional.

### Segurança
Seus dados são protegidos com os mais altos padrões de segurança, em conformidade com a LGPD e melhores práticas do mercado.

## Por que nos Escolher?

- **+50.000** funcionários treinados
- **+1.500** empresas atendidas  
- **+300** cursos disponíveis
- **98%** de taxa de satisfação

## Nossa Tecnologia
Utilizamos inteligência artificial para personalizar a experiência de aprendizado, identificando gaps de conhecimento e sugerindo conteúdos relevantes para cada colaborador.

## Compromisso com o Cliente
Oferecemos suporte dedicado e consultoria especializada para garantir que sua empresa extraia o máximo valor da nossa plataforma.

---

*Sauberlich System - Transformando conhecimento em resultados.*';