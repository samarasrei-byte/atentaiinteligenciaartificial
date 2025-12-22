-- Enable realtime for consultations table
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;

-- Enable realtime for profiles table
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable realtime for subscriptions table
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;