import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { 
  Clock, 
  FileSearch, 
  Handshake, 
  CheckCircle,
  AlertCircle,
  FileText,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LimpaNomeStatusCardProps {
  status: string;
  paymentStatus: string;
  documentsReceived?: boolean;
  className?: string;
}

const statusConfig: Record<string, { 
  label: string; 
  description: string; 
  icon: any; 
  color: string;
  progress: number;
}> = {
  'pending': {
    label: 'Aguardando envio de documentos',
    description: 'Envie os documentos pelo chat para iniciarmos seu atendimento.',
    icon: FileText,
    color: 'bg-amber-500',
    progress: 20,
  },
  'documents_received': {
    label: 'Documentos recebidos – Em análise',
    description: 'Nossos especialistas estão analisando suas pendências.',
    icon: FileSearch,
    color: 'bg-blue-500',
    progress: 40,
  },
  'in_progress': {
    label: 'Pendência identificada',
    description: 'Identificamos as restrições e estamos preparando a estratégia.',
    icon: AlertCircle,
    color: 'bg-violet-500',
    progress: 55,
  },
  'negotiating': {
    label: 'Negociação em andamento',
    description: 'Estamos em negociação direta com os credores.',
    icon: Handshake,
    color: 'bg-indigo-500',
    progress: 75,
  },
  'agreement_reached': {
    label: 'Acordo fechado',
    description: 'Fechamos acordos favoráveis! Aguarde a baixa das restrições.',
    icon: CheckCircle,
    color: 'bg-teal-500',
    progress: 90,
  },
  'completed': {
    label: 'Limpa Nome concluído',
    description: 'Parabéns! Seu CPF/CNPJ foi regularizado com sucesso!',
    icon: Shield,
    color: 'bg-emerald-500',
    progress: 100,
  },
};

export function LimpaNomeStatusCard({ 
  status, 
  paymentStatus,
  documentsReceived,
  className 
}: LimpaNomeStatusCardProps) {
  // Determine effective status
  let effectiveStatus = status;
  if (paymentStatus !== 'paid') {
    effectiveStatus = 'awaiting_payment';
  } else if (status === 'pending' && !documentsReceived) {
    effectiveStatus = 'pending';
  } else if (status === 'pending' && documentsReceived) {
    effectiveStatus = 'documents_received';
  }

  const config = statusConfig[effectiveStatus] || statusConfig['pending'];
  const Icon = config.icon;

  // Payment not done
  if (paymentStatus !== 'paid') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={className}
      >
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-amber-900">Aguardando pagamento</p>
                <p className="text-sm text-amber-700">
                  Finalize o pagamento para iniciar seu atendimento.
                </p>
              </div>
              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                Pendente
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <Card className="overflow-hidden">
        <div className={cn("h-1.5", config.color)} />
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className={cn(
              "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
              config.color.replace('bg-', 'bg-') + '/10'
            )}>
              <Icon className={cn("h-6 w-6", config.color.replace('bg-', 'text-'))} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 truncate">
                  {config.label}
                </h3>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "shrink-0",
                    config.color.replace('bg-', 'bg-') + '/10',
                    config.color.replace('bg-', 'text-'),
                    config.color.replace('bg-', 'border-') + '/30'
                  )}
                >
                  {config.progress}%
                </Badge>
              </div>
              
              <p className="text-sm text-slate-600 mb-3">
                {config.description}
              </p>
              
              {/* Progress bar */}
              <div className="space-y-1.5">
                <Progress value={config.progress} className="h-2" />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Início</span>
                  <span>Concluído</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
