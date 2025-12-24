import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Calculator,
  Users,
  Zap,
  ArrowRight,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react';
import MEIFlow from '@/components/abertura/MEIFlow';
import AutonomoMEFlow from '@/components/abertura/AutonomoMEFlow';

const AberturaEmpresa: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFlow, setSelectedFlow] = useState<'selection' | 'mei' | 'autonomo-me'>('selection');

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (selectedFlow === 'mei') {
    return <MEIFlow onBack={() => setSelectedFlow('selection')} />;
  }

  if (selectedFlow === 'autonomo-me') {
    return <AutonomoMEFlow onBack={() => setSelectedFlow('selection')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="text-white/60 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Abertura de Empresa
            </h1>
            <p className="text-white/60 text-sm mt-1">
              Formalize seu negócio com o suporte da nova Reforma Tributária
            </p>
          </div>
        </div>

        {/* Reform Alert */}
        <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Reforma Tributária 2024/2025
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  Com as mudanças trazidas pela <strong className="text-amber-400">EC 132/2023</strong> e <strong className="text-amber-400">LC 214/2025</strong>, 
                  a formalização do seu negócio ficou ainda mais importante. O novo sistema tributário traz benefícios 
                  significativos para empresas formalizadas, incluindo simplificação de impostos e possibilidade de 
                  aproveitamento de créditos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flow Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* MEI Flow Card */}
          <Card 
            className="bg-slate-800/50 border-slate-700/50 hover:border-emerald-500/50 transition-all cursor-pointer group relative overflow-hidden"
            onClick={() => setSelectedFlow('mei')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="flex items-start justify-between">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4">
                  <User className="h-7 w-7 text-white" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  100% Digital
                </Badge>
              </div>
              <CardTitle className="text-xl text-white">
                Abrir MEI
              </CardTitle>
              <CardDescription className="text-white/60">
                Microempreendedor Individual
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Faturamento até R$ 81.000/ano</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Processo 100% automatizado pelo sistema</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Sem necessidade de contador</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Emissão de NFS-e integrada</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-white/60">~15 minutos</span>
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    Começar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Autônomo / ME Flow Card */}
          <Card 
            className="bg-slate-800/50 border-slate-700/50 hover:border-primary/50 transition-all cursor-pointer group relative overflow-hidden"
            onClick={() => setSelectedFlow('autonomo-me')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="relative">
              <div className="flex items-start justify-between">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4">
                  <Building2 className="h-7 w-7 text-white" />
                </div>
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  Assistido
                </Badge>
              </div>
              <CardTitle className="text-xl text-white">
                Autônomo / ME
              </CardTitle>
              <CardDescription className="text-white/60">
                Microempresa ou Profissional Liberal
              </CardDescription>
            </CardHeader>
            <CardContent className="relative space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Faturamento acima de R$ 81.000/ano</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Diagnóstico inteligente do melhor regime</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Contadores parceiros especializados</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/70">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  <span>Acompanhamento completo do processo</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm text-white/60">Com contador</span>
                  </div>
                  <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
                    Iniciar Análise
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Benefits Section */}
        <Card className="bg-slate-800/30 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Por que formalizar com a Reforma Tributária?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-medium text-white">Aproveitamento de Créditos</h4>
                <p className="text-sm text-white/60">
                  O novo IVA permite recuperar créditos de impostos pagos, reduzindo sua carga tributária final.
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-emerald-400" />
                </div>
                <h4 className="font-medium text-white">Simplicidade Tributária</h4>
                <p className="text-sm text-white/60">
                  Menos impostos, menos burocracia. O IBS e CBS substituem 5 tributos diferentes.
                </p>
              </div>
              <div className="space-y-2">
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-amber-400" />
                </div>
                <h4 className="font-medium text-white">Segurança Jurídica</h4>
                <p className="text-sm text-white/60">
                  Empresa formalizada tem proteção legal, pode emitir notas e acessar linhas de crédito.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <p className="text-center text-xs text-white/40 mt-8">
          O sistema auxilia no processo de formalização, mas não substitui orientação jurídica ou contábil quando necessário.
          Valores e regras podem variar conforme legislação vigente.
        </p>
      </div>
    </div>
  );
};

export default AberturaEmpresa;
