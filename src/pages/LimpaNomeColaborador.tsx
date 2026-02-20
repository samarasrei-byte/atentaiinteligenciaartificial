import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, MessageCircle, FileText, DollarSign, BarChart3, Shield, Scale } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GuilhermeChatHub } from '@/components/admin/GuilhermeChatHub';
import { LimpaNomeSpreadsheet } from '@/components/admin/LimpaNomeSpreadsheet';
import { FiscalAnalysisManagement } from '@/components/admin/FiscalAnalysisManagement';
import { DocumentsCentral } from '@/components/admin/DocumentsCentral';
import { FinancialModule } from '@/components/admin/financial/FinancialModule';
import { SaaSMetricsDashboard } from '@/components/admin/SaaSMetricsDashboard';

/**
 * Limpa Nome Colaborador - Painel dedicado para a equipe do Guilherme (equipe_guilherme)
 * Inclui Chat, Solicitações (Limpa Nome + Análise Fiscal), Documentos, Financeiro e Métricas.
 */
export default function LimpaNomeColaborador() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');

  React.useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
          <div className="px-4 py-2">
            <TabsList className="bg-muted/50 p-1 h-auto flex-wrap w-full justify-start">
              <TabsTrigger value="chat" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="solicitacoes-ln" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                <Shield className="h-4 w-4" />
                Limpa Nome
              </TabsTrigger>
              <TabsTrigger value="solicitacoes-fiscal" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                <Scale className="h-4 w-4" />
                Análise Fiscal
              </TabsTrigger>
              <TabsTrigger value="documentos" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                <FileText className="h-4 w-4" />
                Documentos
              </TabsTrigger>
              <TabsTrigger value="financeiro" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                <DollarSign className="h-4 w-4" />
                Financeiro
              </TabsTrigger>
              <TabsTrigger value="metricas" className="data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
                <BarChart3 className="h-4 w-4" />
                Métricas
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tab Contents */}
        <TabsContent value="chat" className="mt-0 h-[calc(100vh-60px)]">
          <GuilhermeChatHub />
        </TabsContent>

        <TabsContent value="solicitacoes-ln" className="mt-0 p-4">
          <LimpaNomeSpreadsheet />
        </TabsContent>

        <TabsContent value="solicitacoes-fiscal" className="mt-0 p-4">
          <FiscalAnalysisManagement />
        </TabsContent>

        <TabsContent value="documentos" className="mt-0 p-4">
          <DocumentsCentral />
        </TabsContent>

        <TabsContent value="financeiro" className="mt-0 p-4">
          <FinancialModule />
        </TabsContent>

        <TabsContent value="metricas" className="mt-0 p-4">
          <SaaSMetricsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
