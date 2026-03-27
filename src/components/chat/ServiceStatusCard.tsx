import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, Clock, AlertCircle, ArrowRight,
  FileCheck, Search, HandshakeIcon, ShieldCheck, 
  FileText, BarChart3, Lightbulb, Wrench
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export type ServiceType = 'limpanome' | 'analise-fiscal';

export interface ServiceStep {
  id: string;
  label: string;
  icon: React.ElementType;
  status: 'completed' | 'current' | 'pending';
  completedAt?: Date;
}

// Step definitions for each service
export const SERVICE_STEPS: Record<ServiceType, Omit<ServiceStep, 'status' | 'completedAt'>[]> = {
  'limpanome': [
    { id: 'received', label: 'Solicitação recebida', icon: FileText },
    { id: 'documents_analyzed', label: 'Documentos analisados', icon: FileCheck },
    { id: 'pending_identified', label: 'Pendência identificada', icon: Search },
    { id: 'negotiation', label: 'Negociação em andamento', icon: HandshakeIcon },
    { id: 'deal_closed', label: 'Acordo fechado', icon: CheckCircle2 },
    { id: 'completed', label: 'Limpa Nome concluído', icon: ShieldCheck },
  ],
  'analise-fiscal': [
    { id: 'received', label: 'Solicitação recebida', icon: FileText },
    { id: 'collecting_docs', label: 'Coleta de documentos', icon: FileCheck },
    { id: 'technical_analysis', label: 'Análise técnica', icon: Search },
    { id: 'opportunities_found', label: 'Oportunidades encontradas', icon: Lightbulb },
    { id: 'adjustments', label: 'Ajustes / regularização', icon: Wrench },
    { id: 'completed', label: 'Análise concluída', icon: CheckCircle2 },
  ],
  'bi-contabilidade': [
    { id: 'received', label: 'Solicitação recebida', icon: FileText },
    { id: 'collecting_docs', label: 'Coleta de documentos', icon: FileCheck },
    { id: 'ai_processing', label: 'Processamento com IA', icon: BarChart3 },
    { id: 'human_validation', label: 'Validação humana', icon: Search },
    { id: 'insights_ready', label: 'Insights prontos', icon: Lightbulb },
    { id: 'completed', label: 'Relatório entregue', icon: CheckCircle2 },
  ],
};

const SERVICE_COLORS: Record<ServiceType, { bg: string; text: string; progress: string }> = {
  'limpanome': { 
    bg: 'bg-emerald-500/10', 
    text: 'text-emerald-600',
    progress: 'bg-emerald-500'
  },
  'analise-fiscal': { 
    bg: 'bg-violet-500/10', 
    text: 'text-violet-600',
    progress: 'bg-violet-500'
  },
  'bi-contabilidade': { 
    bg: 'bg-indigo-500/10', 
    text: 'text-indigo-600',
    progress: 'bg-indigo-500'
  },
};

interface ServiceStatusCardProps {
  serviceType: ServiceType;
  currentStepIndex: number;
  lastUpdatedAt?: Date;
  className?: string;
  compact?: boolean;
}

export const ServiceStatusCard: React.FC<ServiceStatusCardProps> = ({
  serviceType,
  currentStepIndex,
  lastUpdatedAt,
  className,
  compact = false,
}) => {
  const steps = SERVICE_STEPS[serviceType];
  const colors = SERVICE_COLORS[serviceType];
  const totalSteps = steps.length;
  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;
  const currentStep = steps[currentStepIndex];
  const CurrentIcon = currentStep?.icon || Clock;

  const getStepStatus = (index: number): 'completed' | 'current' | 'pending' => {
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex) return 'current';
    return 'pending';
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-xl border p-3 backdrop-blur-sm',
          colors.bg,
          'border-border/50',
          className
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className={cn('p-1.5 rounded-lg', colors.bg)}>
              <CurrentIcon className={cn('h-4 w-4', colors.text)} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Status atual</p>
              <p className={cn('text-sm font-semibold', colors.text)}>{currentStep?.label}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {currentStepIndex + 1}/{totalSteps}
          </Badge>
        </div>
        <Progress value={progressPercent} className="h-1.5 mt-2" />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border backdrop-blur-sm overflow-hidden',
        'bg-card/80 border-border/50 shadow-lg',
        className
      )}
    >
      {/* Header */}
      <div className={cn('px-4 py-3 border-b border-border/50', colors.bg)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('text-lg', colors.text)}>🟢</span>
            <span className="font-semibold text-sm">{currentStep?.label}</span>
          </div>
          <Badge variant="outline" className="gap-1 text-xs">
            <span className="font-bold">{currentStepIndex + 1}</span>
            <span className="text-muted-foreground">/</span>
            <span>{totalSteps}</span>
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="p-4">
        {/* Visual Progress Bar */}
        <div className="relative mb-4">
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const status = getStepStatus(index);
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300',
                      status === 'completed' && 'bg-emerald-500 text-white',
                      status === 'current' && cn(colors.bg, colors.text, 'ring-2 ring-offset-2', `ring-current`),
                      status === 'pending' && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Connection Line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted -z-10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
              className={cn('h-full', colors.progress)}
            />
          </div>
        </div>

        {/* Step Labels (optional on larger screens) */}
        <div className="hidden sm:flex justify-between text-[10px] text-muted-foreground px-1">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <span 
                key={step.id} 
                className={cn(
                  'text-center max-w-[60px]',
                  status === 'current' && 'font-medium text-foreground'
                )}
              >
                {step.label}
              </span>
            );
          })}
        </div>

        {/* Last Update */}
        {lastUpdatedAt && (
          <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Última ação: {lastUpdatedAt.toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ServiceStatusCard;
