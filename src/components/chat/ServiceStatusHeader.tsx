import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  CheckCircle2, 
  Clock,
  Shield,
  Scale,
  BarChart3
} from 'lucide-react';

export type ServiceType = 'limpanome' | 'analise-fiscal';

interface ServiceStep {
  id: string;
  label: string;
}

const SERVICE_STEPS: Record<ServiceType, ServiceStep[]> = {
  'limpanome': [
    { id: 'received', label: 'Solicitação recebida' },
    { id: 'documents', label: 'Documentos analisados' },
    { id: 'pending', label: 'Pendência identificada' },
    { id: 'negotiation', label: 'Negociação em andamento' },
    { id: 'deal', label: 'Acordo fechado' },
    { id: 'completed', label: 'Limpa Nome concluído' },
  ],
  'analise-fiscal': [
    { id: 'received', label: 'Solicitação recebida' },
    { id: 'collecting', label: 'Coleta de documentos' },
    { id: 'analysis', label: 'Análise técnica' },
    { id: 'opportunities', label: 'Oportunidades encontradas' },
    { id: 'adjustments', label: 'Ajustes / regularização' },
    { id: 'completed', label: 'Análise concluída' },
  ],
  'bi-contabilidade': [
    { id: 'received', label: 'Solicitação recebida' },
    { id: 'collecting', label: 'Coleta de documentos' },
    { id: 'ai_processing', label: 'Processamento com IA' },
    { id: 'validation', label: 'Validação humana' },
    { id: 'insights', label: 'Insights prontos' },
    { id: 'completed', label: 'Relatório entregue' },
  ],
};

const SERVICE_CONFIG: Record<ServiceType, { 
  icon: React.ElementType; 
  color: string;
  bgColor: string;
}> = {
  'limpanome': {
    icon: Shield,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  'analise-fiscal': {
    icon: Scale,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
  },
  'bi-contabilidade': {
    icon: BarChart3,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
  },
};

interface ServiceStatusHeaderProps {
  serviceType: ServiceType;
  currentStepIndex: number;
  lastUpdatedAt?: Date;
  className?: string;
}

/**
 * Header de status do serviço - fixo no topo do chat
 * Mostra progresso visual claro e etapa atual
 */
export const ServiceStatusHeader: React.FC<ServiceStatusHeaderProps> = ({
  serviceType,
  currentStepIndex,
  lastUpdatedAt,
  className,
}) => {
  const steps = SERVICE_STEPS[serviceType];
  const config = SERVICE_CONFIG[serviceType];
  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;
  const ServiceIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'px-4 sm:px-6 py-4 bg-white border-b border-border/50',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-9 w-9 rounded-lg flex items-center justify-center',
            config.bgColor
          )}>
            <FileText className={cn('h-4 w-4', config.color)} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Status atual</p>
            <p className={cn('font-semibold text-sm', config.color)}>
              {currentStep?.label || 'Aguardando'}
            </p>
          </div>
        </div>
        
        <Badge 
          variant="outline" 
          className="shrink-0 font-mono text-xs px-2.5 py-1 bg-muted/50"
        >
          {currentStepIndex + 1}/{totalSteps}
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <Progress 
          value={progressPercent} 
          className="h-2 bg-muted/60" 
        />
        {/* Step indicators */}
        <div className="absolute inset-0 flex justify-between items-center px-0.5">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-2 w-2 rounded-full transition-all duration-300',
                index < currentStepIndex 
                  ? 'bg-emerald-500' 
                  : index === currentStepIndex
                    ? 'bg-primary ring-2 ring-primary/30'
                    : 'bg-muted-foreground/20'
              )}
            />
          ))}
        </div>
      </div>

      {/* Last update time */}
      {lastUpdatedAt && (
        <div className="flex items-center gap-1.5 mt-2.5 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            Última atualização: {lastUpdatedAt.toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default ServiceStatusHeader;
