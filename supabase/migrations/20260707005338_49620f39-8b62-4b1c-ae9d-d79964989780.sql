
-- Energy Recovery
CREATE TABLE public.energy_recovery_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  document text,
  client_type text NOT NULL DEFAULT 'pf' CHECK (client_type IN ('pf','pj')),
  monthly_bill_cents bigint NOT NULL DEFAULT 0,
  months_estimated int NOT NULL DEFAULT 60,
  estimated_recovery_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  approval_stage text NOT NULL DEFAULT 'new_lead',
  partner_id uuid REFERENCES public.credit_repair_partners(id) ON DELETE SET NULL,
  partner_notes text,
  admin_notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.energy_recovery_requests TO authenticated;
GRANT ALL ON public.energy_recovery_requests TO service_role;
ALTER TABLE public.energy_recovery_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages own energy request" ON public.energy_recovery_requests
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin/Guilherme manage all energy" ON public.energy_recovery_requests
  FOR ALL USING (public.has_guilherme_access(auth.uid())) WITH CHECK (public.has_guilherme_access(auth.uid()));
CREATE POLICY "Partner views assigned energy" ON public.energy_recovery_requests
  FOR SELECT USING (
    partner_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.credit_repair_partner_users pu
      WHERE pu.partner_id = energy_recovery_requests.partner_id AND pu.user_id = auth.uid()
    )
  );
CREATE POLICY "Partner updates assigned energy" ON public.energy_recovery_requests
  FOR UPDATE USING (
    partner_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.credit_repair_partner_users pu
      WHERE pu.partner_id = energy_recovery_requests.partner_id AND pu.user_id = auth.uid()
    )
  );
CREATE POLICY "Carta partner views all energy" ON public.energy_recovery_requests
  FOR SELECT USING (public.is_carta_partner(auth.uid()));

CREATE TRIGGER trg_energy_updated BEFORE UPDATE ON public.energy_recovery_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Water Recovery
CREATE TABLE public.water_recovery_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  document text,
  client_type text NOT NULL DEFAULT 'pj' CHECK (client_type IN ('pf','pj')),
  bill_1_cents bigint NOT NULL DEFAULT 0,
  bill_2_cents bigint NOT NULL DEFAULT 0,
  bill_3_cents bigint NOT NULL DEFAULT 0,
  estimated_recovery_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  approval_stage text NOT NULL DEFAULT 'new_lead',
  partner_id uuid REFERENCES public.credit_repair_partners(id) ON DELETE SET NULL,
  partner_notes text,
  admin_notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.water_recovery_requests TO authenticated;
GRANT ALL ON public.water_recovery_requests TO service_role;
ALTER TABLE public.water_recovery_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages own water request" ON public.water_recovery_requests
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin/Guilherme manage all water" ON public.water_recovery_requests
  FOR ALL USING (public.has_guilherme_access(auth.uid())) WITH CHECK (public.has_guilherme_access(auth.uid()));
CREATE POLICY "Partner views assigned water" ON public.water_recovery_requests
  FOR SELECT USING (
    partner_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.credit_repair_partner_users pu
      WHERE pu.partner_id = water_recovery_requests.partner_id AND pu.user_id = auth.uid()
    )
  );
CREATE POLICY "Partner updates assigned water" ON public.water_recovery_requests
  FOR UPDATE USING (
    partner_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.credit_repair_partner_users pu
      WHERE pu.partner_id = water_recovery_requests.partner_id AND pu.user_id = auth.uid()
    )
  );
CREATE POLICY "Carta partner views all water" ON public.water_recovery_requests
  FOR SELECT USING (public.is_carta_partner(auth.uid()));

CREATE TRIGGER trg_water_updated BEFORE UPDATE ON public.water_recovery_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Solar Requests
CREATE TABLE public.solar_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  document text,
  client_type text NOT NULL DEFAULT 'pj' CHECK (client_type IN ('pf','pj')),
  monthly_bill_cents bigint NOT NULL DEFAULT 0,
  monthly_kwh int NOT NULL DEFAULT 0,
  address text,
  city text,
  state text,
  estimated_savings_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  approval_stage text NOT NULL DEFAULT 'new_lead',
  partner_id uuid REFERENCES public.credit_repair_partners(id) ON DELETE SET NULL,
  partner_notes text,
  admin_notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.solar_requests TO authenticated;
GRANT ALL ON public.solar_requests TO service_role;
ALTER TABLE public.solar_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages own solar request" ON public.solar_requests
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin/Guilherme manage all solar" ON public.solar_requests
  FOR ALL USING (public.has_guilherme_access(auth.uid())) WITH CHECK (public.has_guilherme_access(auth.uid()));
CREATE POLICY "Partner views assigned solar" ON public.solar_requests
  FOR SELECT USING (
    partner_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.credit_repair_partner_users pu
      WHERE pu.partner_id = solar_requests.partner_id AND pu.user_id = auth.uid()
    )
  );
CREATE POLICY "Partner updates assigned solar" ON public.solar_requests
  FOR UPDATE USING (
    partner_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.credit_repair_partner_users pu
      WHERE pu.partner_id = solar_requests.partner_id AND pu.user_id = auth.uid()
    )
  );
CREATE POLICY "Carta partner views all solar" ON public.solar_requests
  FOR SELECT USING (public.is_carta_partner(auth.uid()));

CREATE TRIGGER trg_solar_updated BEFORE UPDATE ON public.solar_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.energy_recovery_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.water_recovery_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.solar_requests;
