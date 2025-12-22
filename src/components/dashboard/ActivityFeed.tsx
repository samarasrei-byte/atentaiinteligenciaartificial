import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, MessageSquare, Calculator, Users, DollarSign, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityItem {
  id: string;
  type: 'message' | 'simulation' | 'consultation' | 'payment' | 'signup' | 'other';
  title: string;
  description: string;
  timestamp: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  title?: string;
  maxItems?: number;
}

const typeConfig = {
  message: { icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
  simulation: { icon: Calculator, color: 'text-info', bg: 'bg-info/10' },
  consultation: { icon: Users, color: 'text-accent', bg: 'bg-accent/10' },
  payment: { icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
  signup: { icon: UserPlus, color: 'text-primary', bg: 'bg-primary/10' },
  other: { icon: Activity, color: 'text-muted-foreground', bg: 'bg-muted' },
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  title = 'Atividades Recentes',
  maxItems = 5,
}) => {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card className="bg-card border-border shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayActivities.map((activity) => {
              const config = typeConfig[activity.type];
              const Icon = config.icon;
              
              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={cn('p-2 rounded-lg shrink-0', config.bg)}>
                    <Icon className={cn('h-4 w-4', config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.timestamp}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
