-- Fix security issues: Add missing RLS policies

-- 1. Restrict contador_profiles to authenticated users only
DROP POLICY IF EXISTS "Anyone can view available contador profiles" ON public.contador_profiles;
CREATE POLICY "Authenticated users can view available contador profiles" 
ON public.contador_profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND available = true);

-- 2. Add DELETE policy for companies
CREATE POLICY "Users can delete their own company" 
ON public.companies 
FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Add UPDATE and DELETE policies for ai_chat_messages
CREATE POLICY "Users can delete their own chat messages" 
ON public.ai_chat_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- 4. Add DELETE policy for profiles
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- 5. Add UPDATE and DELETE policies for tax_simulations
CREATE POLICY "Users can update their own simulations" 
ON public.tax_simulations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own simulations" 
ON public.tax_simulations 
FOR DELETE 
USING (auth.uid() = user_id);

-- 6. Add UPDATE policy for subscriptions (user can cancel)
CREATE POLICY "Users can update their own subscription" 
ON public.subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 7. Add DELETE policy for consultations (user can delete their own)
CREATE POLICY "Users can delete their own consultations" 
ON public.consultations 
FOR DELETE 
USING (auth.uid() = user_id);