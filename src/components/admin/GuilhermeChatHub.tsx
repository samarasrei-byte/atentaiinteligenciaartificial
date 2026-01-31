import React from 'react';
import { MessageCircle, FileText, Shield, Scale, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AdminClientChat } from './AdminClientChat';

// WhatsApp Business Icon SVG component
const WhatsAppBusinessIcon = ({ className = "h-5 w-5", connected = true }: { className?: string; connected?: boolean }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path 
      d="M12.001 2C6.478 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.932-1.29A9.953 9.953 0 0012.001 22c5.523 0 10-4.477 10-10s-4.477-10-10-10z" 
      fill={connected ? "#25D366" : "#9CA3AF"}
    />
    <path 
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" 
      fill="white"
    />
    <circle cx="18" cy="6" r="4" fill={connected ? "#128C7E" : "#6B7280"} stroke="white" strokeWidth="1" />
    <text x="18" y="7.5" textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">B</text>
  </svg>
);

/**
 * GuilhermeChatHub - Central de Atendimento ao Cliente
 * 
 * RESPONSÁVEL: Guilherme
 * SERVIÇOS: Limpa Nome, Análise Fiscal
 * 
 * REGRA DE NEGÓCIO:
 * - Todo atendimento ao cliente passa por aqui
 * - Documentos enviados no chat vão para Central de Documentos
 * - WhatsApp Business integrado (instância Guilherme)
 * - Serviços são CONTEXTO, não páginas separadas
 */
export const GuilhermeChatHub: React.FC = () => {
  const [isWhatsAppConnected] = React.useState(true);
  
  return (
    <div className="h-full flex flex-col">
      {/* Header - Identidade Visual */}
      <div className="shrink-0 px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 border-b border-emerald-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20">
              <span className="text-xl font-bold text-white">G</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                Chat – Guilherme
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
                </span>
              </h1>
              <p className="text-emerald-100 text-sm">Central de Atendimento ao Cliente</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* WhatsApp Business Status */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
              <WhatsAppBusinessIcon connected={isWhatsAppConnected} className="h-5 w-5" />
              <span className="text-sm text-white font-medium">WhatsApp Business</span>
              <span className={`h-2 w-2 rounded-full ${isWhatsAppConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            </div>
            
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 gap-2">
              <Shield className="h-3.5 w-3.5" />
              Limpa Nome
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/20 gap-2">
              <Scale className="h-3.5 w-3.5" />
              Análise Fiscal
            </Badge>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-6 mt-4 text-emerald-100 text-sm">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>12 conversas ativas</span>
          </div>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>8 docs pendentes</span>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>3 alertas</span>
          </div>
        </div>
      </div>
      
      {/* Chat Component */}
      <div className="flex-1 min-h-0">
        <AdminClientChat />
      </div>
    </div>
  );
};

export default GuilhermeChatHub;
