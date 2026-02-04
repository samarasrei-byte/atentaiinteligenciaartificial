-- PARTE 2: Criar funções e políticas RLS para equipe_guilherme

-- Criar função para verificar se usuário é da equipe do Guilherme
CREATE OR REPLACE FUNCTION public.is_equipe_guilherme(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'equipe_guilherme'
  )
$$;

-- Criar função para verificar se usuário tem acesso aos módulos do Guilherme (admin OU equipe_guilherme)
CREATE OR REPLACE FUNCTION public.has_guilherme_access(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'equipe_guilherme')
  )
$$;

-- RLS para credit_repair_requests (LimpaNome)
DROP POLICY IF EXISTS "Equipe Guilherme can view credit repair requests" ON public.credit_repair_requests;
CREATE POLICY "Equipe Guilherme can view credit repair requests"
ON public.credit_repair_requests
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR public.has_guilherme_access(auth.uid())
);

DROP POLICY IF EXISTS "Equipe Guilherme can update credit repair requests" ON public.credit_repair_requests;
CREATE POLICY "Equipe Guilherme can update credit repair requests"
ON public.credit_repair_requests
FOR UPDATE
TO authenticated
USING (public.has_guilherme_access(auth.uid()));

-- RLS para fiscal_analysis_requests (Análise Fiscal)
DROP POLICY IF EXISTS "Equipe Guilherme can view fiscal analysis requests" ON public.fiscal_analysis_requests;
CREATE POLICY "Equipe Guilherme can view fiscal analysis requests"
ON public.fiscal_analysis_requests
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR public.has_guilherme_access(auth.uid())
);

DROP POLICY IF EXISTS "Equipe Guilherme can update fiscal analysis requests" ON public.fiscal_analysis_requests;
CREATE POLICY "Equipe Guilherme can update fiscal analysis requests"
ON public.fiscal_analysis_requests
FOR UPDATE
TO authenticated
USING (public.has_guilherme_access(auth.uid()));

-- RLS para credit_repair_chat_messages
DROP POLICY IF EXISTS "Equipe Guilherme can view credit repair chat" ON public.credit_repair_chat_messages;
CREATE POLICY "Equipe Guilherme can view credit repair chat"
ON public.credit_repair_chat_messages
FOR SELECT
TO authenticated
USING (
  sender_id = auth.uid() 
  OR receiver_id = auth.uid()
  OR public.has_guilherme_access(auth.uid())
);

DROP POLICY IF EXISTS "Equipe Guilherme can send credit repair chat" ON public.credit_repair_chat_messages;
CREATE POLICY "Equipe Guilherme can send credit repair chat"
ON public.credit_repair_chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  OR public.has_guilherme_access(auth.uid())
);

-- RLS para fiscal_chat_messages
DROP POLICY IF EXISTS "Equipe Guilherme can view fiscal chat" ON public.fiscal_chat_messages;
CREATE POLICY "Equipe Guilherme can view fiscal chat"
ON public.fiscal_chat_messages
FOR SELECT
TO authenticated
USING (
  sender_id = auth.uid() 
  OR receiver_id = auth.uid()
  OR public.has_guilherme_access(auth.uid())
);

DROP POLICY IF EXISTS "Equipe Guilherme can send fiscal chat" ON public.fiscal_chat_messages;
CREATE POLICY "Equipe Guilherme can send fiscal chat"
ON public.fiscal_chat_messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  OR public.has_guilherme_access(auth.uid())
);