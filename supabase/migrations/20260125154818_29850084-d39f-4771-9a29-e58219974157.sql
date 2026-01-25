-- Update credit_repair_requests table defaults to match official 2025 prices
-- Limpa Nome PF: R$ 780,00 (78000 cents)
-- Limpa Nome CNPJ: R$ 970,00 (97000 cents)
-- Default to PF price as more common

ALTER TABLE public.credit_repair_requests 
  ALTER COLUMN service_price_cents SET DEFAULT 78000;

ALTER TABLE public.credit_repair_requests 
  ALTER COLUMN final_price_cents SET DEFAULT 78000;