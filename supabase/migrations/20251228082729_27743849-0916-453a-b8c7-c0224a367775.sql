-- Tabela de notificações de serviços e promoções
CREATE TABLE public.service_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT NOT NULL DEFAULT 'info', -- 'new_contador', 'promotion', 'service_update', 'info'
  service_type TEXT, -- 'consultation', 'company_opening', 'certificate'
  metadata JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Block anonymous access to service_notifications"
ON public.service_notifications
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view their own notifications"
ON public.service_notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.service_notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all service notifications"
ON public.service_notifications
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create notifications for users"
ON public.service_notifications
FOR INSERT
WITH CHECK (true);

-- Index for faster queries
CREATE INDEX idx_service_notifications_user_id ON public.service_notifications(user_id);
CREATE INDEX idx_service_notifications_created_at ON public.service_notifications(created_at DESC);
CREATE INDEX idx_service_notifications_unread ON public.service_notifications(user_id, is_read) WHERE is_read = false;

-- Function to create notification when new contador registers
CREATE OR REPLACE FUNCTION public.notify_new_contador()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify when contador becomes available
  IF NEW.available = true AND (OLD.available IS NULL OR OLD.available = false) THEN
    -- Get contador name from profiles
    INSERT INTO public.service_notifications (user_id, title, message, notification_type, service_type, metadata)
    SELECT 
      s.user_id,
      'Novo contador disponível! 🎉',
      'Um novo contador especializado está disponível para consultas. Confira agora!',
      'new_contador',
      'consultation',
      jsonb_build_object('contador_id', NEW.user_id, 'specialty', NEW.specialty)
    FROM public.subscriptions s
    WHERE s.status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger for new contador notification
CREATE TRIGGER on_contador_available
  AFTER INSERT OR UPDATE ON public.contador_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_contador();

-- Enable realtime for service_notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.service_notifications;