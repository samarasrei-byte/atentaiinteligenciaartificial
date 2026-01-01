-- Create table for credit repair chat messages
CREATE TABLE public.credit_repair_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.credit_repair_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_type TEXT,
  attachment_name TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_repair_chat_messages ENABLE ROW LEVEL SECURITY;

-- Block anonymous access
CREATE POLICY "Block anonymous access to credit_repair_chat_messages"
ON public.credit_repair_chat_messages
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Users can send messages
CREATE POLICY "Users can send credit repair messages"
ON public.credit_repair_chat_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Users can view their messages
CREATE POLICY "Users can view their credit repair messages"
ON public.credit_repair_chat_messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can mark messages as read
CREATE POLICY "Users can mark credit repair messages as read"
ON public.credit_repair_chat_messages
FOR UPDATE
USING (auth.uid() = receiver_id);

-- Admins can manage all messages
CREATE POLICY "Admins can manage all credit repair messages"
ON public.credit_repair_chat_messages
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create indexes
CREATE INDEX idx_credit_repair_chat_request_id ON public.credit_repair_chat_messages(request_id);
CREATE INDEX idx_credit_repair_chat_sender_id ON public.credit_repair_chat_messages(sender_id);
CREATE INDEX idx_credit_repair_chat_receiver_id ON public.credit_repair_chat_messages(receiver_id);
CREATE INDEX idx_credit_repair_chat_created_at ON public.credit_repair_chat_messages(created_at);

-- Enable realtime for the chat table
ALTER PUBLICATION supabase_realtime ADD TABLE public.credit_repair_chat_messages;