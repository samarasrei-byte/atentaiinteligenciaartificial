import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FiscalChatPanel } from './FiscalChatPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, Loader2, MessageSquare, Brain, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmbeddedFiscalChatProps {
  variant?: 'empresa' | 'autonomo';
  serviceType?: 'fiscal' | 'bi'; // fiscal → Guilherme | bi → César
}

// IDs dos especialistas responsáveis (IDs reais do banco de dados)
const GUILHERME_ADMIN_ID = '596de7f7-4352-4058-8855-18f9489a0311'; // Análise Fiscal - Guilherme Barros
const CESAR_ADMIN_ID = '6307fc12-d37c-43f5-ab78-c62cf29dffd9'; // BI Inteligência Fiscal - César

export const EmbeddedFiscalChat: React.FC<EmbeddedFiscalChatProps> = ({ 
  variant = 'empresa',
  serviceType = 'fiscal' 
}) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  // Determina o especialista responsável
  const specialistId = serviceType === 'bi' ? CESAR_ADMIN_ID : GUILHERME_ADMIN_ID;
  const specialistName = serviceType === 'bi' ? 'César' : 'Guilherme';
  const serviceName = serviceType === 'bi' ? 'BI+ Inteligência Fiscal' : 'Análise Fiscal';

  // Fetch active fiscal request for the user
  const { data: activeRequest, isLoading, refetch } = useQuery({
    queryKey: ['active-fiscal-request', user?.id, serviceType],
    queryFn: async () => {
      if (!user?.id) return null;

      // Filter by notes to find correct service type
      // Use [BI] or [FISCAL] prefix markers for accurate filtering
      const searchPrefix = serviceType === 'bi' ? '[BI]' : '[FISCAL]';
      
      const { data, error } = await supabase
        .from('fiscal_analysis_requests')
        .select('id, company_name, cnpj, status, created_at, notes')
        .eq('user_id', user.id)
        .ilike('notes', `${searchPrefix}%`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Auto-create request when user enters chat without active request
  const createAutoRequest = async () => {
    if (!user?.id || activeRequest || isCreating) return;

    setIsCreating(true);

    try {
      // Get user's company data if exists (for empresa variant)
      let companyData = null;
      if (variant === 'empresa') {
        const { data } = await supabase
          .from('companies')
          .select('company_name, cnpj, tax_regime, annual_revenue_cents')
          .eq('user_id', user.id)
          .maybeSingle();
        companyData = data;
      }

      // Get autonomo profile if exists
      let autonomoData = null;
      if (variant === 'autonomo') {
        const { data } = await supabase
          .from('autonomo_profiles')
          .select('profession, current_regime, monthly_revenue_average_cents, state')
          .eq('user_id', user.id)
          .maybeSingle();
        autonomoData = data;
      }

      // Create the fiscal analysis request
      const requestData = {
        user_id: user.id,
        full_name: profile?.full_name || 'Usuário',
        email: user.email || '',
        phone: profile?.phone || null,
        company_name: companyData?.company_name || autonomoData?.profession || `Solicitação ${serviceName}`,
        cnpj: companyData?.cnpj || '',
        tax_regime: companyData?.tax_regime || autonomoData?.current_regime || 'nao_definido',
        annual_revenue_cents: companyData?.annual_revenue_cents || (autonomoData?.monthly_revenue_average_cents ? autonomoData.monthly_revenue_average_cents * 12 : 0),
        status: 'pending',
        payment_status: 'pending',
        notes: `[${serviceType.toUpperCase()}] Solicitação de ${serviceName} criada automaticamente via painel ${variant}. Responsável: ${specialistName}.`,
      };

      const { data: newRequest, error: createError } = await supabase
        .from('fiscal_analysis_requests')
        .insert(requestData)
        .select()
        .single();

      if (createError) throw createError;

      // Send initial notification message to the correct specialist
      const welcomeMessage = serviceType === 'bi' 
        ? `🔔 **Nova Solicitação de BI+ Inteligência Fiscal**\n\nOlá César! Sou ${profile?.full_name || 'um cliente'} e acabei de iniciar uma solicitação de BI+ Inteligência Fiscal através do painel ${variant === 'empresa' ? 'Empresa' : 'Autônomo'}.\n\nAguardo orientações sobre os próximos passos. Obrigado!`
        : `🔔 **Nova Solicitação de Análise Fiscal**\n\nOlá Guilherme! Sou ${profile?.full_name || 'um cliente'} e acabei de iniciar uma solicitação de Análise Fiscal através do painel ${variant === 'empresa' ? 'Empresa' : 'Autônomo'}.\n\nAguardo orientações sobre os próximos passos. Obrigado!`;

      await supabase
        .from('fiscal_chat_messages')
        .insert({
          request_id: newRequest.id,
          sender_id: user.id,
          // Sempre notificar o especialista correto (Guilherme/César)
          receiver_id: specialistId,
          content: welcomeMessage,
        });

      toast({
        title: '🎉 Solicitação Criada!',
        description: `Sua ${serviceName} foi iniciada. ${specialistName} entrará em contato em breve.`,
      });

      // Refresh the query to show the chat
      refetch();
      queryClient.invalidateQueries({ queryKey: ['active-fiscal-request'] });

    } catch (error: any) {
      console.error('Error creating auto request:', error);
      toast({
        title: 'Erro ao iniciar',
        description: 'Não foi possível criar a solicitação. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Auto-create when no active request and user enters the page
  useEffect(() => {
    if (!isLoading && !activeRequest && user?.id && !isCreating) {
      // Small delay to avoid race conditions
      const timer = setTimeout(() => {
        createAutoRequest();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, activeRequest, user?.id]);

  if (isLoading || isCreating) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {serviceType === 'bi' ? (
              <Brain className="h-6 w-6 text-primary" />
            ) : (
              <Scale className="h-6 w-6 text-primary" />
            )}
            Chat {serviceName}
          </h2>
          <p className="text-muted-foreground">
            {isCreating ? 'Iniciando sua análise...' : 'Carregando sua solicitação...'}
          </p>
        </div>
        <Card className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          {isCreating && (
            <div className="text-center">
              <p className="text-foreground font-medium">Preparando seu atendimento</p>
              <p className="text-sm text-muted-foreground">{specialistName} será notificado automaticamente</p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Has active request - show chat
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          Chat {serviceName}
          <Sparkles className="h-4 w-4 text-amber-500" />
        </h2>
        <p className="text-muted-foreground">
          Converse com {specialistName} sobre sua {serviceName.toLowerCase()}
        </p>
      </div>
      
      {activeRequest ? (
        <FiscalChatPanel requestId={activeRequest.id} serviceType={serviceType} />
      ) : (
        <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
            <div className="p-4 rounded-full bg-primary/10 mb-6">
              {serviceType === 'bi' ? (
                <Brain className="h-12 w-12 text-primary" />
              ) : (
                <Scale className="h-12 w-12 text-primary" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Iniciando atendimento...
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Estamos preparando sua {serviceName.toLowerCase()}. Por favor, aguarde um momento.
            </p>
            <Button 
              size="lg" 
              onClick={createAutoRequest}
              disabled={isCreating}
              className="gap-2"
            >
              {isCreating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <MessageSquare className="h-5 w-5" />
              )}
              Iniciar Atendimento com {specialistName}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmbeddedFiscalChat;
