import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Wrapper component for smooth skeleton transitions
interface SkeletonWrapperProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function SkeletonWrapper({ children, className, delay = 0 }: SkeletonWrapperProps) {
  return (
    <div 
      className={cn(
        "animate-in fade-in-0 slide-in-from-bottom-4 duration-500 fill-mode-both",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Animated skeleton item with staggered delay
interface AnimatedSkeletonProps {
  className?: string;
  delay?: number;
}

export function AnimatedSkeleton({ className, delay = 0 }: AnimatedSkeletonProps) {
  return (
    <div 
      className="animate-in fade-in-0 slide-in-from-left-2 duration-300 fill-mode-both"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Skeleton className={className} />
    </div>
  );
}

// Dashboard Skeleton
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <SkeletonWrapper delay={0}>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </SkeletonWrapper>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonWrapper key={i} delay={100 + i * 50}>
            <Card>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          </SkeletonWrapper>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-6">
        <SkeletonWrapper delay={300}>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </CardContent>
          </Card>
        </SkeletonWrapper>
        <SkeletonWrapper delay={400}>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3" style={{ animationDelay: `${450 + i * 50}ms` }}>
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </SkeletonWrapper>
      </div>
    </div>
  );
}

// Card List Skeleton
export function CardListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <SkeletonWrapper key={i} delay={i * 100}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </SkeletonWrapper>
      ))}
    </div>
  );
}

// Profile Skeleton
export function ProfileSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Avatar and Name */}
      <SkeletonWrapper delay={0}>
        <div className="flex flex-col items-center text-center">
          <Skeleton className="h-24 w-24 rounded-full mb-4" />
          <Skeleton className="h-6 w-40 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </SkeletonWrapper>

      {/* Info Cards */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <SkeletonWrapper key={i} delay={150 + i * 100}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          </SkeletonWrapper>
        ))}
      </div>
    </div>
  );
}

// Simulator Skeleton
export function SimulatorSkeleton() {
  return (
    <div className="space-y-6 p-4">
      <SkeletonWrapper delay={0}>
        <div className="text-center mb-6">
          <Skeleton className="h-8 w-64 mx-auto mb-2" />
          <Skeleton className="h-4 w-48 mx-auto" />
        </div>
      </SkeletonWrapper>

      <SkeletonWrapper delay={100}>
        <Card>
          <CardContent className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2" style={{ animationDelay: `${150 + i * 50}ms` }}>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ))}
            <Skeleton className="h-12 w-full rounded-lg mt-4" />
          </CardContent>
        </Card>
      </SkeletonWrapper>

      <SkeletonWrapper delay={300}>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center p-4 rounded-lg bg-muted/50">
                  <Skeleton className="h-3 w-16 mx-auto mb-2" />
                  <Skeleton className="h-6 w-20 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </SkeletonWrapper>
    </div>
  );
}

// Chat Skeleton
export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full animate-in fade-in-0 duration-300">
      {/* Header */}
      <SkeletonWrapper delay={0}>
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </SkeletonWrapper>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <SkeletonWrapper key={i} delay={100 + i * 80}>
            <div className={cn("flex", i % 2 === 0 ? "justify-start" : "justify-end")}>
              <div className={cn("max-w-[75%] space-y-1", i % 2 === 0 ? "items-start" : "items-end")}>
                <Skeleton className={cn("h-12 rounded-2xl", i % 2 === 0 ? "w-48" : "w-36")} />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          </SkeletonWrapper>
        ))}
      </div>

      {/* Input */}
      <SkeletonWrapper delay={500}>
        <div className="p-4 border-t">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </SkeletonWrapper>
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full animate-in fade-in-0 duration-300">
      {/* Header */}
      <SkeletonWrapper delay={0}>
        <div className="flex gap-4 p-4 border-b bg-muted/50">
          {[...Array(cols)].map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </SkeletonWrapper>
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <SkeletonWrapper key={rowIndex} delay={50 + rowIndex * 30}>
          <div className="flex gap-4 p-4 border-b">
            {[...Array(cols)].map((_, colIndex) => (
              <Skeleton key={colIndex} className="h-4 flex-1" />
            ))}
          </div>
        </SkeletonWrapper>
      ))}
    </div>
  );
}

// Page Loading Skeleton
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SkeletonWrapper delay={0}>
        <div className="h-14 border-b bg-background/80 backdrop-blur-lg" />
      </SkeletonWrapper>
      
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <SkeletonWrapper delay={100}>
            <Skeleton className="h-10 w-64" />
          </SkeletonWrapper>
          <SkeletonWrapper delay={150}>
            <Skeleton className="h-4 w-full max-w-lg" />
          </SkeletonWrapper>
          
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {[...Array(6)].map((_, i) => (
              <SkeletonWrapper key={i} delay={200 + i * 80}>
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3 mt-1" />
                  </CardContent>
                </Card>
              </SkeletonWrapper>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Loading Skeleton
export function InlineSkeleton({ className }: { className?: string }) {
  return (
    <span className="animate-in fade-in-0 slide-in-from-left-1 duration-200 inline-block">
      <Skeleton className={cn("h-4 w-20 inline-block", className)} />
    </span>
  );
}

// Panel Loading Skeleton - for profile/role verification
export function PanelLoadingSkeleton({ 
  title = "Carregando...", 
  description = "Verificando seu perfil e permissões" 
}: { 
  title?: string; 
  description?: string;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        <SkeletonWrapper delay={0}>
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-primary/20 to-transparent animate-pulse" />
          </div>
        </SkeletonWrapper>
        
        <SkeletonWrapper delay={100}>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
        </SkeletonWrapper>
        
        <SkeletonWrapper delay={200}>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </SkeletonWrapper>
      </div>
    </div>
  );
}

// Contador Panel Loading Skeleton
export function ContadorPanelSkeleton() {
  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar placeholder */}
      <div className="hidden lg:block w-56 border-r bg-card/50">
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Header */}
        <SkeletonWrapper delay={0}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </SkeletonWrapper>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <SkeletonWrapper key={i} delay={100 + i * 50}>
              <Card>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-20" />
                </CardContent>
              </Card>
            </SkeletonWrapper>
          ))}
        </div>
        
        {/* Content area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonWrapper delay={400}>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full rounded-lg" />
              </CardContent>
            </Card>
          </SkeletonWrapper>
          <SkeletonWrapper delay={500}>
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-36" />
              </CardHeader>
              <CardContent className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </SkeletonWrapper>
        </div>
      </div>
    </div>
  );
}

// Autonomo Panel Loading Skeleton
export function AutonomoPanelSkeleton() {
  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar placeholder */}
      <div className="hidden lg:block w-56 border-r bg-card/50">
        <div className="p-4 space-y-4">
          <Skeleton className="h-10 w-full rounded-lg" />
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Header */}
        <SkeletonWrapper delay={0}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </SkeletonWrapper>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonWrapper key={i} delay={100 + i * 50}>
              <Card className="bg-gradient-to-br from-muted/50 to-transparent">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SkeletonWrapper>
          ))}
        </div>
        
        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <SkeletonWrapper key={i} delay={300 + i * 80}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </SkeletonWrapper>
          ))}
        </div>
      </div>
    </div>
  );
}
