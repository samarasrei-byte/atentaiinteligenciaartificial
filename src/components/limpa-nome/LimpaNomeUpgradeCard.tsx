import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Building2, 
  Calculator, 
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface LimpaNomeUpgradeCardProps {
  className?: string;
}

export function LimpaNomeUpgradeCard({ className }: LimpaNomeUpgradeCardProps) {
  const navigate = useNavigate();

  const upgrades = [
    {
      icon: Building2,
      title: 'Abertura de Empresa',
      description: 'Formalize seu negócio com nossa assessoria',
      route: '/servicos',
    },
    {
      icon: Calculator,
      title: 'Análise Fiscal',
      description: 'Identifique oportunidades de economia',
      route: '/servicos',
    },
    {
      icon: TrendingUp,
      title: 'BI + Contabilidade',
      description: 'Organize suas finanças com inteligência',
      route: '/bi-contabilidade',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={className}
    >
      <Card className="border-dashed border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Quer ir além?</h3>
              <p className="text-sm text-slate-500">
                Aproveite para organizar sua vida financeira
              </p>
            </div>
          </div>

          {/* Upgrade options */}
          <div className="space-y-3 mb-4">
            {upgrades.map((upgrade, index) => {
              const Icon = upgrade.icon;
              return (
                <button
                  key={index}
                  onClick={() => navigate(upgrade.route)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-violet-200 hover:bg-violet-50/50 transition-all text-left group"
                >
                  <div className="h-9 w-9 rounded-lg bg-slate-100 group-hover:bg-violet-100 flex items-center justify-center transition-colors">
                    <Icon className="h-4 w-4 text-slate-600 group-hover:text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 group-hover:text-violet-800">
                      {upgrade.title}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {upgrade.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-violet-500 shrink-0" />
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <Button 
            variant="outline"
            className="w-full border-violet-200 text-violet-700 hover:bg-violet-50"
            onClick={() => navigate('/servicos')}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Ver opções
          </Button>

          <p className="text-xs text-center text-slate-400 mt-3">
            Seu serviço Limpa Nome não será afetado
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
