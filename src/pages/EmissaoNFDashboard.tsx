import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Zap, Plus, FileText, CreditCard, Users, BarChart3, QrCode,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle,
  Receipt, Search, MessageCircle, LogOut, DollarSign, TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// ⚠️ DADOS SIMULADOS — integração Asaas pendente
const mockPayments = [
  { id: 1, client: 'Maria Silva', amount: 120000, method: 'pix', status: 'paid', date: '2026-03-23', nf: 'NF-e #1247' },
  { id: 2, client: 'João Santos', amount: 85000, method: 'card', status: 'pending', date: '2026-03-22', nf: null },
  { id: 3, client: 'Ana Costa', amount: 350000, method: 'pix', status: 'paid', date: '2026-03-21', nf: 'NF-e #1246' },
  { id: 4, client: 'Pedro Lima', amount: 210000, method: 'boleto', status: 'overdue', date: '2026-03-18', nf: null },
  { id: 5, client: 'Carla Nunes', amount: 175000, method: 'pix', status: 'paid', date: '2026-03-20', nf: 'NF-e #1245' },
];

const mockClients = [
  { id: 1, name: 'Maria Silva', email: 'maria@email.com', total: 'R$ 4.800,00', payments: 8 },
  { id: 2, name: 'João Santos', email: 'joao@email.com', total: 'R$ 2.550,00', payments: 3 },
  { id: 3, name: 'Ana Costa', email: 'ana@email.com', total: 'R$ 12.300,00', payments: 12 },
  { id: 4, name: 'Pedro Lima', email: 'pedro@email.com', total: 'R$ 6.100,00', payments: 5 },
];

const statusMap: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  paid: { label: 'Pago', color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2 },
  pending: { label: 'Pendente', color: 'text-amber-400 bg-amber-500/10', icon: Clock },
  overdue: { label: 'Vencido', color: 'text-red-400 bg-red-500/10', icon: AlertCircle },
};

const methodIcons: Record<string, string> = { pix: '⚡', card: '💳', boleto: '📄' };

const onlyDigits = (value: string) => value.replace(/\D/g, '');

const isValidCPF = (value: string): boolean => {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  check = (sum * 10) % 11;
  if (check === 10) check = 0;

  return check === Number(cpf[10]);
};

