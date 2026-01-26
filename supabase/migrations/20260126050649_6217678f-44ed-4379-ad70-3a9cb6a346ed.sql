-- Create trigger function to notify partner when new credit repair request is created
CREATE OR REPLACE FUNCTION public.notify_partner_new_credit_repair()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_partner_user_id UUID;
  v_partner_name TEXT;
BEGIN
  -- Only trigger on INSERT with a partner_id
  IF NEW.partner_id IS NOT NULL THEN
    -- Get primary partner user
    SELECT pu.user_id INTO v_partner_user_id
    FROM credit_repair_partner_users pu
    WHERE pu.partner_id = NEW.partner_id AND pu.is_primary = true
    LIMIT 1;
    
    IF v_partner_user_id IS NOT NULL THEN
      -- Get partner company name
      SELECT company_name INTO v_partner_name
      FROM credit_repair_partners
      WHERE id = NEW.partner_id;
      
      -- Create notification for partner
      INSERT INTO public.service_notifications (
        user_id,
        title,
        message,
        notification_type,
        service_type,
        metadata
      ) VALUES (
        v_partner_user_id,
        '🛡️ Nova Solicitação Limpa Nome!',
        'Nova solicitação de ' || COALESCE(NEW.full_name, 'Cliente') || ' - Valor: R$ ' || TO_CHAR(NEW.service_price_cents / 100.0, 'FM999G999D00'),
        'new_credit_repair_request',
        'credit_repair',
        jsonb_build_object(
          'request_id', NEW.id,
          'client_name', NEW.full_name,
          'service_price_cents', NEW.service_price_cents,
          'partner_id', NEW.partner_id
        )
      );
      
      -- Create automatic welcome chat message from partner to client
      INSERT INTO public.credit_repair_chat_messages (
        request_id,
        sender_id,
        receiver_id,
        content
      ) VALUES (
        NEW.id,
        v_partner_user_id,
        NEW.user_id,
        'Olá, ' || COALESCE(split_part(NEW.full_name, ' ', 1), 'Cliente') || '! 👋

Sou seu especialista em recuperação de crédito. Recebi sua solicitação e vou analisar seu caso com atenção.

📋 **Próximos passos:**
1. Análise do seu perfil de crédito
2. Identificação das pendências
3. Estratégia personalizada de recuperação

Em breve entrarei em contato para solicitar alguns documentos. Fique tranquilo(a), estamos juntos nessa jornada!

Qualquer dúvida, é só me chamar aqui. 🤝'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new credit repair request notification
DROP TRIGGER IF EXISTS notify_partner_on_new_credit_repair ON public.credit_repair_requests;
CREATE TRIGGER notify_partner_on_new_credit_repair
  AFTER INSERT ON public.credit_repair_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_partner_new_credit_repair();