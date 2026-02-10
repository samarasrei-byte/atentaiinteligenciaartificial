import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  CheckCircle2, 
} from "lucide-react";

/**
 * Payment setup component - Mercado Pago based
 * Stripe Connect has been removed. Payments are processed via Mercado Pago.
 */
export function StripeConnectSetup() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Pagamentos</CardTitle>
                <CardDescription>Receba pagamentos via Mercado Pago</CardDescription>
              </div>
            </div>
            <Badge className="bg-green-500/10 text-green-600 border-green-200">
              Mercado Pago
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h4 className="font-medium mb-2">Pagamentos via Mercado Pago</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Pagamentos processados via PIX e cartão
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Checkout transparente integrado
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Confirmação automática de pagamento
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
