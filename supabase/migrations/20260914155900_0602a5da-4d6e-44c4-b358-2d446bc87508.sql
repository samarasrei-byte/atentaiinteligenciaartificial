
-- ============ HELPERS ============
CREATE OR REPLACE FUNCTION public.difal_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

CREATE TABLE public.difal_companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  razao_social text NOT NULL,
  nome_fantasia text,
  cnpj text NOT NULL,
  inscricao_estadual text,
  uf text NOT NULL,
  regime_tributario text NOT NULL DEFAULT 'simples_nacional',
  atividade_economica text,
  responsavel_fiscal text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.difal_companies TO authenticated;
GRANT ALL ON public.difal_companies TO service_role;
ALTER TABLE public.difal_companies ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.difal_company_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES public.difal_companies(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  member_role text NOT NULL DEFAULT 'analista' CHECK (member_role IN ('owner','contador','analista','viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.difal_company_users TO authenticated;
GRANT ALL ON public.difal_company_users TO service_role;
ALTER TABLE public.difal_company_users ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_difal_company_users_user ON public.difal_company_users(user_id);

CREATE OR REPLACE FUNCTION public.difal_is_member(_company_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.difal_companies c
    WHERE c.id = _company_id AND c.owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.difal_company_users m
    WHERE m.company_id = _company_id AND m.user_id = auth.uid()
  )
$$;

CREATE POLICY "difal_companies_select" ON public.difal_companies FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.difal_is_member(id) OR public.difal_is_admin());
CREATE POLICY "difal_companies_insert" ON public.difal_companies FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() OR public.difal_is_admin());
CREATE POLICY "difal_companies_update" ON public.difal_companies FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.difal_is_admin())
  WITH CHECK (owner_id = auth.uid() OR public.difal_is_admin());
CREATE POLICY "difal_companies_delete" ON public.difal_companies FOR DELETE TO authenticated
  USING (owner_id = auth.uid() OR public.difal_is_admin());

CREATE POLICY "difal_company_users_select" ON public.difal_company_users FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.difal_is_member(company_id) OR public.difal_is_admin());
CREATE POLICY "difal_company_users_manage" ON public.difal_company_users FOR ALL TO authenticated
  USING (public.difal_is_admin() OR EXISTS (SELECT 1 FROM public.difal_companies c WHERE c.id = company_id AND c.owner_id = auth.uid()))
  WITH CHECK (public.difal_is_admin() OR EXISTS (SELECT 1 FROM public.difal_companies c WHERE c.id = company_id AND c.owner_id = auth.uid()));

