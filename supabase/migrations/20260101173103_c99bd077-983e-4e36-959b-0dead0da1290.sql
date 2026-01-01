-- Fix insecure INSERT policy on service_notifications
-- Drop the overly permissive policy that allows any authenticated user to insert notifications for any user
DROP POLICY IF EXISTS "System can create notifications for users" ON public.service_notifications;

-- Create a secure policy that only allows admins to create notifications
-- System-level notifications should be created via Edge Functions using service role key
CREATE POLICY "Only admins can create notifications" 
ON public.service_notifications 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));