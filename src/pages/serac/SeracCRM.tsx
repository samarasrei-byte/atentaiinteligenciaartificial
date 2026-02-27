import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, Plus, GripVertical, Phone, Mail, MessageSquare,
  Calendar, TrendingUp, Users, Building2, Star, Filter,
  BarChart3, Target, DollarSign
} from 'lucide-react';

type Lead = {
  id: string;
  nome: string;
  empresa: string;
  canal: string;
  score: number;
  valor: string;
  contato: string;
  ultimaInteracao: string;
};

const pipelineStages = [
  {
    id: 'novo', label: 'Novo Lead', color: '#6B7280', leads: [
      { id: '1', nome: 'Roberto Almeida', empresa: 'Tech Solutions Ltda', canal: 'Empresas', score: 92, valor: 'R$ 4.500/mês', contato: '(11) 99888-7766', ultimaInteracao: '2 min' },
      { id: '2', nome: 'Fernanda Costa', empresa: 'Cartório 3º Ofício - SP', canal: 'Cartórios', score: 88, valor: 'R$ 6.200/mês', contato: '(11) 98765-4321', ultimaInteracao: '15 min' },
    ]
  },
  {
    id: 'qualificado', label: 'Qualificado', color: '#2563EB', leads: [
      { id: '3', nome: 'Dr. Marcos Lima', empresa: 'Contabilidade Exacta', canal: 'Contadores', score: 85, valor: 'R$ 2.800/mês', contato: '(21) 97654-3210', ultimaInteracao: '1h' },
      { id: '4', nome: 'Paula Rezende', empresa: 'E-Commerce Brasil Shop', canal: 'Empresas', score: 79, valor: 'R$ 3.100/mês', contato: '(31) 96543-2109', ultimaInteracao: '3h' },
      { id: '5', nome: 'Carlos Figueiredo', empresa: 'Cartório 1º Registro - RJ', canal: 'Cartórios', score: 91, valor: 'R$ 8.500/mês', contato: '(21) 95432-1098', ultimaInteracao: '30 min' },
    ]
  },
  {
    id: 'reuniao', label: 'Reunião Agendada', color: '#D97706', leads: [
      { id: '6', nome: 'Ana Beatriz', empresa: 'Grupo Fiscal Sul', canal: 'Contadores', score: 94, valor: 'R$ 5.200/mês', contato: '(41) 94321-0987', ultimaInteracao: '20 min' },
    ]
  },
  {
    id: 'proposta', label: 'Proposta Enviada', color: '#7C3AED', leads: [
      { id: '7', nome: 'Ricardo Santos', empresa: 'Holdings Capital SA', canal: 'Empresas', score: 96, valor: 'R$ 12.000/mês', contato: '(11) 93210-9876', ultimaInteracao: '45 min' },
      { id: '8', nome: 'Luciana Ferreira', empresa: 'Infoprodutora Digital', canal: 'Empresas', score: 82, valor: 'R$ 1.900/mês', contato: '(11) 92109-8765', ultimaInteracao: '2h' },
    ]
  },
  {
    id: 'fechado', label: 'Contrato Fechado', color: '#059669', leads: [
      { id: '9', nome: 'João Pedro Martins', empresa: 'Startup GameDev', canal: 'Empresas', score: 98, valor: 'R$ 7.800/mês', contato: '(11) 91098-7654', ultimaInteracao: '5 min' },
    ]
  },
];

const getScoreColor = (s: number) => s >= 90 ? '#059669' : s >= 75 ? '#2563EB' : s >= 60 ? '#D97706' : '#6B7280';
const getCanalColor = (c: string) => c === 'Empresas' ? '#2563EB' : c === 'Contadores' ? '#059669' : '#7C3AED';

