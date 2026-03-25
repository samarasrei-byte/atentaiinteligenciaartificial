import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Brain, FileText, Upload, CheckCircle2, AlertCircle,
  RefreshCw, Clock, Eye, User, Loader2, BarChart3
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface IRDeclaration {
  id: string;
  user_id: string;
  fiscal_year: number;
  declaration_type: string;
  status: string;
  full_name: string | null;
  cpf: string | null;
  total_income_cents: number;
  total_deductions_cents: number;
  tax_due_cents: number;
  refund_cents: number;
  ai_confidence_percent: number | null;
  created_at: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  draft: { label: 'Rascunho', color: 'bg-muted text-muted-foreground', icon: FileText },
  pending_documents: { label: 'Aguardando Docs', color: 'bg-amber-500/10 text-amber-600', icon: Upload },
  processing: { label: 'Processando', color: 'bg-blue-500/10 text-blue-600', icon: Loader2 },
  ai_analysis: { label: 'IA Analisando', color: 'bg-purple-500/10 text-purple-600', icon: Brain },
  review: { label: 'Em Revisão', color: 'bg-indigo-500/10 text-indigo-600', icon: Eye },
  completed: { label: 'Concluída', color: 'bg-emerald-500/10 text-emerald-600', icon: CheckCircle2 },
  error: { label: 'Erro', color: 'bg-destructive/10 text-destructive', icon: AlertCircle },
};

const formatCurrency = (cents: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

export const AdminIRManagement: React.FC = () => {
  const [declarations, setDeclarations] = useState<IRDeclaration[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, string>>({});

  const fetchDeclarations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ir_ai_declarations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    const items = (data || []) as any[];
    setDeclarations(items);

    // Fetch user profiles
    const userIds = [...new Set(items.map((d: any) => d.user_id))];
    if (userIds.length > 0) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', userIds);

      const map: Record<string, string> = {};
      (profileData || []).forEach((p: any) => {
        map[p.user_id] = p.full_name || p.email || 'Usuário';
      });
      setProfiles(map);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDeclarations();

    const channel = supabase
      .channel('admin-ir-declarations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ir_ai_declarations',
      }, () => fetchDeclarations())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const stats = {
    total: declarations.length,
    pending: declarations.filter(d => ['draft', 'pending_documents'].includes(d.status)).length,
    processing: declarations.filter(d => ['processing', 'ai_analysis'].includes(d.status)).length,
    completed: declarations.filter(d => d.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Imposto de Renda — Contador IA
          </h2>
          <p className="text-sm text-muted-foreground">Declarações processadas por inteligência artificial</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDeclarations} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" /> Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <BarChart3 className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Upload className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pendentes</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Brain className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.processing}</p>
              <p className="text-xs text-muted-foreground">Processando</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Concluídas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Declarations List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base">Declarações</CardTitle>
          <CardDescription>Todas as declarações de IR submetidas pelos usuários</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : declarations.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">Nenhuma declaração de IR ainda</p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                As declarações aparecerão aqui quando os usuários iniciarem pelo Contador IA
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {declarations.map(decl => {
                const config = statusConfig[decl.status] || statusConfig.draft;
                const Icon = config.icon;

                return (
                  <div
                    key={decl.id}
                    className="flex items-start gap-4 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-all"
                  >
                    <div className={`p-2.5 rounded-lg ${config.color} shrink-0`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">
                          {decl.full_name || profiles[decl.user_id] || 'Usuário'}
                        </p>
                        <Badge variant="outline" className={`text-[10px] ${config.color}`}>
                          {config.label}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {decl.declaration_type === 'completa' ? 'Completa' : 'Simples'}
                        </Badge>
                        {decl.ai_confidence_percent && (
                          <Badge variant="secondary" className="text-[10px] gap-1">
                            <Brain className="h-3 w-3" />
                            {decl.ai_confidence_percent}% confiança
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ano fiscal: {decl.fiscal_year}
                        {decl.cpf && ` • CPF: ${decl.cpf}`}
                      </p>
                      {decl.status === 'completed' && (
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Renda: {formatCurrency(decl.total_income_cents)}</span>
                          <span>Deduções: {formatCurrency(decl.total_deductions_cents)}</span>
                          {decl.refund_cents > 0 && (
                            <span className="text-emerald-600">Restituição: {formatCurrency(decl.refund_cents)}</span>
                          )}
                          {decl.tax_due_cents > 0 && (
                            <span className="text-destructive">Imposto: {formatCurrency(decl.tax_due_cents)}</span>
                          )}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        {formatDistanceToNow(new Date(decl.created_at), { addSuffix: true, locale: ptBR })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminIRManagement;
