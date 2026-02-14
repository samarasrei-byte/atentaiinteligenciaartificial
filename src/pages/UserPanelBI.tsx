import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LayoutDashboard, 
  FileText, 
  Bell, 
  User, 
  History,
  Brain,
  Shield,
  ShieldCheck,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { UserRequestsList } from '@/components/user-panel/UserRequestsList';
import { UserRequestDetail } from '@/components/user-panel/UserRequestDetail';
import { UserNotifications } from '@/components/user-panel/UserNotifications';
import { UserProfile } from '@/components/user-panel/UserProfile';
import { UserAuditLog } from '@/components/user-panel/UserAuditLog';

interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  unreadMessages: number;
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  created_at: string;
}

const UserPanelBI = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    unreadMessages: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [selectedRequestType, setSelectedRequestType] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    setLoading(true);

    try {
      // Fetch all request counts
      const [creditRepair, fiscal, ir, certificates, companyOpening] = await Promise.all([
        supabase.from('credit_repair_requests').select('id, status').eq('user_id', user.id),
        supabase.from('fiscal_analysis_requests').select('id, status').eq('user_id', user.id),
        supabase.from('ir_requests').select('id, status').eq('user_id', user.id),
        supabase.from('certificate_requests').select('id, status').eq('user_id', user.id),
        supabase.from('company_opening_requests').select('id, status').eq('user_id', user.id),
      ]);

      const allRequests = [
        ...(creditRepair.data || []),
        ...(fiscal.data || []),
        ...(ir.data || []),
        ...(certificates.data || []),
        ...(companyOpening.data || [])
      ];

      const pending = allRequests.filter(r => ['pending', 'analyzing', 'in_progress', 'documents_pending'].includes(r.status));
      const completed = allRequests.filter(r => r.status === 'completed');

      // Fetch unread messages count
      const { count: unreadCount } = await supabase
        .from('credit_repair_chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .is('read_at', null);

      setStats({
        totalRequests: allRequests.length,
        pendingRequests: pending.length,
        completedRequests: completed.length,
        unreadMessages: unreadCount || 0
      });

      // Fetch recent activities from audit logs
      const { data: auditData } = await supabase
        .from('audit_logs')
        .select('id, action_type, metadata, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (auditData) {
        setRecentActivities(auditData.map(a => ({
          id: a.id,
          type: a.action_type,
          message: getActivityMessage(a.action_type, a.metadata),
          created_at: a.created_at
        })));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityMessage = (type: string, metadata: any) => {
    const messages: Record<string, string> = {
      'login_success': 'Login realizado com sucesso',
      'service_purchase': 'Serviço contratado',
      'profile_update': 'Perfil atualizado',
      'dashboard_route': 'Acesso ao painel'
    };
    return messages[type] || type;
  };

  const handleRequestSelect = (id: string, type: string) => {
    setSelectedRequestId(id);
    setSelectedRequestType(type);
    setActiveTab('detail');
  };

  const handleBackToList = () => {
    setSelectedRequestId(null);
    setSelectedRequestType(null);
    setActiveTab('requests');
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <DashboardLayout
      variant="user"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="p-6 space-y-6">
        {/* Header with BI+ Branding */}
        <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white/30">
                <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                  {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">
                  Olá, {profile?.full_name?.split(' ')[0] || 'Usuário'}!
                </h1>
                <p className="text-white/80">Bem-vindo ao seu Painel BI+ Contabilidade™</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge className="bg-white/20 text-white border-white/30 py-1.5 px-3 backdrop-blur-sm">
                <Brain className="h-4 w-4 mr-2" />
                IA Assistiva
              </Badge>
              <Badge className="bg-emerald-500/30 text-white border-emerald-400/30 py-1.5 px-3">
                <ShieldCheck className="h-4 w-4 mr-2" />
                Validação Humana
              </Badge>
            </div>
          </div>
          
          <p className="mt-4 text-sm text-white/70 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Análises feitas pelo BI+ Contabilidade™ com apoio de IA e validação por especialistas humanos
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 p-1 h-auto flex-wrap gap-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="requests" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white gap-2">
              <FileText className="h-4 w-4" />
              Minhas Solicitações
              {stats.totalRequests > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 text-xs">{stats.totalRequests}</Badge>
              )}
            </TabsTrigger>
            {selectedRequestId && (
              <TabsTrigger value="detail" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white gap-2">
                <MessageSquare className="h-4 w-4" />
                Detalhes
              </TabsTrigger>
            )}
            <TabsTrigger value="notifications" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white gap-2">
              <Bell className="h-4 w-4" />
              Notificações
              {stats.unreadMessages > 0 && (
                <Badge className="ml-1 h-5 text-xs bg-red-500 text-white">{stats.unreadMessages}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white gap-2">
              <History className="h-4 w-4" />
              Auditoria
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white border-slate-200 hover:border-indigo-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Total de Solicitações</p>
                      {loading ? (
                        <Skeleton className="h-8 w-16 mt-1" />
                      ) : (
                        <p className="text-3xl font-bold text-slate-900">{stats.totalRequests}</p>
                      )}
                    </div>
                    <div className="p-3 rounded-xl bg-indigo-100">
                      <FileText className="h-6 w-6 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 hover:border-amber-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Em Andamento</p>
                      {loading ? (
                        <Skeleton className="h-8 w-16 mt-1" />
                      ) : (
                        <p className="text-3xl font-bold text-amber-600">{stats.pendingRequests}</p>
                      )}
                    </div>
                    <div className="p-3 rounded-xl bg-amber-100">
                      <Clock className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 hover:border-emerald-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Concluídas</p>
                      {loading ? (
                        <Skeleton className="h-8 w-16 mt-1" />
                      ) : (
                        <p className="text-3xl font-bold text-emerald-600">{stats.completedRequests}</p>
                      )}
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-100">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200 hover:border-violet-300 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Mensagens</p>
                      {loading ? (
                        <Skeleton className="h-8 w-16 mt-1" />
                      ) : (
                        <p className="text-3xl font-bold text-violet-600">{stats.unreadMessages}</p>
                      )}
                    </div>
                    <div className="p-3 rounded-xl bg-violet-100">
                      <MessageSquare className="h-6 w-6 text-violet-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Quick Actions */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                    Ações Rápidas
                  </CardTitle>
                  <CardDescription>Solicite novos serviços</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-between hover:bg-emerald-50 hover:border-emerald-300 group"
                    onClick={() => navigate('/limpa-nome')}
                  >
                    <span className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
                        <Shield className="h-4 w-4 text-emerald-600" />
                      </div>
                      Limpa Nome
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-between hover:bg-violet-50 hover:border-violet-300 group"
                    onClick={() => navigate('/modulo-fiscal/onboarding')}
                  >
                    <span className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-violet-100 group-hover:bg-violet-200 transition-colors">
                        <FileText className="h-4 w-4 text-violet-600" />
                      </div>
                      Análise Fiscal
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-between hover:bg-blue-50 hover:border-blue-300 group"
                    onClick={() => navigate('/ir')}
                  >
                    <span className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      Declaração IR
                    </span>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-white border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5 text-indigo-600" />
                    Atividade Recente
                  </CardTitle>
                  <CardDescription>Últimas ações na sua conta</CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : recentActivities.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">Nenhuma atividade recente</p>
                  ) : (
                    <div className="space-y-3">
                      {recentActivities.map(activity => (
                        <div key={activity.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                          <div className="p-2 rounded-lg bg-indigo-100">
                            <History className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{activity.message}</p>
                            <p className="text-xs text-slate-500">
                              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: ptBR })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* BI+ Info Card */}
            <Card className="bg-gradient-to-br from-slate-50 to-indigo-50 border-indigo-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-indigo-100">
                    <Brain className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">BI+ Contabilidade™</h3>
                    <p className="text-slate-600 mt-1">
                      Suas solicitações são analisadas com inteligência artificial de ponta, mas todas as decisões 
                      importantes são validadas por <strong>César</strong>, nosso especialista humano. 
                      Isso garante precisão, segurança e conformidade legal.
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <Badge variant="outline" className="bg-white border-indigo-200 text-indigo-700">
                        <Sparkles className="h-3 w-3 mr-1" />
                        IA Avançada
                      </Badge>
                      <Badge variant="outline" className="bg-white border-emerald-200 text-emerald-700">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Validação Humana
                      </Badge>
                      <Badge variant="outline" className="bg-white border-violet-200 text-violet-700">
                        <History className="h-3 w-3 mr-1" />
                        100% Auditável
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests">
            <UserRequestsList onSelectRequest={handleRequestSelect} />
          </TabsContent>

          {/* Detail Tab */}
          <TabsContent value="detail">
            {selectedRequestId && selectedRequestType && (
              <UserRequestDetail 
                requestId={selectedRequestId} 
                requestType={selectedRequestType}
                onBack={handleBackToList}
              />
            )}
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <UserNotifications />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <UserProfile />
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit">
            <UserAuditLog />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default UserPanelBI;
