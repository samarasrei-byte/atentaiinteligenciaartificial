import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  ArrowRight, 
  Shield, 
  BarChart3, 
  FileText, 
  Sparkles,
  CheckCircle2,
  Rocket,
} from 'lucide-react';

export function UpgradeToEmpresaCard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user already has a company profile
  const { data: hasCompany } = useQuery({
    queryKey: ['has-company', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  if (hasCompany) {
    return (
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/20">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">Painel Empresa</h3>
                  <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Você já tem acesso ao painel empresarial completo
                </p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/empresa')}
              className="bg-primary hover:bg-primary/90"
            >
              Acessar
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const benefits = [
    { icon: BarChart3, label: 'BI+ Contabilidade com IA' },
    { icon: FileText, label: 'Análise Fiscal completa' },
    { icon: Shield, label: 'Limpa Nome CNPJ' },
    { icon: Sparkles, label: 'Dashboard empresarial' },
  ];

  return (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-accent/5">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <CardContent className="pt-6 relative">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-foreground">Evolua para Empresa</h3>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                    Novo
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Transforme seu painel autônomo em um painel empresarial completo
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                <benefit.icon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-xs text-foreground font-medium">{benefit.label}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <Button 
              onClick={() => navigate('/onboarding')}
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold"
              size="lg"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Criar Painel Empresa
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              Seu painel autônomo continua ativo
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
