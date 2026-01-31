import React from 'react';
import { BarChart3, FileText, TrendingUp, Bell, Activity, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CesarClientChat } from './CesarClientChat';

/**
 * CesarChatHub - Central de BI & Contabilidade
 * 
 * RESPONSÁVEL: César
 * SERVIÇOS: BI Completo, Contabilidade, Comunicação com Clientes BI
 * 
 * REGRA DE NEGÓCIO:
 * - Chat de comunicação com clientes de BI/Contabilidade
 * - Documentos enviados no chat vão para Central de Documentos
 * - WhatsApp integrado (instância César)
 * - Mesma experiência visual do chat do Guilherme
 * 
 * REMOVIDO daqui (agora no sidebar):
 * - Métricas SaaS
 * - Churn Rate
 * - Análise de Cohort
 * - Alertas de Performance
 */
export const CesarChatHub: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      {/* Header - Identidade Visual César */}
      <div className="shrink-0 px-6 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 border-b border-violet-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
              <span className="text-xl font-bold text-white">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Chat – César
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
              </h1>
              <p className="text-violet-100 text-sm">BI & Contabilidade • Comunicação com Clientes</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 gap-2">
              <BarChart3 className="h-3.5 w-3.5" />
              BI Completo
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 gap-2">
              <FileText className="h-3.5 w-3.5" />
              Contabilidade
            </Badge>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-6 mt-4 text-violet-100 text-sm">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>Atendimento BI</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Docs contábeis</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Relatórios</span>
          </div>
        </div>
      </div>
      
      {/* Chat Component - Igual ao do Guilherme */}
      <div className="flex-1 min-h-0">
        <CesarClientChat />
      </div>
    </div>
  );
};

export default CesarChatHub;
