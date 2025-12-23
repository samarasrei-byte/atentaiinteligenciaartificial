-- Add policy to block anonymous access to chat_messages
CREATE POLICY "Block anonymous access to chat_messages"
ON public.chat_messages
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);