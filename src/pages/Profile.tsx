import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  User, 
  Building2, 
  Save, 
  Loader2, 
  Mail, 
  Phone,
  CreditCard,
  Crown,
  Bell
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPrice, STRIPE_PLANS } from '@/lib/stripe';
import { ProfileSkeleton } from '@/components/ui/skeleton-loaders';
import { NotificationSettings } from '@/components/pwa/NotificationSettings';

const COMPANY_TYPES = [
  { value: 'mei', label: 'MEI - Microempreendedor Individual' },
  { value: 'me', label: 'ME - Microempresa' },
  { value: 'epp', label: 'EPP - Empresa de Pequeno Porte' },
  { value: 'ltda', label: 'LTDA - Sociedade Limitada' },
  { value: 'eireli', label: 'EIRELI - Empresa Individual' },
  { value: 'sa_fechada', label: 'S.A. Fechada' },
  { value: 'sa_aberta', label: 'S.A. Aberta' },
  { value: 'cooperativa', label: 'Cooperativa' },
];

const TAX_REGIMES = [
  { value: 'simples_nacional', label: 'Simples Nacional' },
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
  { value: 'lucro_arbitrado', label: 'Lucro Arbitrado' },
];

const SECTORS = [
  { value: 'comercio', label: 'Comércio' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'industria', label: 'Indústria' },
  { value: 'agronegocio', label: 'Agronegócio' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'saude', label: 'Saúde' },
  { value: 'educacao', label: 'Educação' },
  { value: 'construcao', label: 'Construção Civil' },
  { value: 'transporte', label: 'Transporte' },
  { value: 'alimentacao', label: 'Alimentação' },
  { value: 'outro', label: 'Outro' },
];

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface ProfileData {
  full_name: string;
  email: string;
  phone: string;
}

