import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { TransitionYearAlerts } from '@/components/alerts/TransitionYearAlerts';
import { CashbackSimulator } from '@/components/calculator/CashbackSimulator';
import { SplitPaymentCalculator } from '@/components/calculator/SplitPaymentCalculator';
import { SelectiveTaxCalculator } from '@/components/calculator/SelectiveTaxCalculator';
import { TaxDeadlineNotifications } from '@/components/notifications/TaxDeadlineNotifications';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Coins, Receipt, FileText, Cigarette, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FreeToolBadge } from '@/components/ui/free-tool-badge';

const FerramentasLC214 = () => {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-5xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Badge className="bg-primary/20 text-primary">
                  <FileText className="h-3 w-3 mr-1" />
                  LC 214/2025
                </Badge>
                <FreeToolBadge variant="compact" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                Ferramentas da Reforma Tributária
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
                Simule o cashback, split payment, imposto seletivo e acompanhe alertas fiscais.
              </p>
              <p className="text-sm text-emerald-600/80 max-w-lg mx-auto">
                ✓ Ferramentas educacionais gratuitas para entender a Reforma Tributária 2026
              </p>
            </div>

            {/* Tabs para as ferramentas */}
            <Tabs defaultValue="alertas" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="alertas" className="flex items-center gap-1">
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Alertas</span>
                </TabsTrigger>
                <TabsTrigger value="prazos" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Prazos</span>
                </TabsTrigger>
                <TabsTrigger value="cashback" className="flex items-center gap-1">
                  <Coins className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Cashback</span>
                </TabsTrigger>
                <TabsTrigger value="split" className="flex items-center gap-1">
                  <Receipt className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">Split</span>
                </TabsTrigger>
                <TabsTrigger value="seletivo" className="flex items-center gap-1">
                  <Cigarette className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs">IS</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="alertas" className="space-y-6">
                <TransitionYearAlerts />
                
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Sobre os Alertas de Transição</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>
                      O período de transição da reforma tributária vai de <strong>2026 a 2033</strong>. 
                      Durante esse período, as alíquotas de IBS e CBS são gradualmente aumentadas 
                      enquanto os tributos antigos (ICMS, ISS, PIS, COFINS) são reduzidos.
                    </p>
                    <p>
                      Acompanhe os alertas para se preparar para as mudanças de cada ano e 
                      ajustar seu planejamento tributário.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prazos" className="space-y-6">
                <TaxDeadlineNotifications />
              </TabsContent>

              <TabsContent value="cashback" className="space-y-6">
                <CashbackSimulator />
              </TabsContent>

              <TabsContent value="split" className="space-y-6">
                <SplitPaymentCalculator />
              </TabsContent>

              <TabsContent value="seletivo" className="space-y-6">
                <SelectiveTaxCalculator />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </PublicLayout>
  );
};

export default FerramentasLC214;