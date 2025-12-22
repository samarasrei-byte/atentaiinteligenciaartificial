import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermosDeUso() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
          <p className="text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground mb-4">
              Ao acessar e usar a plataforma AtentAi, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
              Se você não concordar com qualquer parte destes termos, não poderá acessar o serviço.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground mb-4">
              O AtentAi é uma plataforma de simulação tributária que oferece:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Simulador de impostos com base na Reforma Tributária</li>
              <li>Comparador de regimes tributários</li>
              <li>Assistente de IA para dúvidas fiscais</li>
              <li>Conexão com contadores especializados</li>
              <li>Exportação de relatórios em PDF e Excel</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">3. Cadastro e Conta</h2>
            <p className="text-muted-foreground mb-4">
              Para utilizar nossos serviços, você deve:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Ter pelo menos 18 anos de idade</li>
              <li>Fornecer informações verdadeiras e atualizadas</li>
              <li>Manter a confidencialidade de sua senha</li>
              <li>Ser responsável por todas as atividades em sua conta</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">4. Planos e Pagamentos</h2>
            <p className="text-muted-foreground mb-4">
              Oferecemos diferentes planos de assinatura. Ao assinar um plano pago, você concorda que:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Os pagamentos são processados de forma segura pelo Stripe</li>
              <li>As assinaturas são renovadas automaticamente</li>
              <li>Você pode cancelar a qualquer momento pelo portal do cliente</li>
              <li>Reembolsos seguem nossa política de reembolso</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">5. Uso Aceitável</h2>
            <p className="text-muted-foreground mb-4">
              Você concorda em não:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Usar o serviço para fins ilegais</li>
              <li>Tentar acessar áreas restritas do sistema</li>
              <li>Compartilhar sua conta com terceiros</li>
              <li>Revender ou redistribuir nossos serviços</li>
              <li>Usar automação não autorizada</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">6. Isenção de Responsabilidade</h2>
            <p className="text-muted-foreground mb-4">
              O AtentAi fornece simulações e informações tributárias para fins educacionais e de planejamento. 
              <strong> Nossas simulações não substituem consultoria tributária profissional.</strong> 
              Recomendamos sempre consultar um contador ou advogado tributarista para decisões importantes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">7. Propriedade Intelectual</h2>
            <p className="text-muted-foreground mb-4">
              Todo o conteúdo, design, código e funcionalidades do AtentAi são protegidos por direitos autorais 
              e outras leis de propriedade intelectual. Você não pode copiar, modificar ou distribuir nosso conteúdo 
              sem autorização prévia.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">8. Modificações nos Termos</h2>
            <p className="text-muted-foreground mb-4">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. 
              Notificaremos sobre mudanças significativas por e-mail ou através da plataforma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">9. Contato</h2>
            <p className="text-muted-foreground mb-4">
              Para dúvidas sobre estes termos, entre em contato conosco através do e-mail: 
              <a href="mailto:contato@atentai.com.br" className="text-primary hover:underline ml-1">
                contato@atentai.com.br
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">10. Lei Aplicável</h2>
            <p className="text-muted-foreground mb-4">
              Estes termos são regidos pelas leis da República Federativa do Brasil. 
              Qualquer disputa será resolvida nos tribunais da cidade de São Paulo, SP.
            </p>
          </section>
        </article>

        <div className="mt-12 pt-6 border-t">
          <p className="text-sm text-muted-foreground text-center">
            Veja também nossa{' '}
            <Link to="/privacidade" className="text-primary hover:underline">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
