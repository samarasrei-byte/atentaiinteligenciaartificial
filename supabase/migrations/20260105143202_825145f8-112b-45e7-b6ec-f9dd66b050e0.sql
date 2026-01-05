-- Add RLS policy for partner users to view credit repair requests
CREATE POLICY "Partner users can view their partner requests"
ON public.credit_repair_requests
FOR SELECT
TO authenticated
USING (
    partner_id IN (
        SELECT pu.partner_id 
        FROM credit_repair_partner_users pu 
        WHERE pu.user_id = auth.uid()
    )
);

-- Add RLS policy for partner users to update credit repair requests
CREATE POLICY "Partner users can update their partner requests"
ON public.credit_repair_requests
FOR UPDATE
TO authenticated
USING (
    partner_id IN (
        SELECT pu.partner_id 
        FROM credit_repair_partner_users pu 
        WHERE pu.user_id = auth.uid()
    )
);

-- Add RLS policy for partner users to create partner_users records (for accepting invites)
CREATE POLICY "Users can accept invitations for themselves"
ON public.credit_repair_partner_users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to update invitation status when accepting
CREATE POLICY "Users can accept pending invitations"
ON public.partner_invitations
FOR UPDATE
TO authenticated
USING (
    status = 'pending' 
    AND expires_at > now()
)
WITH CHECK (
    auth.uid() = accepted_by
);