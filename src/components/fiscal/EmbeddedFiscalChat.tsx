import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { FiscalChatPanel } from './FiscalChatPanel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Scale, FileSearch, Loader2, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmbeddedFiscalChatProps {
  variant?: 'empresa' | 'autonomo';
}

export const EmbeddedFiscalChat: React.FC<EmbeddedFiscalChatProps> = ({ variant = 'empresa' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch active fiscal request for the user
  const { data: activeRequest, isLoading, error } = useQuery({
    queryKey: ['active-fiscal-request', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('fiscal_analysis_requests')
        .select('id, company_name, cnpj, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            Chat Análise Fiscal
          </h2>
          <p className="text-muted-foreground">Carregando sua solicitação...</p>
        </div>
        <Card className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </Card>
      </div>
    );
  }

  // No active request - show CTA to start analysis
  if (!activeRequest) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            Análise Fiscal Inteligente
          </h2>
          <p className="text-muted-foreground">
            Identifique oportunidades de economia tributária com nossa equipe especializada
          </p>
        </div>
        
        <Card className="border-2 border-dashed border-primary/30 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
            <div className="p-4 rounded-full bg-primary/10 mb-6">
              <FileSearch className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Nenhuma análise em andamento
            </h3>
            <p className="text-muted-foreground max-w-md mb-6">
              Inicie sua análise fiscal gratuita e descubra quanto você pode recuperar em impostos pagos a mais.
              <br />
              <span className="text-sm font-medium text-primary">Pague apenas no êxito: 50% do valor recuperado.</span>
            </p>
            <Button 
              size="lg" 
              onClick={() => navigate('/bi-contabilidade')}
              className="gap-2"
            >
              <FileSearch className="h-5 w-5" />
              Iniciar Análise Gratuita
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
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
          Chat Análise Fiscal
        </h2>
        <p className="text-muted-foreground">
          Converse com nosso especialista sobre sua análise fiscal
        </p>
      </div>
      
      <FiscalChatPanel requestId={activeRequest.id} />
    </div>
  );
};

export default EmbeddedFiscalChat;
