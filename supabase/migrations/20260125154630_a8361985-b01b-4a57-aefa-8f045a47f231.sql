-- Update IR requests table defaults to match official 2025 prices
-- IR Simples: R$ 200,00 (20000 cents)
-- IR Completo: R$ 420,00 (42000 cents)

ALTER TABLE public.ir_requests 
  ALTER COLUMN base_price_cents SET DEFAULT 20000;

ALTER TABLE public.ir_requests 
  ALTER COLUMN final_price_cents SET DEFAULT 20000;