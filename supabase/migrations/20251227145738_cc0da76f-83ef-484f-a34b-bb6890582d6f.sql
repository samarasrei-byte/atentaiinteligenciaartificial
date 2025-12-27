-- Create table for certificate requests
CREATE TABLE public.certificate_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contador_id UUID,
  certificate_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 10000,
  document_url TEXT,
  document_name TEXT,
  notes TEXT,
  rejection_reason TEXT,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificate_requests ENABLE ROW LEVEL SECURITY;

-- Block anonymous access
CREATE POLICY "Block anonymous access to certificate_requests"
  ON public.certificate_requests
  AS RESTRICTIVE
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Users can view their own requests
CREATE POLICY "Users can view their own certificate requests"
  ON public.certificate_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own requests
CREATE POLICY "Users can create certificate requests"
  ON public.certificate_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending requests
CREATE POLICY "Users can update their pending requests"
  ON public.certificate_requests
  FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Contadores can view assigned requests
CREATE POLICY "Contadores can view assigned certificate requests"
  ON public.certificate_requests
  FOR SELECT
  USING (auth.uid() = contador_id);

-- Contadores can update assigned requests
CREATE POLICY "Contadores can update assigned certificate requests"
  ON public.certificate_requests
  FOR UPDATE
  USING (auth.uid() = contador_id);

-- Admins can manage all requests
CREATE POLICY "Admins can manage all certificate requests"
  ON public.certificate_requests
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_certificate_requests_updated_at
  BEFORE UPDATE ON public.certificate_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for certificate documents
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', false);

-- Storage policies for certificates bucket
CREATE POLICY "Users can view their certificate documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Contadores can upload certificate documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'certificates' AND has_role(auth.uid(), 'contador'::app_role));

CREATE POLICY "Contadores can view all certificate documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'certificates' AND has_role(auth.uid(), 'contador'::app_role));

CREATE POLICY "Admins can manage certificate documents"
  ON storage.objects FOR ALL
  USING (bucket_id = 'certificates' AND has_role(auth.uid(), 'admin'::app_role));