export default function SeracCRM() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pipeline');

  const totalLeads = pipelineStages.reduce((acc, s) => acc + s.leads.length, 0);
  const totalValor = 'R$ 52.000/mês';
  const taxaConversao = '34%';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1B3A5C]">CRM Enterprise — Pipeline de Vendas</h2>
          <p className="text-sm text-[#6B7280] mt-1">Gestão completa de oportunidades por canal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-[#E5E7EB] text-[#4B5563]">
            <Filter className="h-4 w-4 mr-2" /> Filtros
          </Button>
          <Button className="bg-[#1B3A5C] hover:bg-[#1B3A5C]/90 text-white">
            <Plus className="h-4 w-4 mr-2" /> Novo Lead
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total de Leads', value: totalLeads.toString(), icon: Users, color: '#2563EB' },
          { label: 'Forecast Mensal', value: totalValor, icon: DollarSign, color: '#059669' },
          { label: 'Taxa de Conversão', value: taxaConversao, icon: Target, color: '#D97706' },
          { label: 'Reuniões Hoje', value: '3', icon: Calendar, color: '#7C3AED' },
        ].map((k) => (
          <Card key={k.label} className="border-[#E5E7EB]">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2.5 rounded-lg" style={{ backgroundColor: `${k.color}10` }}>
                <k.icon className="h-5 w-5" style={{ color: k.color }} />
              </div>
              <div>
                <p className="text-xs text-[#6B7280]">{k.label}</p>
                <p className="text-lg font-bold" style={{ color: k.color }}>{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[#F3F4F6]">
          <TabsTrigger value="pipeline">Pipeline Visual</TabsTrigger>
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
          <TabsTrigger value="contadores">Contadores</TabsTrigger>
          <TabsTrigger value="cartorios">Cartórios</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-4">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <Input placeholder="Buscar lead por nome, empresa..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 border-[#E5E7EB]" />
          </div>

          {/* Kanban */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {pipelineStages.map((stage) => (
              <div key={stage.id} className="min-w-[280px] flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="text-sm font-semibold text-[#1B3A5C]">{stage.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{stage.leads.length}</Badge>
                </div>
                <div className="space-y-3">
                  {stage.leads
                    .filter(l => !search || l.nome.toLowerCase().includes(search.toLowerCase()) || l.empresa.toLowerCase().includes(search.toLowerCase()))
                    .map((lead) => (
                    <Card key={lead.id} className="border-[#E5E7EB] hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <GripVertical className="h-3.5 w-3.5 text-[#D1D5DB]" />
                            <Badge className="text-[9px]" style={{ backgroundColor: `${getCanalColor(lead.canal)}15`, color: getCanalColor(lead.canal), border: 'none' }}>
                              {lead.canal}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" style={{ color: getScoreColor(lead.score), fill: getScoreColor(lead.score) }} />
                            <span className="text-xs font-bold" style={{ color: getScoreColor(lead.score) }}>{lead.score}</span>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-[#1B3A5C]">{lead.nome}</p>
                        <p className="text-xs text-[#6B7280] mt-0.5">{lead.empresa}</p>
                        <p className="text-xs font-medium text-[#059669] mt-2">{lead.valor}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#F3F4F6]">
                          <span className="text-[10px] text-[#9CA3AF]">{lead.ultimaInteracao}</span>
                          <div className="flex gap-1">
                            <button className="p-1 rounded hover:bg-[#F3F4F6]"><Phone className="h-3 w-3 text-[#6B7280]" /></button>
                            <button className="p-1 rounded hover:bg-[#F3F4F6]"><Mail className="h-3 w-3 text-[#6B7280]" /></button>
                            <button className="p-1 rounded hover:bg-[#F3F4F6]"><MessageSquare className="h-3 w-3 text-[#6B7280]" /></button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {['empresas', 'contadores', 'cartorios'].map((canal) => {
          const canalLabel = canal === 'empresas' ? 'Empresas' : canal === 'contadores' ? 'Contadores' : 'Cartórios';
          const allLeads = pipelineStages.flatMap(s => s.leads.map(l => ({ ...l, stage: s.label }))).filter(l => l.canal === canalLabel);
          return (
            <TabsContent key={canal} value={canal} className="mt-4">
              <div className="space-y-3">
                <p className="text-sm text-[#6B7280]">{allLeads.length} leads no funil de {canalLabel}</p>
                {allLeads.map((lead) => (
                  <Card key={lead.id} className="border-[#E5E7EB] hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${getCanalColor(canalLabel)}10` }}>
                            <Building2 className="h-4 w-4" style={{ color: getCanalColor(canalLabel) }} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#1B3A5C]">{lead.nome}</p>
                            <p className="text-xs text-[#6B7280]">{lead.empresa}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="text-[10px]">{lead.stage}</Badge>
                          <span className="text-sm font-bold text-[#059669]">{lead.valor}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            <span className="text-sm font-bold text-[#1B3A5C]">{lead.score}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
