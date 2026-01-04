import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Lock, FileCheck, TrendingUp, AlertTriangle, CheckCircle2, FileText, Building2, Scale, Eye, Ban, Zap } from "lucide-react";
import { FiscalAnalysisForm } from "@/components/fiscal/FiscalAnalysisForm";
import { motion } from "framer-motion";

export default function ModuloFiscal() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  const benefits = [
    { icon: Lock, title: "Não alteramos faturamento", description: "Sem manipulação de dados declaratórios" },
    { icon: Shield, title: "Bloqueio automático em risco", description: "Se detectado risco de malha fina, não executamos" },
    { icon: FileCheck, title: "Relatório fiscal completo", description: "Documentação 100% auditável" },
    { icon: TrendingUp, title: "Pagamento no êxito", description: "Você só paga se houver resultado positivo" },
  ];

  const regimes = [
    { name: "Simples Nacional", description: "Verificação de inconsistências e risco de malha fina" },
    { name: "Lucro Presumido", description: "Análise de créditos e oportunidades técnicas" },
    { name: "Lucro Real", description: "Auditoria completa e otimização fiscal" },
  ];

  const workflow = [
    { step: "1", title: "Envio da Guia", description: "O contador/empresa envia a guia (DAS ou equivalente) para análise" },
    { step: "2", title: "Análise Técnica", description: "Rastreamento fiscal completo com software próprio + validação humana" },
    { step: "3", title: "Gate de Segurança", description: "Se houver risco fiscal → execução automaticamente cancelada" },
    { step: "4", title: "Execução com Êxito", description: "Quando viável, nova guia pode ser gerada para pagamento na Receita" },
    { step: "5", title: "Documentação", description: "Relatório completo + evidências fiscais entregues ao cliente" },
  ];

  const limitations = [
    { title: "IRRF", description: "Imposto de Renda Retido na Fonte não é passível de compensação técnica" },
    { title: "ISS", description: "Imposto Sobre Serviços possui limitações legais específicas" },
  ];

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
        <div className="container max-w-4xl mx-auto px-4">
          <Button 
            variant="ghost" 
            onClick={() => setShowForm(false)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <FiscalAnalysisForm onSuccess={() => navigate('/modulo-fiscal/sucesso')} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Hero Section */}
      <section className="container max-w-7xl mx-auto px-4 py-12 lg:py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <Badge variant="outline" className="mb-6 text-sm px-4 py-2 border-primary/30 bg-primary/5">
            <Shield className="h-4 w-4 mr-2 text-primary" />
            Módulo Fiscal Avançado
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent leading-tight">
            Inteligência Fiscal Técnica para Empresas que Não Aceitam Risco.
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Análise fiscal avançada com software próprio de rastreabilidade, executada por empresa parceira homologada, 
            com <strong className="text-foreground">pagamento somente no êxito</strong> e total conformidade com a Receita Federal.
          </p>

          {/* Benefit Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
              >
                <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
                  <benefit.icon className="h-4 w-4 mr-2 text-primary" />
                  {benefit.title}
                </Badge>
              </motion.div>
            ))}
          </div>

          <Button 
            size="lg" 
            onClick={() => setShowForm(true)}
            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            <Zap className="h-5 w-5 mr-2" />
            Solicitar Análise Fiscal
          </Button>
          
          <p className="text-sm text-muted-foreground mt-4">
            Serviço técnico sob análise prévia • Disponibilidade sujeita ao enquadramento da empresa
          </p>
        </motion.div>
      </section>

      {/* Simples Nacional Concept */}
      <section className="container max-w-7xl mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-xl bg-primary/10">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Simples Nacional – Conceito e Diretrizes</h2>
          </div>
          
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                O regime <strong className="text-foreground">Simples Nacional não gera crédito tributário</strong> e não permite compensação.
                Nosso serviço atua de forma estritamente técnica, utilizando software próprio de rastreabilidade fiscal, capaz de identificar:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-amber-500" />
                  <span>Se a empresa <strong>caiu em malha fina</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>Se a empresa <strong>pode vir a cair</strong> em malha fina</span>
                </li>
              </ul>
              
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="font-semibold text-destructive flex items-center gap-2">
                  <Ban className="h-5 w-5" />
                  Regra absoluta:
                </p>
                <p className="text-sm mt-1">
                  Se, em qualquer etapa da análise ou execução, for identificado risco fiscal, o serviço não é executado.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="container max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Fluxo de Execução Transparente</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Todo o processo é documentado, auditável e entregue ao cliente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl mx-auto">
          {workflow.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full text-center hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="mx-auto w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <span className="text-lg font-bold text-primary">{item.step}</span>
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{item.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Regimes Section */}
      <section className="container max-w-7xl mx-auto px-4 py-16 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Regimes Atendidos</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Todos os ramos de atividade podem ser atendidos, sujeitos à análise prévia do CNAE e enquadramento fiscal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {regimes.map((regime, i) => (
            <Card key={i} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="p-2 w-fit rounded-lg bg-primary/10 mb-2">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{regime.name}</CardTitle>
                <CardDescription>{regime.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Payment Model */}
      <section className="container max-w-7xl mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl flex items-center justify-center gap-3">
                <TrendingUp className="h-8 w-8 text-primary" />
                Modelo de Pagamento – Justo e Seguro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge variant="default" className="text-lg px-6 py-2 mb-4">
                  💰 Pagamento somente no êxito
                </Badge>
                <p className="text-2xl font-bold text-primary">
                  50% do valor da guia identificada no processo
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                <div className="p-4 bg-background rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-primary" />
                    O cliente recebe:
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Relatório Fiscal Completo comprovando o trabalho e resultado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Guia(s) oficial(is) para pagamento direto na Receita</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <h4 className="font-semibold flex items-center gap-2 mb-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Garantias:
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Pagamento apenas após entrega do relatório</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>Documentação 100% auditável</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Limitations */}
      <section className="container max-w-7xl mx-auto px-4 py-16 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Limitações Técnicas Importantes
          </h2>
          <p className="text-muted-foreground mb-6">
            Alguns tributos não são passíveis de compensação ou execução técnica. Estas limitações são respeitadas integralmente para preservar a conformidade legal:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {limitations.map((item, i) => (
              <Card key={i} className="border-amber-500/20 bg-amber-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="container max-w-7xl mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Por que Empresas Escolhem o Atentai</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
            <div className="p-4 bg-destructive/10 rounded-lg">
              <Ban className="h-6 w-6 text-destructive mx-auto mb-2" />
              <p className="text-sm font-medium">Não prometemos atalhos fiscais</p>
            </div>
            <div className="p-4 bg-destructive/10 rounded-lg">
              <Ban className="h-6 w-6 text-destructive mx-auto mb-2" />
              <p className="text-sm font-medium">Não alteramos dados declaratórios</p>
            </div>
            <div className="p-4 bg-destructive/10 rounded-lg">
              <Ban className="h-6 w-6 text-destructive mx-auto mb-2" />
              <p className="text-sm font-medium">Não executamos com risco</p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Atuamos com técnica</p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Atuamos com rastreabilidade</p>
            </div>
            <div className="p-4 bg-green-500/10 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Atuamos com governança</p>
            </div>
          </div>

          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-8">
            <blockquote className="text-lg md:text-xl italic text-muted-foreground">
              "Não prometemos milagres fiscais. Entregamos técnica, rastreabilidade e segurança. 
              Se houver risco, não executamos. Se houver êxito, tudo é documentado e validado direto na Receita."
            </blockquote>
          </Card>

          <Button 
            size="lg" 
            onClick={() => setShowForm(true)}
            className="mt-10 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            <Zap className="h-5 w-5 mr-2" />
            Solicitar Análise Fiscal
          </Button>
        </div>
      </section>
    </div>
  );
}
