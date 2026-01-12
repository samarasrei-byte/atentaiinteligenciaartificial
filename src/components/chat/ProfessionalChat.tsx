import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { filterChatMessage } from '@/lib/chatMessageFilter';
import { 
  Send, 
  Loader2,
  Paperclip,
  Mic,
  MicOff,
  Image as ImageIcon,
  FileText,
  X,
  Check,
  CheckCheck,
  Phone,
  Video,
  MoreVertical,
  Search,
  Users,
  MessageSquare,
  ArrowLeft,
  Star,
  Calendar,
  Clock,
  FileIcon,
  Download,
  Play,
  Pause,
  Volume2,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatMessage {
  id: string;
  consultation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
}

interface Consultation {
  id: string;
  user_id: string;
  contador_id: string;
  status: string;
  scheduled_at: string | null;
  price_cents: number;
  notes: string | null;
  created_at: string;
  rating: number | null;
  other_name?: string;
}

interface ProfessionalChatProps {
  isContador?: boolean;
}

export function ProfessionalChat({ isContador = false }: ProfessionalChatProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) fetchConsultations();
  }, [user, isContador]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (!selectedConsultation || !user) return;

    const channel = supabase
      .channel(`chat-${selectedConsultation.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `consultation_id=eq.${selectedConsultation.id}` },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMsg]);
          if (newMsg.receiver_id === user.id) markAsRead(newMsg.id);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedConsultation, user]);

  const fetchConsultations = async () => {
    if (!user) return;
    
    try {
      const column = isContador ? 'contador_id' : 'user_id';
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .eq(column, user.id)
        .in('status', ['pending', 'scheduled', 'completed'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const withNames = await Promise.all(
        (data || []).map(async (c) => {
          const otherId = isContador ? c.user_id : c.contador_id;
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', otherId)
            .single();
          return { ...c, other_name: profile?.full_name || 'Usuário' };
        })
      );

      setConsultations(withNames);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (consultationId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('consultation_id', consultationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data);
      data.filter(m => m.receiver_id === user?.id && !m.read_at).forEach(m => markAsRead(m.id));
    }
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('chat_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('id', messageId);
  };

  const selectConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    loadMessages(consultation.id);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 10MB.', variant: 'destructive' });
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], `audio-${Date.now()}.webm`, { type: 'audio/webm' });
        setSelectedFile(file);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      toast({ title: 'Erro ao acessar microfone', description: 'Permita o acesso ao microfone.', variant: 'destructive' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const uploadFile = async (file: File): Promise<{ url: string; type: string; name: string } | null> => {
    if (!user) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('chat-attachments')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return null;
    }

    // Use signed URL for private bucket (valid for 24 hours)
    const { data, error: signedUrlError } = await supabase.storage
      .from('chat-attachments')
      .createSignedUrl(fileName, 3600); // 1 hour expiry for security

    if (signedUrlError || !data?.signedUrl) {
      console.error('Signed URL error:', signedUrlError);
      return null;
    }

    let type = 'file';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('audio/')) type = 'audio';

    return { url: data.signedUrl, type, name: file.name };
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !user || !selectedConsultation || isSending) return;

    // Filter message for blocked content
    if (newMessage.trim()) {
      const filterResult = filterChatMessage(newMessage);
      if (filterResult.isBlocked) {
        toast({ 
          title: 'Mensagem bloqueada', 
          description: filterResult.reason || 'Conteúdo não permitido',
          variant: 'destructive' 
        });
        return;
      }
    }

    setIsSending(true);
    let attachment = null;

    if (selectedFile) {
      attachment = await uploadFile(selectedFile);
      if (!attachment) {
        toast({ title: 'Erro ao enviar arquivo', variant: 'destructive' });
        setIsSending(false);
        return;
      }
    }

    const otherUserId = isContador ? selectedConsultation.user_id : selectedConsultation.contador_id;

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        consultation_id: selectedConsultation.id,
        sender_id: user.id,
        receiver_id: otherUserId,
        content: newMessage.trim() || (attachment ? `📎 ${attachment.name}` : ''),
        attachment_url: attachment?.url,
        attachment_type: attachment?.type,
        attachment_name: attachment?.name,
      });

    if (error) {
      toast({ title: 'Erro ao enviar', variant: 'destructive' });
    } else {
      setNewMessage('');
      clearFile();
    }
    
    setIsSending(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  
  const formatCurrency = (cents: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const getStatusBadge = (status: string) => {
    const config: Record<string, { class: string; label: string }> = {
      pending: { class: 'bg-amber-500/10 text-amber-500', label: 'Pendente' },
      scheduled: { class: 'bg-blue-500/10 text-blue-500', label: 'Agendada' },
      completed: { class: 'bg-emerald-500/10 text-emerald-500', label: 'Concluída' },
    };
    return config[status] || config.pending;
  };

  const renderAttachment = (message: ChatMessage) => {
    if (!message.attachment_url) return null;

    if (message.attachment_type === 'image') {
      return (
        <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" className="block mt-2">
          <img src={message.attachment_url} alt={message.attachment_name || 'Imagem'} className="max-w-[200px] max-h-[200px] rounded-lg object-cover border border-border" />
        </a>
      );
    }

    if (message.attachment_type === 'audio') {
      return (
        <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-background/50">
          <Volume2 className="h-4 w-4 text-primary" />
          <audio controls className="h-8 flex-1">
            <source src={message.attachment_url} type="audio/webm" />
          </audio>
        </div>
      );
    }

    return (
      <a href={message.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mt-2 p-2 rounded bg-background/50 hover:bg-background/80 transition-colors">
        <FileIcon className="h-4 w-4" />
        <span className="text-xs underline">{message.attachment_name}</span>
        <Download className="h-3 w-3" />
      </a>
    );
  };

  const filteredConsultations = consultations.filter(c => 
    c.other_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[650px] flex rounded-xl border border-border overflow-hidden bg-card">
      {/* Conversations List */}
      <div className={`${selectedConsultation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-border`}>
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Conversas</h3>
              <p className="text-xs text-muted-foreground">{consultations.length} {isContador ? 'clientes' : 'contadores'}</p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-muted/50"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {filteredConsultations.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">Nenhuma conversa ainda</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredConsultations.map((consultation) => {
                const status = getStatusBadge(consultation.status);
                return (
                  <button
                    key={consultation.id}
                    onClick={() => selectConsultation(consultation)}
                    className={`w-full p-3 rounded-xl text-left transition-all ${
                      selectedConsultation?.id === consultation.id
                        ? 'bg-primary/10 border-primary/50 border'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={isContador ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500'}>
                          {getInitials(consultation.other_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate text-sm">{consultation.other_name}</p>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(consultation.created_at), { locale: ptBR, addSuffix: false })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${status.class}`}>
                            {status.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground truncate">{consultation.notes || 'Consulta'}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={`${selectedConsultation ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
        {selectedConsultation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border bg-muted/30">
              <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedConsultation(null)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarFallback className={isContador ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-500'}>
                  {getInitials(selectedConsultation.other_name || 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{selectedConsultation.other_name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{isContador ? 'Cliente' : 'Contador'}</span>
                  <Badge variant="outline" className={`text-[10px] ${getStatusBadge(selectedConsultation.status).class}`}>
                    {getStatusBadge(selectedConsultation.status).label}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollRef} className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground text-sm">Nenhuma mensagem ainda. Comece a conversa!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isMine = message.sender_id === user?.id;
                    return (
                      <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-end gap-2 max-w-[75%] ${isMine ? 'flex-row-reverse' : ''}`}>
                          {!isMine && (
                            <Avatar className="h-7 w-7">
                              <AvatarFallback className="bg-muted text-xs">
                                {getInitials(selectedConsultation.other_name || 'U')}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`rounded-2xl px-4 py-2 ${
                            isMine
                              ? 'bg-gradient-to-br from-primary to-primary/80 text-white rounded-br-sm'
                              : 'bg-muted text-foreground rounded-bl-sm'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {renderAttachment(message)}
                            <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                              <span className={`text-[10px] ${isMine ? 'text-white/70' : 'text-muted-foreground'}`}>
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: ptBR })}
                              </span>
                              {isMine && (message.read_at ? <CheckCheck className="h-3 w-3 text-white/70" /> : <Check className="h-3 w-3 text-white/70" />)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* File Preview */}
            {selectedFile && (
              <div className="px-4 py-2 border-t border-border bg-muted/30">
                <div className="flex items-center gap-3 p-2 bg-background rounded-lg">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-12 w-12 rounded object-cover" />
                  ) : selectedFile.type.startsWith('audio/') ? (
                    <div className="h-12 w-12 rounded bg-primary/10 flex items-center justify-center">
                      <Volume2 className="h-6 w-6 text-primary" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearFile}><X className="h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {/* Recording Indicator */}
            {isRecording && (
              <div className="px-4 py-3 border-t border-border bg-red-500/10">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-red-500 font-medium">Gravando {formatTime(recordingTime)}</span>
                  <Button size="sm" variant="destructive" onClick={stopRecording}>
                    <MicOff className="h-4 w-4 mr-1" /> Parar
                  </Button>
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-border bg-muted/30">
              <div className="flex gap-2 items-end">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={isSending} className="shrink-0">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={isRecording ? stopRecording : startRecording} disabled={isSending} className={`shrink-0 ${isRecording ? 'text-red-500' : ''}`}>
                    {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                  </Button>
                </div>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1"
                  disabled={isSending || isRecording}
                />
                <Button type="submit" disabled={(!newMessage.trim() && !selectedFile) || isSending} className="bg-gradient-to-r from-primary to-emerald-600 shrink-0">
                  {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 w-fit mx-auto mb-4">
                <MessageSquare className="h-12 w-12 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Chat Profissional</h3>
              <p className="text-muted-foreground max-w-sm">
                Selecione uma conversa para começar. Você pode enviar mensagens, arquivos e áudios.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
