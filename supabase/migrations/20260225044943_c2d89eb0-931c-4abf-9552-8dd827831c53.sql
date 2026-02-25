
-- Add attachment columns to capassi_chat_messages
ALTER TABLE public.capassi_chat_messages
  ADD COLUMN IF NOT EXISTS attachment_url TEXT,
  ADD COLUMN IF NOT EXISTS attachment_name TEXT,
  ADD COLUMN IF NOT EXISTS attachment_type TEXT;
