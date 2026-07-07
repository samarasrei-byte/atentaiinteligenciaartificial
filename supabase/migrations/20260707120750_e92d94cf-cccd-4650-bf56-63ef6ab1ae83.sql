
CREATE POLICY "Carta partner updates all energy" ON public.energy_recovery_requests
  FOR UPDATE TO authenticated
  USING (public.is_carta_partner(auth.uid()))
  WITH CHECK (public.is_carta_partner(auth.uid()));

CREATE POLICY "Carta partner updates all water" ON public.water_recovery_requests
  FOR UPDATE TO authenticated
  USING (public.is_carta_partner(auth.uid()))
  WITH CHECK (public.is_carta_partner(auth.uid()));

CREATE POLICY "Carta partner updates all solar" ON public.solar_requests
  FOR UPDATE TO authenticated
  USING (public.is_carta_partner(auth.uid()))
  WITH CHECK (public.is_carta_partner(auth.uid()));
