import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CreditRepairChat } from '@/components/limpa-nome/CreditRepairChat';
import { LimpaNomeUpgradeCard } from '@/components/limpa-nome/LimpaNomeUpgradeCard';
import {
  ArrowLeft,
  Shield,
  FileText,
  Building2,
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageCircle,
  Loader2,
  Plus,
  Scale,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CreditRepairRequest {
  id: string;
  full_name: string;
  debt_amount_cents: number;
  bureaus_selected: string[] | null;
  status: string;
  payment_status: string;
  final_price_cents: number;
  contador_id: string | null;
  partner_id: string | null;
  created_at: string;
}

interface FiscalAnalysisRequest {
  id: string;
  full_name: string;
  company_name: string;
  cnpj: string;
  tax_regime: string;
  status: string;
  payment_status: string | null;
  service_fee_cents: number | null;
  identified_value_cents: number | null;
  partner_id: string | null;
  created_at: string;
}

interface IRRequest {
  id: string;
  full_name: string;
  fiscal_year: number;
  ir_type: string;
  status: string;
  payment_status: string;
  final_price_cents: number;
  contador_id: string | null;
  created_at: string;
}

interface CertificateRequest {
  id: string;
  certificate_type: string;
  status: string;
  payment_status: string;
  amount_cents: number;
  contador_id: string | null;
  created_at: string;
}

interface CompanyOpeningRequest {
  id: string;
  full_name: string;
  recommended_regime: string | null;
  status: string;
  payment_status: string | null;
  service_price_cents: number | null;
  contador_id: string | null;
  created_at: string;
}

interface PartnerInfo {
  id: string;
  company_name: string;
  contact_person: string;
}

// Partner Guilherme Info - Fixed for display
const PARTNER_GUILHERME = {
  name: 'Guilherme Barros',
  role: 'Especialista AtentAI',
  specialty: 'Limpa Nome & Análise Fiscal'
};

const MinhasSolicitacoesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  // Request states
  const [creditRepairRequests, setCreditRepairRequests] = useState<CreditRepairRequest[]>([]);
  const [fiscalRequests, setFiscalRequests] = useState<FiscalAnalysisRequest[]>([]);
  const [irRequests, setIRRequests] = useState<IRRequest[]>([]);
  const [certificateRequests, setCertificateRequests] = useState<CertificateRequest[]>([]);
  const [companyOpeningRequests, setCompanyOpeningRequests] = useState<CompanyOpeningRequest[]>([]);
  
  // Partner info
  const [partnerInfo, setPartnerInfo] = useState<PartnerInfo | null>(null);
  
  // Chat state
  const [selectedChat, setSelectedChat] = useState<{
    type: 'credit_repair' | 'fiscal';
    requestId: string;
    partnerId: string;
    partnerName: string;
  } | null>(null);

  useEffect(() => {
    if (user) {
      fetchAllRequests();
    }
  }, [user]);

  const fetchAllRequests = async () => {
    setIsLoading(true);
    
    const [creditRepairRes, fiscalRes, irRes, certificateRes, companyOpeningRes] = await Promise.all([
      supabase
        .from('credit_repair_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('fiscal_analysis_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('ir_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('certificate_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('company_opening_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false }),
    ]);

    setCreditRepairRequests(creditRepairRes.data || []);
    setFiscalRequests(fiscalRes.data || []);
    setIRRequests(irRes.data || []);
    setCertificateRequests(certificateRes.data || []);
    setCompanyOpeningRequests(companyOpeningRes.data || []);

    // Fetch partner info (Guilherme)
    const { data: partner } = await supabase
      .from('credit_repair_partners')
      .select('id, company_name, contact_person')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    
    if (partner) {
      setPartnerInfo(partner);
    }

    setIsLoading(false);
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; icon: any; label: string }> = {
      pending: { class: 'bg-amber-100 text-amber-700', icon: Clock, label: 'Nova' },
      analyzing: { class: 'bg-blue-100 text-blue-700', icon: AlertCircle, label: 'Analisando' },
      in_progress: { class: 'bg-blue-100 text-blue-700', icon: AlertCircle, label: 'Em Andamento' },
      documents_pending: { class: 'bg-amber-100 text-amber-700', icon: FileText, label: 'Docs Pendentes' },
      negotiating: { class: 'bg-purple-100 text-purple-700', icon: MessageCircle, label: 'Em Contato' },
      completed: { class: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Concluído' },
      cancelled: { class: 'bg-red-100 text-red-700', icon: XCircle, label: 'Cancelado' },
      rejected: { class: 'bg-red-100 text-red-700', icon: XCircle, label: 'Rejeitado' },
      issued: { class: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, label: 'Emitido' },
      processing: { class: 'bg-blue-100 text-blue-700', icon: AlertCircle, label: 'Processando' },
    };
    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;
    return <Badge variant="outline" className={cfg.class}><Icon className="h-3 w-3 mr-1" />{cfg.label}</Badge>;
  };

  const getPaymentBadge = (status: string | null) => {
    if (!status || status === 'pending') {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700">Aguardando</Badge>;
    }
    if (status === 'paid') {
      return <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Pago</Badge>;
    }
    return null;
  };

  const openPartnerChat = (type: 'credit_repair' | 'fiscal', requestId: string, partnerId: string) => {
    setSelectedChat({
      type,
      requestId,
      partnerId,
      partnerName: partnerInfo?.contact_person || PARTNER_GUILHERME.name,
    });
  };

  const getCertificateTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cnd_federal: 'CND Federal',
      cnd_estadual: 'CND Estadual',
      cnd_municipal: 'CND Municipal',
      certidao_fgts: 'Certidão FGTS',
      certidao_trabalhista: 'Certidão Trabalhista',
    };
    return labels[type] || type;
  };

  const getIRTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      simples: 'Simples',
      completo: 'Completo',
      investidor: 'Investidor',
      exterior: 'Exterior',
    };
    return labels[type] || type;
  };

  const totalRequests = creditRepairRequests.length + fiscalRequests.length + irRequests.length + certificateRequests.length + companyOpeningRequests.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderPartnerBadge = (partnerId: string | null) => {
    if (!partnerId) return null;
    return (
      <div className="flex items-center gap-2 mt-3 p-2 bg-primary/5 rounded-lg">
        <Avatar className="h-8 w-8 border border-primary/20">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">G</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xs font-medium text-slate-700">Parceiro: {PARTNER_GUILHERME.name}</p>
          <p className="text-xs text-slate-500">{PARTNER_GUILHERME.specialty}</p>
        </div>
      </div>
    );
  };

  const renderCreditRepairCard = (request: CreditRepairRequest) => (
    <Card 
      key={request.id} 
      className="hover:border-emerald-500/50 transition-colors cursor-pointer"
      onClick={() => navigate(`/chat/guilherme?servico=limpanome&request=${request.id}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <Shield className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold">Limpa Nome</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(request.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {request.payment_status === 'paid' ? (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700">
                <CheckCircle className="h-3 w-3 mr-1" />
                Pago
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700">
                <Clock className="h-3 w-3 mr-1" />
                Aguardando Pagamento
              </Badge>
            )}
            {getStatusBadge(request.status)}
            <Button
              variant="default"
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/chat/guilherme?servico=limpanome&request=${request.id}`);
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat com Guilherme
            </Button>
          </div>
        </div>
        {renderPartnerBadge(request.partner_id)}
        <div className="mt-3 flex flex-wrap gap-2">
          {request.bureaus_selected?.map(b => (
            <Badge key={b} variant="secondary" className="uppercase text-xs">{b}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderFiscalCard = (request: FiscalAnalysisRequest) => (
    <Card key={request.id} className="hover:border-blue-500/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Scale className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold">Análise Fiscal</p>
              <p className="text-sm text-muted-foreground">
                {request.company_name} • {format(new Date(request.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {request.identified_value_cents && request.identified_value_cents > 0 ? (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valor Identificado</p>
                <p className="font-semibold text-emerald-600">{formatCurrency(request.identified_value_cents)}</p>
              </div>
            ) : (
              <Badge variant="outline" className="bg-blue-50 text-blue-700">Análise Gratuita</Badge>
            )}
            {getStatusBadge(request.status)}
            {request.partner_id && (
              <Button
                variant="default"
                size="sm"
                onClick={() => openPartnerChat('fiscal', request.id, request.partner_id!)}
              >
                <MessageCircle className="h-4 w-4" />
                Chat com Guilherme Barros
              </Button>
            )}
          </div>
        </div>
        {renderPartnerBadge(request.partner_id)}
      </CardContent>
    </Card>
  );

  const renderIRCard = (request: IRRequest) => (
    <Card key={request.id} className="hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Imposto de Renda {request.fiscal_year}</p>
              <p className="text-sm text-muted-foreground">
                Tipo: {getIRTypeLabel(request.ir_type)} • {format(new Date(request.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="font-semibold">{formatCurrency(request.final_price_cents)}</p>
            </div>
            {getStatusBadge(request.status)}
            {getPaymentBadge(request.payment_status)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCertificateCard = (request: CertificateRequest) => (
    <Card key={request.id} className="hover:border-amber-500/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
              <Award className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold">{getCertificateTypeLabel(request.certificate_type)}</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(request.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="font-semibold">{formatCurrency(request.amount_cents)}</p>
            </div>
            {getStatusBadge(request.status)}
            {getPaymentBadge(request.payment_status)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCompanyOpeningCard = (request: CompanyOpeningRequest) => (
    <Card key={request.id} className="hover:border-emerald-500/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold">Abertura de Empresa</p>
              <p className="text-sm text-muted-foreground">
                {request.recommended_regime?.toUpperCase() || 'Análise pendente'} • {format(new Date(request.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {request.service_price_cents && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="font-semibold">{formatCurrency(request.service_price_cents)}</p>
              </div>
            )}
            {getStatusBadge(request.status)}
            {getPaymentBadge(request.payment_status)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onNavigate={() => navigate('/')} />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Minhas Solicitações
            </h1>
            <p className="text-muted-foreground">
              Acompanhe todos os seus serviços em um só lugar
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/modulo-fiscal')}>
              <Plus className="h-4 w-4 mr-2" />
              Análise Fiscal
            </Button>
            <Button onClick={() => navigate('/limpa-nome')}>
              <Plus className="h-4 w-4 mr-2" />
              Limpa Nome
            </Button>
          </div>
        </div>

        {totalRequests === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Nenhuma solicitação</h2>
              <p className="text-muted-foreground mb-6">
                Você ainda não tem solicitações de serviços.
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" onClick={() => navigate('/modulo-fiscal')}>
                  Análise Fiscal
                </Button>
                <Button onClick={() => navigate('/limpa-nome')}>
                  Limpar Nome
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                Todos ({totalRequests})
              </TabsTrigger>
              <TabsTrigger value="credit_repair" className="gap-2">
                <Shield className="h-4 w-4" />
                Limpa Nome ({creditRepairRequests.length})
              </TabsTrigger>
              <TabsTrigger value="fiscal" className="gap-2">
                <Scale className="h-4 w-4" />
                Fiscal ({fiscalRequests.length})
              </TabsTrigger>
              <TabsTrigger value="ir" className="gap-2">
                <FileText className="h-4 w-4" />
                IR ({irRequests.length})
              </TabsTrigger>
              <TabsTrigger value="certificate" className="gap-2">
                <Award className="h-4 w-4" />
                Certidões ({certificateRequests.length})
              </TabsTrigger>
              <TabsTrigger value="company_opening" className="gap-2">
                <Building2 className="h-4 w-4" />
                Abertura ({companyOpeningRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {creditRepairRequests.map(renderCreditRepairCard)}
              {fiscalRequests.map(renderFiscalCard)}
              {irRequests.map(renderIRCard)}
              {certificateRequests.map(renderCertificateCard)}
              {companyOpeningRequests.map(renderCompanyOpeningCard)}
            </TabsContent>

            <TabsContent value="credit_repair" className="space-y-4">
              {creditRepairRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">Nenhuma solicitação de Limpa Nome</p>
                    <Button className="mt-4" onClick={() => navigate('/limpa-nome')}>
                      Solicitar Limpa Nome
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                creditRepairRequests.map(renderCreditRepairCard)
              )}
            </TabsContent>

            <TabsContent value="fiscal" className="space-y-4">
              {fiscalRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">Nenhuma análise fiscal</p>
                    <Button className="mt-4" onClick={() => navigate('/modulo-fiscal')}>
                      Solicitar Análise Fiscal
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                fiscalRequests.map(renderFiscalCard)
              )}
            </TabsContent>

            <TabsContent value="ir" className="space-y-4">
              {irRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">Nenhuma declaração de IR</p>
                    <Button className="mt-4" onClick={() => navigate('/ir')}>
                      Declarar IR
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                irRequests.map(renderIRCard)
              )}
            </TabsContent>

            <TabsContent value="certificate" className="space-y-4">
              {certificateRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">Nenhuma solicitação de certidão</p>
                    <Button className="mt-4" onClick={() => navigate('/certidoes')}>
                      Solicitar Certidão
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                certificateRequests.map(renderCertificateCard)
              )}
            </TabsContent>

            <TabsContent value="company_opening" className="space-y-4">
              {companyOpeningRequests.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground">Nenhuma abertura de empresa</p>
                    <Button className="mt-4" onClick={() => navigate('/abertura-empresa')}>
                      Abrir Empresa
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                companyOpeningRequests.map(renderCompanyOpeningCard)
              )}
            </TabsContent>
          </Tabs>
        )}
        
        {/* Upgrade Card - Show for users with active Limpa Nome */}
        {creditRepairRequests.some(r => r.payment_status === 'paid') && (
          <LimpaNomeUpgradeCard className="mt-8 max-w-md" />
        )}
      </main>

      {/* Chat Sheet with Partner Info */}
      <Sheet open={!!selectedChat} onOpenChange={() => setSelectedChat(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0">
          <SheetHeader className="p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">G</AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="flex items-center gap-2 text-lg">
                  <User className="h-4 w-4 text-primary" />
                  {PARTNER_GUILHERME.name}
                </SheetTitle>
                <SheetDescription className="text-sm">
                  {PARTNER_GUILHERME.specialty}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="h-[calc(100vh-140px)]">
            {selectedChat && (
              <CreditRepairChat
                requestId={selectedChat.requestId}
                otherUserId={selectedChat.partnerId}
                otherUserName={selectedChat.partnerName}
                isAdmin={false}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Footer onNavigate={() => navigate('/')} />
    </div>
  );
};

export default MinhasSolicitacoesPage;
