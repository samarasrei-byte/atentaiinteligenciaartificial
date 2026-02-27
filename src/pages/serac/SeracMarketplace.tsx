import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2, Landmark, Gamepad2, ShoppingBag, Calculator,
  Award, KeyRound, Briefcase, FileText, Scale, Shield, User,
  Search, ArrowRight, Lock, Clock, Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Service {
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'available' | 'soon' | 'exclusive';
  items: string[];
}

const categories: { key: string; label: string; services: Service[] }[] = [
  {
    key: 'empresas', label: 'Contabilidade para Empresas',
    services: [
      { name: 'MEI', description: 'Gestão completa para Microempreendedor Individual', icon: User, status: 'available', items: ['Abertura', 'DAS', 'DASN', 'Faturamento'] },
      { name: 'ME / EPP', description: 'Contabilidade para Micro e Pequenas Empresas', icon: Building2, status: 'available', items: ['Simples Nacional', 'Folha', 'Fiscal', 'Contábil'] },
      { name: 'Lucro Real', description: 'Gestão contábil e fiscal avançada', icon: Calculator, status: 'available', items: ['Escrituração', 'ECF', 'ECD', 'LALUR'] },
      { name: 'Lucro Presumido', description: 'Regime tributário otimizado', icon: Scale, status: 'available', items: ['Apuração', 'DCTF', 'SPED', 'Obrigações'] },
      { name: 'Holding', description: 'Planejamento patrimonial e societário', icon: Briefcase, status: 'exclusive', items: ['Estruturação', 'Proteção patrimonial', 'Planejamento sucessório'] },
      { name: 'Planejamento Tributário', description: 'Redução legal da carga tributária', icon: Scale, status: 'available', items: ['Diagnóstico', 'Simulação', 'Implementação', 'Monitoramento'] },
    ],
  },
  {
    key: 'cartorios', label: 'Contabilidade para Cartórios',
    services: [
      { name: 'Gestão Contábil Especializada', description: 'Contabilidade exclusiva para cartórios', icon: Landmark, status: 'exclusive', items: ['Escrituração', 'Conciliação', 'DRE'] },
      { name: 'Diagnóstico Tributário', description: 'Análise fiscal completa', icon: FileText, status: 'available', items: ['Mapeamento', 'Oportunidades', 'Relatório'] },
      { name: 'Otimização Fiscal', description: 'Redução de carga tributária', icon: Scale, status: 'available', items: ['ISS', 'IR', 'CSLL', 'Emolumentos'] },
      { name: 'Análise de Emolumentos', description: 'Auditoria de taxas e receitas', icon: Calculator, status: 'soon', items: ['Conferência', 'Projeção', 'Benchmarking'] },
      { name: 'Planejamento Societário', description: 'Estruturação societária', icon: Briefcase, status: 'soon', items: ['Sociedade', 'Sucessão', 'Governança'] },
    ],
  },
  {
    key: 'infoprodutores', label: 'Infoprodutores',
    services: [
      { name: 'PLR', description: 'Participação nos Lucros para infoprodutores', icon: ShoppingBag, status: 'available', items: ['Estruturação', 'Compliance', 'Distribuição'] },
      { name: 'Cursos Online', description: 'Gestão contábil para educadores digitais', icon: FileText, status: 'available', items: ['Faturamento', 'Impostos', 'Notas'] },
      { name: 'Coprodução', description: 'Contabilidade para coparcerias digitais', icon: User, status: 'soon', items: ['Split', 'Contratos', 'Tributação'] },
      { name: 'E-commerce Digital', description: 'Lojas e marketplaces', icon: ShoppingBag, status: 'available', items: ['Vendas', 'Estoque', 'Fiscal'] },
    ],
  },
  {
    key: 'tech', label: 'Games & Tech',
    services: [
      { name: 'Estúdios de Games', description: 'Contabilidade para estúdios', icon: Gamepad2, status: 'exclusive', items: ['Royalties', 'Internacional', 'Incentivos'] },
      { name: 'Startups', description: 'Do MVP ao scale-up', icon: Rocket, status: 'available', items: ['Estruturação', 'Rounds', 'Compliance'] },
      { name: 'Empresas SaaS', description: 'Recorrência e métricas', icon: Building2, status: 'available', items: ['MRR', 'Churn', 'CAC/LTV'] },
      { name: 'Captação de Investimento', description: 'Preparação para investidores', icon: Briefcase, status: 'soon', items: ['Valuation', 'Pitch Deck', 'Due Diligence'] },
    ],
  },
  {
    key: 'ir', label: 'Imposto de Renda',
    services: [
      { name: 'IRPF', description: 'Declaração pessoa física', icon: Calculator, status: 'available', items: ['Completa', 'Simplificada', 'Investimentos'] },
      { name: 'IRPJ', description: 'Declaração pessoa jurídica', icon: Building2, status: 'available', items: ['ECF', 'Apuração', 'Compensação'] },
      { name: 'Restituição', description: 'Acompanhamento e maximização', icon: Scale, status: 'available', items: ['Análise', 'Rastreio', 'Malha fina'] },
      { name: 'Regularização', description: 'Regularização de pendências', icon: Shield, status: 'available', items: ['DCTF', 'Parcelamento', 'Certidões'] },
    ],
  },
  {
    key: 'outros', label: 'Outros Serviços',
    services: [
      { name: 'Marcas e Patentes – INPI', description: 'Registro e proteção', icon: Award, status: 'available', items: ['Registro', 'Acompanhamento', 'Defesa'] },
      { name: 'Certificado Digital', description: 'e-CPF, e-CNPJ, NF-e', icon: KeyRound, status: 'available', items: ['e-CPF A1/A3', 'e-CNPJ', 'NF-e'] },
      { name: 'Consultoria Empresarial', description: 'Gestão e estratégia', icon: Briefcase, status: 'exclusive', items: ['Planejamento', 'Reestruturação', 'Valuation'] },
    ],
  },
];

