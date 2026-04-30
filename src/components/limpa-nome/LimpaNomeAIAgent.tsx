import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  Zap, 
  Send, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  ShieldCheck, 
  Loader2,
  Mail,
  Smartphone,
  History
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AIAgentLog {
  id: string;
  channel: string;
  direction: string;
  message: string;
  created_at: string;
  metadata: any;
}

interface LimpaNomeAIAgentProps {
  requestId: string;
  status: string;
  aiStatus: string;
}

export function LimpaNomeAIAgent({ requestId, status, aiStatus }: LimpaNomeAIAgentProps) {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AIAgentLog[]>([]);
  const [isActivating, setIsActivating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetchLogs();
    
    const channel = supabase
      .channel(`ai-agent-logs-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'credit_repair_ai_logs',
          filter: `request_id=eq.${requestId}`
        },
        (payload) => {
          setLogs(prev => [payload.new as AIAgentLog, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId]);

  useEffect(() => {
    if (aiStatus === 'contacting') setProgress(45);
    else if (aiStatus === 'waiting_reply') setProgress(75);
    else if (aiStatus === 'negotiated') setProgress(100);
    else setProgress(10);
  }, [aiStatus]);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('credit_repair_ai_logs')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setLogs(data);
    }
  };

  const handleActivateAgent = async () => {
    setIsActivating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-limpa-nome-outreach', {
        body: { requestId, action: 'start_outreach' }
      });

      if (error) throw error;

      toast({
        title: "Agente IA Ativado!",
        description: "O agente iniciou o contato com seus credores.",
      });
    } catch (error: any) {
      console.error('Error activating agent:', error);
      toast({
        title: "Erro ao ativar agente",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden shadow-strong">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/20">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Agente IA de Negociação</CardTitle>
              <CardDescription>Automação jurídica para limpeza de nome</CardDescription>
            </div>
          </div>
          <Badge variant={aiStatus === 'idle' ? 'secondary' : 'default'} className="animate-pulse">
            {aiStatus === 'idle' ? 'Inativo' : 'Em Execução'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status da Automação</span>
            <span className="font-medium">{progress}% concluído</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Action Controls */}
        {aiStatus === 'idle' && (
          <div className="p-4 rounded-xl bg-background/50 border border-border flex flex-col items-center text-center gap-4">
            <Zap className="h-10 w-10 text-accent animate-bounce" />
            <div>
              <h4 className="font-bold">Deseja que a IA inicie as negociações?</h4>
              <p className="text-sm text-muted-foreground">O agente enviará e-mails e mensagens profissionais para seus credores solicitando a baixa dos apontamentos.</p>
            </div>
            <Button 
              onClick={handleActivateAgent} 
              disabled={isActivating}
              className="w-full sm:w-auto bg-gradient-to-r from-primary to-accent hover:opacity-90"
            >
              {isActivating ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ativando...</>
              ) : (
                <><Zap className="mr-2 h-4 w-4" /> Ativar Agente Negociador</>
              )}
            </Button>
            
            {/* Simulation button for demo purposes */}
            <Button 
              variant="link" 
              size="sm" 
              className="text-[10px] text-muted-foreground opacity-50"
              onClick={async () => {
                await supabase.functions.invoke('ai-limpa-nome-callback', {
                  body: { 
                    requestId, 
                    channel: 'WhatsApp', 
                    sender: 'Banco Bradesco', 
                    message: 'Recebemos sua solicitação. Após análise do CPF, confirmamos que o débito de 2018 está prescrito e procedemos com a exclusão do apontamento em nosso sistema. Favor aguardar 72h para atualização nos bureaus.'
                  }
                });
              }}
            >
              (Simular Resposta do Credor)
            </Button>
          </div>
        )}

        {/* Active Status Display */}
        {aiStatus !== 'idle' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-background/40 border border-border flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                <Mail className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <p className="font-medium">E-mails</p>
                <p className="text-muted-foreground">Enviados</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-background/40 border border-border flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                <Smartphone className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <p className="font-medium">WhatsApp</p>
                <p className="text-muted-foreground">Simulado</p>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-background/40 border border-border flex items-center gap-3">
              <div className="p-2 rounded-full bg-accent/10 text-accent">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="text-xs">
                <p className="font-medium">Legal</p>
                <p className="text-muted-foreground">Validado</p>
              </div>
            </div>
          </div>
        )}

        {/* Activity Log */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Registro de Atividades do Agente
          </h4>
          <ScrollArea className="h-[200px] rounded-md border p-4 bg-background/30">
            {logs.length === 0 ? (
              <p className="text-sm text-center text-muted-foreground py-10">Nenhuma atividade registrada ainda.</p>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="relative pl-6 pb-4 border-l border-primary/20 last:border-0 last:pb-0">
                    <div className="absolute -left-1.5 top-1 h-3 w-3 rounded-full bg-primary" />
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-5">
                          {log.channel}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(log.created_at), "HH:mm 'de' d 'de' MMM", { locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-foreground/90 whitespace-pre-wrap">
                        {log.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}