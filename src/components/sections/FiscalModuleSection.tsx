import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock, FileCheck, TrendingUp, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export function FiscalModuleSection() {
  const navigate = useNavigate();

  const benefits = [
    { icon: Lock, text: "Não alteramos faturamento" },
    { icon: Shield, text: "Bloqueio automático em risco" },
    { icon: FileCheck, text: "Relatório fiscal completo" },
    { icon: TrendingUp, text: "Pagamento no êxito" },
  ];

  const guarantees = [
    "Não prometemos atalhos fiscais",
    "Não alteramos dados declaratórios",
    "Não executamos com risco",
  ];

  const positive = [
    "Atuamos com técnica",
    "Atuamos com rastreabilidade",
    "Atuamos com governança",
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5">
              <Shield className="h-4 w-4 mr-2 text-primary" />
              Módulo Fiscal Avançado
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Inteligência Fiscal para Empresas que{" "}
              <span className="text-primary">Não Aceitam Risco</span>
            </h2>
            
            <p className="text-lg text-muted-foreground mb-6">
              Análise fiscal avançada com software próprio de rastreabilidade, 
              executada por empresa parceira homologada, com{" "}
              <strong className="text-foreground">pagamento somente no êxito</strong>.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <benefit.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>

            <Button 
              size="lg" 
              onClick={() => navigate('/modulo-fiscal')}
              className="shadow-lg hover:shadow-xl transition-all"
            >
              <Zap className="h-5 w-5 mr-2" />
              Solicitar Análise Fiscal
            </Button>
            
            <p className="text-xs text-muted-foreground mt-3">
              Serviço técnico sob análise prévia • Disponibilidade sujeita ao enquadramento
            </p>
          </motion.div>

          {/* Right Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-primary/20 bg-gradient-to-br from-card to-muted/30 overflow-hidden">
              <CardContent className="pt-6 space-y-6">
                {/* Quote */}
                <blockquote className="text-lg italic text-muted-foreground border-l-4 border-primary pl-4">
                  "Não prometemos milagres fiscais. Entregamos técnica, rastreabilidade e segurança."
                </blockquote>

                {/* Success Fee */}
                <div className="p-4 bg-primary/10 rounded-xl text-center">
                  <p className="text-sm text-muted-foreground mb-1">Modelo de Pagamento</p>
                  <p className="text-2xl font-bold text-primary">50% no Êxito</p>
                  <p className="text-xs text-muted-foreground">do valor identificado no processo</p>
                </div>

                {/* Guarantees */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {guarantees.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {positive.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Regimes */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary">Simples Nacional</Badge>
                  <Badge variant="secondary">Lucro Presumido</Badge>
                  <Badge variant="secondary">Lucro Real</Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
