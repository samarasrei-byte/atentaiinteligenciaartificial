import React from 'react';
import { TransitionYearAlerts } from '@/components/alerts/TransitionYearAlerts';
import { CashbackSimulator } from '@/components/calculator/CashbackSimulator';
import { SplitPaymentCalculator } from '@/components/calculator/SplitPaymentCalculator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Coins, Receipt, FileText, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FerramentasLC214 = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden animate-page-enter">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border/30 p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="font-semibold text-lg">Ferramentas LC 214/2025</h1>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <Badge className="bg-primary/20 text-primary mb-4">
              <FileText className="h-3 w-3 mr-1" />
              LC 214/2025
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Ferramentas da Reforma Tributária
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simule o cashback para famílias de baixa renda, calcule o split payment obrigatório 
              e acompanhe os alertas de cada ano da transição tributária.
            </p>
          </div>

          {/* Tabs para as ferramentas */}
          <Tabs defaultValue="alertas" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="alertas" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Alertas</span>
              </TabsTrigger>
              <TabsTrigger value="cashback" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                <span className="hidden sm:inline">Cashback</span>
              </TabsTrigger>
              <TabsTrigger value="split" className="flex items-center gap-2">
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Split Payment</span>
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
                    Use esta ferramenta para visualizar os principais alertas e mudanças de cada ano, 
                    incluindo marcos importantes como a obrigatoriedade do Split Payment e início 
                    do programa de Cashback.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="cashback" className="space-y-6">
              <CashbackSimulator />
              
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Sobre o Cashback LC 214/2025</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    O programa de Cashback é destinado a <strong>famílias de baixa renda</strong> inscritas 
                    no Cadastro Único (CadÚnico), conforme Art. 134 a 140 da LC 214/2025.
                  </p>
                  <p>
                    A devolução é automática via PIX para produtos essenciais como energia elétrica, 
                    gás de cozinha, água, esgoto e itens da cesta básica. O percentual de devolução 
                    varia conforme a categoria do produto.
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Energia, gás e água: 100% de CBS e IBS devolvidos</li>
                    <li>Cesta básica: 100% CBS + até 20% IBS</li>
                    <li>Outros produtos: até 20% de CBS e IBS</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="split" className="space-y-6">
              <SplitPaymentCalculator />
              
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Sobre o Split Payment</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <p>
                    O <strong>Split Payment</strong> é a retenção automática de CBS e IBS no momento 
                    do pagamento, conforme Art. 28 a 32 da LC 214/2025.
                  </p>
                  <p>
                    A partir de 2026, todas as transações com nota fiscal eletrônica terão os 
                    tributos retidos automaticamente por credenciadoras de cartão, bancos e 
                    operadoras de PIX.
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Elimina inadimplência tributária</li>
                    <li>Reduz sonegação fiscal</li>
                    <li>Vendedor recebe valor líquido automaticamente</li>
                    <li>Tributos vão direto para União, Estados e Municípios</li>
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default FerramentasLC214;
