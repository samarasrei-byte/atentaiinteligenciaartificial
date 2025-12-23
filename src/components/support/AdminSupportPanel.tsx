import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Clock, CheckCircle, AlertCircle, User, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface SupportMessage {
  id: string;
  content: string;
  is_admin: boolean;
  sender_id: string;
  created_at: string;
}

interface UserProfile {
  full_name: string | null;
  email: string | null;
}

export function AdminSupportPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchTickets();

    const channel = supabase
      .channel('admin-support-tickets')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'support_tickets'
      }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
      
      const channel = supabase
        .channel(`admin-ticket-${selectedTicket.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=eq.${selectedTicket.id}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as SupportMessage]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTickets(data);
      
      // Fetch user profiles for all unique user_ids
      const userIds = [...new Set(data.map(t => t.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      if (profiles) {
        const profileMap: Record<string, UserProfile> = {};
        profiles.forEach(p => {
          profileMap[p.user_id] = { full_name: p.full_name, email: p.email };
        });
        setUserProfiles(profileMap);
      }
    }
  };

  const fetchMessages = async (ticketId: string) => {
    const { data } = await supabase
      .from('support_messages')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  const handleSendMessage = async () => {
    if (!user || !selectedTicket || !newMessage.trim()) return;
    
    setSending(true);
    
    const { error } = await supabase
      .from('support_messages')
      .insert({
        ticket_id: selectedTicket.id,
        sender_id: user.id,
        content: newMessage.trim(),
        is_admin: true
      });

    if (!error) {
      setNewMessage('');
      
      // Update ticket status to in_progress if it was open
      if (selectedTicket.status === 'open') {
        await supabase
          .from('support_tickets')
          .update({ status: 'in_progress' })
          .eq('id', selectedTicket.id);
        
        setSelectedTicket(prev => prev ? { ...prev, status: 'in_progress' } : null);
      }
    }
    
    setSending(false);
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    
    const { error } = await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', selectedTicket.id);

    if (!error) {
      setSelectedTicket(prev => prev ? { ...prev, status } : null);
      toast({ title: 'Status atualizado!' });
      fetchTickets();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; color: string }> = {
      open: { variant: 'destructive', icon: <AlertCircle className="w-3 h-3 mr-1" />, color: 'bg-red-500' },
      in_progress: { variant: 'secondary', icon: <Clock className="w-3 h-3 mr-1" />, color: 'bg-yellow-500' },
      resolved: { variant: 'default', icon: <CheckCircle className="w-3 h-3 mr-1" />, color: 'bg-green-500' },
      closed: { variant: 'outline', icon: <CheckCircle className="w-3 h-3 mr-1" />, color: 'bg-gray-500' }
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

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      normal: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    const labels: Record<string, string> = {
      low: 'Baixa',
      normal: 'Normal',
      high: 'Alta',
      urgent: 'Urgente'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority] || colors.normal}`}>
        {labels[priority] || priority}
      </span>
    );
  };

  const filteredTickets = tickets.filter(t => 
    statusFilter === 'all' || t.status === statusFilter
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Tickets List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Tickets de Suporte
          </CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="open">Abertos</SelectItem>
              <SelectItem value="in_progress">Em Progresso</SelectItem>
              <SelectItem value="resolved">Resolvidos</SelectItem>
              <SelectItem value="closed">Fechados</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {filteredTickets.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Nenhum ticket encontrado
                </p>
              ) : (
                filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedTicket?.id === ticket.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium truncate flex-1">{ticket.subject}</h4>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-3 h-3" />
                      <span className="truncate">
                        {userProfiles[ticket.user_id]?.full_name || 'Usuário'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      {getPriorityBadge(ticket.priority)}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(ticket.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Panel */}
      <Card className="lg:col-span-2">
        {selectedTicket ? (
          <>
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedTicket.subject}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {userProfiles[selectedTicket.user_id]?.full_name || 'Usuário'} • {userProfiles[selectedTicket.user_id]?.email}
                  </p>
                </div>
                <Select value={selectedTicket.status} onValueChange={handleUpdateStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.is_admin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          msg.is_admin
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-xs font-medium mb-1">
                          {msg.is_admin ? 'Suporte' : userProfiles[selectedTicket.user_id]?.full_name || 'Usuário'}
                        </p>
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
              
              <div className="flex gap-2 p-4 border-t">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua resposta..."
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-[500px]">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Selecione um ticket para visualizar</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
