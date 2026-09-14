
REVOKE EXECUTE ON FUNCTION public.difal_is_admin() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.difal_is_member(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.difal_can_access_simulation(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.difal_log_rule_changes() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.difal_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.difal_is_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.difal_can_access_simulation(uuid) TO authenticated;
