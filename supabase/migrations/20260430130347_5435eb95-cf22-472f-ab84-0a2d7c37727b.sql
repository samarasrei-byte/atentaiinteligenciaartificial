-- Add AI Agent columns to credit_repair_requests
ALTER TABLE public.credit_repair_requests 
ADD COLUMN IF NOT EXISTS ai_agent_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ai_agent_status TEXT DEFAULT 'idle';

-- Create table for AI Agent logs/activities
CREATE TABLE IF NOT EXISTS public.credit_repair_ai_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES public.credit_repair_requests(id) ON DELETE CASCADE,
    channel TEXT NOT NULL, -- 'email', 'whatsapp', 'system', 'internal'
    direction TEXT NOT NULL, -- 'outbound', 'inbound', 'internal'
    message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_repair_ai_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view logs for their own requests" 
ON public.credit_repair_ai_logs 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.credit_repair_requests r 
        WHERE r.id = credit_repair_ai_logs.request_id 
        AND r.user_id = auth.uid()
    )
);

CREATE POLICY "Partners can view logs for assigned requests" 
ON public.credit_repair_ai_logs 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.credit_repair_requests r 
        WHERE r.id = credit_repair_ai_logs.request_id 
        AND (r.partner_id = auth.uid() OR r.contador_id = auth.uid())
    )
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_credit_repair_ai_logs_request_id ON public.credit_repair_ai_logs(request_id);