const isValidCNPJ = (value: string): boolean => {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const calcCheck = (base: string, factors: number[]) => {
    const total = factors.reduce((acc, factor, idx) => acc + Number(base[idx]) * factor, 0);
    const remainder = total % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const check1 = calcCheck(cnpj.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const check2 = calcCheck(cnpj.slice(0, 13), [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return check1 === Number(cnpj[12]) && check2 === Number(cnpj[13]);
};

const isValidCpfCnpj = (value: string): boolean => {
  const digits = onlyDigits(value);
  if (digits.length === 11) return isValidCPF(digits);
  if (digits.length === 14) return isValidCNPJ(digits);
  return false;
};

const EmissaoNFDashboard = () => {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showNewCharge, setShowNewCharge] = useState(false);
  const [chargeAmount, setChargeAmount] = useState('');
  const [chargeMethod, setChargeMethod] = useState('');
  const [chargeClient, setChargeClient] = useState('');
  const [chargeClientDocument, setChargeClientDocument] = useState('');
  const [chargeServiceCode, setChargeServiceCode] = useState('');
  const [chargeMunicipality, setChargeMunicipality] = useState('');
  const [chargeDescription, setChargeDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const parsedChargeAmount = Number.parseFloat(chargeAmount.replace(',', '.'));
  const isChargeAmountValid = Number.isFinite(parsedChargeAmount) && parsedChargeAmount > 0;
  const isChargeFormValid =
    isChargeAmountValid &&
    !!chargeMethod &&
    chargeClient.trim().length > 0 &&
    isValidCpfCnpj(chargeClientDocument) &&
    chargeServiceCode.trim().length > 0 &&
    chargeMunicipality.trim().length > 0 &&
    chargeDescription.trim().length > 0;

  const handleCreateCharge = () => {
    if (!isChargeAmountValid) {
      toast.error('Informe um valor de cobrança válido');
      return;
    }
    if (!chargeMethod) {
      toast.error('Selecione o método de pagamento');
      return;
    }
    if (!chargeClient.trim()) {
      toast.error('Informe o nome do cliente para emissão da NF');
      return;
    }
    if (!isValidCpfCnpj(chargeClientDocument)) {
      toast.error('CPF/CNPJ inválido — ajuste para continuar');
      return;
    }
    if (!chargeServiceCode.trim()) {
      toast.error('Informe o código de serviço tributável');
      return;
    }
    if (!chargeMunicipality.trim()) {
      toast.error('Informe o município de incidência para cálculo do ISS');
      return;
    }
    if (!chargeDescription.trim()) {
      toast.error('Descreva o serviço/produto para evitar rejeição fiscal');
      return;
    }

    toast.success('Cobrança criada com validação fiscal crítica ✅');
    setShowNewCharge(false);
    setChargeAmount('');
    setChargeMethod('');
    setChargeClient('');
    setChargeClientDocument('');
    setChargeServiceCode('');
    setChargeMunicipality('');
    setChargeDescription('');
  };

  const metrics = [
    { label: 'Faturamento total', value: 'R$ 47.800,00', icon: DollarSign, trend: '+12%', trendUp: true },
    { label: 'Notas emitidas', value: '234', icon: FileText, trend: '+8', trendUp: true },
    { label: 'Pagamentos Pix', value: '189', icon: Zap, trend: '+23', trendUp: true },
    { label: 'Pagamentos Cartão', value: '45', icon: CreditCard, trend: '+5', trendUp: true },
    { label: 'Receita líquida', value: 'R$ 44.100,00', icon: TrendingUp, trend: '+10%', trendUp: true },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <Helmet>
        <title>AtentAI - Emissão de NF</title>
      </Helmet>

      {/* Demo Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-center">
        <p className="text-xs text-amber-400">
          🔧 <strong>Modo demonstração</strong> — Dados simulados. Integração Asaas em desenvolvimento.
        </p>
      </div>

      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img src="/logo-atentai.png" alt="AtentAI" className="h-7 w-auto" />
            </div>
            <div className="hidden md:block text-sm text-white/40 border-l border-white/10 pl-4">
              Saldo: <span className="text-emerald-400 font-semibold">R$ 12.450,00</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowNewCharge(true)}
              className="bg-emerald-500 hover:bg-emerald-600 rounded-full h-9 px-4 text-sm"
            >
              <Plus className="w-4 h-4 mr-1" /> Nova cobrança
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toast.info('Em breve: chat com especialista')}
              className="text-white/40 hover:text-white"
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => { signOut(); navigate('/emissao-nf'); }}
              className="text-white/40 hover:text-white"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Olá, {profile?.full_name?.split(' ')[0] || 'Empreendedor'} 👋</h1>
          <p className="text-white/40 text-sm mt-1">Seu financeiro no piloto automático</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-white/[0.03] border border-white/[0.06] rounded-full p-1 mb-8">
            <TabsTrigger value="overview" className="rounded-full data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-white/50 text-sm px-5">
              Visão geral
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-full data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-white/50 text-sm px-5">
              Pagamentos
            </TabsTrigger>
            <TabsTrigger value="invoices" className="rounded-full data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-white/50 text-sm px-5">
              Notas fiscais
            </TabsTrigger>
            <TabsTrigger value="clients" className="rounded-full data-[state=active]:bg-emerald-500 data-[state=active]:text-white text-white/50 text-sm px-5">
              Clientes
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview">
            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {metrics.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="bg-white/[0.03] border-white/[0.06]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <m.icon className="w-4 h-4 text-emerald-400" />
                        <span className={`text-xs flex items-center gap-0.5 ${m.trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
                          {m.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {m.trend}
                        </span>
                      </div>
                      <p className="text-lg font-bold">{m.value}</p>
                      <p className="text-xs text-white/40">{m.label}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { title: 'Criar cobrança', desc: 'Pix, boleto ou cartão', icon: Plus, action: () => setShowNewCharge(true) },
                { title: 'Emitir nota fiscal', desc: 'Manual ou automática', icon: Receipt, action: () => toast.info('Notas fiscais são emitidas automaticamente!') },
                { title: 'Ver clientes', desc: 'Histórico completo', icon: Users, action: () => setActiveTab('clients') },
                { title: 'Falar com especialista', desc: 'Suporte dedicado', icon: MessageCircle, action: () => toast.info('Em breve: chat com especialista') },
              ].map((a, i) => (
                <Card
                  key={i}
                  className="bg-white/[0.03] border-white/[0.06] cursor-pointer hover:border-emerald-500/30 transition-all group"
                  onClick={a.action}
                >
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                      <a.icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{a.title}</p>
                      <p className="text-xs text-white/40">{a.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent activity */}
            <Card className="bg-white/[0.03] border-white/[0.06]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Atividade recente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPayments.slice(0, 5).map((p) => {
                    const s = statusMap[p.status];
                    return (
                      <div key={p.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{methodIcons[p.method]}</span>
                          <div>
                            <p className="text-sm font-medium">{p.client}</p>
                            <p className="text-xs text-white/40">{p.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-medium">R$ {(p.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          <Badge className={`${s.color} text-xs border-0`}>
                            <s.icon className="w-3 h-3 mr-1" />
                            {s.label}
                          </Badge>
                          {p.nf && <span className="text-xs text-emerald-400">{p.nf}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PAYMENTS */}
          <TabsContent value="payments">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Pagamentos</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/30 rounded-full h-9 w-48"
                  />
                </div>
                <Button onClick={() => setShowNewCharge(true)} className="bg-emerald-500 hover:bg-emerald-600 rounded-full h-9">
                  <Plus className="w-4 h-4 mr-1" /> Nova
                </Button>
              </div>
            </div>
            <Card className="bg-white/[0.03] border-white/[0.06]">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-left p-4 text-white/40 font-medium">Cliente</th>
                        <th className="text-left p-4 text-white/40 font-medium">Valor</th>
                        <th className="text-left p-4 text-white/40 font-medium">Método</th>
                        <th className="text-left p-4 text-white/40 font-medium">Status</th>
                        <th className="text-left p-4 text-white/40 font-medium">NF</th>
                        <th className="text-left p-4 text-white/40 font-medium">Data</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockPayments.filter(p => p.client.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => {
                        const s = statusMap[p.status];
                        return (
                          <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                            <td className="p-4 font-medium">{p.client}</td>
                            <td className="p-4">R$ {(p.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                            <td className="p-4">{methodIcons[p.method]} {p.method === 'pix' ? 'Pix' : p.method === 'card' ? 'Cartão' : 'Boleto'}</td>
                            <td className="p-4">
                              <Badge className={`${s.color} text-xs border-0`}>{s.label}</Badge>
                            </td>
                            <td className="p-4 text-emerald-400 text-xs">{p.nf || '—'}</td>
                            <td className="p-4 text-white/40">{p.date}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* INVOICES */}
          <TabsContent value="invoices">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Notas Fiscais</h2>
              <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                Emissão automática ativa ✅
              </Badge>
            </div>
            <Card className="bg-white/[0.03] border-white/[0.06]">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left p-4 text-white/40 font-medium">Nota</th>
                      <th className="text-left p-4 text-white/40 font-medium">Cliente</th>
                      <th className="text-left p-4 text-white/40 font-medium">Valor</th>
                      <th className="text-left p-4 text-white/40 font-medium">Status</th>
                      <th className="text-left p-4 text-white/40 font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPayments.filter(p => p.nf).map((p) => (
                      <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="p-4 font-medium text-emerald-400">{p.nf}</td>
                        <td className="p-4">{p.client}</td>
                        <td className="p-4">R$ {(p.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td className="p-4"><Badge className="text-emerald-400 bg-emerald-500/10 text-xs border-0">Emitida ✅</Badge></td>
                        <td className="p-4 text-white/40">{p.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>

            <div className="mt-6 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
              <p className="text-emerald-400 font-medium">✅ Pagamento recebido — Nota emitida automaticamente</p>
              <p className="text-sm text-white/40 mt-1">Todas as notas são emitidas em até 5 minutos após confirmação do pagamento</p>
            </div>
          </TabsContent>

          {/* CLIENTS */}
          <TabsContent value="clients">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Clientes</h2>
              <Button onClick={() => toast.info('Em breve: adicionar cliente')} className="bg-emerald-500 hover:bg-emerald-600 rounded-full h-9">
                <Plus className="w-4 h-4 mr-1" /> Adicionar
              </Button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {mockClients.map((c) => (
                <Card key={c.id} className="bg-white/[0.03] border-white/[0.06] hover:border-emerald-500/20 transition-all cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-semibold">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{c.name}</p>
                          <p className="text-xs text-white/40">{c.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/40">{c.payments} pagamentos</span>
                      <span className="text-emerald-400 font-medium">{c.total}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* New Charge Dialog */}
      <Dialog open={showNewCharge} onOpenChange={setShowNewCharge}>
        <DialogContent className="bg-[#12121a] border-white/[0.08] text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Nova cobrança</DialogTitle>
            <DialogDescription className="text-white/40">
              Crie uma cobrança em segundos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white/60 text-sm">Valor (R$)</Label>
              <Input
                type="number"
                placeholder="0,00"
                value={chargeAmount}
                onChange={(e) => setChargeAmount(e.target.value)}
                className="bg-white/[0.05] border-white/[0.1] text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/60 text-sm">Método de pagamento</Label>
              <Select value={chargeMethod} onValueChange={setChargeMethod}>
                <SelectTrigger className="bg-white/[0.05] border-white/[0.1] text-white mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a24] border-white/[0.1]">
                  <SelectItem value="pix">⚡ Pix</SelectItem>
                  <SelectItem value="boleto">📄 Boleto</SelectItem>
                  <SelectItem value="card">💳 Cartão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white/60 text-sm">Cliente (obrigatório)</Label>
              <Input
                placeholder="Nome ou email"
                value={chargeClient}
                onChange={(e) => setChargeClient(e.target.value)}
                className="bg-white/[0.05] border-white/[0.1] text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/60 text-sm">CPF/CNPJ do cliente</Label>
              <Input
                placeholder="Somente números ou formatado"
                value={chargeClientDocument}
                onChange={(e) => setChargeClientDocument(e.target.value)}
                className="bg-white/[0.05] border-white/[0.1] text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/60 text-sm">Código do serviço fiscal</Label>
              <Input
                placeholder="Ex: 17.05"
                value={chargeServiceCode}
                onChange={(e) => setChargeServiceCode(e.target.value)}
                className="bg-white/[0.05] border-white/[0.1] text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/60 text-sm">Município de incidência (ISS)</Label>
              <Input
                placeholder="Ex: São Paulo - SP"
                value={chargeMunicipality}
                onChange={(e) => setChargeMunicipality(e.target.value)}
                className="bg-white/[0.05] border-white/[0.1] text-white mt-1"
              />
            </div>
            <div>
              <Label className="text-white/60 text-sm">Descrição fiscal da operação</Label>
              <Input
                placeholder="Ex: Consultoria tributária mensal"
                value={chargeDescription}
                onChange={(e) => setChargeDescription(e.target.value)}
                className="bg-white/[0.05] border-white/[0.1] text-white mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowNewCharge(false)} className="text-white/40">
              Cancelar
            </Button>
            <Button onClick={handleCreateCharge} disabled={!isChargeFormValid} className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40">
              Criar cobrança
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmissaoNFDashboard;
