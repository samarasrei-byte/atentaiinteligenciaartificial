
-- Create function to check tax limits and create notifications
CREATE OR REPLACE FUNCTION public.check_tax_limits_and_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_annual_revenue_cents BIGINT;
  v_mei_limit_cents BIGINT := 8100000; -- R$ 81.000
  v_simples_limit_cents BIGINT := 480000000; -- R$ 4.800.000
  v_mei_80_percent BIGINT;
  v_simples_80_percent BIGINT;
  v_notification_exists BOOLEAN;
  v_user_name TEXT;
BEGIN
  -- Calculate 80% thresholds
  v_mei_80_percent := v_mei_limit_cents * 0.8; -- R$ 64.800
  v_simples_80_percent := v_simples_limit_cents * 0.8; -- R$ 3.840.000
  
  -- Get user name from profiles
  SELECT full_name INTO v_user_name FROM public.profiles WHERE user_id = NEW.user_id;
  
  -- Handle autonomo_profiles table
  IF TG_TABLE_NAME = 'autonomo_profiles' THEN
    v_annual_revenue_cents := COALESCE(NEW.monthly_revenue_average_cents, 0) * 12;
    
    -- Check MEI limit (80%)
    IF v_annual_revenue_cents >= v_mei_80_percent AND v_annual_revenue_cents < v_mei_limit_cents THEN
      -- Check if notification already exists in last 30 days
      SELECT EXISTS(
        SELECT 1 FROM public.service_notifications 
        WHERE user_id = NEW.user_id 
        AND notification_type = 'mei_limit_warning'
        AND created_at > now() - interval '30 days'
      ) INTO v_notification_exists;
      
      IF NOT v_notification_exists THEN
        INSERT INTO public.service_notifications (
          user_id, title, message, notification_type, service_type, metadata
        ) VALUES (
          NEW.user_id,
          '⚠️ Atenção: Limite MEI Próximo',
          'Seu faturamento anual atingiu ' || ROUND((v_annual_revenue_cents::numeric / v_mei_limit_cents) * 100) || '% do limite MEI (R$ 81.000). Considere migrar para ME - Simples Nacional.',
          'mei_limit_warning',
          'tax_alert',
          jsonb_build_object(
            'annual_revenue_cents', v_annual_revenue_cents,
            'limit_cents', v_mei_limit_cents,
            'percentage', ROUND((v_annual_revenue_cents::numeric / v_mei_limit_cents) * 100)
          )
        );
      END IF;
    END IF;
    
    -- Check if exceeded MEI limit
    IF v_annual_revenue_cents >= v_mei_limit_cents THEN
      SELECT EXISTS(
        SELECT 1 FROM public.service_notifications 
        WHERE user_id = NEW.user_id 
        AND notification_type = 'mei_limit_exceeded'
        AND created_at > now() - interval '30 days'
      ) INTO v_notification_exists;
      
      IF NOT v_notification_exists THEN
        INSERT INTO public.service_notifications (
          user_id, title, message, notification_type, service_type, metadata
        ) VALUES (
          NEW.user_id,
          '🚨 Limite MEI Ultrapassado!',
          'Seu faturamento anual de R$ ' || TO_CHAR(v_annual_revenue_cents / 100.0, 'FM999G999G999D00') || ' ultrapassou o limite MEI. Migre urgentemente para ME - Simples Nacional para evitar multas.',
          'mei_limit_exceeded',
          'tax_alert',
          jsonb_build_object(
            'annual_revenue_cents', v_annual_revenue_cents,
            'limit_cents', v_mei_limit_cents,
            'percentage', ROUND((v_annual_revenue_cents::numeric / v_mei_limit_cents) * 100)
          )
        );
      END IF;
    END IF;
  END IF;
  
  -- Handle companies table
  IF TG_TABLE_NAME = 'companies' THEN
    v_annual_revenue_cents := COALESCE(NEW.annual_revenue_cents, COALESCE(NEW.monthly_revenue_cents, 0) * 12);
    
    -- Check Simples Nacional limit (80%)
    IF v_annual_revenue_cents >= v_simples_80_percent AND v_annual_revenue_cents < v_simples_limit_cents THEN
      SELECT EXISTS(
        SELECT 1 FROM public.service_notifications 
        WHERE user_id = NEW.user_id 
        AND notification_type = 'simples_limit_warning'
        AND created_at > now() - interval '30 days'
      ) INTO v_notification_exists;
      
      IF NOT v_notification_exists THEN
        INSERT INTO public.service_notifications (
          user_id, title, message, notification_type, service_type, metadata
        ) VALUES (
          NEW.user_id,
          '⚠️ Atenção: Limite Simples Nacional Próximo',
          'O faturamento anual da empresa atingiu ' || ROUND((v_annual_revenue_cents::numeric / v_simples_limit_cents) * 100) || '% do limite do Simples Nacional (R$ 4,8M). Avalie migrar para Lucro Presumido.',
          'simples_limit_warning',
          'tax_alert',
          jsonb_build_object(
            'annual_revenue_cents', v_annual_revenue_cents,
            'limit_cents', v_simples_limit_cents,
            'percentage', ROUND((v_annual_revenue_cents::numeric / v_simples_limit_cents) * 100),
            'company_name', NEW.company_name
          )
        );
      END IF;
    END IF;
    
    -- Check if exceeded Simples limit
    IF v_annual_revenue_cents >= v_simples_limit_cents THEN
      SELECT EXISTS(
        SELECT 1 FROM public.service_notifications 
        WHERE user_id = NEW.user_id 
        AND notification_type = 'simples_limit_exceeded'
        AND created_at > now() - interval '30 days'
      ) INTO v_notification_exists;
      
      IF NOT v_notification_exists THEN
        INSERT INTO public.service_notifications (
          user_id, title, message, notification_type, service_type, metadata
        ) VALUES (
          NEW.user_id,
          '🚨 Limite Simples Nacional Ultrapassado!',
          'O faturamento anual de R$ ' || TO_CHAR(v_annual_revenue_cents / 100.0, 'FM999G999G999D00') || ' ultrapassou o limite do Simples Nacional. Migre para Lucro Presumido ou Real.',
          'simples_limit_exceeded',
          'tax_alert',
          jsonb_build_object(
            'annual_revenue_cents', v_annual_revenue_cents,
            'limit_cents', v_simples_limit_cents,
            'percentage', ROUND((v_annual_revenue_cents::numeric / v_simples_limit_cents) * 100),
            'company_name', NEW.company_name
          )
        );
      END IF;
    END IF;
    
    -- Also check MEI limit for MEI companies
    IF NEW.company_type = 'mei' THEN
      IF v_annual_revenue_cents >= v_mei_80_percent AND v_annual_revenue_cents < v_mei_limit_cents THEN
        SELECT EXISTS(
          SELECT 1 FROM public.service_notifications 
          WHERE user_id = NEW.user_id 
          AND notification_type = 'mei_limit_warning'
          AND created_at > now() - interval '30 days'
        ) INTO v_notification_exists;
        
        IF NOT v_notification_exists THEN
          INSERT INTO public.service_notifications (
            user_id, title, message, notification_type, service_type, metadata
          ) VALUES (
            NEW.user_id,
            '⚠️ Atenção: Limite MEI Próximo',
            'O faturamento anual da empresa ' || NEW.company_name || ' atingiu ' || ROUND((v_annual_revenue_cents::numeric / v_mei_limit_cents) * 100) || '% do limite MEI. Considere migrar para ME.',
            'mei_limit_warning',
            'tax_alert',
            jsonb_build_object(
              'annual_revenue_cents', v_annual_revenue_cents,
              'limit_cents', v_mei_limit_cents,
              'percentage', ROUND((v_annual_revenue_cents::numeric / v_mei_limit_cents) * 100),
              'company_name', NEW.company_name
            )
          );
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create triggers for both tables
DROP TRIGGER IF EXISTS check_autonomo_tax_limits ON public.autonomo_profiles;
CREATE TRIGGER check_autonomo_tax_limits
  AFTER INSERT OR UPDATE OF monthly_revenue_average_cents ON public.autonomo_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_tax_limits_and_notify();

