import React from 'react';
import { TransitionYearAlerts } from '@/components/alerts/TransitionYearAlerts';
import { CashbackSimulator } from '@/components/calculator/CashbackSimulator';
import { SplitPaymentCalculator } from '@/components/calculator/SplitPaymentCalculator';
import { SelectiveTaxCalculator } from '@/components/calculator/SelectiveTaxCalculator';
import { TaxDeadlineNotifications } from '@/components/notifications/TaxDeadlineNotifications';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Coins, Receipt, FileText, Cigarette, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const EmbeddedFerramentasLC214: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/20 text-primary">
            <FileText className="h-3 w-3 mr-1" />
            LC 214/2025
          </Badge>
          <Badge variant="outline" className="border-emerald-500/30 text-emerald-600">
            Gratuito
          </Badge>
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Ferramentas da Reforma Tributária
        </h2>
        <p className="text-muted-foreground">
          Simule o cashback, split payment, imposto seletivo e acompanhe alertas fiscais.
        </p>
      </div>

      {/* Tabs para as ferramentas */}
      <Tabs defaultValue="alertas" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
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

        <TabsContent value="alertas" className="space-y-6 mt-6">
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

        <TabsContent value="prazos" className="space-y-6 mt-6">
          <TaxDeadlineNotifications />
        </TabsContent>

        <TabsContent value="cashback" className="space-y-6 mt-6">
          <CashbackSimulator />
        </TabsContent>

        <TabsContent value="split" className="space-y-6 mt-6">
          <SplitPaymentCalculator />
        </TabsContent>

        <TabsContent value="seletivo" className="space-y-6 mt-6">
          <SelectiveTaxCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmbeddedFerramentasLC214;
