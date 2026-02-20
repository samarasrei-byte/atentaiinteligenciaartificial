import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MessageCircle, FileText, DollarSign, BarChart3, Shield, Scale, Menu, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GuilhermeChatHub } from '@/components/admin/GuilhermeChatHub';
import { LimpaNomeSpreadsheet } from '@/components/admin/LimpaNomeSpreadsheet';
import { FiscalAnalysisManagement } from '@/components/admin/FiscalAnalysisManagement';
import { DocumentsCentral } from '@/components/admin/DocumentsCentral';
import { FinancialModule } from '@/components/admin/financial/FinancialModule';
import { SaaSMetricsDashboard } from '@/components/admin/SaaSMetricsDashboard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

/**
 * Limpa Nome Colaborador - Painel dedicado para a equipe do Guilherme (equipe_guilherme)
 * Inclui Chat, Solicitações (Limpa Nome + Análise Fiscal), Documentos, Financeiro e Métricas.
 * 
 * REALTIME: Escuta inserções/atualizações em credit_repair_requests e fiscal_analysis_requests
 * RESPONSIVO: Adapta-se a mobile, tablet, notebook e desktop
 */

const tabs = [
  { value: 'chat', label: 'Chat', icon: MessageCircle },
  { value: 'solicitacoes-ln', label: 'Limpa Nome', icon: Shield },
  { value: 'solicitacoes-fiscal', label: 'Análise Fiscal', icon: Scale },
  { value: 'documentos', label: 'Documentos', icon: FileText },
  { value: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { value: 'metricas', label: 'Métricas', icon: BarChart3 },
];

export default function LimpaNomeColaborador() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [realtimeStats, setRealtimeStats] = useState({ lnPending: 0, fiscalPending: 0 });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Load initial stats
  useEffect(() => {
    const loadStats = async () => {
      const [lnRes, fiscalRes] = await Promise.all([
        supabase.from('credit_repair_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('fiscal_analysis_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);
      setRealtimeStats({
        lnPending: lnRes.count || 0,
        fiscalPending: fiscalRes.count || 0,
      });
    };
    if (user) loadStats();
  }, [user]);

  // Realtime subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('colaborador-realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'credit_repair_requests',
      }, () => {
        // Refresh stats on any change
        supabase.from('credit_repair_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending')
          .then(({ count }) => setRealtimeStats(prev => ({ ...prev, lnPending: count || 0 })));
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'fiscal_analysis_requests',
      }, () => {
        supabase.from('fiscal_analysis_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending')
          .then(({ count }) => setRealtimeStats(prev => ({ ...prev, fiscalPending: count || 0 })));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setMobileMenuOpen(false);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh] bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Carregando painel...</p>
        </div>
      </div>
    );
  }

  const activeTabData = tabs.find(t => t.value === activeTab);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col flex-1">
        {/* Top Navigation Bar - Responsive */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b shrink-0">
          <div className="px-2 sm:px-4 py-2">
            {/* Mobile: hamburger + active tab label */}
            <div className="flex items-center gap-2 md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[280px] p-0">
                  <div className="p-4 border-b">
                    <h2 className="font-semibold text-lg">Painel Colaborador</h2>
                    <p className="text-xs text-muted-foreground">Equipe Limpa Nome</p>
                  </div>
                  <nav className="p-2 space-y-1">
                    {tabs.map(tab => {
                      const Icon = tab.icon;
                      const isActive = activeTab === tab.value;
                      const pendingCount = tab.value === 'solicitacoes-ln' ? realtimeStats.lnPending
                        : tab.value === 'solicitacoes-fiscal' ? realtimeStats.fiscalPending : 0;
                      return (
                        <button
                          key={tab.value}
                          onClick={() => handleTabChange(tab.value)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-primary/10 text-primary'
                              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0" />
                          <span className="flex-1 text-left">{tab.label}</span>
                          {pendingCount > 0 && (
                            <Badge variant="destructive" className="text-xs px-1.5 py-0.5 min-w-[20px] justify-center">
                              {pendingCount}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </SheetContent>
              </Sheet>

              {activeTabData && (
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <activeTabData.icon className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium text-sm truncate">{activeTabData.label}</span>
                  {(activeTab === 'solicitacoes-ln' && realtimeStats.lnPending > 0) && (
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">{realtimeStats.lnPending}</Badge>
                  )}
                  {(activeTab === 'solicitacoes-fiscal' && realtimeStats.fiscalPending > 0) && (
                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5">{realtimeStats.fiscalPending}</Badge>
                  )}
                </div>
              )}
            </div>

            {/* Desktop/Tablet: full tab bar */}
            <TabsList className="hidden md:flex bg-muted/50 p-1 h-auto flex-wrap w-full justify-start">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const pendingCount = tab.value === 'solicitacoes-ln' ? realtimeStats.lnPending
                  : tab.value === 'solicitacoes-fiscal' ? realtimeStats.fiscalPending : 0;
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2 text-xs lg:text-sm"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{tab.label}</span>
                    <span className="lg:hidden">{tab.label.split(' ')[0]}</span>
                    {pendingCount > 0 && (
                      <Badge variant="destructive" className="text-[10px] px-1 py-0 min-w-[16px] justify-center leading-4">
                        {pendingCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>

        {/* Tab Contents - Responsive heights */}
        <TabsContent value="chat" className="mt-0 flex-1 min-h-0" style={{ height: 'calc(100dvh - 60px)' }}>
          <GuilhermeChatHub />
        </TabsContent>

        <TabsContent value="solicitacoes-ln" className="mt-0 p-2 sm:p-4 flex-1 overflow-auto">
          <LimpaNomeSpreadsheet />
        </TabsContent>

        <TabsContent value="solicitacoes-fiscal" className="mt-0 p-2 sm:p-4 flex-1 overflow-auto">
          <FiscalAnalysisManagement />
        </TabsContent>

        <TabsContent value="documentos" className="mt-0 p-2 sm:p-4 flex-1 overflow-auto">
          <DocumentsCentral />
        </TabsContent>

        <TabsContent value="financeiro" className="mt-0 p-2 sm:p-4 flex-1 overflow-auto">
          <FinancialModule />
        </TabsContent>

        <TabsContent value="metricas" className="mt-0 p-2 sm:p-4 flex-1 overflow-auto">
          <SaaSMetricsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
