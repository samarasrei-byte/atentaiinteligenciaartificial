import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Search, Send, Paperclip, Image, FileText, 
  CheckCircle, Clock, AlertCircle, User, Building, Phone, Mail,
  ChevronRight, X, Upload, File
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CreditRepairChat } from '@/components/limpa-nome/CreditRepairChat';

interface ChatClient {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  status: string;
  service_type: 'limpa-nome' | 'fiscal';
  user_id: string;
  last_message?: string;
  unread_count?: number;
  created_at: string;
}

interface ModernPartnerChatProps {
  clients: ChatClient[];
  currentUserId: string;
  isDark?: boolean;
}

export function ModernPartnerChat({ clients, currentUserId, isDark = false }: ModernPartnerChatProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<ChatClient | null>(null);
  const [showDocumentRequest, setShowDocumentRequest] = useState(false);

  const filteredClients = clients.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusConfig = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pendente' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Em Andamento' },
      negotiating: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Negociando' },
      analyzing: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Analisando' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Concluído' },
    };
    return config[status] || config.pending;
  };

  const documentTypes = [
    { id: 'cnd_federal', label: 'CND Federal', icon: FileText },
    { id: 'cnd_estadual', label: 'CND Estadual', icon: FileText },
    { id: 'cnd_municipal', label: 'CND Municipal', icon: FileText },
    { id: 'contrato_social', label: 'Contrato Social', icon: File },
    { id: 'alteracao_contratual', label: 'Alteração Contratual', icon: File },
    { id: 'doc_fiscal', label: 'Documento Fiscal', icon: FileText },
    { id: 'comprovante_renda', label: 'Comprovante de Renda', icon: FileText },
    { id: 'rg_cpf', label: 'RG / CPF', icon: User },
    { id: 'outro', label: 'Outro Documento', icon: Paperclip },
  ];

  return (
    <div className={cn(
      "h-[calc(100vh-280px)] min-h-[500px] rounded-2xl overflow-hidden border flex",
      isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-xl'
    )}>
      {/* Client List */}
      <div className={cn(
        "w-80 flex-shrink-0 border-r flex flex-col",
        isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'
      )}>
        {/* Search Header */}
        <div className={cn(
          "p-4 border-b",
          isDark ? 'border-slate-700' : 'border-slate-200'
        )}>
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className={cn("h-5 w-5", isDark ? 'text-emerald-400' : 'text-emerald-600')} />
            <h3 className={cn("font-semibold", isDark ? 'text-white' : 'text-slate-900')}>
              Conversas
            </h3>
            <Badge className="bg-emerald-100 text-emerald-700 text-xs">{clients.length}</Badge>
          </div>
          <div className="relative">
            <Search className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
              isDark ? 'text-slate-500' : 'text-slate-400'
            )} />
            <Input 
              placeholder="Buscar cliente..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "pl-10",
                isDark 
                  ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-500' 
                  : 'bg-white border-slate-200'
              )}
            />
          </div>
        </div>

        {/* Client List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredClients.length === 0 ? (
              <div className={cn(
                "text-center py-8",
                isDark ? 'text-slate-500' : 'text-slate-400'
              )}>
                <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhuma conversa encontrada</p>
              </div>
            ) : (
              filteredClients.map((client) => {
                const statusConfig = getStatusConfig(client.status);
                const isSelected = selectedClient?.id === client.id;
                
                return (
                  <button
                    key={client.id}
                    onClick={() => setSelectedClient(client)}
                    className={cn(
                      "w-full p-3 rounded-xl flex items-center gap-3 transition-all text-left",
                      isSelected
                        ? isDark 
                          ? 'bg-emerald-500/20 border border-emerald-500/30' 
                          : 'bg-emerald-50 border border-emerald-200'
                        : isDark 
                          ? 'hover:bg-slate-800/50 border border-transparent' 
                          : 'hover:bg-white border border-transparent hover:shadow-sm'
                    )}
                  >
                    <Avatar className={cn(
                      "h-11 w-11 border-2",
                      client.service_type === 'fiscal' ? 'border-blue-500/30' : 'border-emerald-500/30'
                    )}>
                      <AvatarFallback className={cn(
                        "font-semibold",
                        client.service_type === 'fiscal' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      )}>
                        {client.full_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "font-medium text-sm truncate",
                          isDark ? 'text-white' : 'text-slate-900'
                        )}>
                          {client.full_name}
                        </span>
                        {client.unread_count && client.unread_count > 0 && (
                          <span className="h-5 min-w-5 px-1.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {client.unread_count}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge className={cn("text-[10px] h-5", statusConfig.bg, statusConfig.text)}>
                          {statusConfig.label}
                        </Badge>
                        <Badge variant="outline" className={cn(
                          "text-[10px] h-5",
                          client.service_type === 'fiscal' 
                            ? 'border-blue-300 text-blue-600' 
                            : 'border-emerald-300 text-emerald-600'
                        )}>
                          {client.service_type === 'fiscal' ? 'Fiscal' : 'Limpa Nome'}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "h-4 w-4 flex-shrink-0",
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    )} />
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedClient ? (
          <>
            {/* Chat Header */}
            <div className={cn(
              "p-4 border-b flex items-center justify-between",
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
            )}>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-emerald-500/30">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                    {selectedClient.full_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className={cn("font-semibold", isDark ? 'text-white' : 'text-slate-900')}>
                    {selectedClient.full_name}
                  </h3>
                  <div className={cn("flex items-center gap-3 text-xs", isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {selectedClient.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {selectedClient.email}
                      </span>
                    )}
                    {selectedClient.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedClient.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDocumentRequest(!showDocumentRequest)}
                  className={cn(
                    "gap-2",
                    isDark ? 'border-slate-600 text-slate-300' : 'border-slate-200'
                  )}
                >
                  <FileText className="h-4 w-4" />
                  Solicitar Documento
                </Button>
              </div>
            </div>

            {/* Document Request Panel (Collapsible) */}
            <AnimatePresence>
              {showDocumentRequest && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={cn(
                    "border-b overflow-hidden",
                    isDark ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-200'
                  )}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={cn("font-medium text-sm", isDark ? 'text-white' : 'text-slate-900')}>
                        Selecione o tipo de documento:
                      </h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setShowDocumentRequest(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {documentTypes.map((doc) => (
                        <Button
                          key={doc.id}
                          variant="outline"
                          size="sm"
                          className={cn(
                            "justify-start gap-2 h-auto py-2",
                            isDark ? 'border-slate-600 hover:bg-slate-700' : 'border-slate-200 hover:bg-white'
                          )}
                          onClick={() => {
                            // In a real implementation, this would send a document request message
                            setShowDocumentRequest(false);
                          }}
                        >
                          <doc.icon className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs">{doc.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat Messages */}
            <div className="flex-1 overflow-hidden">
              <CreditRepairChat
                requestId={selectedClient.id}
                otherUserId={selectedClient.user_id}
                otherUserName={selectedClient.full_name}
                isAdmin={false}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className={cn(
                "h-20 w-20 rounded-2xl flex items-center justify-center mx-auto mb-4",
                isDark ? 'bg-slate-800' : 'bg-slate-100'
              )}>
                <MessageCircle className={cn("h-10 w-10", isDark ? 'text-slate-600' : 'text-slate-400')} />
              </div>
              <h3 className={cn("font-semibold mb-1", isDark ? 'text-white' : 'text-slate-900')}>
                Selecione uma conversa
              </h3>
              <p className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-500')}>
                Escolha um cliente na lista para iniciar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
