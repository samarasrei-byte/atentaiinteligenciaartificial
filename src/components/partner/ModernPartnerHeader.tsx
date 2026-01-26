import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Bell, 
  RefreshCw, 
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface ModernPartnerHeaderProps {
  partnerName: string;
  isActive: boolean;
  newRequestsCount: number;
  onRefresh: () => void;
  onClearNotifications: () => void;
}

export function ModernPartnerHeader({
  partnerName,
  isActive,
  newRequestsCount,
  onRefresh,
  onClearNotifications
}: ModernPartnerHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 border-4 border-emerald-500/30 shadow-lg shadow-emerald-500/20">
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-xl font-bold">
                {partnerName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'P'}
              </AvatarFallback>
            </Avatar>
            {isActive && (
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                {partnerName}
              </h1>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 gap-1">
                <Sparkles className="h-3 w-3" />
                Parceiro Ativo
              </Badge>
            </div>
            <p className="text-slate-300 text-sm">
              Painel de Gerenciamento de Serviços
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {newRequestsCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              <Button 
                variant="outline" 
                size="sm"
                onClick={onClearNotifications}
                className="bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
              >
                <Bell className="h-4 w-4 mr-2" />
                {newRequestsCount} nova{newRequestsCount > 1 ? 's' : ''}
              </Button>
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-amber-500 rounded-full animate-ping" />
            </motion.div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onRefresh}
            className="text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
