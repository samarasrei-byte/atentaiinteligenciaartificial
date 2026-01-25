import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PublicLayout } from '@/components/layout/PublicLayout';

export default function PoliticaPrivacidade() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Link>
          </Button>

          <article className="prose prose-slate dark:prose-invert max-w-none">
            <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
            <p className="text-muted-foreground mb-8">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">1. Introdução</h2>
              <p className="text-muted-foreground mb-4">
                O AtentAI está comprometido em proteger sua privacidade. Esta Política de Privacidade explica 
                como coletamos, usamos, divulgamos e protegemos suas informações pessoais, em conformidade com a 
                Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">2. Dados Coletados</h2>
              <p className="text-muted-foreground mb-4">Coletamos os seguintes tipos de informações:</p>
              
              <h3 className="text-lg font-medium mb-2">2.1 Dados de Cadastro</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>Nome completo</li>
                <li>Endereço de e-mail</li>
                <li>Telefone (opcional)</li>
                <li>Senha (criptografada)</li>
              </ul>

              <h3 className="text-lg font-medium mb-2">2.2 Dados da Empresa</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2 mb-4">
                <li>CNPJ e razão social</li>
                <li>Tipo de empresa e regime tributário</li>
                <li>Faturamento mensal e anual</li>
                <li>Setor de atuação</li>
                <li>Localização (cidade/estado)</li>
              </ul>

              <h3 className="text-lg font-medium mb-2">2.3 Dados de Uso</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Simulações realizadas</li>
                <li>Histórico de consultas</li>
                <li>Interações com o chat de IA</li>
                <li>Dados de navegação e logs de acesso</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">3. Finalidade do Tratamento</h2>
              <p className="text-muted-foreground mb-4">Utilizamos seus dados para:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Fornecer e melhorar nossos serviços</li>
                <li>Realizar simulações tributárias personalizadas</li>
                <li>Processar pagamentos e gerenciar assinaturas</li>
                <li>Enviar comunicações sobre o serviço</li>
                <li>Conectar você com contadores especializados (quando solicitado)</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">4. Base Legal</h2>
              <p className="text-muted-foreground mb-4">O tratamento de dados é realizado com base nas seguintes hipóteses legais da LGPD:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Consentimento:</strong> Para comunicações de marketing</li>
                <li><strong>Execução de contrato:</strong> Para prestação dos serviços contratados</li>
                <li><strong>Interesse legítimo:</strong> Para melhorias no serviço e segurança</li>
                <li><strong>Cumprimento de obrigação legal:</strong> Para retenção fiscal obrigatória</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">5. Compartilhamento de Dados</h2>
              <p className="text-muted-foreground mb-4">Seus dados podem ser compartilhados com:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Stripe:</strong> Para processamento de pagamentos</li>
                <li><strong>Contadores parceiros:</strong> Apenas quando você solicitar uma consultoria</li>
                <li><strong>Provedores de infraestrutura:</strong> Para hospedagem e armazenamento seguro</li>
                <li><strong>Autoridades competentes:</strong> Quando exigido por lei</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                <strong>Não vendemos seus dados pessoais a terceiros.</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">6. Segurança dos Dados</h2>
              <p className="text-muted-foreground mb-4">Implementamos medidas técnicas e organizacionais para proteger seus dados:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Criptografia de dados em trânsito (SSL/TLS) e em repouso</li>
                <li>Controle de acesso baseado em funções (RBAC)</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Backups regulares e plano de recuperação de desastres</li>
                <li>Autenticação segura com hash de senhas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">7. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground mb-4">Você tem direito a:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Confirmar a existência de tratamento de dados</li>
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos ou desatualizados</li>
                <li>Anonimizar, bloquear ou eliminar dados desnecessários</li>
                <li>Portabilidade dos dados</li>
                <li>Eliminar dados tratados com base em consentimento</li>
                <li>Revogar consentimento a qualquer momento</li>
                <li>Obter informações sobre compartilhamento de dados</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Para exercer seus direitos, entre em contato pelo e-mail: 
                <a href="mailto:privacidade@atentai.com.br" className="text-primary hover:underline ml-1">
                  privacidade@atentai.com.br
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">8. Retenção de Dados</h2>
              <p className="text-muted-foreground mb-4">Mantemos seus dados pelo tempo necessário para:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Prestação dos serviços contratados</li>
                <li>Cumprimento de obrigações legais (até 5 anos para dados fiscais)</li>
                <li>Exercício regular de direitos em processos judiciais</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Após o cancelamento da conta, seus dados serão anonimizados ou eliminados em até 30 dias, 
                exceto quando a retenção for necessária por obrigação legal.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">9. Cookies</h2>
              <p className="text-muted-foreground mb-4">
                Utilizamos cookies essenciais para funcionamento do serviço e cookies analíticos 
                para melhorar a experiência do usuário. Você pode gerenciar suas preferências 
                de cookies nas configurações do navegador.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">10. Alterações nesta Política</h2>
              <p className="text-muted-foreground mb-4">
                Esta política pode ser atualizada periodicamente. Notificaremos sobre alterações 
                significativas por e-mail ou através da plataforma. O uso continuado do serviço 
                após as alterações constitui aceitação da política atualizada.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">11. Encarregado de Dados (DPO)</h2>
              <p className="text-muted-foreground mb-4">
                Para questões relacionadas à proteção de dados, entre em contato com nosso 
                Encarregado de Proteção de Dados:
              </p>
              <p className="text-muted-foreground">
                E-mail: <a href="mailto:dpo@atentai.com.br" className="text-primary hover:underline">dpo@atentai.com.br</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4">12. Contato</h2>
              <p className="text-muted-foreground mb-4">Para dúvidas sobre esta política, entre em contato:</p>
              <ul className="list-none text-muted-foreground space-y-1">
                <li>E-mail: <a href="mailto:contato@atentai.com.br" className="text-primary hover:underline">contato@atentai.com.br</a></li>
                <li>Telefone: (11) 3000-0000</li>
              </ul>
            </section>
          </article>

          <div className="mt-12 pt-6 border-t">
            <p className="text-sm text-muted-foreground text-center">
              Veja também nossos{' '}
              <Link to="/termos" className="text-primary hover:underline">
                Termos de Uso
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