-- ============ STATES ============
CREATE TABLE public.difal_states (
  uf text PRIMARY KEY,
  name text NOT NULL,
  region text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.difal_states TO authenticated;
GRANT ALL ON public.difal_states TO service_role;
ALTER TABLE public.difal_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "difal_states_read" ON public.difal_states FOR SELECT TO authenticated USING (true);
CREATE POLICY "difal_states_admin" ON public.difal_states FOR ALL TO authenticated
  USING (public.difal_is_admin()) WITH CHECK (public.difal_is_admin());

INSERT INTO public.difal_states (uf, name, region) VALUES
('AC','Acre','Norte'),('AL','Alagoas','Nordeste'),('AP','Amapá','Norte'),('AM','Amazonas','Norte'),
('BA','Bahia','Nordeste'),('CE','Ceará','Nordeste'),('DF','Distrito Federal','Centro-Oeste'),
('ES','Espírito Santo','Sudeste'),('GO','Goiás','Centro-Oeste'),('MA','Maranhão','Nordeste'),
('MT','Mato Grosso','Centro-Oeste'),('MS','Mato Grosso do Sul','Centro-Oeste'),('MG','Minas Gerais','Sudeste'),
('PA','Pará','Norte'),('PB','Paraíba','Nordeste'),('PR','Paraná','Sul'),('PE','Pernambuco','Nordeste'),
('PI','Piauí','Nordeste'),('RJ','Rio de Janeiro','Sudeste'),('RN','Rio Grande do Norte','Nordeste'),
('RS','Rio Grande do Sul','Sul'),('RO','Rondônia','Norte'),('RR','Roraima','Norte'),
('SC','Santa Catarina','Sul'),('SP','São Paulo','Sudeste'),('SE','Sergipe','Nordeste'),('TO','Tocantins','Norte');

-- ============ TAX RULES ============
CREATE TABLE public.difal_tax_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uf_origem text REFERENCES public.difal_states(uf),
  uf_destino text NOT NULL REFERENCES public.difal_states(uf),
  tipo_operacao text NOT NULL DEFAULT 'venda',
  aliquota_interna numeric(6,3) NOT NULL,
  aliquota_interestadual numeric(6,3) NOT NULL,
  fcp_percentual numeric(6,3) NOT NULL DEFAULT 0,
  base_calculo_metodo text NOT NULL DEFAULT 'simples' CHECK (base_calculo_metodo IN ('simples','dupla')),
  trat_consumidor_final_contribuinte text,
  trat_consumidor_final_nao_contribuinte text,
  trat_revenda text,
  trat_marketplace text,
  responsavel_recolhimento text NOT NULL DEFAULT 'remetente' CHECK (responsavel_recolhimento IN ('remetente','destinatario','marketplace','nao_aplicavel')),
  codigo_receita text,
  vigencia_inicio date NOT NULL,
  vigencia_fim date,
  fonte_oficial text,
  norma text,
  observacoes text,
  nivel_confianca text NOT NULL DEFAULT 'demonstrativo' CHECK (nivel_confianca IN ('demonstrativo','revisado','oficial')),
  is_demo boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','ativo','arquivado')),
  ultima_revisao_em timestamptz,
  atualizado_por uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.difal_tax_rules TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.difal_tax_rules TO authenticated;
GRANT ALL ON public.difal_tax_rules TO service_role;
ALTER TABLE public.difal_tax_rules ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_difal_rules_lookup ON public.difal_tax_rules(uf_destino, uf_origem, status, vigencia_inicio);
CREATE POLICY "difal_rules_read" ON public.difal_tax_rules FOR SELECT TO authenticated
  USING (status = 'ativo' OR public.difal_is_admin());
CREATE POLICY "difal_rules_admin_write" ON public.difal_tax_rules FOR ALL TO authenticated
  USING (public.difal_is_admin()) WITH CHECK (public.difal_is_admin());

CREATE TABLE public.difal_tax_rule_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid NOT NULL REFERENCES public.difal_tax_rules(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  url text,
  publicado_em date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.difal_tax_rule_sources TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.difal_tax_rule_sources TO authenticated;
GRANT ALL ON public.difal_tax_rule_sources TO service_role;
ALTER TABLE public.difal_tax_rule_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "difal_rule_sources_read" ON public.difal_tax_rule_sources FOR SELECT TO authenticated USING (true);
CREATE POLICY "difal_rule_sources_admin" ON public.difal_tax_rule_sources FOR ALL TO authenticated
  USING (public.difal_is_admin()) WITH CHECK (public.difal_is_admin());

CREATE TABLE public.difal_rule_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id uuid,
  changed_by uuid,
  field_name text NOT NULL,
  old_value text,
  new_value text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.difal_rule_audit_logs TO authenticated;
GRANT ALL ON public.difal_rule_audit_logs TO service_role;
ALTER TABLE public.difal_rule_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "difal_rule_audit_admin" ON public.difal_rule_audit_logs FOR SELECT TO authenticated
  USING (public.difal_is_admin());

CREATE OR REPLACE FUNCTION public.difal_log_rule_changes()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  col text;
  old_v text;
  new_v text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.difal_rule_audit_logs (rule_id, changed_by, field_name, old_value, new_value, reason)
    VALUES (NEW.id, auth.uid(), 'registro', NULL, 'regra criada', NEW.observacoes);
    RETURN NEW;
  END IF;

  FOREACH col IN ARRAY ARRAY['aliquota_interna','aliquota_interestadual','fcp_percentual','status','vigencia_inicio','vigencia_fim','responsavel_recolhimento','nivel_confianca','fonte_oficial','norma','base_calculo_metodo','tipo_operacao'] LOOP
    EXECUTE format('SELECT ($1).%I::text, ($2).%I::text', col, col) INTO old_v, new_v USING OLD, NEW;
    IF old_v IS DISTINCT FROM new_v THEN
      INSERT INTO public.difal_rule_audit_logs (rule_id, changed_by, field_name, old_value, new_value, reason)
      VALUES (NEW.id, auth.uid(), col, old_v, new_v, NEW.observacoes);
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER difal_rules_audit
AFTER INSERT OR UPDATE ON public.difal_tax_rules
FOR EACH ROW EXECUTE FUNCTION public.difal_log_rule_changes();

CREATE TRIGGER difal_rules_updated_at BEFORE UPDATE ON public.difal_tax_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER difal_companies_updated_at BEFORE UPDATE ON public.difal_companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PRODUCTS ============
CREATE TABLE public.difal_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES public.difal_companies(id) ON DELETE CASCADE,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  descricao text NOT NULL,
  codigo_interno text,
  ncm text,
  cest text,
  cfop text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.difal_products TO authenticated;
GRANT ALL ON public.difal_products TO service_role;
ALTER TABLE public.difal_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "difal_products_all" ON public.difal_products FOR ALL TO authenticated
  USING (created_by = auth.uid() OR (company_id IS NOT NULL AND public.difal_is_member(company_id)) OR public.difal_is_admin())
  WITH CHECK (created_by = auth.uid() OR (company_id IS NOT NULL AND public.difal_is_member(company_id)) OR public.difal_is_admin());

CREATE TABLE public.difal_product_tax_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.difal_products(id) ON DELETE CASCADE,
  uf text REFERENCES public.difal_states(uf),
  substituicao_tributaria boolean NOT NULL DEFAULT false,
  sujeito_fcp boolean NOT NULL DEFAULT false,
  fcp_percentual numeric(6,3) NOT NULL DEFAULT 0,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.difal_product_tax_data TO authenticated;
GRANT ALL ON public.difal_product_tax_data TO service_role;
ALTER TABLE public.difal_product_tax_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "difal_product_tax_all" ON public.difal_product_tax_data FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.difal_products p WHERE p.id = product_id AND (p.created_by = auth.uid() OR public.difal_is_admin())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.difal_products p WHERE p.id = product_id AND (p.created_by = auth.uid() OR public.difal_is_admin())));

