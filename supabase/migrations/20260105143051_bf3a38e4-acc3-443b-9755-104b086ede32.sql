-- Create partner invitations table
CREATE TABLE public.partner_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES public.credit_repair_partners(id) ON DELETE CASCADE NOT NULL,
    invitation_token UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
    email TEXT,
    invited_by UUID NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    accepted_by UUID,
    accepted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days') NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.partner_invitations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can manage invitations"
ON public.partner_invitations
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can read valid invitations by token"
ON public.partner_invitations
FOR SELECT
TO authenticated
USING (
    status = 'pending' 
    AND expires_at > now()
);

-- Allow anonymous users to read invitations (for registration page)
CREATE POLICY "Anon can read pending invitations"
ON public.partner_invitations
FOR SELECT
TO anon
USING (
    status = 'pending' 
    AND expires_at > now()
);

-- Create index for token lookup
CREATE INDEX idx_partner_invitations_token ON public.partner_invitations(invitation_token);
CREATE INDEX idx_partner_invitations_partner ON public.partner_invitations(partner_id);

-- Add trigger for updated_at
CREATE TRIGGER update_partner_invitations_updated_at
    BEFORE UPDATE ON public.partner_invitations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.partner_invitations;