const statusConfig = {
  available: { label: 'Disponível', icon: Rocket, cls: 'bg-success/10 text-success border-success/30' },
  soon: { label: 'Em breve', icon: Clock, cls: 'bg-accent/20 text-accent-foreground border-accent/30' },
  exclusive: { label: 'Exclusivo SERAC', icon: Lock, cls: 'bg-info/10 text-info border-info/30' },
};

export default function SeracMarketplace() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('empresas');

  const currentCategory = categories.find(c => c.key === tab);
  const filteredServices = currentCategory?.services.filter(s =>
    search === '' || s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Marketplace SERAC</h2>
          <p className="text-sm text-muted-foreground mt-1">Catálogo completo de serviços especializados</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar serviço..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const count = categories.reduce((acc, cat) => acc + cat.services.filter(s => s.status === key).length, 0);
          return (
            <Card key={key} className="border-border">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={cn("p-2 rounded-lg", cfg.cls.split(' ')[0])}>
                  <cfg.icon className={cn("h-4 w-4", cfg.cls.split(' ')[1])} />
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">{count}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{cfg.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap h-auto gap-1 p-1">
          {categories.map(c => (
            <TabsTrigger key={c.key} value={c.key} className="text-xs">{c.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((svc) => {
              const sc = statusConfig[svc.status];
              return (
                <Card key={svc.name} className="border-border hover:shadow-md transition-all group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-secondary/10 group-hover:bg-primary/10 transition-colors">
                        <svc.icon className="h-5 w-5 text-foreground" />
                      </div>
                      <Badge variant="outline" className={cn("text-[10px]", sc.cls)}>
                        <sc.icon className="h-2.5 w-2.5 mr-1" />
                        {sc.label}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{svc.name}</h3>
                    <p className="text-[11px] text-muted-foreground mb-3">{svc.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {svc.items.map(item => (
                        <span key={item} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{item}</span>
                      ))}
                    </div>
                    {svc.status === 'available' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full mt-3 text-xs text-primary hover:text-primary hover:bg-primary/10 gap-1"
                        onClick={() => toast.success(`Solicitação enviada para "${svc.name}"! Nossa equipe entrará em contato em breve.`)}
                      >
                        Solicitar <ArrowRight className="h-3 w-3" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
