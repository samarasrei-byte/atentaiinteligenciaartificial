import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PartnerTheme } from '@/hooks/usePartnerTheme';
import { cn } from '@/lib/utils';

interface PartnerThemeToggleProps {
  theme: PartnerTheme;
  onToggle: () => void;
  className?: string;
}

export function PartnerThemeToggle({ theme, onToggle, className }: PartnerThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className={cn(
        'gap-2 transition-all',
        isDark 
          ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' 
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
        className
      )}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4 text-amber-400" />
          <span className="hidden sm:inline">Modo Claro</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 text-slate-600" />
          <span className="hidden sm:inline">Modo Escuro</span>
        </>
      )}
    </Button>
  );
}
