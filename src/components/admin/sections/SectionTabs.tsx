import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  badge?: string;
  isLive?: boolean;
}

export interface TabGroup {
  id: string;
  label: string;
  icon?: LucideIcon;
  tabs: TabItem[];
}

interface SectionTabsProps {
  tabs?: TabItem[];
  groups?: TabGroup[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const SectionTabs: React.FC<SectionTabsProps> = ({
  tabs,
  groups,
  activeTab,
  onTabChange,
  className,
}) => {
  // Render grouped tabs
  if (groups && groups.length > 0) {
    return (
      <div className={cn('border-b border-border/50 bg-muted/20', className)}>
        <div className="flex flex-wrap gap-6 px-6 py-4">
          {groups.map((group) => (
            <div key={group.id} className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.icon && <group.icon className="h-3.5 w-3.5" />}
                {group.label}
              </div>
              <div className="flex items-center gap-1">
                {group.tabs.map((tab) => (
                  <TabButton
                    key={tab.id}
                    tab={tab}
                    isActive={activeTab === tab.id}
                    onClick={() => onTabChange(tab.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Render flat tabs
  if (tabs && tabs.length > 0) {
    return (
      <div className={cn('border-b border-border/50 bg-muted/20', className)}>
        <div className="flex items-center gap-1 px-6 py-3 overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              onClick={() => onTabChange(tab.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
};

interface TabButtonProps {
  tab: TabItem;
  isActive: boolean;
  onClick: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ tab, isActive, onClick }) => {
  const Icon = tab.icon;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
        'touch-manipulation active:scale-[0.98]',
        isActive
          ? 'bg-background text-foreground shadow-sm border border-border/50'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{tab.label}</span>
      
      {tab.isLive && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      )}
      
      {tab.badge && (
        <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
          {tab.badge}
        </span>
      )}
      
      {/* Active indicator line */}
      {isActive && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
      )}
    </button>
  );
};

export default SectionTabs;
