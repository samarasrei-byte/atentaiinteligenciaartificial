import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users, AlertTriangle, TrendingUp, ShieldAlert, DollarSign, BarChart3,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, AreaChart, Area
} from 'recharts';

const kpis = [
  { label: 'Clientes Ativos', value: '247', icon: Users, change: '+12', up: true, color: '#1B3A5C' },
  { label: 'Impactados pela Reforma', value: '189', icon: AlertTriangle, change: '76.5%', up: false, color: '#DC2626' },
  { label: 'Oportunidades Identificadas', value: 'R$ 2.4M', icon: TrendingUp, change: '+18%', up: true, color: '#059669' },
  { label: 'Alertas Críticos', value: '23', icon: ShieldAlert, change: '-5', up: true, color: '#D97706' },
  { label: 'Risco Fiscal Médio', value: '34%', icon: BarChart3, change: '-2.1%', up: true, color: '#7C3AED' },
  { label: 'Receita Potencial Otimizada', value: 'R$ 890K', icon: DollarSign, change: '+22%', up: true, color: '#2563EB' },
];

const regimeData = [
  { name: 'Simples', value: 98, color: '#2563EB' },
  { name: 'Lucro Presumido', value: 72, color: '#1B3A5C' },
  { name: 'Lucro Real', value: 45, color: '#059669' },
  { name: 'MEI', value: 32, color: '#D97706' },
];

const setorData = [
  { setor: 'Comércio', clientes: 68 },
  { setor: 'Serviços', clientes: 82 },
  { setor: 'Indústria', clientes: 34 },
  { setor: 'Tecnologia', clientes: 41 },
  { setor: 'Saúde', clientes: 22 },
];

const riscoData = [
  { mes: 'Jan', risco: 42 }, { mes: 'Fev', risco: 38 }, { mes: 'Mar', risco: 41 },
  { mes: 'Abr', risco: 36 }, { mes: 'Mai', risco: 34 }, { mes: 'Jun', risco: 31 },
];

export default function SeracDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B3A5C]">Dashboard Executivo</h2>
        <p className="text-sm text-[#6B7280] mt-1">Visão consolidada da carteira de clientes</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-[#E5E7EB] hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-2xl font-bold" style={{ color: kpi.color }}>{kpi.value}</p>
                  <div className="flex items-center gap-1">
                    {kpi.up ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" /> : <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />}
                    <span className={`text-xs font-medium ${kpi.up ? 'text-emerald-600' : 'text-red-500'}`}>{kpi.change}</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${kpi.color}10` }}>
                  <kpi.icon className="h-5 w-5" style={{ color: kpi.color }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Regime */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1B3A5C]">Impacto por Regime Tributário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={regimeData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                    {regimeData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {regimeData.map((r) => (
                <div key={r.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="text-[#4B5563]">{r.name}</span>
                  </div>
                  <span className="font-semibold text-[#1B3A5C]">{r.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Setor */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1B3A5C]">Distribuição por Setor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={setorData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis dataKey="setor" type="category" tick={{ fontSize: 11, fill: '#4B5563' }} width={80} />
                  <Tooltip />
                  <Bar dataKey="clientes" fill="#2563EB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Risco */}
        <Card className="border-[#E5E7EB]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-[#1B3A5C]">Evolução de Risco Fiscal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={riscoData}>
                  <defs>
                    <linearGradient id="riscoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="risco" stroke="#7C3AED" strokeWidth={2} fill="url(#riscoGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
