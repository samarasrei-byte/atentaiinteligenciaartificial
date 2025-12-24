-- Table for company opening requests with status tracking
CREATE TABLE public.company_opening_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  
  -- Personal data
  full_name TEXT NOT NULL,
  cpf TEXT,
  phone TEXT,
  email TEXT,
  
  -- Business data
  profession TEXT,
  annual_revenue_cents BIGINT DEFAULT 0,
  monthly_expenses_cents BIGINT DEFAULT 0,
  has_employees BOOLEAN DEFAULT false,
  wants_partner BOOLEAN DEFAULT false,
  current_situation TEXT,
  city TEXT,
  state TEXT,
  
  -- Recommendation
  recommended_regime TEXT, -- 'mei', 'me-simples', 'me-presumido'
  recommendation_reasons TEXT[],
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending', -- pending, analyzing, documents_pending, in_progress, completed, cancelled
  status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Contador assignment (for ME)
  contador_id UUID,
  contador_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_opening_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Block anonymous access to company_opening_requests"
ON public.company_opening_requests
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own requests"
ON public.company_opening_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
ON public.company_opening_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests"
ON public.company_opening_requests
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Contadores can view assigned requests"
ON public.company_opening_requests
FOR SELECT
USING (auth.uid() = contador_id);

CREATE POLICY "Contadores can update assigned requests"
ON public.company_opening_requests
FOR UPDATE
USING (auth.uid() = contador_id);

CREATE POLICY "Admins can manage all requests"
ON public.company_opening_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Table for company opening notifications
CREATE TABLE public.company_opening_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_id UUID NOT NULL REFERENCES public.company_opening_requests(id) ON DELETE CASCADE,
  
  -- Notification content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- status_change, document_request, contador_message, reminder
  
  -- Read status
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_opening_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Block anonymous access to company_opening_notifications"
ON public.company_opening_notifications
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own notifications"
ON public.company_opening_notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.company_opening_notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.company_opening_notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'contador'));

-- Trigger to update updated_at
CREATE TRIGGER update_company_opening_requests_updated_at
BEFORE UPDATE ON public.company_opening_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notification on status change
CREATE OR REPLACE FUNCTION public.notify_company_opening_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title TEXT;
  v_message TEXT;
BEGIN
  -- Only trigger on status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Set notification content based on new status
    CASE NEW.status
      WHEN 'analyzing' THEN
        v_title := 'Análise Iniciada';
        v_message := 'Um contador está analisando sua solicitação de abertura de empresa.';
      WHEN 'documents_pending' THEN
        v_title := 'Documentos Pendentes';
        v_message := 'Existem documentos pendentes para continuar o processo de abertura.';
      WHEN 'in_progress' THEN
        v_title := 'Abertura em Andamento';
        v_message := 'O processo de abertura da sua empresa está em andamento.';
      WHEN 'completed' THEN
        v_title := 'Empresa Aberta!';
        v_message := 'Parabéns! Sua empresa foi aberta com sucesso.';
      WHEN 'cancelled' THEN
        v_title := 'Solicitação Cancelada';
        v_message := 'Sua solicitação de abertura de empresa foi cancelada.';
      ELSE
        v_title := 'Atualização de Status';
        v_message := 'O status da sua solicitação foi atualizado para: ' || NEW.status;
    END CASE;
    
    -- Insert notification
    INSERT INTO public.company_opening_notifications (
      user_id,
      request_id,
      title,
      message,
      notification_type,
      metadata
    ) VALUES (
      NEW.user_id,
      NEW.id,
      v_title,
      v_message,
      'status_change',
      jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for status change notifications
CREATE TRIGGER notify_on_status_change
AFTER UPDATE ON public.company_opening_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_company_opening_status_change();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.company_opening_notifications;