import { useState } from 'react';
import { useCapassi } from '@/contexts/CapassiContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Building2, Plus, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CapassiOrgSelector() {
  const { organizations, companies, currentOrg, currentCompany, setCurrentOrg, setCurrentCompany, refetch } = useCapassi();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showNewOrg, setShowNewOrg] = useState(false);
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('single');
  const [compName, setCompName] = useState('');
  const [compCnpj, setCompCnpj] = useState('');
  const [compType, setCompType] = useState('filial');

  const createOrg = async () => {
    if (!orgName.trim() || !user) return;
    const { error } = await supabase.from('capassi_organizations' as any).insert({
      name: orgName.trim(),
      type: orgType,
      created_by: user.id,
    } as any);
    if (error) { toast({ title: 'Erro ao criar organização', variant: 'destructive' }); return; }
    toast({ title: 'Organização criada!' });
    setOrgName(''); setShowNewOrg(false);
    await refetch();
  };

  const createCompany = async () => {
    if (!compName.trim() || !compCnpj.trim() || !currentOrg) return;
    const { error } = await supabase.from('capassi_companies' as any).insert({
      organization_id: currentOrg.id,
      name: compName.trim(),
      cnpj: compCnpj.trim(),
      type: compType,
    } as any);
    if (error) { toast({ title: 'Erro ao criar empresa', variant: 'destructive' }); return; }
    toast({ title: 'Empresa criada!' });
    setCompName(''); setCompCnpj(''); setShowNewCompany(false);
    await refetch();
  };

  return (
    <div className="space-y-2">
      {/* Org Selector */}
      <div className="flex items-center gap-2">
        <Select
          value={currentOrg?.id || ''}
          onValueChange={(id) => {
            const org = organizations.find(o => o.id === id);
            if (org) setCurrentOrg(org);
          }}
        >
          <SelectTrigger className="flex-1 bg-white/[0.03] border-white/10 text-white/70 h-8 text-xs">
            <Building2 className="h-3 w-3 mr-1.5 text-[#55FFAA]/60" />
            <SelectValue placeholder="Organização" />
          </SelectTrigger>
          <SelectContent>
            {organizations.map(o => (
              <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={showNewOrg} onOpenChange={setShowNewOrg}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/30 hover:text-[#55FFAA] hover:bg-[#55FFAA]/5">
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0d1117] border-white/10 text-white">
            <DialogHeader><DialogTitle>Nova Organização</DialogTitle></DialogHeader>
            <div className="space-y-3 pt-2">
              <Input placeholder="Nome" value={orgName} onChange={e => setOrgName(e.target.value)}
                className="bg-white/5 border-white/10 text-white" />
              <Select value={orgType} onValueChange={setOrgType}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="franchise">Franquia</SelectItem>
                  <SelectItem value="matriz">Matriz</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={createOrg} className="w-full bg-[#55FFAA] text-black hover:bg-[#55FFAA]/80">Criar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Company Selector */}
      {currentOrg && (
        <div className="flex items-center gap-2">
          <Select
            value={currentCompany?.id || ''}
            onValueChange={(id) => {
              const comp = companies.find(c => c.id === id);
              if (comp) setCurrentCompany(comp);
            }}
          >
            <SelectTrigger className="flex-1 bg-white/[0.03] border-white/10 text-white/50 h-8 text-xs">
              <SelectValue placeholder="Empresa" />
            </SelectTrigger>
            <SelectContent>
              {companies.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={showNewCompany} onOpenChange={setShowNewCompany}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/30 hover:text-[#55FFAA] hover:bg-[#55FFAA]/5">
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0d1117] border-white/10 text-white">
              <DialogHeader><DialogTitle>Nova Empresa</DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <Input placeholder="Nome da empresa" value={compName} onChange={e => setCompName(e.target.value)}
                  className="bg-white/5 border-white/10 text-white" />
                <Input placeholder="CNPJ" value={compCnpj} onChange={e => setCompCnpj(e.target.value)}
                  className="bg-white/5 border-white/10 text-white" />
                <Select value={compType} onValueChange={setCompType}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matriz">Matriz</SelectItem>
                    <SelectItem value="filial">Filial</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={createCompany} className="w-full bg-[#55FFAA] text-black hover:bg-[#55FFAA]/80">Criar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
