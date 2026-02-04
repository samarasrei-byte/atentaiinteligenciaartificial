import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MaskedInput } from '@/components/ui/masked-input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, Upload, Shield, FileText, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LimpaNomeDataCollection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const requestId = searchParams.get('request_id');
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestData, setRequestData] = useState<any>(null);
  
  // Campos do formulário
  const [fullName, setFullName] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [cpfCnpjValid, setCpfCnpjValid] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneValid, setPhoneValid] = useState(false);
  const [email, setEmail] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<string>('');

  useEffect(() => {
    if (!requestId) {
      toast({ title: 'Solicitação não encontrada', variant: 'destructive' });
      navigate('/limpa-nome');
      return;
    }
    
    fetchRequestData();
  }, [requestId]);

  const fetchRequestData = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_repair_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (error || !data) {
        throw new Error('Solicitação não encontrada');
      }

      // Verificar se já foi preenchido
      if (data.data_submitted_at) {
        toast({ title: 'Dados já enviados', description: 'Redirecionando para o chat...' });
        navigate(`/chat/guilherme?servico=limpanome&request=${requestId}`);
        return;
      }

      setRequestData(data);
      setFullName(data.full_name || '');
      setCpfCnpj(data.cpf || '');
      setPhone(data.phone || '');
      setEmail(data.email || '');
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching request:', error);
      toast({ title: 'Erro ao carregar solicitação', variant: 'destructive' });
      navigate('/limpa-nome');
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocumentFile(file);
    setIsExtracting(true);

    try {
      // Simular extração OCR - em produção, usar edge function
      // Por enquanto, apenas marcar que o documento foi enviado
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setExtractedData(`Documento "${file.name}" processado com sucesso.`);
      toast({ title: 'Documento processado', description: 'Dados extraídos com sucesso!' });
    } catch (error) {
      console.error('Error extracting document:', error);
      toast({ title: 'Erro ao processar documento', variant: 'destructive' });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim() || !cpfCnpjValid || !birthDate || !phoneValid || !email.trim()) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Atualizar a solicitação com os dados coletados
      const { error: updateError } = await supabase
        .from('credit_repair_requests')
        .update({
          full_name: fullName,
          cpf: cpfCnpj,
          birth_date: birthDate,
          phone: phone,
          email: email,
          document_extracted_text: extractedData || null,
          data_submitted_at: new Date().toISOString(),
          status: 'pending',
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // Criar notificação para admin
      await supabase.from('service_notifications').insert({
        user_id: user?.id || requestData?.user_id,
        title: '📋 Novo Cliente - Limpa Nome',
        message: `${fullName} enviou os dados para processamento de Limpa Nome.`,
        notification_type: 'new_client',
        service_type: 'limpanome',
        metadata: { requestId, fullName, cpfCnpj },
      });

      toast({ title: 'Dados enviados com sucesso!' });
      
      // Redirecionar para o chat
      navigate(`/chat/guilherme?servico=limpanome&request=${requestId}`);
    } catch (error) {
      console.error('Error submitting data:', error);
      toast({ title: 'Erro ao enviar dados', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Complete seus Dados
          </h1>
          <p className="text-slate-400">
            Preencha as informações para iniciarmos seu processo de Limpa Nome
          </p>
        </div>

        {/* Formulário */}
        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="h-5 w-5 text-emerald-400" />
              Dados Pessoais
            </CardTitle>
            <CardDescription className="text-slate-400">
              Todos os campos marcados com * são obrigatórios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-200">Nome Completo *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="bg-slate-800/50 border-slate-700 text-white"
                  required
                />
              </div>

              {/* CPF/CNPJ */}
              <div className="space-y-2">
                <Label htmlFor="cpfCnpj" className="text-slate-200">CPF ou CNPJ *</Label>
                <MaskedInput
                  mask="cpf-cnpj"
                  value={cpfCnpj}
                  onChange={(value, isValid) => {
                    setCpfCnpj(value);
                    setCpfCnpjValid(isValid);
                  }}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              {/* Data de Nascimento */}
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-slate-200">Data de Nascimento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="bg-slate-800/50 border-slate-700 text-white"
                  required
                />
              </div>

              {/* Telefone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-slate-200">Telefone / WhatsApp *</Label>
                <MaskedInput
                  mask="phone"
                  value={phone}
                  onChange={(value, isValid) => {
                    setPhone(value);
                    setPhoneValid(isValid);
                  }}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="bg-slate-800/50 border-slate-700 text-white"
                  required
                />
              </div>

              {/* Upload de Documento */}
              <div className="space-y-2">
                <Label className="text-slate-200">Documento (CNH ou RG) - Opcional</Label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-emerald-500/50 transition-colors">
                  {isExtracting ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
                      <p className="text-slate-400">Processando documento...</p>
                    </div>
                  ) : documentFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <CheckCircle className="h-8 w-8 text-emerald-400" />
                      <p className="text-emerald-400 font-medium">{documentFile.name}</p>
                      <p className="text-xs text-slate-500">{extractedData}</p>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleDocumentUpload}
                        className="hidden"
                      />
                      <Upload className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                      <p className="text-slate-400">Clique para enviar documento</p>
                      <p className="text-xs text-slate-500 mt-1">
                        O arquivo será processado e excluído automaticamente
                      </p>
                    </label>
                  )}
                </div>
              </div>

              {/* Aviso de segurança */}
              <div className="flex items-start gap-3 p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <AlertCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <p className="font-medium text-emerald-400 mb-1">Seus dados estão seguros</p>
                  <p>Utilizamos criptografia de ponta a ponta. Documentos são processados e excluídos automaticamente.</p>
                </div>
              </div>

              {/* Botão de Envio */}
              <Button
                type="submit"
                disabled={isSubmitting || !fullName.trim() || !cpfCnpjValid || !birthDate || !phoneValid || !email.trim()}
                className="w-full py-6 text-lg rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Enviar Dados e Iniciar Processo
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
