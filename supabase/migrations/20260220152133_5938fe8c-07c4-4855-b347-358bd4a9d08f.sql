
-- Create table for specialist chat messages (Guilherme and César)
CREATE TABLE public.specialist_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialist_channel TEXT NOT NULL CHECK (specialist_channel IN ('guilherme', 'cesar')),
  service_type TEXT NOT NULL,
  request_id TEXT,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'specialist', 'system')),
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.specialist_chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view own chat messages"
  ON public.specialist_chat_messages
  FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'contador', 'equipe_guilherme')
  ));

-- Users can insert their own messages
CREATE POLICY "Users can send chat messages"
  ON public.specialist_chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- Admin/contador can insert on behalf (for specialist responses)
CREATE POLICY "Admins can insert specialist messages"
  ON public.specialist_chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'contador', 'equipe_guilherme'))
  );

-- Admin/contador can update (mark as read)
CREATE POLICY "Admins can update messages"
  ON public.specialist_chat_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'contador', 'equipe_guilherme'))
  );

-- Create index for performance
CREATE INDEX idx_specialist_chat_sender ON public.specialist_chat_messages (sender_id, created_at DESC);
CREATE INDEX idx_specialist_chat_channel ON public.specialist_chat_messages (specialist_channel, created_at DESC);
CREATE INDEX idx_specialist_chat_request ON public.specialist_chat_messages (request_id, created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.specialist_chat_messages;
