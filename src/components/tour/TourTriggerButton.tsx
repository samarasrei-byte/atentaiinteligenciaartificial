import React from 'react';
import { Button } from '@/components/ui/button';
import { HelpCircle, RotateCcw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface TourTriggerButtonProps {
  onStartTour: () => void;
  onResetTour: () => void;
  hasCompletedTour: boolean;
  className?: string;
}

export function TourTriggerButton({
  onStartTour,
  onResetTour,
  hasCompletedTour,
  className,
}: TourTriggerButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5',
            className
          )}
        >
          <HelpCircle className="h-4 w-4 text-primary" />
          <span className="hidden sm:inline">Ajuda</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={onStartTour} className="cursor-pointer">
          <HelpCircle className="h-4 w-4 mr-2 text-primary" />
          {hasCompletedTour ? 'Ver tour novamente' : 'Iniciar tour guiado'}
        </DropdownMenuItem>
        {hasCompletedTour && (
          <DropdownMenuItem onClick={onResetTour} className="cursor-pointer">
            <RotateCcw className="h-4 w-4 mr-2 text-muted-foreground" />
            Resetar tour
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
