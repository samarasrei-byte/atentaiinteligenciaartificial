import React, { useState } from 'react';
import { 
  ChevronRight, ChevronLeft, CheckCircle2, 
  Loader2, FileText, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useServiceStatus, ServiceType } from '@/hooks/useServiceStatus';

interface AdminStatusControlProps {
  serviceType: ServiceType;
  requestId: string;
  onStatusChange?: (newStepIndex: number) => void;
}

const SERVICE_COLORS: Record<ServiceType, { bg: string; text: string }> = {
  'limpanome': { bg: 'bg-emerald-500/10', text: 'text-emerald-600' },
  'analise-fiscal': { bg: 'bg-violet-500/10', text: 'text-violet-600' },
  };
};

export const AdminStatusControl: React.FC<AdminStatusControlProps> = ({
  serviceType,
  requestId,
  onStatusChange,
}) => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const {
    currentStepIndex,
    updateStatus,
    steps,
    totalSteps,
    lastUpdatedAt,
  } = useServiceStatus(serviceType, requestId);

  const colors = SERVICE_COLORS[serviceType];
  const currentStep = steps[currentStepIndex];
  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100;

  const handleAdvanceStep = async () => {
    if (currentStepIndex >= totalSteps - 1) return;
    
    setIsUpdating(true);
    const newIndex = currentStepIndex + 1;
    
    const success = await updateStatus(newIndex);
    
    if (success) {
      toast({
        title: 'Status atualizado',
        description: `Avançado para: ${steps[newIndex].label}`,
      });
      onStatusChange?.(newIndex);
    } else {
      toast({
        title: 'Erro ao atualizar',
        description: 'Tente novamente.',
        variant: 'destructive',
      });
    }
    
    setIsUpdating(false);
  };

  const handleRegressStep = async () => {
    if (currentStepIndex <= 0) return;
    
    setIsUpdating(true);
    const newIndex = currentStepIndex - 1;
    
    const success = await updateStatus(newIndex);
    
    if (success) {
      toast({
        title: 'Status retrocedido',
        description: `Voltou para: ${steps[newIndex].label}`,
      });
      onStatusChange?.(newIndex);
    } else {
      toast({
        title: 'Erro ao atualizar',
        variant: 'destructive',
      });
    }
    
    setIsUpdating(false);
  };

  const handleDirectSelect = async (stepIndexStr: string) => {
    const newIndex = parseInt(stepIndexStr);
    if (newIndex === currentStepIndex) return;
    
    setIsUpdating(true);
    
    const success = await updateStatus(newIndex);
    
    if (success) {
      toast({
        title: 'Status alterado',
        description: `Definido como: ${steps[newIndex].label}`,
      });
      onStatusChange?.(newIndex);
    } else {
      toast({
        title: 'Erro ao atualizar',
        variant: 'destructive',
      });
    }
    
    setIsUpdating(false);
  };

  return (
    <div className={cn('rounded-xl border p-4 space-y-4', colors.bg, 'border-border/50')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Controle de Status
          </Badge>
          <span className="text-xs text-muted-foreground">
            {currentStepIndex + 1}/{totalSteps}
          </span>
        </div>
        {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {/* Current Status */}
      <div className="flex items-center gap-3">
        <div className={cn('p-2 rounded-lg', colors.bg)}>
          <FileText className={cn('h-5 w-5', colors.text)} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{currentStep?.label}</p>
          {lastUpdatedAt && (
            <p className="text-xs text-muted-foreground">
              Última atualização: {lastUpdatedAt.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progressPercent} className="h-2" />

      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRegressStep}
          disabled={currentStepIndex <= 0 || isUpdating}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>

        <Select
          value={currentStepIndex.toString()}
          onValueChange={handleDirectSelect}
          disabled={isUpdating}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Selecionar etapa" />
          </SelectTrigger>
          <SelectContent>
            {steps.map((step, index) => (
              <SelectItem key={step.id} value={index.toString()}>
                <div className="flex items-center gap-2">
                  {index < currentStepIndex ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : index === currentStepIndex ? (
                    <Clock className="h-4 w-4 text-primary" />
                  ) : (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{step.label}</span>
                  {index === currentStepIndex && (
                    <Badge variant="secondary" className="text-[10px] ml-auto">Atual</Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="default"
          size="sm"
          onClick={handleAdvanceStep}
          disabled={currentStepIndex >= totalSteps - 1 || isUpdating}
          className="gap-1"
        >
          Avançar
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Quick Complete */}
      {currentStepIndex < totalSteps - 1 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          onClick={() => handleDirectSelect((totalSteps - 1).toString())}
          disabled={isUpdating}
        >
          <CheckCircle2 className="h-4 w-4" />
          Marcar como Concluído
        </Button>
      )}

      {currentStepIndex === totalSteps - 1 && (
        <div className="flex items-center justify-center gap-2 text-emerald-600 text-sm font-medium">
          <CheckCircle2 className="h-5 w-5" />
          Processo Concluído
        </div>
      )}
    </div>
  );
};

export default AdminStatusControl;