-- ============ SIMULATIONS ============
CREATE SEQUENCE IF NOT EXISTS public.difal_simulation_number_seq;

CREATE TABLE public.difal_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero bigint NOT NULL DEFAULT nextval('public.difal_simulation_number_seq'),
  company_id uuid REFERENCES public.difal_companies(id) ON DELETE SET NULL,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_by_email text,
  data_operacao date NOT NULL,
  uf_origem text NOT NULL REFERENCES public.difal_states(uf),
  uf_destino text NOT NULL REFERENCES public.difal_states(uf),
  tipo_operacao text NOT NULL DEFAULT 'venda',
  finalidade text NOT NULL DEFAULT 'consumo' CHECK (finalidade IN ('consumo','revenda')),
  destinatario_contribuinte boolean NOT NULL DEFAULT false,
  regime_vendedor text,
  regime_comprador text,
  canal_venda text,
  responsavel_recolhimento text,
  valor_produtos_cents bigint NOT NULL DEFAULT 0,
  frete_cents bigint NOT NULL DEFAULT 0,
  seguro_cents bigint NOT NULL DEFAULT 0,
  outras_despesas_cents bigint NOT NULL DEFAULT 0,
  descontos_cents bigint NOT NULL DEFAULT 0,
  valor_total_cents bigint NOT NULL DEFAULT 0,
  comissao_tipo text CHECK (comissao_tipo IN ('percentual','fixo')),
  comissao_valor numeric(12,2),
  status text NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho','calculada','revisao','arquivada')),
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.difal_simulations TO authenticated;
GRANT ALL ON public.difal_simulations TO service_role;
ALTER TABLE public.difal_simulations ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_difal_sim_user ON public.difal_simulations(created_by, created_at DESC);
CREATE INDEX idx_difal_sim_company ON public.difal_simulations(company_id);
CREATE POLICY "difal_sim_all" ON public.difal_simulations FOR ALL TO authenticated
  USING (created_by = auth.uid() OR (company_id IS NOT NULL AND public.difal_is_member(company_id)) OR public.difal_is_admin())
  WITH CHECK (created_by = auth.uid() OR (company_id IS NOT NULL AND public.difal_is_member(company_id)) OR public.difal_is_admin());

