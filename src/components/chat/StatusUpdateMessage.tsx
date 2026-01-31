import React from 'react';
import { motion } from 'framer-motion';
import { 
  RefreshCw, CheckCircle2, Clock, 
  ArrowRight, FileText, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Define types locally to avoid circular dependencies
export type ServiceType = 'limpanome' | 'analise-fiscal' | 'bi-contabilidade';

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

type UpdateType = 'status_change' | 'document_received' | 'document_analyzed' | 'milestone' | 'completion';

interface StatusUpdateMessageProps {
  type: UpdateType;
  serviceType: ServiceType;
  stepIndex: number;
  previousStepIndex?: number;
  documentName?: string;
  linkedStep?: string;
  timestamp: Date;
  isNew?: boolean;
}

const UPDATE_CONFIG: Record<UpdateType, { 
  icon: React.ElementType; 
  bgColor: string; 
  iconColor: string;
  label: string;
}> = {
  'status_change': {
    icon: RefreshCw,
    bgColor: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    label: 'Status atualizado',
  },
  'document_received': {
    icon: FileText,
    bgColor: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
    label: 'Documento recebido',
  },
  'document_analyzed': {
    icon: CheckCircle2,
    bgColor: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    label: 'Documento analisado',
  },
  'milestone': {
    icon: Sparkles,
    bgColor: 'bg-violet-500/10',
    iconColor: 'text-violet-500',
    label: 'Marco alcançado',
  },
  'completion': {
    icon: CheckCircle2,
    bgColor: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    label: 'Processo concluído',
  },
};

export const StatusUpdateMessage: React.FC<StatusUpdateMessageProps> = ({
  type,
  serviceType,
  stepIndex,
  previousStepIndex,
  documentName,
  linkedStep,
  timestamp,
  isNew = false,
}) => {
  const config = UPDATE_CONFIG[type];
  const Icon = config.icon;
  const steps = SERVICE_STEPS[serviceType];
  const currentStep = steps[stepIndex];
  const previousStep = previousStepIndex !== undefined ? steps[previousStepIndex] : null;
  const totalSteps = steps.length;
  const progressPercent = ((stepIndex + 1) / totalSteps) * 100;

  return (
    <motion.div
      initial={isNew ? { opacity: 0, scale: 0.95, y: 10 } : { opacity: 1 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex justify-center my-4'
      )}
    >
      <div className={cn(
        'w-full max-w-md rounded-xl border shadow-sm overflow-hidden',
        'bg-card/90 backdrop-blur-sm border-border/50'
      )}>
        {/* Header */}
        <div className={cn('flex items-center gap-2 px-4 py-2', config.bgColor)}>
          <Icon className={cn('h-4 w-4', config.iconColor)} />
          <span className="text-sm font-medium">{config.label}</span>
          {isNew && (
            <Badge className="ml-auto text-[10px] h-5 bg-primary/90">Novo</Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Step change indicator */}
          {type === 'status_change' && currentStep && (
            <div className="flex items-center justify-center gap-2 text-sm">
              {previousStep && (
                <>
                  <span className="text-muted-foreground line-through">{previousStep.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </>
              )}
              <span className="font-semibold text-foreground">{currentStep.label}</span>
            </div>
          )}

          {/* Document info */}
          {(type === 'document_received' || type === 'document_analyzed') && documentName && (
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{documentName}</span>
              {linkedStep && (
                <Badge variant="outline" className="text-[10px]">
                  Vinculado: {linkedStep}
                </Badge>
              )}
            </div>
          )}

          {/* Completion celebration */}
          {type === 'completion' && (
            <div className="text-center space-y-2">
              <span className="text-2xl">🎉</span>
              <p className="font-semibold text-emerald-600">Processo concluído com sucesso!</p>
            </div>
          )}

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span>{stepIndex + 1}/{totalSteps} etapas</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Timestamp */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground pt-1">
            <Clock className="h-3 w-3" />
            <span>{timestamp.toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatusUpdateMessage;
