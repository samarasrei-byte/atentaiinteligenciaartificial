import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, Activity, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CesarClientChat } from './CesarClientChat';
import { supabase } from '@/integrations/supabase/client';

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

interface Stats {
  biClients: number;
  pendingDocs: number;
  activeReports: number;
}

/**
 * CesarChatHub - Central de Emissão de NF
 * 
 * SERVIÇOS: Emissão de NF, Validação Fiscal, Comunicação com Clientes
 */
export const CesarChatHub: React.FC = () => {
  const [isWhatsAppConnected] = React.useState(true);
  const [stats, setStats] = useState<Stats>({ biClients: 0, pendingDocs: 0, activeReports: 0 });
  
  useEffect(() => {
    const loadStats = async () => {
      // Count BI requests (notes starting with [BI])
      const { data: biRequests } = await supabase
        .from('fiscal_analysis_requests')
        .select('id, notes')
        .neq('status', 'completed');
      
      const biClients = (biRequests || []).filter(r => 
        typeof r.notes === 'string' && r.notes.toUpperCase().startsWith('[BI]')
      ).length;
      
      // Count active subscriptions
      const { count: activeReports } = await supabase
        .from('subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');
      
      setStats({ 
        biClients, 
        pendingDocs: 0, 
        activeReports: activeReports || 0 
      });
    };
    
    loadStats();
  }, []);
  
  return (
    <div className="h-full flex flex-col">
      {/* Header - Identidade Visual César - Responsive */}
      <div className="shrink-0 px-3 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-violet-600 to-indigo-600 border-b border-violet-700">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20 shrink-0">
              <span className="text-base sm:text-xl font-bold text-white">NF</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="truncate">Chat – Emissão de NF</span>
                <span className="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-full w-full bg-white" />
                </span>
              </h1>
              <p className="text-violet-100 text-xs sm:text-sm truncate">Notas Fiscais • NF-e, NFS-e, NFC-e</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* WhatsApp Business Status - hidden on small screens */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20">
              <WhatsAppBusinessIcon connected={isWhatsAppConnected} className="h-5 w-5" />
              <span className="text-sm text-white font-medium">WhatsApp Business</span>
              <span className={`h-2 w-2 rounded-full ${isWhatsAppConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            </div>
            
            {/* Compact WhatsApp icon on medium screens */}
            <div className="hidden md:flex lg:hidden items-center px-2 py-1.5 rounded-full bg-white/10 border border-white/20">
              <WhatsAppBusinessIcon connected={isWhatsAppConnected} className="h-5 w-5" />
            </div>
            
            <Badge variant="outline" className="hidden sm:flex bg-white/10 text-white border-white/20 gap-1.5 text-xs">
              <BarChart3 className="h-3 w-3" />
              <span className="hidden md:inline">Emissão NF</span>
              <span className="md:hidden">NF</span>
            </Badge>
            <Badge variant="outline" className="hidden sm:flex bg-white/10 text-white border-white/20 gap-1.5 text-xs">
              <FileText className="h-3 w-3" />
              <span className="hidden md:inline">Validação Fiscal</span>
              <span className="md:hidden">Valid</span>
            </Badge>
          </div>
        </div>
        
        {/* Quick Stats - Real Data - responsive */}
        <div className="flex items-center gap-3 sm:gap-6 mt-2 sm:mt-4 text-violet-100 text-xs sm:text-sm overflow-x-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{stats.biClients} <span className="hidden sm:inline">clientes</span> BI</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Docs contábeis</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{stats.activeReports} assinantes</span>
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
