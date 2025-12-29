-- Fix 1: Make chat-attachments bucket private
UPDATE storage.buckets SET public = false WHERE id = 'chat-attachments';

-- Fix 2: Secure the increment_daily_questions function with auth validation
CREATE OR REPLACE FUNCTION public.increment_daily_questions(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count INTEGER;
BEGIN
  -- Validate that the calling user matches the parameter
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Cannot increment question count for other users';
  END IF;

  INSERT INTO public.daily_question_usage (user_id, usage_date, question_count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, usage_date)
  DO UPDATE SET 
    question_count = daily_question_usage.question_count + 1,
    updated_at = now()
  RETURNING question_count INTO v_count;
  
  RETURN v_count;
END;
$function$;

-- Also secure the get_daily_question_count function
CREATE OR REPLACE FUNCTION public.get_daily_question_count(p_user_id uuid)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_count INTEGER;
BEGIN
  -- Validate that the calling user matches the parameter
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Cannot view question count for other users';
  END IF;

  SELECT question_count INTO v_count
  FROM public.daily_question_usage
  WHERE user_id = p_user_id AND usage_date = CURRENT_DATE;
  
  RETURN COALESCE(v_count, 0);
END;
$function$;