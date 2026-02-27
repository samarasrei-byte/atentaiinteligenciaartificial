import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Building2, Landmark, Gamepad2, ShoppingBag, Calculator,
  Award, KeyRound, Briefcase, FileText, Scale, Shield, User,
  Search, ArrowRight, Lock, Clock, Rocket, Check, Star,
  BadgeCheck, Flame, Sparkles, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeracService {
  key: string;
  name: string;
  description: string;
  targetAudience: string;
  features: string[];
  guarantees: string[];
  icon: React.ElementType;
  status: 'available' | 'soon' | 'exclusive';
  category: string;
  badge?: 'popular' | 'exclusive' | 'soon' | 'new';
}

const services: SeracService[] = [
  // Contabilidade para Empresas
  { key: 'mei', name: 'MEI', description: 'Gestão completa para Microempreendedor Individual com suporte dedicado.', targetAudience: 'Para microempreendedores', features: ['Abertura e regularização', 'Emissão de DAS mensal', 'Declaração DASN anual', 'Controle de faturamento'], guarantees: ['Suporte SERAC', 'Especialistas dedicados'], icon: User, status: 'available', category: 'empresas', badge: 'popular' },
  { key: 'me_epp', name: 'ME / EPP', description: 'Contabilidade completa para Micro e Pequenas Empresas.', targetAudience: 'Para micro e pequenas empresas', features: ['Simples Nacional completo', 'Folha de pagamento', 'Escrituração fiscal', 'Contabilidade mensal'], guarantees: ['Atendimento responsável', 'Relatórios mensais'], icon: Building2, status: 'available', category: 'empresas' },
  { key: 'lucro_real', name: 'Lucro Real', description: 'Gestão contábil e fiscal avançada para grandes operações.', targetAudience: 'Para empresas de grande porte', features: ['Escrituração completa', 'ECF e ECD', 'LALUR detalhado', 'Planejamento tributário'], guarantees: ['Compliance total', 'Equipe sênior'], icon: Calculator, status: 'available', category: 'empresas' },
  { key: 'lucro_presumido', name: 'Lucro Presumido', description: 'Regime tributário otimizado com apuração precisa.', targetAudience: 'Para empresas de médio porte', features: ['Apuração de impostos', 'DCTF e SPED', 'Obrigações acessórias', 'Análise de regime'], guarantees: ['Otimização fiscal', 'Suporte contínuo'], icon: Scale, status: 'available', category: 'empresas' },
  { key: 'holding', name: 'Holding Patrimonial', description: 'Planejamento patrimonial e societário de alta complexidade.', targetAudience: 'Para proteção patrimonial', features: ['Estruturação societária', 'Proteção patrimonial', 'Planejamento sucessório', 'Governança corporativa'], guarantees: ['Exclusivo SERAC', 'Consultoria premium'], icon: Briefcase, status: 'exclusive', category: 'empresas', badge: 'exclusive' },
  { key: 'planejamento', name: 'Planejamento Tributário', description: 'Redução legal da carga tributária com estratégias avançadas.', targetAudience: 'Para empresas que querem economizar', features: ['Diagnóstico tributário', 'Simulação de cenários', 'Implementação de estratégias', 'Monitoramento contínuo'], guarantees: ['Economia garantida', 'Metodologia SERAC'], icon: Scale, status: 'available', category: 'empresas' },

  // Contabilidade para Cartórios
  { key: 'cartorio_contabil', name: 'Gestão Contábil para Cartórios', description: 'Contabilidade exclusiva e especializada para cartórios.', targetAudience: 'Para cartórios extrajudiciais', features: ['Escrituração especializada', 'Conciliação de emolumentos', 'DRE gerencial', 'Relatórios customizados'], guarantees: ['Expertise em cartórios', 'Exclusivo SERAC'], icon: Landmark, status: 'exclusive', category: 'cartorios', badge: 'exclusive' },
  { key: 'cartorio_fiscal', name: 'Diagnóstico Tributário Cartório', description: 'Análise fiscal completa para otimização de cartórios.', targetAudience: 'Para redução de impostos', features: ['Mapeamento tributário', 'Identificação de oportunidades', 'Relatório detalhado', 'Plano de ação'], guarantees: ['Análise profunda', 'Resultados comprovados'], icon: FileText, status: 'available', category: 'cartorios' },
  { key: 'cartorio_otimizacao', name: 'Otimização Fiscal Cartório', description: 'Redução efetiva da carga tributária de cartórios.', targetAudience: 'Para maximizar resultados', features: ['Otimização de ISS', 'Planejamento de IR', 'CSLL estratégico', 'Gestão de emolumentos'], guarantees: ['ROI comprovado', 'Suporte SERAC'], icon: Scale, status: 'available', category: 'cartorios' },
  { key: 'cartorio_emolumentos', name: 'Análise de Emolumentos', description: 'Auditoria completa de taxas e receitas de cartório.', targetAudience: 'Para conferência de receitas', features: ['Conferência detalhada', 'Projeção de receitas', 'Benchmarking regional'], guarantees: ['Precisão analítica', 'Relatórios claros'], icon: Calculator, status: 'soon', category: 'cartorios', badge: 'soon' },

  // Infoprodutores
  { key: 'info_plr', name: 'PLR para Infoprodutores', description: 'Participação nos lucros estruturada para o digital.', targetAudience: 'Para infoprodutores', features: ['Estruturação completa', 'Compliance tributário', 'Distribuição otimizada', 'Relatórios de performance'], guarantees: ['Expertise digital', 'Parceria séria'], icon: ShoppingBag, status: 'available', category: 'infoprodutores' },
  { key: 'info_cursos', name: 'Cursos Online', description: 'Gestão contábil especializada para educadores digitais.', targetAudience: 'Para criadores de cursos', features: ['Gestão de faturamento', 'Apuração de impostos', 'Emissão de notas fiscais', 'Controle de plataformas'], guarantees: ['Multi-plataforma', 'Suporte ágil'], icon: FileText, status: 'available', category: 'infoprodutores' },
  { key: 'info_ecommerce', name: 'E-commerce Digital', description: 'Contabilidade para lojas e marketplaces digitais.', targetAudience: 'Para e-commerces', features: ['Gestão de vendas', 'Controle de estoque', 'Escrituração fiscal', 'Integração com plataformas'], guarantees: ['Automatização', 'Suporte contínuo'], icon: ShoppingBag, status: 'available', category: 'infoprodutores' },

  // Games & Tech
  { key: 'tech_games', name: 'Estúdios de Games', description: 'Contabilidade especializada para a indústria de games.', targetAudience: 'Para estúdios de jogos', features: ['Gestão de royalties', 'Operações internacionais', 'Incentivos fiscais', 'Compliance ANCINE'], guarantees: ['Exclusivo SERAC', 'Expertise tech'], icon: Gamepad2, status: 'exclusive', category: 'tech', badge: 'exclusive' },
  { key: 'tech_startups', name: 'Startups', description: 'Do MVP ao scale-up com suporte contábil estratégico.', targetAudience: 'Para startups inovadoras', features: ['Estruturação inicial', 'Preparação para rounds', 'Compliance societário', 'Valuation support'], guarantees: ['Mentalidade startup', 'Agilidade'], icon: Rocket, status: 'available', category: 'tech', badge: 'new' },
  { key: 'tech_saas', name: 'Empresas SaaS', description: 'Métricas financeiras e recorrência para SaaS.', targetAudience: 'Para empresas SaaS', features: ['Controle de MRR', 'Análise de churn', 'CAC/LTV tracking', 'Relatórios para investidores'], guarantees: ['Data-driven', 'Métricas SaaS'], icon: Building2, status: 'available', category: 'tech' },

  // IR
  { key: 'irpf', name: 'IRPF', description: 'Declaração completa de Imposto de Renda Pessoa Física.', targetAudience: 'Para pessoa física', features: ['Declaração completa', 'Declaração simplificada', 'Investimentos e crypto', 'Bens no exterior'], guarantees: ['Sem erros', 'Restituição maximizada'], icon: Calculator, status: 'available', category: 'ir', badge: 'popular' },
  { key: 'irpj', name: 'IRPJ', description: 'Declaração de Imposto de Renda Pessoa Jurídica.', targetAudience: 'Para empresas', features: ['ECF completa', 'Apuração detalhada', 'Compensação de prejuízos', 'Análise de benefícios'], guarantees: ['Compliance total', 'Equipe especializada'], icon: Building2, status: 'available', category: 'ir' },
  { key: 'regularizacao', name: 'Regularização Fiscal', description: 'Regularização de pendências com a Receita Federal.', targetAudience: 'Para regularizar situação', features: ['DCTF e obrigações', 'Parcelamento de débitos', 'Emissão de certidões', 'Defesa administrativa'], guarantees: ['Experiência comprovada', 'Resolução ágil'], icon: Shield, status: 'available', category: 'ir' },

  // Outros
  { key: 'marcas', name: 'Marcas e Patentes – INPI', description: 'Registro e proteção de marcas junto ao INPI.', targetAudience: 'Para proteção de marca', features: ['Registro de marca', 'Acompanhamento processual', 'Defesa de marca', 'Renovação automática'], guarantees: ['Proteção garantida', 'Acompanhamento INPI'], icon: Award, status: 'available', category: 'outros' },
  { key: 'certificado', name: 'Certificado Digital', description: 'Emissão de certificados digitais e-CPF, e-CNPJ e NF-e.', targetAudience: 'Para autenticação digital', features: ['e-CPF A1 e A3', 'e-CNPJ completo', 'NF-e e NFC-e', 'Instalação inclusa'], guarantees: ['Processo rápido', 'Suporte técnico'], icon: KeyRound, status: 'available', category: 'outros' },
  { key: 'consultoria', name: 'Consultoria Empresarial', description: 'Gestão estratégica e reestruturação empresarial.', targetAudience: 'Para transformação empresarial', features: ['Planejamento estratégico', 'Reestruturação operacional', 'Valuation profissional', 'Assessoria M&A'], guarantees: ['Exclusivo SERAC', 'C-Level advisory'], icon: Briefcase, status: 'exclusive', category: 'outros', badge: 'exclusive' },
];

