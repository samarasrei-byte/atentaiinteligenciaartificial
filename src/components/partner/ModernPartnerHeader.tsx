import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
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
  isDark?: boolean;
}

export function ModernPartnerHeader({
  partnerName,
  isActive,
  newRequestsCount,
  onRefresh,
  onClearNotifications,
  isDark = false
}: ModernPartnerHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className={cn(
        "rounded-2xl border shadow-lg p-6",
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      )}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className={cn(
                "h-16 w-16 border-4 shadow-lg",
                isDark ? 'border-emerald-900/50' : 'border-emerald-100'
              )}>
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white text-xl font-bold">
                  {partnerName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'P'}
                </AvatarFallback>
              </Avatar>
              {isActive && (
                <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  <CheckCircle className="h-3 w-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className={cn(
                  "text-2xl lg:text-3xl font-bold",
                  isDark ? 'text-white' : 'text-slate-900'
                )}>
                  {partnerName}
                </h1>
                <Badge className={cn(
                  "gap-1 font-medium",
                  isDark 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                    : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                )}>
                  <Sparkles className="h-3 w-3" />
                  Parceiro Ativo
                </Badge>
              </div>
              <p className={cn("text-sm", isDark ? 'text-slate-400' : 'text-slate-600')}>
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
                  className={cn(
                    "font-medium",
                    isDark 
                      ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
                      : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                  )}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {newRequestsCount} nova{newRequestsCount > 1 ? 's' : ''}
                </Button>
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-amber-500 rounded-full animate-ping" />
              </motion.div>
            )}
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={onRefresh}
              className={cn(
                isDark 
                  ? 'border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700'
                  : 'border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
