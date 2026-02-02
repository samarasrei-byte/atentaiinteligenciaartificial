-- Create dedicated table for Fiscal Analysis chat messages
CREATE TABLE public.fiscal_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL REFERENCES public.fiscal_analysis_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_fiscal_chat_messages_request_id ON public.fiscal_chat_messages(request_id);
CREATE INDEX idx_fiscal_chat_messages_sender_id ON public.fiscal_chat_messages(sender_id);
CREATE INDEX idx_fiscal_chat_messages_created_at ON public.fiscal_chat_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.fiscal_chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages where they are sender or receiver
CREATE POLICY "Users can view their own fiscal chat messages"
ON public.fiscal_chat_messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send messages in their own fiscal requests
CREATE POLICY "Users can send fiscal chat messages"
ON public.fiscal_chat_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND (
    -- User owns the fiscal request
    EXISTS (
      SELECT 1 FROM public.fiscal_analysis_requests far
      WHERE far.id = request_id AND far.user_id = auth.uid()
    )
    -- Or user is a contador/admin
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() AND ur.role IN ('contador', 'admin')
    )
  )
);

-- Users can update their own messages (mark as read)
CREATE POLICY "Users can update read status on fiscal chat"
ON public.fiscal_chat_messages
FOR UPDATE
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);

-- Enable Realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.fiscal_chat_messages;

-- Add comment for documentation
COMMENT ON TABLE public.fiscal_chat_messages IS 'Chat messages for fiscal analysis service with dedicated realtime support';