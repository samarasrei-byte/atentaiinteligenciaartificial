import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  MessageSquare, 
  AlertTriangle, 
  FileText, 
  Zap,
  Bot,
  User,
  ShieldCheck,
  Bell
} from 'lucide-react';
import { BIDashboard } from './BIDashboard';
import { BIAIChat } from './BIAIChat';
import { BIAnomalies } from './BIAnomalies';
import { BIReports } from './BIReports';
import { BIAutomations } from './BIAutomations';
import { BIRequestsInbox } from './BIRequestsInbox';
import { BIRealtimeNotifications } from './BIRealtimeNotifications';
import { ServiceDocuments } from '../documents/ServiceDocuments';
import { DREAnalysis } from './DREAnalysis';

export const BIAccountingModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inbox');

  return (
    <div className="space-y-6">
      {/* Header com destaque IA + Humano */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-indigo-500/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              Emissão de NF
            </h1>
            <p className="text-muted-foreground mt-1">
              Inteligência Artificial para análises • Decisões finais por especialistas humanos
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/30 py-1.5 px-3">
              <Bot className="h-4 w-4 mr-2" />
              IA Assistiva
            </Badge>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 py-1.5 px-3">
              <User className="h-4 w-4 mr-2" />
              Supervisão Humana
            </Badge>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 py-1.5 px-3">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Auditável
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
          <TabsTrigger value="inbox" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <MessageSquare className="h-4 w-4" />
            Inbox
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboards
          </TabsTrigger>
          <TabsTrigger value="ai-chat" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <Bot className="h-4 w-4" />
            Chat IA
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <AlertTriangle className="h-4 w-4" />
            Anomalias
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <FileText className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="automations" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <Zap className="h-4 w-4" />
            Automações
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-white data-[state=active]:shadow-sm gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-4">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <BIRequestsInbox />
            </div>
            <div className="lg:col-span-1">
              <BIRealtimeNotifications />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <BIDashboard />
        </TabsContent>

        <TabsContent value="ai-chat" className="space-y-4">
          <BIAIChat />
        </TabsContent>

        <TabsContent value="anomalies" className="space-y-4">
          <BIAnomalies />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <BIReports />
        </TabsContent>

        <TabsContent value="automations" className="space-y-4">
          <BIAutomations />
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DREAnalysis />
          <Separator className="my-6" />
          <ServiceDocuments 
            serviceType="bi" 
            serviceName="BI Contabilidade" 
            serviceColor="indigo" 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