interface CompanyData {
  id?: string;
  company_name: string;
  trade_name: string;
  cnpj: string;
  company_type: string;
  tax_regime: string;
  sector: string;
  monthly_revenue_cents: number;
  employee_count: number;
  state: string;
  city: string;
  main_activity: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile: authProfile, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    email: '',
    phone: '',
  });
  
  const [companyData, setCompanyData] = useState<CompanyData>({
    company_name: '',
    trade_name: '',
    cnpj: '',
    company_type: '',
    tax_regime: '',
    sector: '',
    monthly_revenue_cents: 0,
    employee_count: 0,
    state: '',
    city: '',
    main_activity: '',
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Load profile (0 rows should not throw)
      const { data: profileResult, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error loading profile:', profileError);
      }

      setProfileData({
        full_name: profileResult?.full_name || authProfile?.full_name || '',
        email: profileResult?.email || user.email || '',
        phone: profileResult?.phone || '',
      });

      // Load company (0 rows should not throw)
      const { data: companyResult, error: companyError } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (companyError) {
        console.error('Error loading company:', companyError);
      }

      if (companyResult) {
        setCompanyData({
          id: companyResult.id,
          company_name: companyResult.company_name,
          trade_name: companyResult.trade_name || '',
          cnpj: companyResult.cnpj || '',
          company_type: companyResult.company_type,
          tax_regime: companyResult.tax_regime,
          sector: companyResult.sector,
          monthly_revenue_cents: companyResult.monthly_revenue_cents,
          employee_count: companyResult.employee_count,
          state: companyResult.state || '',
          city: companyResult.city || '',
          main_activity: companyResult.main_activity || '',
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    try {
      const payload = {
        full_name: profileData.full_name,
        phone: profileData.phone,
        updated_at: new Date().toISOString(),
      };

      // Try update first
      const { data: updatedRow, error: updateError } = await supabase
        .from('profiles')
        .update(payload)
        .eq('user_id', user.id)
        .select('*')
        .maybeSingle();

      if (updateError) throw updateError;

      // If no row existed, insert it
      if (!updatedRow) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email ?? null,
            full_name: profileData.full_name,
            phone: profileData.phone,
          });

        if (insertError) throw insertError;
      }

      toast({
        title: 'Perfil atualizado!',
        description: 'Seus dados pessoais foram salvos',
      });
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao salvar perfil',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCompany = async () => {
    setIsSaving(true);
    try {
      const companyPayload = {
        company_name: companyData.company_name,
        trade_name: companyData.trade_name || null,
        cnpj: companyData.cnpj || null,
        company_type: companyData.company_type as any,
        tax_regime: companyData.tax_regime as any,
        sector: companyData.sector as any,
        monthly_revenue_cents: companyData.monthly_revenue_cents,
        annual_revenue_cents: companyData.monthly_revenue_cents * 12,
        employee_count: companyData.employee_count,
        state: companyData.state || null,
        city: companyData.city || null,
        main_activity: companyData.main_activity || null,
        updated_at: new Date().toISOString(),
      };

      if (companyData.id) {
        const { error } = await supabase
          .from('companies')
          .update(companyPayload)
          .eq('id', companyData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('companies')
          .insert({
            ...companyPayload,
            user_id: user!.id,
            onboarding_completed: true,
          });
        if (error) throw error;
      }

      toast({
        title: 'Empresa atualizada!',
        description: 'Os dados da empresa foram salvos',
      });
      
      loadData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao salvar dados da empresa',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsManaging(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao abrir portal de assinatura',
      });
    } finally {
      setIsManaging(false);
    }
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    );
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-4">
        <div className="max-w-4xl mx-auto">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  const currentPlan = subscription.plan ? STRIPE_PLANS[subscription.plan] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Meu Perfil</h1>
            <p className="text-slate-400">Gerencie seus dados e assinatura</p>
          </div>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700 flex-wrap">
            <TabsTrigger value="personal" className="data-[state=active]:bg-teal-600 text-white">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Dados Pessoais</span>
              <span className="sm:hidden">Pessoal</span>
            </TabsTrigger>
            <TabsTrigger value="company" className="data-[state=active]:bg-teal-600 text-white">
              <Building2 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Empresa</span>
              <span className="sm:hidden">Empresa</span>
            </TabsTrigger>
            <TabsTrigger value="subscription" className="data-[state=active]:bg-teal-600 text-white">
              <CreditCard className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Assinatura</span>
              <span className="sm:hidden">Plano</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-teal-600 text-white">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Notificações</span>
              <span className="sm:hidden">Alertas</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Data Tab */}
          <TabsContent value="personal">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-teal-400" />
                  Dados Pessoais
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Atualize suas informações de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        value={profileData.full_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Seu nome"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        value={profileData.email}
                        disabled
                        className="pl-10 bg-slate-700/30 border-slate-600 text-slate-400"
                      />
                    </div>
                    <p className="text-xs text-slate-500">Email não pode ser alterado</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-300">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Company Tab */}
          <TabsContent value="company">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-teal-400" />
                  Dados da Empresa
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Informações utilizadas nas simulações tributárias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Identification */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-teal-400">Identificação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Razão Social *</Label>
                      <Input
                        value={companyData.company_name}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, company_name: e.target.value }))}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Nome oficial da empresa"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">Nome Fantasia</Label>
                      <Input
                        value={companyData.trade_name}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, trade_name: e.target.value }))}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Nome comercial"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">CNPJ</Label>
                      <Input
                        value={companyData.cnpj}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 14);
                          setCompanyData(prev => ({ ...prev, cnpj: formatCNPJ(value) }));
                        }}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="00.000.000/0000-00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">Tipo de Empresa *</Label>
                      <Select
                        value={companyData.company_type}
                        onValueChange={(value) => setCompanyData(prev => ({ ...prev, company_type: value }))}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 z-50">
                          {COMPANY_TYPES.map((type) => (
                            <SelectItem 
                              key={type.value} 
                              value={type.value}
                              className="text-white hover:bg-slate-700"
                            >
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Tax Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-cyan-400">Regime Tributário</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Regime Tributário *</Label>
                      <Select
                        value={companyData.tax_regime}
                        onValueChange={(value) => setCompanyData(prev => ({ ...prev, tax_regime: value }))}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 z-50">
                          {TAX_REGIMES.map((regime) => (
                            <SelectItem 
                              key={regime.value} 
                              value={regime.value}
                              className="text-white hover:bg-slate-700"
                            >
                              {regime.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">Setor *</Label>
                      <Select
                        value={companyData.sector}
                        onValueChange={(value) => setCompanyData(prev => ({ ...prev, sector: value }))}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 z-50">
                          {SECTORS.map((sector) => (
                            <SelectItem 
                              key={sector.value} 
                              value={sector.value}
                              className="text-white hover:bg-slate-700"
                            >
                              {sector.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label className="text-slate-300">Atividade Principal</Label>
                      <Input
                        value={companyData.main_activity}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, main_activity: e.target.value }))}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Ex: Desenvolvimento de software"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-green-400">Dados Financeiros</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Faturamento Mensal</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-medium">R$</span>
                        <Input
                          type="text"
                          inputMode="numeric"
                          value={companyData.monthly_revenue_cents > 0 ? new Intl.NumberFormat('pt-BR').format(companyData.monthly_revenue_cents / 100) : ''}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setCompanyData(prev => ({ ...prev, monthly_revenue_cents: parseInt(value) * 100 || 0 }));
                          }}
                          className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                          placeholder="0"
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        Anual: {formatCurrency(companyData.monthly_revenue_cents * 12)}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">Funcionários</Label>
                      <Input
                        type="number"
                        min="0"
                        value={companyData.employee_count || ''}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, employee_count: parseInt(e.target.value) || 0 }))}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-amber-400">Localização</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Estado</Label>
                      <Select
                        value={companyData.state}
                        onValueChange={(value) => setCompanyData(prev => ({ ...prev, state: value }))}
                      >
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 max-h-[200px] z-50">
                          {STATES.map((state) => (
                            <SelectItem 
                              key={state} 
                              value={state}
                              className="text-white hover:bg-slate-700"
                            >
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-300">Cidade</Label>
                      <Input
                        value={companyData.city}
                        onChange={(e) => setCompanyData(prev => ({ ...prev, city: e.target.value }))}
                        className="bg-slate-700/50 border-slate-600 text-white"
                        placeholder="Nome da cidade"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleSaveCompany}
                  disabled={isSaving || !companyData.company_name || !companyData.company_type || !companyData.tax_regime || !companyData.sector}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Salvar Empresa
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-teal-400" />
                  Minha Assinatura
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Gerencie seu plano e pagamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {subscription.subscribed && currentPlan ? (
                  <div className="space-y-6">
                    <div className="p-6 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-teal-500/20">
                            <Crown className="h-6 w-6 text-teal-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{currentPlan.name}</h3>
                            <p className="text-slate-400">{currentPlan.description}</p>
                          </div>
                        </div>
                        <Badge className="bg-teal-500/20 text-teal-400 border-teal-500/30">
                          Ativo
                        </Badge>
                      </div>
                      
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-3xl font-bold text-white">
                          {formatPrice(currentPlan.price)}
                        </span>
                        <span className="text-slate-400">/mês</span>
                      </div>

                      {subscription.subscriptionEnd && (
                        <p className="text-sm text-slate-400">
                          Próxima renovação: {new Date(subscription.subscriptionEnd).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-300">Recursos incluídos:</h4>
                      <ul className="space-y-2">
                        {currentPlan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2 text-slate-400">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button 
                      onClick={handleManageSubscription}
                      disabled={isManaging}
                      variant="outline"
                      className="w-full border-slate-600 text-white hover:bg-slate-700"
                    >
                      {isManaging ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Gerenciar Assinatura
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="p-4 rounded-full bg-slate-700/50 w-fit mx-auto mb-4">
                      <CreditCard className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">Nenhum plano ativo</h3>
                    <p className="text-slate-400 mb-6">
                      Assine um plano para desbloquear todos os recursos
                    </p>
                    <Button 
                      onClick={() => navigate('/pricing')}
                      className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                    >
                      Ver Planos
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