const categories = [
  { id: 'all', label: 'Todos', icon: Briefcase },
  { id: 'empresas', label: 'Empresas', icon: Building2 },
  { id: 'cartorios', label: 'Cartórios', icon: Landmark },
  { id: 'infoprodutores', label: 'Infoprodutores', icon: ShoppingBag },
  { id: 'tech', label: 'Games & Tech', icon: Gamepad2 },
  { id: 'ir', label: 'Imposto de Renda', icon: Calculator },
  { id: 'outros', label: 'Outros', icon: Award },
];

const socialProof = [
  { value: '1.200+', label: 'Empresas atendidas' },
  { value: 'R$ 45M+', label: 'Economizados para clientes' },
  { value: '4.9/5', label: 'Avaliação média' },
  { value: '98%', label: 'Taxa de retenção' },
];

const badgeConfig = {
  popular: { label: 'MAIS VENDIDO', icon: Flame, cls: 'bg-accent text-white' },
  exclusive: { label: 'EXCLUSIVO SERAC', icon: Lock, cls: 'bg-gradient-to-r from-primary to-blue-600 text-white' },
  soon: { label: 'EM BREVE', icon: Clock, cls: 'bg-muted-foreground text-white' },
  new: { label: 'NOVO', icon: Star, cls: 'bg-blue-500 text-white' },
};

