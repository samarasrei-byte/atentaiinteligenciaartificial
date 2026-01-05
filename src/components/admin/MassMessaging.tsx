import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Send, 
  Users, 
  MessageSquare, 
  AlertTriangle,
  Info,
  Sparkles,
  Settings,
  Clock,
  CheckCircle,
  RefreshCw
} from 'lucide-react';

interface MassMessage {
  id: string;
  title: string;
  content: string;
  message_type: string;
  target_audience: string;
  recipient_count: number;
  sent_at: string;
}

const audienceLabels: Record<string, { label: string; description: string }> = {
  all: { label: 'Todos os Usuários', description: 'Enviar para toda a base de usuários' },
  active_subscribers: { label: 'Assinantes Ativos', description: 'Apenas usuários com assinatura ativa' },
  inactive_users: { label: 'Usuários Inativos', description: 'Usuários que não acessam há mais de 14 dias' },
  churned_users: { label: 'Usuários Cancelados', description: 'Usuários que cancelaram a assinatura' },
  new_users: { label: 'Novos Usuários', description: 'Cadastrados nos últimos 7 dias' }
};

const messageTypeIcons: Record<string, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-info" />,
  warning: <AlertTriangle className="h-4 w-4 text-warning" />,
  promo: <Sparkles className="h-4 w-4 text-primary" />,
  system: <Settings className="h-4 w-4 text-muted-foreground" />
};

export const MassMessaging: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<MassMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [audienceCount, setAudienceCount] = useState<number>(0);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    message_type: 'info',
    target_audience: 'all'
  });

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('mass_messages')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAudienceCount = async (audience: string) => {
    try {
      let query = supabase.from('profiles').select('user_id', { count: 'exact', head: true });
      
      const now = new Date();
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - 7);
      const inactiveThreshold = new Date();
      inactiveThreshold.setDate(inactiveThreshold.getDate() - 14);
      
      if (audience === 'new_users') {
        query = query.gte('created_at', startOfWeek.toISOString());
      } else if (audience === 'inactive_users') {
        query = query.lt('updated_at', inactiveThreshold.toISOString());
      }
      
      // For active_subscribers and churned_users, we need to check subscriptions
      if (audience === 'active_subscribers') {
        const { count } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
        setAudienceCount(count || 0);
        return;
      }
      
      if (audience === 'churned_users') {
        const { count } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'cancelled');
        setAudienceCount(count || 0);
        return;
      }
      
      const { count } = await query;
      setAudienceCount(count || 0);
    } catch (error) {
      console.error('Error fetching audience count:', error);
      setAudienceCount(0);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchAudienceCount('all');
  }, []);

  useEffect(() => {
    fetchAudienceCount(formData.target_audience);
  }, [formData.target_audience]);

  const handleSendMessage = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        variant: 'destructive',
        title: 'Campos obrigatórios',
        description: 'Preencha o título e o conteúdo da mensagem.'
      });
      return;
    }

    if (!user) return;

    setIsSending(true);
    try {
      // Get target users based on audience
      let targetUsers: string[] = [];
      
      if (formData.target_audience === 'all') {
        const { data } = await supabase.from('profiles').select('user_id');
        targetUsers = data?.map(p => p.user_id) || [];
      } else if (formData.target_audience === 'active_subscribers') {
        const { data } = await supabase.from('subscriptions').select('user_id').eq('status', 'active');
        targetUsers = data?.map(s => s.user_id) || [];
      } else if (formData.target_audience === 'churned_users') {
        const { data } = await supabase.from('subscriptions').select('user_id').eq('status', 'cancelled');
        targetUsers = data?.map(s => s.user_id) || [];
      } else if (formData.target_audience === 'new_users') {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);
        const { data } = await supabase.from('profiles').select('user_id').gte('created_at', startOfWeek.toISOString());
        targetUsers = data?.map(p => p.user_id) || [];
      } else if (formData.target_audience === 'inactive_users') {
        const inactiveThreshold = new Date();
        inactiveThreshold.setDate(inactiveThreshold.getDate() - 14);
        const { data } = await supabase.from('profiles').select('user_id').lt('updated_at', inactiveThreshold.toISOString());
        targetUsers = data?.map(p => p.user_id) || [];
      }

      // Create the mass message
      const { data: messageData, error: messageError } = await supabase
        .from('mass_messages')
        .insert({
          title: formData.title,
          content: formData.content,
          message_type: formData.message_type,
          target_audience: formData.target_audience,
          sent_by: user.id,
          recipient_count: targetUsers.length
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Create broadcast messages for each user
      if (targetUsers.length > 0 && messageData) {
        const broadcastMessages = targetUsers.map(userId => ({
          message_id: messageData.id,
          user_id: userId
        }));

        // Insert in batches of 100
        for (let i = 0; i < broadcastMessages.length; i += 100) {
          const batch = broadcastMessages.slice(i, i + 100);
          await supabase.from('user_broadcast_messages').insert(batch);
        }
      }

      toast({
        title: 'Mensagem enviada!',
        description: `Enviada para ${targetUsers.length} usuários.`
      });

      // Reset form
      setFormData({
        title: '',
        content: '',
        message_type: 'info',
        target_audience: 'all'
      });

      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar',
        description: 'Não foi possível enviar a mensagem.'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            Mensagens em Massa
          </h2>
          <p className="text-muted-foreground">Envie comunicações para grupos de usuários</p>
        </div>
        <Button variant="outline" onClick={fetchMessages} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Compose Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Nova Mensagem
            </CardTitle>
            <CardDescription>Componha e envie uma mensagem para seus usuários</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Título</label>
              <Input
                placeholder="Ex: Novidade importante!"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Conteúdo</label>
              <Textarea
                placeholder="Digite o conteúdo da mensagem..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <Select 
                  value={formData.message_type} 
                  onValueChange={(v) => setFormData({ ...formData, message_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-info" />
                        Informativo
                      </div>
                    </SelectItem>
                    <SelectItem value="warning">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        Aviso
                      </div>
                    </SelectItem>
                    <SelectItem value="promo">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Promoção
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Sistema
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Audiência</label>
                <Select 
                  value={formData.target_audience} 
                  onValueChange={(v) => setFormData({ ...formData, target_audience: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(audienceLabels).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Audience Preview */}
            <div className="p-4 bg-muted/30 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">
                    {audienceLabels[formData.target_audience]?.description}
                  </span>
                </div>
                <Badge variant="outline" className="text-lg font-bold">
                  {audienceCount} usuários
                </Badge>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleSendMessage}
              disabled={isSending || !formData.title || !formData.content}
            >
              {isSending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar para {audienceCount} usuários
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Message History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Histórico de Mensagens
            </CardTitle>
            <CardDescription>Últimas mensagens enviadas</CardDescription>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma mensagem enviada ainda</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {messages.map((msg) => (
                  <div key={msg.id} className="p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {messageTypeIcons[msg.message_type]}
                          <h4 className="font-medium">{msg.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{msg.content}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          <Users className="h-3 w-3 mr-1" />
                          {msg.recipient_count}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(msg.sent_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {audienceLabels[msg.target_audience]?.label || msg.target_audience}
                      </Badge>
                      <CheckCircle className="h-3 w-3 text-success" />
                      <span className="text-xs text-success">Enviada</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MassMessaging;
