-- Create mass_messages table for broadcast communications
CREATE TABLE public.mass_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'info' CHECK (message_type IN ('info', 'warning', 'promo', 'system')),
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'active_subscribers', 'inactive_users', 'churned_users', 'new_users')),
  sent_by UUID NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  recipient_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mass_messages ENABLE ROW LEVEL SECURITY;

-- Only admins can manage mass messages
CREATE POLICY "Admins can manage mass messages"
ON public.mass_messages
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create user_broadcast_messages for tracking which users received which messages
CREATE TABLE public.user_broadcast_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.mass_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_broadcast_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view their own broadcast messages"
ON public.user_broadcast_messages
FOR SELECT
USING (auth.uid() = user_id);

-- Users can mark their messages as read
CREATE POLICY "Users can update their own broadcast messages"
ON public.user_broadcast_messages
FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can manage all broadcast messages
CREATE POLICY "Admins can manage all broadcast messages"
ON public.user_broadcast_messages
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.mass_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_broadcast_messages;