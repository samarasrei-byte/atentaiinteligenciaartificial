import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search, Plus, GripVertical, Phone, Mail, MessageSquare,
  Calendar, Users, Building2, Star, Filter,
  Target, DollarSign
} from 'lucide-react';
import {
  DndContext, closestCorners, DragOverlay,
  PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

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

type Stage = {
  id: string;
  label: string;
  leads: Lead[];
};

const initialStages: Stage[] = [
  {
    id: 'novo', label: 'Novo Lead', leads: [
      { id: '1', nome: 'Roberto Almeida', empresa: 'Tech Solutions Ltda', canal: 'Empresas', score: 92, valor: 'R$ 4.500/mês', contato: '(11) 99888-7766', ultimaInteracao: '2 min' },
      { id: '2', nome: 'Fernanda Costa', empresa: 'Cartório 3º Ofício - SP', canal: 'Cartórios', score: 88, valor: 'R$ 6.200/mês', contato: '(11) 98765-4321', ultimaInteracao: '15 min' },
    ]
  },
  {
    id: 'qualificado', label: 'Qualificado', leads: [
      { id: '3', nome: 'Dr. Marcos Lima', empresa: 'Contabilidade Exacta', canal: 'Contadores', score: 85, valor: 'R$ 2.800/mês', contato: '(21) 97654-3210', ultimaInteracao: '1h' },
      { id: '4', nome: 'Paula Rezende', empresa: 'E-Commerce Brasil Shop', canal: 'Empresas', score: 79, valor: 'R$ 3.100/mês', contato: '(31) 96543-2109', ultimaInteracao: '3h' },
      { id: '5', nome: 'Carlos Figueiredo', empresa: 'Cartório 1º Registro - RJ', canal: 'Cartórios', score: 91, valor: 'R$ 8.500/mês', contato: '(21) 95432-1098', ultimaInteracao: '30 min' },
    ]
  },
  {
    id: 'reuniao', label: 'Reunião Agendada', leads: [
      { id: '6', nome: 'Ana Beatriz', empresa: 'Grupo Fiscal Sul', canal: 'Contadores', score: 94, valor: 'R$ 5.200/mês', contato: '(41) 94321-0987', ultimaInteracao: '20 min' },
    ]
  },
  {
    id: 'proposta', label: 'Proposta Enviada', leads: [
      { id: '7', nome: 'Ricardo Santos', empresa: 'Holdings Capital SA', canal: 'Empresas', score: 96, valor: 'R$ 12.000/mês', contato: '(11) 93210-9876', ultimaInteracao: '45 min' },
      { id: '8', nome: 'Luciana Ferreira', empresa: 'Infoprodutora Digital', canal: 'Empresas', score: 82, valor: 'R$ 1.900/mês', contato: '(11) 92109-8765', ultimaInteracao: '2h' },
    ]
  },
  {
    id: 'fechado', label: 'Contrato Fechado', leads: [
      { id: '9', nome: 'João Pedro Martins', empresa: 'Startup GameDev', canal: 'Empresas', score: 98, valor: 'R$ 7.800/mês', contato: '(11) 91098-7654', ultimaInteracao: '5 min' },
    ]
  },
];

const stageColors: Record<string, string> = {
  novo: 'bg-muted-foreground',
  qualificado: 'bg-primary',
  reuniao: 'bg-accent',
  proposta: 'bg-info',
  fechado: 'bg-success',
};

const getScoreClass = (s: number) => s >= 90 ? 'text-success' : s >= 75 ? 'text-primary' : s >= 60 ? 'text-accent-foreground' : 'text-muted-foreground';
const getCanalClass = (c: string) => c === 'Empresas' ? 'bg-primary/10 text-primary' : c === 'Contadores' ? 'bg-success/10 text-success' : 'bg-info/10 text-info';

/* ── Sortable Lead Card ── */
function SortableLeadCard({ lead, search }: { lead: Lead; search: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: lead.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  if (search && !lead.nome.toLowerCase().includes(search.toLowerCase()) && !lead.empresa.toLowerCase().includes(search.toLowerCase())) {
    return null;
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card className={cn("border-border hover:shadow-md transition-all", isDragging && "opacity-50 shadow-lg ring-2 ring-primary/30")}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <button {...listeners} className="cursor-grab active:cursor-grabbing touch-manipulation">
                <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
              <Badge className={cn("text-[9px] border-none", getCanalClass(lead.canal))}>
                {lead.canal}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Star className={cn("h-3 w-3 fill-current", getScoreClass(lead.score))} />
              <span className={cn("text-xs font-bold", getScoreClass(lead.score))}>{lead.score}</span>
            </div>
          </div>
          <p className="text-sm font-semibold text-foreground">{lead.nome}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{lead.empresa}</p>
          <p className="text-xs font-medium text-success mt-2">{lead.valor}</p>
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <span className="text-[10px] text-muted-foreground">{lead.ultimaInteracao}</span>
            <div className="flex gap-1">
              <button className="p-1 rounded hover:bg-muted"><Phone className="h-3 w-3 text-muted-foreground" /></button>
              <button className="p-1 rounded hover:bg-muted"><Mail className="h-3 w-3 text-muted-foreground" /></button>
              <button className="p-1 rounded hover:bg-muted"><MessageSquare className="h-3 w-3 text-muted-foreground" /></button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Lead Overlay (while dragging) ── */
function LeadOverlay({ lead }: { lead: Lead }) {
  return (
    <Card className="border-primary shadow-strong w-[280px] rotate-2">
      <CardContent className="p-4">
        <p className="text-sm font-semibold text-foreground">{lead.nome}</p>
        <p className="text-xs text-muted-foreground">{lead.empresa}</p>
        <p className="text-xs font-medium text-success mt-1">{lead.valor}</p>
      </CardContent>
    </Card>
  );
}

export default function SeracCRM() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pipeline');
  const [stages, setStages] = useState<Stage[]>(initialStages);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const findStageOfLead = (leadId: string) => stages.find(s => s.leads.some(l => l.id === leadId));
  const allLeads = stages.flatMap(s => s.leads);
  const activeLead = activeId ? allLeads.find(l => l.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeStage = findStageOfLead(active.id as string);
    // over could be a lead id or a stage id
    const overStage = findStageOfLead(over.id as string) || stages.find(s => s.id === over.id);

    if (!activeStage || !overStage || activeStage.id === overStage.id) return;

    setStages(prev => {
      const lead = activeStage.leads.find(l => l.id === active.id)!;
      return prev.map(s => {
        if (s.id === activeStage.id) return { ...s, leads: s.leads.filter(l => l.id !== active.id) };
        if (s.id === overStage.id) return { ...s, leads: [...s.leads, lead] };
        return s;
      });
    });
  };

  const handleDragEnd = (_event: DragEndEvent) => {
    setActiveId(null);
  };

  const totalLeads = stages.reduce((acc, s) => acc + s.leads.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">CRM Enterprise — Pipeline de Vendas</h2>
          <p className="text-sm text-muted-foreground mt-1">Gestão completa de oportunidades por canal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" /> Filtros
          </Button>
          <Button className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
            <Plus className="h-4 w-4 mr-2" /> Novo Lead
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total de Leads', value: totalLeads.toString(), icon: Users, cls: 'text-primary bg-primary/10' },
          { label: 'Forecast Mensal', value: 'R$ 52.000/mês', icon: DollarSign, cls: 'text-success bg-success/10' },
          { label: 'Taxa de Conversão', value: '34%', icon: Target, cls: 'text-accent-foreground bg-accent/30' },
          { label: 'Reuniões Hoje', value: '3', icon: Calendar, cls: 'text-info bg-info/10' },
        ].map((k) => (
          <Card key={k.label} className="border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2.5 rounded-lg", k.cls.split(' ').slice(1).join(' '))}>
                <k.icon className={cn("h-5 w-5", k.cls.split(' ')[0])} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className={cn("text-lg font-bold", k.cls.split(' ')[0])}>{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline Visual</TabsTrigger>
          <TabsTrigger value="empresas">Empresas</TabsTrigger>
          <TabsTrigger value="contadores">Contadores</TabsTrigger>
          <TabsTrigger value="cartorios">Cartórios</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="mt-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar lead por nome, empresa..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {stages.map((stage) => (
                <div key={stage.id} className="min-w-[280px] flex-shrink-0" id={stage.id}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", stageColors[stage.id])} />
                      <span className="text-sm font-semibold text-foreground">{stage.label}</span>
                    </div>
                    <Badge variant="secondary" className="text-[10px]">{stage.leads.length}</Badge>
                  </div>
                  <SortableContext items={stage.leads.map(l => l.id)} strategy={verticalListSortingStrategy} id={stage.id}>
                    <div className="space-y-3 min-h-[100px]">
                      {stage.leads.map((lead) => (
                        <SortableLeadCard key={lead.id} lead={lead} search={search} />
                      ))}
                    </div>
                  </SortableContext>
                </div>
              ))}
            </div>

            <DragOverlay>
              {activeLead ? <LeadOverlay lead={activeLead} /> : null}
            </DragOverlay>
          </DndContext>
        </TabsContent>

        {['empresas', 'contadores', 'cartorios'].map((canal) => {
          const canalLabel = canal === 'empresas' ? 'Empresas' : canal === 'contadores' ? 'Contadores' : 'Cartórios';
          const canalLeads = stages.flatMap(s => s.leads.map(l => ({ ...l, stage: s.label }))).filter(l => l.canal === canalLabel);
          return (
            <TabsContent key={canal} value={canal} className="mt-4">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{canalLeads.length} leads no funil de {canalLabel}</p>
                {canalLeads.map((lead) => (
                  <Card key={lead.id} className="border-border hover:shadow-sm transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10">
                            <Building2 className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{lead.nome}</p>
                            <p className="text-xs text-muted-foreground">{lead.empresa}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="text-[10px]">{lead.stage}</Badge>
                          <span className="text-sm font-bold text-success">{lead.valor}</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-accent fill-accent" />
                            <span className="text-sm font-bold text-foreground">{lead.score}</span>
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
