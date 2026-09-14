import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { formatCNPJ, isValidCNPJ } from '@/lib/difal/format';
import { UFS } from '@/lib/difal/types';
import { Loader2, Save } from 'lucide-react';

interface Empresa {
  id: string;
  razao_social: string;
  nome_fantasia: string | null;
  cnpj: string;
  uf: string;
  inscricao_estadual: string | null;
  regime_tributario: string;
  responsavel_fiscal: string | null;
  atividade_economica: string | null;
}

const REGIMES = [
  { value: 'simples_nacional', label: 'Simples Nacional' },
  { value: 'lucro_presumido', label: 'Lucro Presumido' },
  { value: 'lucro_real', label: 'Lucro Real' },
  { value: 'mei', label: 'MEI' },
];

export default function DifalConfiguracoes() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    uf: 'SP',
    inscricao_estadual: '',
    regime_tributario: 'simples_nacional',
    responsavel_fiscal: '',
    atividade_economica: '',
  });

  const { data: empresa, isLoading } = useQuery({
    queryKey: ['difal-empresa'],
    queryFn: async (): Promise<Empresa | null> => {
      const { data, error } = await supabase
        .from('difal_companies')
        .select('id, razao_social, nome_fantasia, cnpj, uf, inscricao_estadual, regime_tributario, responsavel_fiscal, atividade_economica')
        .is('deleted_at', null)
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as Empresa | null) ?? null;
    },
  });

  useEffect(() => {
    if (!empresa) return;
    setForm({
      razao_social: empresa.razao_social ?? '',
      nome_fantasia: empresa.nome_fantasia ?? '',
      cnpj: formatCNPJ(empresa.cnpj ?? ''),
      uf: empresa.uf ?? 'SP',
      inscricao_estadual: empresa.inscricao_estadual ?? '',
      regime_tributario: empresa.regime_tributario ?? 'simples_nacional',
      responsavel_fiscal: empresa.responsavel_fiscal ?? '',
      atividade_economica: empresa.atividade_economica ?? '',
    });
  }, [empresa]);

  const salvar = async () => {
    if (!form.razao_social.trim()) {
      toast({ title: 'Informe a razão social', variant: 'destructive' });
      return;
    }
    if (!isValidCNPJ(form.cnpj)) {
      toast({ title: 'CNPJ inválido', description: 'Confira os 14 dígitos do CNPJ.', variant: 'destructive' });
      return;
    }
    setSalvando(true);
    const payload = {
      razao_social: form.razao_social.trim(),
      nome_fantasia: form.nome_fantasia.trim() || null,
      cnpj: form.cnpj.replace(/\D/g, ''),
      uf: form.uf,
      inscricao_estadual: form.inscricao_estadual.trim() || null,
      regime_tributario: form.regime_tributario,
      responsavel_fiscal: form.responsavel_fiscal.trim() || null,
      atividade_economica: form.atividade_economica.trim() || null,
    };

    let error;
    if (empresa) {
      ({ error } = await supabase.from('difal_companies').update(payload).eq('id', empresa.id));
    } else {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        setSalvando(false);
        toast({ title: 'Sessão expirada', description: 'Entre novamente para salvar.', variant: 'destructive' });
        return;
      }
      ({ error } = await supabase.from('difal_companies').insert({ ...payload, owner_id: uid }));
    }
    setSalvando(false);
    if (error) {
      toast({ title: 'Não foi possível salvar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Configurações salvas' });
    qc.invalidateQueries({ queryKey: ['difal-empresa'] });
  };

  if (isLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações do módulo</h1>
        <p className="text-sm text-muted-foreground">
          Dados da empresa usados nas simulações e no cabeçalho dos relatórios em PDF.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados da empresa</CardTitle>
          <CardDescription>Informações exibidas nos relatórios gerados pelo módulo.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="razao">Razão social *</Label>
            <Input id="razao" value={form.razao_social} onChange={(e) => setForm({ ...form, razao_social: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fantasia">Nome fantasia</Label>
            <Input id="fantasia" value={form.nome_fantasia} onChange={(e) => setForm({ ...form, nome_fantasia: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cnpj">CNPJ *</Label>
            <Input id="cnpj" value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: formatCNPJ(e.target.value) })} placeholder="00.000.000/0000-00" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="uf">UF da empresa</Label>
            <Select value={form.uf} onValueChange={(v) => setForm({ ...form, uf: v })}>
              <SelectTrigger id="uf"><SelectValue /></SelectTrigger>
              <SelectContent>
                {UFS.map((u) => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ie">Inscrição estadual</Label>
            <Input id="ie" value={form.inscricao_estadual} onChange={(e) => setForm({ ...form, inscricao_estadual: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="regime">Regime tributário</Label>
            <Select value={form.regime_tributario} onValueChange={(v) => setForm({ ...form, regime_tributario: v })}>
              <SelectTrigger id="regime"><SelectValue /></SelectTrigger>
              <SelectContent>
                {REGIMES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="resp">Responsável fiscal</Label>
            <Input id="resp" value={form.responsavel_fiscal} onChange={(e) => setForm({ ...form, responsavel_fiscal: e.target.value })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="ativ">Atividade econômica principal</Label>
            <Input id="ativ" value={form.atividade_economica} onChange={(e) => setForm({ ...form, atividade_economica: e.target.value })} />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <Button onClick={salvar} disabled={salvando}>
              {salvando ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar configurações
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Base de regras <Badge variant="secondary">Dados demonstrativos</Badge>
          </CardTitle>
          <CardDescription>
            As regras por estado atualmente carregadas são exemplos para demonstração. Um administrador autorizado deve
            revisar e cadastrar as regras oficiais antes do uso fiscal.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Integrações com ERP, marketplaces, notas fiscais e SEFAZ não estão ativas nesta versão: todos os dados são
          informados manualmente.
        </CardContent>
      </Card>
    </div>
  );
}
