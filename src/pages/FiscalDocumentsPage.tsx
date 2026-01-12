import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import {
  FileText, CheckCircle2, AlertCircle, Upload, ArrowRight, Shield,
  Building, Calendar, Calculator, FileSearch, FolderOpen, Download,
  Info, Clock, Sparkles
} from 'lucide-react';

const REQUIRED_DOCUMENTS = [
  {
    category: 'Documentos Básicos',
    icon: Building,
    color: 'from-blue-500 to-cyan-500',
    items: [
      { name: 'CNPJ', description: 'Cartão CNPJ atualizado', required: true },
      { name: 'Contrato Social Completo', description: 'Última alteração contratual consolidada', required: true },
      { name: 'Cadastro Fiscal', description: 'Inscrição estadual e municipal', required: true }
    ]
  },
  {
    category: 'Faturamento e Notas',
    icon: FileText,
    color: 'from-emerald-500 to-green-500',
    items: [
      { name: 'Faturamento dos últimos 5 anos', description: 'Relatório de vendas mensal', required: true },
      { name: '60 Notas de Entrada', description: 'Últimas 60 notas fiscais de compra', required: true },
      { name: '60 Notas de Saída', description: 'Últimas 60 notas fiscais de venda', required: true }
    ]
  },
  {
    category: 'Obrigações Acessórias',
    icon: FileSearch,
    color: 'from-purple-500 to-violet-500',
    items: [
      { name: 'SPED Fiscal', description: 'Escrituração Fiscal Digital - EFD ICMS/IPI', required: true },
      { name: 'SPED Contribuições', description: 'EFD PIS/COFINS', required: true },
      { name: 'DCTF', description: 'Declaração de Débitos e Créditos Tributários Federais', required: true },
      { name: 'GIA', description: 'Guia de Informação e Apuração do ICMS', required: false },
      { name: 'PGDAS / DEFIS', description: 'Para empresas do Simples Nacional', required: false }
    ]
  },
  {
    category: 'Guias de Impostos',
    icon: Calculator,
    color: 'from-orange-500 to-amber-500',
    items: [
      { name: 'DAS', description: 'Documento de Arrecadação do Simples Nacional', required: false },
      { name: 'DARF', description: 'Documento de Arrecadação de Receitas Federais', required: true },
      { name: 'GPS', description: 'Guia da Previdência Social', required: false },
      { name: 'GNRE / GARE', description: 'Guias de recolhimento estadual', required: false }
    ]
  },
  {
    category: 'Folha de Pagamento',
    icon: Calendar,
    color: 'from-pink-500 to-rose-500',
    items: [
      { name: 'Folha de Pagamento', description: 'Relatório mensal de funcionários (se houver)', required: false },
      { name: 'SEFIP / GFIP', description: 'Informações ao FGTS e Previdência', required: false }
    ]
  },
  {
    category: 'Demonstrações Contábeis',
    icon: Shield,
    color: 'from-indigo-500 to-blue-500',
    items: [
      { name: 'Balanço Patrimonial', description: 'Últimos exercícios sociais', required: true },
      { name: 'Balancetes Mensais', description: 'Balancetes de verificação', required: true },
      { name: 'DRE', description: 'Demonstração do Resultado do Exercício', required: true }
    ]
  }
];

export default function FiscalDocumentsPage() {
  const navigate = useNavigate();
  const totalRequired = REQUIRED_DOCUMENTS.reduce((acc, cat) => acc + cat.items.filter(i => i.required).length, 0);
  const totalOptional = REQUIRED_DOCUMENTS.reduce((acc, cat) => acc + cat.items.filter(i => !i.required).length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <FileSearch className="w-4 h-4" />
              Análise Fiscal Completa
            </div>
            
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
              Documentos Necessários para{' '}
              <span className="text-primary">Análise Fiscal</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Para realizar uma análise fiscal completa e identificar oportunidades de recuperação de créditos, 
              precisamos dos seguintes documentos da sua empresa.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">{totalRequired} documentos obrigatórios</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted text-muted-foreground">
                <Info className="w-5 h-5" />
                <span className="font-medium">{totalOptional} documentos opcionais</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Documents List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-8">
            {REQUIRED_DOCUMENTS.map((category, catIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: catIndex * 0.1 }}
              >
                <Card className="border-0 shadow-soft overflow-hidden">
                  {/* Category Header */}
                  <div className={`bg-gradient-to-r ${category.color} p-6`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{category.category}</h2>
                        <p className="text-white/80 text-sm">
                          {category.items.filter(i => i.required).length} obrigatório(s) • 
                          {category.items.filter(i => !i.required).length} opcional(is)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <CardContent className="p-0">
                    <div className="divide-y divide-border">
                      {category.items.map((item, itemIndex) => (
                        <div
                          key={item.name}
                          className="p-4 hover:bg-muted/50 transition-colors flex items-center gap-4"
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            item.required 
                              ? 'bg-green-100 dark:bg-green-900/30' 
                              : 'bg-muted'
                          }`}>
                            {item.required ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <FolderOpen className="w-5 h-5 text-muted-foreground" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-foreground">{item.name}</h3>
                              <Badge variant={item.required ? 'default' : 'secondary'} className="text-xs">
                                {item.required ? 'Obrigatório' : 'Opcional'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Prazo de Análise</h3>
                      <p className="text-muted-foreground text-sm">
                        Após o envio de todos os documentos, nossa equipe realiza a análise em até 15 dias úteis, 
                        identificando oportunidades de recuperação de créditos.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Análise com IA</h3>
                      <p className="text-muted-foreground text-sm">
                        Utilizamos inteligência artificial para cruzar dados e identificar inconsistências, 
                        maximizando as chances de recuperação.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-soft mt-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Segurança dos Dados</h3>
                    <p className="text-muted-foreground text-sm">
                      Todos os documentos são tratados com total sigilo e segurança. Utilizamos criptografia de ponta 
                      e seguimos as melhores práticas de proteção de dados conforme a LGPD.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mx-auto mb-6">
              <Upload className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-2xl lg:text-4xl font-bold text-foreground mb-4">
              Pronto para Enviar os Documentos?
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8">
              Inicie sua análise fiscal agora mesmo e descubra quanto sua empresa pode recuperar em créditos tributários.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/modulo-fiscal')}
                className="h-14 px-10 text-lg font-semibold rounded-xl"
              >
                <Upload className="w-5 h-5 mr-2" />
                Enviar Documentos Agora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/contadores')}
                className="h-14 px-10 text-lg font-semibold rounded-xl"
              >
                Falar com Especialista
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              Tem dúvidas sobre algum documento? Nossa equipe está pronta para ajudar.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
