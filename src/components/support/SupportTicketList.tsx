import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Plus, MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export function SupportTicketList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  useEffect(() => {
    if (!user) return;
    fetchTickets();

    const channel = supabase
      .channel('user-tickets')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'support_tickets',
        filter: `user_id=eq.${user.id}`
      }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchTickets = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTickets(data);
    }
    setLoading(false);
  };

  const handleCreateTicket = async () => {
    if (!user || !subject.trim() || !message.trim()) return;
    
    setSubmitting(true);
    
    const { data: ticketData, error: ticketError } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        subject: subject.trim(),
        status: 'open',
        priority: 'normal'
      })
      .select()
      .single();

    if (ticketError) {
      toast({ title: 'Erro ao criar ticket', variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    const { error: messageError } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticketData.id,
        sender_id: user.id,
        content: message.trim(),
        is_admin: false
      });

    if (messageError) {
      toast({ title: 'Erro ao enviar mensagem', variant: 'destructive' });
    } else {
      toast({ title: 'Ticket criado com sucesso!' });
      setSubject('');
      setMessage('');
      setNewTicketOpen(false);
      fetchTickets();
    }
    
    setSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      open: { variant: 'default', icon: <AlertCircle className="w-3 h-3 mr-1" /> },
      in_progress: { variant: 'secondary', icon: <Clock className="w-3 h-3 mr-1" /> },
      resolved: { variant: 'outline', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
      closed: { variant: 'outline', icon: <CheckCircle className="w-3 h-3 mr-1" /> }
    };
    const config = variants[status] || variants.open;
    const labels: Record<string, string> = {
      open: 'Aberto',
      in_progress: 'Em Progresso',
      resolved: 'Resolvido',
      closed: 'Fechado'
    };
    return (
      <Badge variant={config.variant} className="flex items-center">
        {config.icon}
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Suporte
        </CardTitle>
        <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Ticket de Suporte</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Assunto</label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Descreva brevemente seu problema"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mensagem</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Descreva seu problema em detalhes..."
                  rows={5}
                />
              </div>
              <Button
                onClick={handleCreateTicket}
                disabled={submitting || !subject.trim() || !message.trim()}
                className="w-full"
              >
                {submitting ? 'Enviando...' : 'Criar Ticket'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {tickets.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Nenhum ticket de suporte. Clique em "Novo Ticket" se precisar de ajuda.
          </p>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{ticket.subject}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(ticket.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {selectedTicket && (
        <SupportTicketChat
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </Card>
  );
}

interface SupportTicketChatProps {
  ticket: SupportTicket;
  onClose: () => void;
}

interface SupportMessage {
  id: string;
  content: string;
  is_admin: boolean;
  sender_id: string;
  created_at: string;
}

function SupportTicketChat({ ticket, onClose }: SupportTicketChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`ticket-${ticket.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'support_messages',
        filter: `ticket_id=eq.${ticket.id}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as SupportMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticket.id]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticket.id)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  const handleSend = async () => {
    if (!user || !newMessage.trim()) return;
    
    setSending(true);
    
    const { error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: ticket.id,
        sender_id: user.id,
        content: newMessage.trim(),
        is_admin: false
      });

    if (!error) {
      setNewMessage('');
    }
    
    setSending(false);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{ticket.subject}</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[300px] border rounded-lg p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.is_admin
                      ? 'bg-primary text-primary-foreground'
                      : msg.sender_id === user?.id
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.is_admin && (
                    <p className="text-xs font-medium mb-1">Suporte</p>
                  )}
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {formatDistanceToNow(new Date(msg.created_at), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          />
          <Button onClick={handleSend} disabled={sending || !newMessage.trim()}>
            Enviar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
