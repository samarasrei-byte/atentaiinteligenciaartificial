import React, { ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import AppSidebar from './AppSidebar';

export interface DashboardLayoutProps {
  children: ReactNode;
  variant: 'admin' | 'contador' | 'empresa' | 'autonomo' | 'partner' | 'user';
  activeTab: string;
  onTabChange: (tab: string) => void;
  header?: ReactNode;
  /** Custom sidebar component for panels that use their own sidebar implementation */
  customSidebar?: ReactNode;
  /** Whether to show the default AppSidebar */
  showDefaultSidebar?: boolean;
}

/**
 * DashboardLayout - Layout Master Unificado para todos os painéis
 * 
 * Garante:
 * - Sidebar fixa
 * - Header fixo (sticky)
 * - Conteúdo com min-height que preenche a viewport
 * - Nenhum espaço em branco no rodapé
 * - Scroll apenas quando necessário
 */
export function DashboardLayout({
  children,
  variant,
  activeTab,
  onTabChange,
  header,
  customSidebar,
  showDefaultSidebar = true,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      {showDefaultSidebar && !customSidebar && (
        <div className="hidden lg:block">
          <AppSidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            variant={variant}
            activeTab={activeTab}
            onTabChange={onTabChange}
          />
        </div>
      )}

      {/* Sidebar - Mobile */}
      {showDefaultSidebar && !customSidebar && (
        <div
          className={cn(
            'lg:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <AppSidebar
            collapsed={false}
            onToggle={() => setMobileMenuOpen(false)}
            variant={variant}
            activeTab={activeTab}
            onTabChange={(tab) => {
              onTabChange(tab);
              setMobileMenuOpen(false);
            }}
          />
        </div>
      )}

      {/* Custom Sidebar */}
      {customSidebar}

      {/* Main Content Area - fills remaining space */}
      <main
        className={cn(
          'flex-1 flex flex-col min-h-screen w-full min-w-0 transition-all duration-300',
          showDefaultSidebar && !customSidebar && (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64')
        )}
      >
        {/* Header - if provided as prop, render it; otherwise render mobile menu button */}
        {header ? (
          header
        ) : (
          <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border px-4 lg:px-6 py-4 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </header>
        )}

        {/* Content Area - flex-1 ensures it fills all available space */}
        <div className="flex-1 p-4 lg:p-6 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
