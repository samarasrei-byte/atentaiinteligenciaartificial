-- 1. Primeiro, criar um usuário placeholder para o registro órfão via profiles
-- Como não podemos criar auth.users diretamente, vamos:
-- a) Atualizar o registro órfão para vincular a um admin temporariamente para não bloquear
-- b) Adicionar constraint NOT NULL com DEFAULT para novos registros

-- 2. Adicionar constraint NOT NULL para prevenir futuros órfãos
-- Primeiro precisamos lidar com o registro existente

-- Criar uma função que valida user_id não nulo em novos inserts
CREATE OR REPLACE FUNCTION public.validate_fiscal_request_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'user_id cannot be NULL for fiscal_analysis_requests';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger para validar em INSERT
DROP TRIGGER IF EXISTS validate_fiscal_request_user_id_trigger ON public.fiscal_analysis_requests;
CREATE TRIGGER validate_fiscal_request_user_id_trigger
  BEFORE INSERT ON public.fiscal_analysis_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_fiscal_request_user_id();

-- Comentário: O registro órfão existente (9a5f4fde-240c-4143-aaa7-089de9341bbe) 
-- será tratado manualmente via edge function ou quando o cliente fizer login