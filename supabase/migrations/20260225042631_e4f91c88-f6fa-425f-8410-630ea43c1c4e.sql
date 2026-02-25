
-- Create chat messages table for Capassi multi-tenant panel
CREATE TABLE public.capassi_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.capassi_organizations(id),
  company_id UUID NOT NULL REFERENCES public.capassi_companies(id),
  client_id UUID NOT NULL REFERENCES public.capassi_clients(id),
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL DEFAULT 'admin' CHECK (sender_type IN ('admin', 'client', 'system')),
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name TEXT,
  attachment_type TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.capassi_chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies: org members can read/write
CREATE POLICY "Org members can view chat messages"
  ON public.capassi_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.capassi_memberships
      WHERE capassi_memberships.organization_id = capassi_chat_messages.organization_id
        AND capassi_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can insert chat messages"
  ON public.capassi_chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.capassi_memberships
      WHERE capassi_memberships.organization_id = capassi_chat_messages.organization_id
        AND capassi_memberships.user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can update chat messages"
  ON public.capassi_chat_messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.capassi_memberships
      WHERE capassi_memberships.organization_id = capassi_chat_messages.organization_id
        AND capassi_memberships.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_capassi_chat_client ON public.capassi_chat_messages(client_id, created_at);
CREATE INDEX idx_capassi_chat_org ON public.capassi_chat_messages(organization_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.capassi_chat_messages;
