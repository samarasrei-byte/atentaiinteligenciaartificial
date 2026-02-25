import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Organization {
  id: string;
  name: string;
  type: string;
  created_by: string;
}

interface Company {
  id: string;
  organization_id: string;
  name: string;
  cnpj: string;
  type: string;
  segment?: string;
  city?: string;
  state?: string;
}

interface CapassiContextType {
  organizations: Organization[];
  companies: Company[];
  currentOrg: Organization | null;
  currentCompany: Company | null;
  setCurrentOrg: (org: Organization | null) => void;
  setCurrentCompany: (company: Company | null) => void;
  loading: boolean;
  refetch: () => Promise<void>;
}

const CapassiContext = createContext<CapassiContextType | null>(null);

export function CapassiProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = async () => {
    if (!user) return;
    setLoading(true);
    const { data: orgs } = await supabase
      .from('capassi_organizations' as any)
      .select('*')
      .order('created_at', { ascending: false });

    const orgList = (orgs || []) as unknown as Organization[];
    setOrganizations(orgList);

    if (orgList.length > 0) {
      const selected = currentOrg && orgList.find(o => o.id === currentOrg.id)
        ? currentOrg
        : orgList[0];
      setCurrentOrg(selected);

      const { data: comps } = await supabase
        .from('capassi_companies' as any)
        .select('*')
        .eq('organization_id', selected.id)
        .order('name');

      const compList = (comps || []) as unknown as Company[];
      setCompanies(compList);

      if (compList.length > 0 && (!currentCompany || !compList.find(c => c.id === currentCompany.id))) {
        setCurrentCompany(compList[0]);
      } else if (compList.length === 0) {
        setCurrentCompany(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => { refetch(); }, [user]);

  // Refetch companies when org changes
  useEffect(() => {
    if (!currentOrg) return;
    (async () => {
      const { data: comps } = await supabase
        .from('capassi_companies' as any)
        .select('*')
        .eq('organization_id', currentOrg.id)
        .order('name');
      const compList = (comps || []) as unknown as Company[];
      setCompanies(compList);
      if (compList.length > 0) {
        setCurrentCompany(compList[0]);
      } else {
        setCurrentCompany(null);
      }
    })();
  }, [currentOrg?.id]);

  return (
    <CapassiContext.Provider value={{
      organizations, companies, currentOrg, currentCompany,
      setCurrentOrg, setCurrentCompany, loading, refetch
    }}>
      {children}
    </CapassiContext.Provider>
  );
}

export function useCapassi() {
  const ctx = useContext(CapassiContext);
  if (!ctx) throw new Error('useCapassi must be used within CapassiProvider');
  return ctx;
}
