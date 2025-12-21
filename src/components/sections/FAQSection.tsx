import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "O que é a Reforma Tributária de 2026?",
    answer: `A Reforma Tributária é uma mudança estrutural no sistema de impostos brasileiro que unifica tributos sobre consumo. 

**Principais mudanças:**
• ICMS (estadual) + ISS (municipal) → IBS (Imposto sobre Bens e Serviços)
• PIS + COFINS (federal) → CBS (Contribuição sobre Bens e Serviços)
• Criação do IS (Imposto Seletivo) sobre produtos nocivos

O objetivo é simplificar, aumentar a transparência e tornar o sistema mais justo.`,
  },
  {
    question: "Quando a reforma começa a valer?",
    answer: `A transição será gradual, entre 2026 e 2033:

• **2026:** Início com alíquotas de teste (CBS 0,9% + IBS 0,1%)
• **2027-2028:** Aumento gradual das novas alíquotas
• **2029-2032:** Redução progressiva de ICMS, ISS, PIS e COFINS
• **2033:** Extinção total dos tributos antigos

Durante esse período, as empresas operarão com os dois sistemas simultaneamente.`,
  },
  {
    question: "Qual será a alíquota dos novos impostos?",
    answer: `A alíquota padrão de referência é de aproximadamente **26,5%**, dividida em:

• **IBS:** 17,7% (estadual e municipal)
• **CBS:** 8,8% (federal)

**Importante:** Muitos setores terão alíquotas reduzidas:
• Cesta básica: 0% (isenta)
• Saúde e educação: 40% de redução
• Transporte público: alíquota reduzida

A carga tributária total tende a permanecer similar à atual.`,
  },
  {
    question: "O Simples Nacional vai acabar?",
    answer: `**Não!** O Simples Nacional será mantido para MEIs e pequenas empresas.

O que muda:
• Opção de recolher IBS e CBS separadamente (por fora)
• Isso permite que compradores aproveitem créditos tributários
• As alíquotas do Simples serão ajustadas

**Benefício:** Empresas do Simples poderão ser mais competitivas ao vender para outras empresas.`,
  },
  {
    question: "O que é o cashback tributário?",
    answer: `É um mecanismo de devolução de impostos para famílias de baixa renda, inscrita no CadÚnico.

**Como funciona:**
• Parte dos tributos pagos nas compras será devolvida
• O crédito é depositado diretamente na conta (via PIX)
• Produtos essenciais terão maior percentual de devolução

Estima-se que o cashback beneficiará cerca de **70 milhões de brasileiros**, tornando o sistema tributário mais progressivo.`,
  },
  {
    question: "Como funciona a não-cumulatividade?",
    answer: `A não-cumulatividade plena é um dos maiores avanços da reforma.

**Sistema atual:** Créditos limitados, muita cumulatividade, efeito cascata.

**Novo sistema:** 
• Todo imposto pago na cadeia gera crédito
• Créditos podem ser aproveitados amplamente
• Fim do efeito cascata

**Resultado:** Empresas pagam imposto apenas sobre o valor que agregaram, não sobre o que já foi tributado antes.`,
  },
  {
    question: "O que é o Imposto Seletivo (IS)?",
    answer: `O IS é conhecido como "imposto do pecado" e incide sobre produtos nocivos:

**Produtos tributados:**
• Cigarros e derivados do tabaco
• Bebidas alcoólicas
• Bebidas açucaradas
• Veículos poluentes
• Extração de minerais

**Objetivo:** Desestimular o consumo de produtos que causam danos à saúde pública e ao meio ambiente.`,
  },
  {
    question: "Como será a tributação da cesta básica?",
    answer: `A Cesta Básica Nacional terá **isenção total** (alíquota 0%) para produtos essenciais:

**Produtos isentos:**
• Arroz, feijão, leite
• Carnes, ovos, peixes
• Frutas, verduras, legumes
• Pão francês, farinha, café
• Óleo de cozinha

**Alíquota reduzida (60% de desconto):**
• Outros alimentos não classificados como essenciais

Esta é uma das maiores conquistas sociais da reforma, beneficiando principalmente famílias de menor renda.`,
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20 md:py-32">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <BookOpen className="w-4 h-4" />
              Perguntas Frequentes
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
              Tudo Sobre a
              <span className="gradient-text"> Reforma Tributária</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              As respostas para as dúvidas mais comuns sobre o novo sistema tributário brasileiro.
            </p>
          </div>

          {/* FAQ Accordion */}
          <Card variant="elevated">
            <CardContent className="p-6 md:p-8">
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left hover:no-underline py-6 group">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <HelpCircle className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-semibold text-base md:text-lg pr-4">
                          {faq.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-12 pb-6">
                      <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {faq.answer.split(/(\*\*.*?\*\*)/).map((part, i) => {
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return <strong key={i} className="text-foreground">{part.slice(2, -2)}</strong>;
                          }
                          return part;
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground mb-4">
              Não encontrou o que procurava?
            </p>
            <p className="font-medium">
              Use nossa <span className="text-primary">IA Tributar</span> para perguntas específicas 
              ou agende uma <span className="text-primary">consulta com contador</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
