import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Building2, Landmark, Gamepad2, ShoppingBag, Calculator,
  Award, KeyRound, Briefcase, FileText, Scale, Shield, User,
  Search, ArrowRight, Lock, Clock, Rocket
} from 'lucide-react';

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
  available: { label: 'Disponível', icon: Rocket, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  soon: { label: 'Em breve', icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200' },
  exclusive: { label: 'Exclusivo SERAC', icon: Lock, className: 'bg-blue-50 text-blue-700 border-blue-200' },
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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1B3A5C]">Marketplace SERAC</h2>
          <p className="text-sm text-[#6B7280] mt-1">Catálogo completo de serviços especializados</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Buscar serviço..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-[#E5E7EB] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] w-64"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const count = categories.reduce((acc, cat) => acc + cat.services.filter(s => s.status === key).length, 0);
          return (
            <Card key={key} className="border-[#E5E7EB]">
              <CardContent className="p-3 flex items-center gap-3">
                <div className={`p-2 rounded-lg ${cfg.className.split(' ')[0]}`}>
                  <cfg.icon className={`h-4 w-4 ${cfg.className.split(' ')[1]}`} />
                </div>
                <div>
                  <p className="text-lg font-bold text-[#1B3A5C]">{count}</p>
                  <p className="text-[10px] text-[#9CA3AF] uppercase">{cfg.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Category Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-[#F3F4F6] flex-wrap h-auto gap-1 p-1">
          {categories.map(c => (
            <TabsTrigger key={c.key} value={c.key} className="text-xs">{c.label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((svc) => {
              const sc = statusConfig[svc.status];
              return (
                <Card key={svc.name} className="border-[#E5E7EB] hover:shadow-md transition-all group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2.5 rounded-xl bg-[#1B3A5C]/5 group-hover:bg-[#2563EB]/10 transition-colors">
                        <svc.icon className="h-5 w-5 text-[#1B3A5C]" />
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${sc.className}`}>
                        <sc.icon className="h-2.5 w-2.5 mr-1" />
                        {sc.label}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-[#1B3A5C] text-sm mb-1">{svc.name}</h3>
                    <p className="text-[11px] text-[#6B7280] mb-3">{svc.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {svc.items.map(item => (
                        <span key={item} className="text-[10px] px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280]">{item}</span>
                      ))}
                    </div>
                    {svc.status === 'available' && (
                      <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-[#2563EB] hover:text-[#1D4ED8] hover:bg-blue-50 gap-1">
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
