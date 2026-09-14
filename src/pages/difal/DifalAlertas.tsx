import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dateBR } from '@/lib/difal/format';
import { Bell, ExternalLink, Loader2 } from 'lucide-react';

interface AlertaRow {
  id: string;
  titulo: string;
  resumo: string | null;
  severidade: string;
  uf: string | null;
  norma: string | null;
  fonte_url: string | null;
  vigencia_em: string | null;
  created_at: string;
}

const severidadeVariant = (s: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (s === 'alta' || s === 'critica') return 'destructive';
  if (s === 'media') return 'default';
  return 'secondary';
};

export default function DifalAlertas() {
  const [busca, setBusca] = useState('');
  const [uf, setUf] = useState('todas');

  const { data, isLoading } = useQuery({
    queryKey: ['difal-alertas'],
    queryFn: async (): Promise<AlertaRow[]> => {
      const { data, error } = await supabase
        .from('difal_legislative_alerts')
        .select('id, titulo, resumo, severidade, uf, norma, fonte_url, vigencia_em, created_at')
        .eq('publicado', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as AlertaRow[];
    },
  });

  const ufs = useMemo(
    () => Array.from(new Set((data ?? []).map((a) => a.uf).filter(Boolean) as string[])).sort(),
    [data],
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (data ?? []).filter((a) => {
      if (uf !== 'todas' && a.uf !== uf) return false;
      if (!termo) return true;
      return [a.titulo, a.resumo ?? '', a.norma ?? ''].join(' ').toLowerCase().includes(termo);
    });
  }, [data, busca, uf]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Alertas legislativos</h1>
        <p className="text-sm text-muted-foreground">
          Mudanças de legislação que podem afetar o cálculo do DIFAL nas suas operações.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Buscar por título, resumo ou norma" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <Select value={uf} onValueChange={setUf}>
            <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos os estados</SelectItem>
              {ufs.map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtrados.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-2">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Nenhum alerta publicado no momento. Os alertas aparecem aqui quando um administrador autorizado publica
              uma atualização de legislação.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtrados.map((a) => (
            <Card key={a.id}>
              <CardContent className="pt-6 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={severidadeVariant(a.severidade)}>{a.severidade}</Badge>
                  {a.uf && <Badge variant="outline">{a.uf}</Badge>}
                  {a.vigencia_em && (
                    <span className="text-xs text-muted-foreground">Vigência: {dateBR(a.vigencia_em)}</span>
                  )}
                </div>
                <h2 className="font-semibold tracking-tight">{a.titulo}</h2>
                {a.resumo && <p className="text-sm text-muted-foreground">{a.resumo}</p>}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  {a.norma && <span>Norma: {a.norma}</span>}
                  {a.fonte_url && (
                    <a
                      href={a.fonte_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Ver fonte oficial <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <span>Publicado em {dateBR(a.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
