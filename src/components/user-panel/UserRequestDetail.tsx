import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft,
  MessageSquare,
  FileText,
  Upload,
  Send,
  Paperclip,
  Download,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  User,
  Shield,
  Scale,
  Brain,
  ShieldCheck,
  Loader2,
  Image as ImageIcon,
  File
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserRequestDetailProps {
  requestId: string;
  requestType: string;
  onBack: () => void;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_admin: boolean;
  attachment_url?: string;
  attachment_name?: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
}

const typeLabels: Record<string, string> = {
  credit_repair: 'Limpa Nome',
  fiscal: 'Análise Fiscal',
  ir: 'Declaração IR',
  certificate: 'Certidão',
  company_opening: 'Abertura de Empresa'
};

export const UserRequestDetail: React.FC<UserRequestDetailProps> = ({ requestId, requestType, onBack }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [request, setRequest] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRequestDetails();
    fetchMessages();
    fetchDocuments();

    // Set up realtime subscription
    const channel = supabase
      .channel(`request-${requestId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'credit_repair_chat_messages',
        filter: `request_id=eq.${requestId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, requestType]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRequestDetails = async () => {
    let data: any = null;
    let error: any = null;

    if (requestType === 'credit_repair') {
      const result = await supabase.from('credit_repair_requests').select('*').eq('id', requestId).maybeSingle();
      data = result.data;
      error = result.error;
    } else if (requestType === 'fiscal') {
      const result = await supabase.from('fiscal_analysis_requests').select('*').eq('id', requestId).maybeSingle();
      data = result.data;
      error = result.error;
    } else if (requestType === 'ir') {
      const result = await supabase.from('ir_requests').select('*').eq('id', requestId).maybeSingle();
      data = result.data;
      error = result.error;
    } else if (requestType === 'certificate') {
      const result = await supabase.from('certificate_requests').select('*').eq('id', requestId).maybeSingle();
      data = result.data;
      error = result.error;
    } else if (requestType === 'company_opening') {
      const result = await supabase.from('company_opening_requests').select('*').eq('id', requestId).maybeSingle();
      data = result.data;
      error = result.error;
    }

    if (!error && data) {
      setRequest(data);
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    if (requestType !== 'credit_repair' && requestType !== 'fiscal') return;

    const { data } = await supabase
      .from('credit_repair_chat_messages')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data.map(m => ({
        id: m.id,
        content: m.content,
        sender_id: m.sender_id,
        created_at: m.created_at,
        is_admin: m.sender_id !== user?.id,
        attachment_url: m.attachment_url,
        attachment_name: m.attachment_name
      })));
    }
  };

  const fetchDocuments = async () => {
    if (requestType !== 'company_opening') return;

    const { data } = await supabase
      .from('company_opening_documents')
      .select('*')
      .eq('request_id', requestId)
      .order('created_at', { ascending: false });

    if (data) {
      setDocuments(data.map(d => ({
        id: d.id,
        name: d.document_name,
        type: d.document_type,
        url: d.file_path,
        created_at: d.created_at,
        status: d.status as 'pending' | 'approved' | 'rejected'
      })));
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    setSending(true);
    try {
      // Get the partner ID from the request
      const partnerId = request?.partner_id || request?.contador_id;
      
      if (!partnerId) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível enviar a mensagem. Aguarde o atendimento ser iniciado.'
        });
        return;
      }

      const { error } = await supabase
        .from('credit_repair_chat_messages')
        .insert({
          request_id: requestId,
          sender_id: user.id,
          receiver_id: partnerId,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível enviar a mensagem.'
      });
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${requestId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('company-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Insert document record
      const { error: dbError } = await supabase
        .from('company_opening_documents')
        .insert({
          request_id: requestId,
          user_id: user.id,
          document_type: 'user_upload',
          document_name: file.name,
          file_path: filePath,
          file_size_bytes: file.size,
          mime_type: file.type
        });

      if (dbError) throw dbError;

      toast({
        title: 'Documento enviado!',
        description: 'Seu documento foi enviado para análise.'
      });

      fetchDocuments();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível enviar o documento.'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; color: string; icon: React.ElementType }> = {
      pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
      analyzing: { label: 'Em Análise', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle },
      in_progress: { label: 'Em Andamento', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: AlertCircle },
      completed: { label: 'Concluído', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    };
    const cfg = config[status] || config.pending;
    const Icon = cfg.icon;
    return <Badge className={`${cfg.color} border gap-1`}><Icon className="h-3 w-3" />{cfg.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar para lista
        </Button>
        {getStatusBadge(request?.status)}
      </div>

      {/* Request Info Card */}
      <Card className="bg-white border-slate-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-100">
              {requestType === 'credit_repair' ? (
                <Shield className="h-6 w-6 text-indigo-600" />
              ) : (
                <Scale className="h-6 w-6 text-indigo-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-xl">{typeLabels[requestType]}</CardTitle>
              <CardDescription>
                Solicitado em {format(new Date(request?.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl border border-indigo-100">
            <Avatar className="h-12 w-12 border-2 border-indigo-200">
              <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">G</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-slate-900">Guilherme Barros</p>
              <p className="text-sm text-slate-600">Especialista BI+ Contabilidade™</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-white border-indigo-200 text-indigo-700">
                <Brain className="h-3 w-3 mr-1" />
                IA Assistida
              </Badge>
              <Badge variant="outline" className="bg-white border-emerald-200 text-emerald-700">
                <ShieldCheck className="h-3 w-3 mr-1" />
                Validação Humana
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="chat" className="data-[state=active]:bg-white gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-white gap-2">
            <FileText className="h-4 w-4" />
            Documentos
          </TabsTrigger>
          <TabsTrigger value="response" className="data-[state=active]:bg-white gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Resposta
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <Card className="bg-white border-slate-200">
            <CardContent className="p-0">
              {/* Messages Area */}
              <ScrollArea className="h-[400px] p-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageSquare className="h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500">Nenhuma mensagem ainda</p>
                    <p className="text-sm text-slate-400 mt-1">Envie uma mensagem para iniciar a conversa</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`flex ${message.is_admin ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[70%] ${message.is_admin ? 'order-2' : 'order-1'}`}>
                          {message.is_admin && (
                            <div className="flex items-center gap-2 mb-1">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">G</AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-slate-500">Guilherme Barros</span>
                            </div>
                          )}
                          <div className={`p-3 rounded-2xl ${
                            message.is_admin 
                              ? 'bg-slate-100 text-slate-900 rounded-tl-sm' 
                              : 'bg-indigo-600 text-white rounded-tr-sm'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            {message.attachment_url && (
                              <a 
                                href={message.attachment_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 mt-2 text-xs underline"
                              >
                                <Paperclip className="h-3 w-3" />
                                {message.attachment_name || 'Anexo'}
                              </a>
                            )}
                          </div>
                          <p className={`text-xs text-slate-400 mt-1 ${message.is_admin ? '' : 'text-right'}`}>
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Documentos</CardTitle>
                  <CardDescription>Upload e visualização de documentos</CardDescription>
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  />
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="gap-2"
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    Enviar Documento
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Nenhum documento enviado</p>
                  <p className="text-sm text-slate-400 mt-1">Envie documentos para análise</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100">
                          {doc.type.includes('image') ? (
                            <ImageIcon className="h-5 w-5 text-blue-600" />
                          ) : (
                            <File className="h-5 w-5 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{doc.name}</p>
                          <p className="text-xs text-slate-500">
                            {format(new Date(doc.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={
                          doc.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          doc.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }>
                          {doc.status === 'approved' ? 'Aprovado' : 
                           doc.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                        </Badge>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Response Tab */}
        <TabsContent value="response">
          <Card className="bg-white border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Resposta & Relatórios</CardTitle>
              <CardDescription>Resultado final da análise</CardDescription>
            </CardHeader>
            <CardContent>
              {request?.status !== 'completed' ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Aguardando conclusão da análise</p>
                  <p className="text-sm text-slate-400 mt-1">
                    O resultado será exibido aqui quando a análise for concluída
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      <h3 className="font-semibold text-emerald-800">Análise Concluída</h3>
                    </div>
                    <p className="text-emerald-700">
                      {request?.contador_notes || 'Sua solicitação foi processada com sucesso.'}
                    </p>
                  </div>
                  
                  {request?.document_url && (
                    <Button variant="outline" className="gap-2 w-full">
                      <Download className="h-4 w-4" />
                      Baixar Relatório Final
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
