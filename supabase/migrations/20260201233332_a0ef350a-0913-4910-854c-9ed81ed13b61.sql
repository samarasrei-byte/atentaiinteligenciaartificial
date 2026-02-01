
-- SECURITY FIX: Remove unused apply_affiliate_coupon function
-- This function has SECURITY DEFINER without proper authentication checks
-- It's not used anywhere in the codebase and poses a security risk
-- Attackers could call it via RPC to fabricate coupon usage records

DROP FUNCTION IF EXISTS public.apply_affiliate_coupon(uuid, text, text, integer, integer, text);