DROP TRIGGER IF EXISTS check_company_tax_limits ON public.companies;
CREATE TRIGGER check_company_tax_limits
  AFTER INSERT OR UPDATE OF monthly_revenue_cents, annual_revenue_cents ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.check_tax_limits_and_notify();

-- Also create a function to notify contadores about their clients' limits
CREATE OR REPLACE FUNCTION public.notify_contador_client_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_contador_record RECORD;
  v_client_name TEXT;
BEGIN
  -- Get client name
  SELECT full_name INTO v_client_name FROM public.profiles WHERE user_id = NEW.user_id;
  
  -- Notify all contadores about this client reaching limits
  IF NEW.notification_type IN ('mei_limit_warning', 'mei_limit_exceeded', 'simples_limit_warning', 'simples_limit_exceeded') THEN
    FOR v_contador_record IN 
      SELECT DISTINCT cp.user_id 
      FROM public.contador_profiles cp
      WHERE cp.available = true
    LOOP
      -- Create notification for contador
      INSERT INTO public.service_notifications (
        user_id, title, message, notification_type, service_type, metadata
      ) VALUES (
        v_contador_record.user_id,
        CASE 
          WHEN NEW.notification_type LIKE '%exceeded%' THEN '🚨 Cliente Ultrapassou Limite!'
          ELSE '⚠️ Cliente Próximo do Limite'
        END,
        'O cliente ' || COALESCE(v_client_name, 'Anônimo') || ' ' ||
        CASE 
          WHEN NEW.notification_type = 'mei_limit_warning' THEN 'está próximo do limite MEI (80%+)'
          WHEN NEW.notification_type = 'mei_limit_exceeded' THEN 'ultrapassou o limite MEI'
          WHEN NEW.notification_type = 'simples_limit_warning' THEN 'está próximo do limite Simples Nacional (80%+)'
          WHEN NEW.notification_type = 'simples_limit_exceeded' THEN 'ultrapassou o limite Simples Nacional'
          ELSE 'precisa de atenção tributária'
        END || '. Entre em contato para auxiliar na migração.',
        'contador_client_alert',
        'tax_alert',
        jsonb_build_object(
          'client_user_id', NEW.user_id,
          'client_name', v_client_name,
          'original_notification_type', NEW.notification_type,
          'original_metadata', NEW.metadata
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to notify contadores
DROP TRIGGER IF EXISTS notify_contadores_on_limit_alert ON public.service_notifications;
CREATE TRIGGER notify_contadores_on_limit_alert
  AFTER INSERT ON public.service_notifications
  FOR EACH ROW
  WHEN (NEW.notification_type IN ('mei_limit_warning', 'mei_limit_exceeded', 'simples_limit_warning', 'simples_limit_exceeded'))
  EXECUTE FUNCTION public.notify_contador_client_limits();
