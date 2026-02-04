-- Adicionar campos para coleta de dados pós-pagamento
ALTER TABLE public.credit_repair_requests
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS data_submitted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS document_extracted_text TEXT,
ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMP WITH TIME ZONE;

-- Criar tabela de histórico de ações para Limpa Nome
CREATE TABLE IF NOT EXISTS public.credit_repair_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.credit_repair_requests(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  action_description TEXT NOT NULL,
  performed_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de histórico
ALTER TABLE public.credit_repair_history ENABLE ROW LEVEL SECURITY;

-- Política para admins visualizarem todo o histórico
CREATE POLICY "Admins can view all credit repair history"
ON public.credit_repair_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Política para usuários verem histórico de suas próprias solicitações
CREATE POLICY "Users can view their own request history"
ON public.credit_repair_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.credit_repair_requests 
    WHERE id = credit_repair_history.request_id 
    AND user_id = auth.uid()
  )
);

-- Política para admins inserirem histórico
CREATE POLICY "Admins can insert credit repair history"
ON public.credit_repair_history
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Função para registrar histórico automaticamente
CREATE OR REPLACE FUNCTION public.log_credit_repair_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar mudança de status
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.credit_repair_history (request_id, action_type, action_description, performed_by, metadata)
    VALUES (
      NEW.id,
      'status_change',
      'Status alterado de ' || COALESCE(OLD.status, 'null') || ' para ' || NEW.status,
      auth.uid(),
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;

  -- Registrar envio de dados
  IF OLD.data_submitted_at IS NULL AND NEW.data_submitted_at IS NOT NULL THEN
    INSERT INTO public.credit_repair_history (request_id, action_type, action_description, performed_by, metadata)
    VALUES (
      NEW.id,
      'data_submitted',
      'Dados do cliente enviados',
      auth.uid(),
      jsonb_build_object('submitted_at', NEW.data_submitted_at)
    );
  END IF;

  -- Registrar confirmação de pagamento
  IF OLD.payment_status IS DISTINCT FROM NEW.payment_status AND NEW.payment_status = 'paid' THEN
    INSERT INTO public.credit_repair_history (request_id, action_type, action_description, performed_by, metadata)
    VALUES (
      NEW.id,
      'payment_confirmed',
      'Pagamento confirmado',
      auth.uid(),
      jsonb_build_object('confirmed_at', NEW.payment_confirmed_at)
    );
  END IF;

  -- Registrar notas do contador
  IF OLD.contador_notes IS DISTINCT FROM NEW.contador_notes AND NEW.contador_notes IS NOT NULL THEN
    INSERT INTO public.credit_repair_history (request_id, action_type, action_description, performed_by, metadata)
    VALUES (
      NEW.id,
      'notes_updated',
      'Observações atualizadas',
      auth.uid(),
      jsonb_build_object('notes', NEW.contador_notes)
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger para histórico automático
DROP TRIGGER IF EXISTS trigger_credit_repair_history ON public.credit_repair_requests;
CREATE TRIGGER trigger_credit_repair_history
AFTER UPDATE ON public.credit_repair_requests
FOR EACH ROW
EXECUTE FUNCTION public.log_credit_repair_history();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_credit_repair_history_request_id ON public.credit_repair_history(request_id);
CREATE INDEX IF NOT EXISTS idx_credit_repair_history_created_at ON public.credit_repair_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_repair_requests_data_submitted ON public.credit_repair_requests(data_submitted_at);