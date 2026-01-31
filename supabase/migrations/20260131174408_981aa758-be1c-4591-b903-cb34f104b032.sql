-- Create table to track welcome messages sent to users
CREATE TABLE public.user_welcome_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chat_type TEXT NOT NULL CHECK (chat_type IN ('guilherme', 'cesar')),
  service_context TEXT,
  message_date DATE NOT NULL DEFAULT CURRENT_DATE,
  message_content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, chat_type, message_date)
);

-- Enable RLS
ALTER TABLE public.user_welcome_chats ENABLE ROW LEVEL SECURITY;

-- Users can view their own welcome chats
CREATE POLICY "Users can view their own welcome chats" 
ON public.user_welcome_chats 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can update their own welcome chats (mark as read)
CREATE POLICY "Users can update their own welcome chats" 
ON public.user_welcome_chats 
FOR UPDATE 
USING (auth.uid() = user_id);

-- System can insert welcome chats
CREATE POLICY "Allow authenticated insert" 
ON public.user_welcome_chats 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_user_welcome_chats_user_id ON public.user_welcome_chats(user_id);
CREATE INDEX idx_user_welcome_chats_unread ON public.user_welcome_chats(user_id, is_read) WHERE is_read = false;

-- Create trigger for updated_at
CREATE TRIGGER update_user_welcome_chats_updated_at
BEFORE UPDATE ON public.user_welcome_chats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for instant notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_welcome_chats;