function SeracServiceCard({ service }: { service: SeracService }) {
  const handleSolicitar = () => {
    if (service.status === 'soon') return;
    toast.success(`Solicitação de "${service.name}" enviada com sucesso!`, {
      description: 'Nossa equipe SERAC entrará em contato em até 24 horas.',
    });
  };

  const isDisabled = service.status === 'soon';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <Card className={cn(
        "h-full flex flex-col border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group relative overflow-hidden rounded-2xl bg-card",
        service.badge === 'popular' ? 'border-accent/50 ring-1 ring-accent/20' :
        service.badge === 'exclusive' ? 'border-primary/50 ring-1 ring-primary/20' :
        'border-border hover:border-primary/30'
      )}>
        {/* Badge */}
        {service.badge && (
          <div className="absolute top-4 right-4 z-10">
            {(() => {
              const cfg = badgeConfig[service.badge];
              return (
                <Badge className={cn("border-0 text-[11px] font-semibold px-3 py-1 shadow-lg", cfg.cls)}>
                  <cfg.icon className="w-3 h-3 mr-1" />
                  {cfg.label}
                </Badge>
              );
            })()}
          </div>
        )}

        <CardContent className="p-6 flex flex-col flex-1">
          {/* Icon */}
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 transition-transform group-hover:scale-110">
            <service.icon className="h-7 w-7 text-primary" />
          </div>

          {/* Target Audience */}
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            {service.targetAudience}
          </p>

          {/* Name */}
          <h3 className="text-xl font-bold text-foreground mb-2 leading-tight">
            {service.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4">
            {service.description}
          </p>

          {/* Features List */}
          <div className="space-y-2.5 mb-5 flex-grow">
            {service.features.map((feature, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground/80">{feature}</span>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="py-4 border-t border-border mb-4">
            {service.status === 'soon' ? (
              <div>
                <span className="text-lg font-bold text-muted-foreground">Em Breve</span>
                <p className="text-xs text-muted-foreground mt-1">Disponível em breve na plataforma</p>
              </div>
            ) : (
              <div>
                <span className="text-xl font-bold text-primary">Sob Consulta</span>
                <p className="text-xs text-muted-foreground mt-1">
                  Fale com nossa equipe para uma proposta personalizada
                </p>
              </div>
            )}
          </div>

          {/* Guarantees */}
          <div className="flex flex-wrap gap-2 mb-5">
            {service.guarantees.map((guarantee, i) => (
              <span key={i} className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {guarantee}
              </span>
            ))}
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleSolicitar}
            disabled={isDisabled}
            className={cn(
              "w-full rounded-xl h-12 font-semibold text-white transition-all shadow-lg hover:shadow-xl mt-auto",
              isDisabled ? 'bg-muted-foreground cursor-not-allowed' : 'serac-gradient hover:opacity-90'
            )}
          >
            {isDisabled ? 'Em Breve' : 'Solicitar'}
            {!isDisabled && <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function SeracMarketplace() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      const matchesSearch =
        search === '' ||
        svc.name.toLowerCase().includes(search.toLowerCase()) ||
        svc.description.toLowerCase().includes(search.toLowerCase()) ||
        svc.targetAudience.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || svc.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const totalAvailable = services.filter(s => s.status === 'available').length;
  const totalExclusive = services.filter(s => s.status === 'exclusive').length;
  const totalSoon = services.filter(s => s.status === 'soon').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  return (
    <div className="space-y-0 -m-4 lg:-m-8">
      {/* Hero Section */}
      <section className="relative py-16 lg:py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, hsl(210 50% 15%) 0%, hsl(215 60% 25%) 50%, hsl(200 50% 20%) 100%)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Marketplace de Serviços
              <span className="block text-accent mt-1">Contábeis & Especializados</span>
            </h1>

            <p className="text-base lg:text-lg text-white/80 max-w-xl mx-auto mb-8">
              Catálogo completo de serviços SERAC com atendimento{' '}
              <span className="text-accent font-semibold">exclusivo e personalizado</span>
            </p>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-accent" />
                <span>100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-accent" />
                <span>Especialistas Verificados</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-accent" />
                <span>4.9 Avaliação</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-card border-b border-border py-4">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 justify-center">
              <div className="p-2 rounded-lg bg-success/10"><Rocket className="h-4 w-4 text-success" /></div>
              <div><p className="text-lg font-bold text-foreground">{totalAvailable}</p><p className="text-[10px] text-muted-foreground uppercase">Disponível</p></div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <div className="p-2 rounded-lg bg-accent/10"><Clock className="h-4 w-4 text-accent" /></div>
              <div><p className="text-lg font-bold text-foreground">{totalSoon}</p><p className="text-[10px] text-muted-foreground uppercase">Em Breve</p></div>
            </div>
            <div className="flex items-center gap-3 justify-center">
              <div className="p-2 rounded-lg bg-primary/10"><Lock className="h-4 w-4 text-primary" /></div>
              <div><p className="text-lg font-bold text-foreground">{totalExclusive}</p><p className="text-[10px] text-muted-foreground uppercase">Exclusivo SERAC</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filter Bar - STICKY */}
      <section className="sticky top-16 z-20 bg-card/98 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl lg:text-2xl font-bold text-foreground whitespace-nowrap">
                Nossos Serviços
              </h2>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 whitespace-nowrap">
                {filteredServices.length} serviços
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar serviço..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn("whitespace-nowrap transition-all", selectedCategory === cat.id && 'serac-gradient text-white')}
                  >
                    <cat.icon className="h-3.5 w-3.5 mr-1.5" />
                    {cat.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services Grid */}
      <section className="py-12 bg-background">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredServices.map((service) => (
              <SeracServiceCard key={service.key} service={service} />
            ))}
          </motion.div>

          {filteredServices.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">Nenhum serviço encontrado para "{search}"</p>
              <Button variant="outline" onClick={() => { setSearch(''); setSelectedCategory('all'); }}>
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-card border-t border-border">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {socialProof.map((stat, i) => (
              <div key={i}>
                <p className="text-2xl lg:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Powered by */}
      <section className="py-6 bg-card border-t border-border">
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <p className="text-[10px] text-muted-foreground">Powered by AtentAI</p>
          </div>
        </div>
      </section>
    </div>
  );
}