CREATE OR REPLACE FUNCTION public.difal_can_access_simulation(_sim_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.difal_simulations s
    WHERE s.id = _sim_id
      AND (s.created_by = auth.uid()
           OR (s.company_id IS NOT NULL AND public.difal_is_member(s.company_id))
           OR public.difal_is_admin())
  )
$$;

CREATE TABLE public.difal_simulation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid NOT NULL REFERENCES public.difal_simulations(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  codigo_interno text,
  ncm text,
  cest text,
  cfop text,
  quantidade numeric(14,4) NOT NULL DEFAULT 1,
  valor_unitario_cents bigint NOT NULL DEFAULT 0,
  desconto_cents bigint NOT NULL DEFAULT 0,
  substituicao_tributaria boolean NOT NULL DEFAULT false,
  sujeito_fcp boolean NOT NULL DEFAULT false,
  fcp_percentual numeric(6,3),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.difal_simulation_items TO authenticated;
GRANT ALL ON public.difal_simulation_items TO service_role;
ALTER TABLE public.difal_simulation_items ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_difal_items_sim ON public.difal_simulation_items(simulation_id);
CREATE POLICY "difal_items_all" ON public.difal_simulation_items FOR ALL TO authenticated
  USING (public.difal_can_access_simulation(simulation_id))
  WITH CHECK (public.difal_can_access_simulation(simulation_id));

CREATE TABLE public.difal_calculation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  simulation_id uuid NOT NULL REFERENCES public.difal_simulations(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES public.difal_tax_rules(id) ON DELETE SET NULL,
  valor_operacao_cents bigint NOT NULL DEFAULT 0,
  base_calculo_cents bigint NOT NULL DEFAULT 0,
  aliquota_interestadual numeric(6,3),
  aliquota_interna numeric(6,3),
  percentual_difal numeric(6,3),
  icms_interestadual_cents bigint NOT NULL DEFAULT 0,
  difal_cents bigint NOT NULL DEFAULT 0,
  fcp_percentual numeric(6,3),
  fcp_cents bigint NOT NULL DEFAULT 0,
  total_estimado_cents bigint NOT NULL DEFAULT 0,
  responsavel_recolhimento text,
  regra_vigencia_inicio date,
  regra_fonte text,
  nivel_confianca text,
  needs_review boolean NOT NULL DEFAULT false,
  review_reason text,
  memoria_calculo jsonb NOT NULL DEFAULT '[]'::jsonb,
  parametros jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.difal_calculation_results TO authenticated;
GRANT ALL ON public.difal_calculation_results TO service_role;
ALTER TABLE public.difal_calculation_results ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_difal_results_sim ON public.difal_calculation_results(simulation_id);
CREATE POLICY "difal_results_all" ON public.difal_calculation_results FOR ALL TO authenticated
  USING (public.difal_can_access_simulation(simulation_id))
  WITH CHECK (public.difal_can_access_simulation(simulation_id));

-- ============ LEGISLATIVE ALERTS ============
CREATE TABLE public.difal_legislative_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uf text REFERENCES public.difal_states(uf),
  titulo text NOT NULL,
  resumo text,
  norma text,
  fonte_url text,
  severidade text NOT NULL DEFAULT 'info' CHECK (severidade IN ('info','atencao','critico')),
  publicado boolean NOT NULL DEFAULT false,
  vigencia_em date,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.difal_legislative_alerts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.difal_legislative_alerts TO authenticated;
GRANT ALL ON public.difal_legislative_alerts TO service_role;
ALTER TABLE public.difal_legislative_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "difal_alerts_read" ON public.difal_legislative_alerts FOR SELECT TO authenticated
  USING (publicado = true OR public.difal_is_admin());
CREATE POLICY "difal_alerts_admin" ON public.difal_legislative_alerts FOR ALL TO authenticated
  USING (public.difal_is_admin()) WITH CHECK (public.difal_is_admin());

CREATE TRIGGER difal_sim_updated_at BEFORE UPDATE ON public.difal_simulations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER difal_products_updated_at BEFORE UPDATE ON public.difal_products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER difal_alerts_updated_at BEFORE UPDATE ON public.difal_legislative_alerts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
