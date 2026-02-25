import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageSquare, Send } from 'lucide-react';

export default function CapassiChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('specialist_chat_messages')
      .select('*')
      .eq('specialist_channel', 'cesar')
      .order('created_at', { ascending: true })
      .limit(200);
    setMessages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    fetchMessages();

    const channel = supabase
      .channel('capassi-chat')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'specialist_chat_messages',
        filter: 'specialist_channel=eq.cesar',
      }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    await supabase.from('specialist_chat_messages').insert({
      sender_id: user.id,
      sender_type: 'specialist',
      service_type: 'bi-contabilidade',
      specialist_channel: 'cesar',
      content: newMessage.trim(),
    });
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Chat</h2>
        <p className="text-sm text-white/40">Mensagens com clientes — envio e recebimento</p>
      </div>

      <Card className="bg-[#0B0F1A] border-[#372938] flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>
        <CardHeader className="pb-3" style={{ borderBottom: '1px solid #372938' }}>
          <CardTitle className="text-base text-white flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#55FFAA]" />
            Conversas ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="text-white/40 text-center py-8">Carregando mensagens...</p>
          ) : messages.length === 0 ? (
            <p className="text-white/30 text-center py-8">Nenhuma mensagem ainda</p>
          ) : (
            messages.map((msg) => {
              const isMe = msg.sender_type === 'specialist' && msg.sender_id === user?.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                      isMe
                        ? 'bg-[#55FFAA]/10 text-[#55FFAA] rounded-br-sm'
                        : 'bg-white/5 text-white/80 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-[10px] mt-1 opacity-50">
                      {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </CardContent>

        <div className="p-4" style={{ borderTop: '1px solid #372938' }}>
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Digite sua mensagem..."
              className="bg-white/5 border-[#372938] text-white placeholder:text-white/30"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-[#55FFAA] text-black hover:bg-[#55FFAA]/80"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
