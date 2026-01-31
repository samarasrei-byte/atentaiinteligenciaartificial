import React from 'react';
import { MessageCircle, FileText, Shield, Scale, Bell, User, Send, Paperclip, Sparkles, Phone, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AdminClientChat } from './AdminClientChat';

/**
 * GuilhermeChatHub - Central de Atendimento ao Cliente
 * 
 * RESPONSÁVEL: Guilherme
 * SERVIÇOS: Limpa Nome, Análise Fiscal
 * 
 * REGRA DE NEGÓCIO:
 * - Todo atendimento ao cliente passa por aqui
 * - Documentos enviados no chat vão para Central de Documentos
 * - WhatsApp integrado (instância Guilherme)
 * - Serviços são CONTEXTO, não páginas separadas
 */
export const GuilhermeChatHub: React.FC = () => {
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
