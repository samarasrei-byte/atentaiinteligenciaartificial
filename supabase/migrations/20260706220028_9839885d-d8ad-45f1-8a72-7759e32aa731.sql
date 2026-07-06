-- Grab first admin user_id
DO $$
DECLARE admin_uid uuid;
DECLARE admin_email text;
BEGIN
  SELECT ur.user_id, au.email INTO admin_uid, admin_email
  FROM public.user_roles ur JOIN auth.users au ON au.id = ur.user_id
  WHERE ur.role='admin' LIMIT 1;

  -- RELEASE approved lead
  UPDATE public.mentoria_cartas_leads
  SET approval_stage='admin_released',
      admin_released_at=now(),
      admin_released_by=admin_uid,
      admin_release_notes='Contato validado — E2E liberado'
  WHERE id='bf209c41-526f-4563-93e7-93e2049d12bb';

  INSERT INTO public.audit_logs(user_id, action_type, resource_type, resource_id, success, metadata)
  VALUES (admin_uid, 'carta_admin_release', 'mentoria_cartas_lead',
          'bf209c41-526f-4563-93e7-93e2049d12bb', true,
          jsonb_build_object('actor_role','admin','actor_email',admin_email,'admin_release_notes','Contato validado — E2E liberado'));

  -- DENY rejected lead
  UPDATE public.mentoria_cartas_leads
  SET approval_stage='admin_denied',
      admin_released_at=now(),
      admin_released_by=admin_uid,
      admin_release_notes='Lead descartado — E2E negado'
  WHERE id='789134fe-7dc5-4a02-a403-4c12bfa21f69';

  INSERT INTO public.audit_logs(user_id, action_type, resource_type, resource_id, success, metadata)
  VALUES (admin_uid, 'carta_admin_deny', 'mentoria_cartas_lead',
          '789134fe-7dc5-4a02-a403-4c12bfa21f69', true,
          jsonb_build_object('actor_role','admin','actor_email',admin_email,'admin_release_notes','Lead descartado — E2E negado'));
END $$;