import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { ServiceChat } from '@/components/chat/ServiceChat';
import { CreditRepairChat } from '@/components/limpa-nome/CreditRepairChat';
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
  DollarSign
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

interface ContadorInfo {
  full_name: string | null;
  user_id: string;
}

const MinhasSolicitacoesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  // Request states
  const [creditRepairRequests, setCreditRepairRequests] = useState<CreditRepairRequest[]>([]);
  const [irRequests, setIRRequests] = useState<IRRequest[]>([]);
  const [certificateRequests, setCertificateRequests] = useState<CertificateRequest[]>([]);
  const [companyOpeningRequests, setCompanyOpeningRequests] = useState<CompanyOpeningRequest[]>([]);
  
  // Chat state
  const [selectedChat, setSelectedChat] = useState<{
    type: 'credit_repair' | 'ir' | 'certificate' | 'company_opening';
    requestId: string;
    contadorId: string;
    contadorName: string;
  } | null>(null);
  
  const [contadorInfoMap, setContadorInfoMap] = useState<Record<string, ContadorInfo>>({});

  useEffect(() => {
    if (user) {
      fetchAllRequests();
    }
  }, [user]);

  const fetchAllRequests = async () => {
    setIsLoading(true);
    
    const [creditRepairRes, irRes, certificateRes, companyOpeningRes] = await Promise.all([
      supabase
        .from('credit_repair_requests')
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
    setIRRequests(irRes.data || []);
    setCertificateRequests(certificateRes.data || []);
    setCompanyOpeningRequests(companyOpeningRes.data || []);

    // Fetch contador info for all requests
    const allContadorIds = new Set<string>();
    [...(creditRepairRes.data || []), ...(irRes.data || []), ...(certificateRes.data || []), ...(companyOpeningRes.data || [])]
      .forEach(req => {
        if (req.contador_id) allContadorIds.add(req.contador_id);
      });

    if (allContadorIds.size > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', Array.from(allContadorIds));

      const map: Record<string, ContadorInfo> = {};
      profiles?.forEach(p => {
        map[p.user_id] = { full_name: p.full_name, user_id: p.user_id };
      });
      setContadorInfoMap(map);
    }

    setIsLoading(false);
  };

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; icon: any; label: string }> = {
      pending: { class: 'bg-accent/10 text-accent', icon: Clock, label: 'Pendente' },
      analyzing: { class: 'bg-info/10 text-info', icon: AlertCircle, label: 'Analisando' },
      in_progress: { class: 'bg-info/10 text-info', icon: AlertCircle, label: 'Em Andamento' },
      documents_pending: { class: 'bg-accent/10 text-accent', icon: FileText, label: 'Docs Pendentes' },
      negotiating: { class: 'bg-primary/10 text-primary', icon: MessageCircle, label: 'Negociando' },
      completed: { class: 'bg-success/10 text-success', icon: CheckCircle, label: 'Concluído' },
      cancelled: { class: 'bg-destructive/10 text-destructive', icon: XCircle, label: 'Cancelado' },
      rejected: { class: 'bg-destructive/10 text-destructive', icon: XCircle, label: 'Rejeitado' },
      issued: { class: 'bg-success/10 text-success', icon: CheckCircle, label: 'Emitido' },
      processing: { class: 'bg-info/10 text-info', icon: AlertCircle, label: 'Processando' },
    };
    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;
    return <Badge variant="outline" className={cfg.class}><Icon className="h-3 w-3 mr-1" />{cfg.label}</Badge>;
  };

  const getPaymentBadge = (status: string | null) => {
    if (!status || status === 'pending') {
      return <Badge variant="outline" className="bg-accent/10 text-accent">Aguardando Pagamento</Badge>;
    }
    if (status === 'paid') {
      return <Badge variant="outline" className="bg-success/10 text-success">Pago</Badge>;
    }
    return null;
  };

  const openChat = (type: 'credit_repair' | 'ir' | 'certificate' | 'company_opening', requestId: string, contadorId: string) => {
    const contadorInfo = contadorInfoMap[contadorId];
    setSelectedChat({
      type,
      requestId,
      contadorId,
      contadorName: contadorInfo?.full_name || 'Contador',
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

  const totalRequests = creditRepairRequests.length + irRequests.length + certificateRequests.length + companyOpeningRequests.length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderCreditRepairCard = (request: CreditRepairRequest) => (
    <Card 
      key={request.id} 
      className="hover:border-success/50 transition-colors"
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="font-semibold">Limpa Nome</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(request.created_at), "dd/MM/yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Dívida</p>
              <p className="font-semibold text-destructive">{formatCurrency(request.debt_amount_cents)}</p>
            </div>
            {getStatusBadge(request.status)}
            {request.contador_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openChat('credit_repair', request.id, request.contador_id!)}
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </Button>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {request.bureaus_selected?.map(b => (
            <Badge key={b} variant="secondary" className="uppercase text-xs">{b}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderIRCard = (request: IRRequest) => (
    <Card 
      key={request.id} 
      className="hover:border-primary/50 transition-colors"
    >
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
            {request.contador_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openChat('ir', request.id, request.contador_id!)}
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCertificateCard = (request: CertificateRequest) => (
    <Card 
      key={request.id} 
      className="hover:border-amber-500/50 transition-colors"
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Award className="h-6 w-6 text-amber-500" />
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
            {request.contador_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openChat('certificate', request.id, request.contador_id!)}
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderCompanyOpeningCard = (request: CompanyOpeningRequest) => (
    <Card 
      key={request.id} 
      className="hover:border-emerald-500/50 transition-colors"
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-emerald-500" />
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
            {request.contador_id && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openChat('company_opening', request.id, request.contador_id!)}
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </Button>
            )}
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
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mb-2"
            >
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
            <Button variant="outline" onClick={() => navigate('/ir')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo IR
            </Button>
            <Button variant="outline" onClick={() => navigate('/certidoes')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Certidão
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
                <Button variant="outline" onClick={() => navigate('/ir')}>
                  Declarar IR
                </Button>
                <Button variant="outline" onClick={() => navigate('/certidoes')}>
                  Solicitar Certidão
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
      </main>

      {/* Chat Sheet */}
      <Sheet open={!!selectedChat} onOpenChange={() => setSelectedChat(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Chat com {selectedChat?.contadorName}
            </SheetTitle>
            <SheetDescription>
              Converse diretamente com o contador responsável
            </SheetDescription>
          </SheetHeader>
          <div className="h-[calc(100vh-120px)]">
            {selectedChat && selectedChat.type === 'credit_repair' ? (
              <CreditRepairChat
                requestId={selectedChat.requestId}
                otherUserId={selectedChat.contadorId}
                otherUserName={selectedChat.contadorName}
                isAdmin={false}
              />
            ) : selectedChat ? (
              <ServiceChat
                consultationId={selectedChat.requestId}
                otherUserId={selectedChat.contadorId}
                otherUserName={selectedChat.contadorName}
                serviceType={selectedChat.type as 'ir' | 'certificate' | 'company_opening'}
                isContador={false}
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>

      <Footer onNavigate={() => navigate('/')} />
    </div>
  );
};

export default MinhasSolicitacoesPage;
