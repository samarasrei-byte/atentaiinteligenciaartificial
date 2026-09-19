import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { dateBR } from '@/lib/difal/format';
import { Bell, ExternalLink, Loader2, Search } from 'lucide-react';

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

const severidadeLabel: Record<string, string> = {
  info: 'Informativo',
  atencao: 'Atenção',
  critico: 'Crítico',
};

const severidadeVariant = (severidade: string): 'default' | 'secondary' | 'destructive' => {
  if (severidade === 'critico') return 'destructive';
  if (severidade === 'atencao') return 'default';
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
    () => Array.from(new Set((data ?? []).map((alerta) => alerta.uf).filter(Boolean) as string[])).sort(),
    [data],
  );

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (data ?? []).filter((alerta) => {
      if (uf !== 'todas' && alerta.uf !== uf) return false;
      if (!termo) return true;
      return [alerta.titulo, alerta.resumo ?? '', alerta.norma ?? ''].join(' ').toLowerCase().includes(termo);
    });
  }, [data, busca, uf]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Alertas legislativos</h1>
        <p className="text-sm text-muted-foreground">
          Atualizações publicadas que podem afetar a análise de DIFAL das suas operações.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base">Filtros de Alerta</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título, resumo ou norma..."
              className="pl-9 w-full"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
            />
          </div>
          <Select value={uf} onValueChange={setUf}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filtrar por Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todos os estados</SelectItem>
              {ufs.map((estado) => <SelectItem key={estado} value={estado}>{estado}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="py-12 flex justify-center" aria-label="Carregando alertas">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtrados.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-2">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              Não há alertas legislativos publicados para os filtros selecionados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtrados.map((alerta) => (
            <Card key={alerta.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={severidadeVariant(alerta.severidade)}>
                        {severidadeLabel[alerta.severidade] ?? alerta.severidade}
                      </Badge>
                      {alerta.uf && <Badge variant="outline" className="bg-muted/50">{alerta.uf}</Badge>}
                    </div>
                    {alerta.vigencia_em && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-secondary/50 text-muted-foreground">
                        Vigência: {dateBR(alerta.vigencia_em)}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight mb-2">{alerta.titulo}</h2>
                    {alerta.resumo && <p className="text-sm text-muted-foreground leading-relaxed">{alerta.resumo}</p>}
                  </div>
                </div>
                
                <div className="bg-muted/30 px-6 py-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    {alerta.norma && <span className="font-medium text-foreground/80">Norma: {alerta.norma}</span>}
                    <span className="flex items-center gap-1.5"><Bell className="h-3.5 w-3.5" /> Publicado em {dateBR(alerta.created_at)}</span>
                  </div>
                  {alerta.fonte_url && (
                    <a
                      href={alerta.fonte_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      Consultar fonte oficial <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
