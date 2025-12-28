import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Wallet,
  TrendingUp,
  RefreshCw
} from "lucide-react";

interface StripeConnectStatus {
  connected: boolean;
  status: string;
  payouts_enabled: boolean;
  charges_enabled: boolean;
  details_submitted?: boolean;
  balance?: {
    available: number;
    pending: number;
  };
  requirements?: {
    currently_due?: string[];
    eventually_due?: string[];
    disabled_reason?: string;
  };
}

export function StripeConnectSetup() {
  const [status, setStatus] = useState<StripeConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [openingDashboard, setOpeningDashboard] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("stripe-connect-status");
      
      if (error) throw error;
      setStatus(data);
    } catch (error) {
      console.error("Error fetching Stripe Connect status:", error);
      toast.error("Erro ao verificar status do Stripe");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Check URL params for onboarding completion
    const params = new URLSearchParams(window.location.search);
    if (params.get("onboarding") === "complete") {
      toast.success("Configuração do Stripe concluída!");
      fetchStatus();
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname + "?tab=earnings");
    }
    if (params.get("refresh") === "true") {
      fetchStatus();
      window.history.replaceState({}, "", window.location.pathname + "?tab=earnings");
    }
  }, []);

  const handleConnect = async () => {
    try {
      setConnecting(true);
      const { data, error } = await supabase.functions.invoke("stripe-connect-onboard");
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error starting Stripe Connect:", error);
      toast.error("Erro ao iniciar configuração do Stripe");
    } finally {
      setConnecting(false);
    }
  };

  const handleOpenDashboard = async () => {
    try {
      setOpeningDashboard(true);
      const { data, error } = await supabase.functions.invoke("stripe-connect-dashboard");
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error opening Stripe dashboard:", error);
      toast.error("Erro ao abrir painel do Stripe");
    } finally {
      setOpeningDashboard(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };

  const getStatusBadge = () => {
    if (!status?.connected) {
      return <Badge variant="outline" className="text-muted-foreground">Não conectado</Badge>;
    }
    
    switch (status.status) {
      case "active":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200">Ativo</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">Pendente</Badge>;
      case "restricted":
        return <Badge className="bg-red-500/10 text-red-600 border-red-200">Restrito</Badge>;
      default:
        return <Badge variant="outline">{status.status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Stripe Connect</CardTitle>
                <CardDescription>Receba pagamentos automaticamente</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <Button variant="ghost" size="icon" onClick={fetchStatus}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!status?.connected ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50 border">
                <h4 className="font-medium mb-2">Por que conectar o Stripe?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Receba pagamentos automaticamente após cada consulta
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Sem necessidade de solicitar saques manualmente
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Split automático: você recebe 90%, plataforma 10%
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Saque direto para sua conta bancária quando quiser
                  </li>
                </ul>
              </div>
              
              <Button onClick={handleConnect} disabled={connecting} className="w-full">
                {connecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Conectar Stripe
                  </>
                )}
              </Button>
            </div>
          ) : status.status === "pending" ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">Configuração incompleta</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Complete a configuração do Stripe para começar a receber pagamentos.
                    </p>
                    {status.requirements?.currently_due && status.requirements.currently_due.length > 0 && (
                      <p className="text-sm text-yellow-700 mt-2">
                        Pendências: {status.requirements.currently_due.length} item(s)
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <Button onClick={handleConnect} disabled={connecting} className="w-full">
                {connecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Abrindo...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Completar Configuração
                  </>
                )}
              </Button>
            </div>
          ) : status.status === "active" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">Disponível</span>
                  </div>
                  <p className="text-2xl font-bold text-green-800">
                    {status.balance ? formatCurrency(status.balance.available) : "R$ 0,00"}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-blue-700">Pendente</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-800">
                    {status.balance ? formatCurrency(status.balance.pending) : "R$ 0,00"}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Conta verificada e ativa</span>
                </div>
                
                <Button variant="outline" size="sm" onClick={handleOpenDashboard} disabled={openingDashboard}>
                  {openingDashboard ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ExternalLink className="mr-2 h-4 w-4" />
                  )}
                  Painel Stripe
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-800">Conta restrita</h4>
                    <p className="text-sm text-red-700 mt-1">
                      {status.requirements?.disabled_reason || "Sua conta tem restrições. Acesse o painel do Stripe para mais detalhes."}
                    </p>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleOpenDashboard} disabled={openingDashboard} variant="outline" className="w-full">
                {openingDashboard ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ExternalLink className="mr-2 h-4 w-4" />
                )}
                Ver Detalhes no Stripe
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Como funciona o split de pagamento?</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Quando um cliente paga por uma consulta, o valor é automaticamente dividido: 
                <strong> 90% para você</strong> e <strong>10% para a plataforma</strong>. 
                O dinheiro vai direto para sua conta Stripe, e você pode sacar para sua conta bancária quando quiser.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
