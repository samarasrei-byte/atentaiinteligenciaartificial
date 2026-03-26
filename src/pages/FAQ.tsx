import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  Volume2,
  VolumeX,
  HelpCircle,
  Calculator,
  MessageSquare,
  Bell,
  FileText,
  Settings,
  Bot,
  Building,
  TrendingUp,
  Clock,
  Headphones,
  X,
  Play,
  Pause,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PublicLayout } from "@/components/layout/PublicLayout";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
}

const faqData: FAQItem[] = [
  // Categoria: Reforma Tributária
  {
    id: "reforma-1",
    question: "O que é a Reforma Tributária de 2026?",
    answer: "A Reforma Tributária é uma grande mudança no sistema de impostos do Brasil. A partir de 2026, os impostos atuais como ICMS, ISS, PIS e COFINS serão substituídos por novos impostos mais simples: o IBS (Imposto sobre Bens e Serviços) e a CBS (Contribuição sobre Bens e Serviços). O objetivo é simplificar o pagamento de impostos e tornar tudo mais transparente para empresas e cidadãos.",
    category: "Reforma Tributária",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: "reforma-2",
    question: "O que é o IBS?",
    answer: "O IBS significa Imposto sobre Bens e Serviços. Ele vai substituir dois impostos que existem hoje: o ICMS (imposto estadual) e o ISS (imposto municipal). A alíquota prevista é de 17,7%. Uma grande mudança é que o imposto será cobrado no destino, ou seja, onde o produto é consumido, e não mais onde é produzido.",
    category: "Reforma Tributária",
    icon: <Calculator className="h-5 w-5" />,
  },
  {
    id: "reforma-3",
    question: "O que é a CBS?",
    answer: "A CBS é a Contribuição sobre Bens e Serviços. Ela vai substituir dois tributos federais: o PIS e a COFINS. A alíquota prevista é de 8,8%. Junto com o IBS, forma o novo sistema de tributação do consumo no Brasil, conhecido como IVA Dual (dois impostos sobre valor agregado).",
    category: "Reforma Tributária",
    icon: <Calculator className="h-5 w-5" />,
  },
  {
    id: "reforma-4",
    question: "O que é o Imposto Seletivo (IS)?",
    answer: "O Imposto Seletivo, também chamado de 'imposto do pecado', é um novo tributo que será aplicado sobre produtos considerados prejudiciais à saúde ou ao meio ambiente. Isso inclui cigarros, bebidas alcoólicas, bebidas açucaradas e combustíveis fósseis. O objetivo é desestimular o consumo desses produtos.",
    category: "Reforma Tributária",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    id: "reforma-5",
    question: "Quando a reforma começa a valer?",
    answer: "A transição será gradual, começando em 2026 e terminando em 2033. Durante esse período, os impostos antigos (ICMS, ISS, PIS, COFINS) vão sendo reduzidos aos poucos, enquanto os novos (IBS e CBS) vão aumentando. Isso dá tempo para empresas e contadores se adaptarem às mudanças.",
    category: "Reforma Tributária",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    id: "reforma-6",
    question: "O que é o Cashback Tributário?",
    answer: "O Cashback Tributário é um benefício para famílias de baixa renda. Parte do imposto pago em produtos essenciais como gás de cozinha, luz e água será devolvido para essas famílias. É uma forma de tornar o sistema tributário mais justo, reduzindo o peso dos impostos para quem ganha menos.",
    category: "Reforma Tributária",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  // Categoria: Regimes Tributários
  {
    id: "regime-1",
    question: "O que é o Simples Nacional?",
    answer: "O Simples Nacional é um regime tributário simplificado para micro e pequenas empresas. Ele reúne vários impostos em uma única guia de pagamento (DAS). É mais simples de administrar e geralmente tem alíquotas menores. Podem optar pelo Simples empresas com faturamento anual de até R$ 4,8 milhões.",
    category: "Regimes Tributários",
    icon: <Building className="h-5 w-5" />,
  },
  {
    id: "regime-2",
    question: "O que é Lucro Presumido?",
    answer: "O Lucro Presumido é um regime onde o governo presume qual foi o lucro da empresa com base em um percentual do faturamento. É mais simples que o Lucro Real porque não exige controle detalhado de todas as despesas. É indicado para empresas com faturamento de até R$ 78 milhões por ano e margens de lucro acima da presunção.",
    category: "Regimes Tributários",
    icon: <Building className="h-5 w-5" />,
  },
  {
    id: "regime-3",
    question: "O que é Lucro Real?",
    answer: "O Lucro Real é o regime onde a empresa paga impostos sobre o lucro efetivamente apurado na contabilidade. Exige controle rigoroso de todas as receitas e despesas. É obrigatório para empresas com faturamento acima de R$ 78 milhões por ano, mas pode ser vantajoso para empresas com margens de lucro baixas ou prejuízo.",
    category: "Regimes Tributários",
    icon: <Building className="h-5 w-5" />,
  },
  {
    id: "regime-4",
    question: "O que é MEI?",
    answer: "MEI significa Microempreendedor Individual. É a forma mais simples de ter uma empresa no Brasil. O MEI paga um valor fixo mensal (cerca de R$ 70) que inclui todos os impostos. Pode faturar até R$ 81 mil por ano e ter no máximo um funcionário. É ideal para quem está começando um pequeno negócio.",
    category: "Regimes Tributários",
    icon: <Building className="h-5 w-5" />,
  },
  // Categoria: Casos Práticos - Empresas
  {
    id: "caso-1",
    question: "Tenho um restaurante. Como a reforma me afeta?",
    answer: "Restaurantes terão uma alíquota reduzida de 60% sobre a alíquota padrão (IBS + CBS). Isso significa que em vez de pagar 26,5%, você pagará cerca de 15,9%. Além disso, poderá aproveitar créditos de todos os insumos (alimentos, energia, aluguel). Na prática, muitos restaurantes terão redução de carga tributária, especialmente os que compram muitos produtos com crédito.",
    category: "Casos Práticos",
    icon: <Building className="h-5 w-5" />,
  },
  {
    id: "caso-2",
    question: "Sou prestador de serviços de TI. O que muda?",
    answer: "Empresas de tecnologia pagarão a alíquota cheia de 26,5% (IBS + CBS). Porém, poderão aproveitar créditos de equipamentos, software, aluguel e outros insumos. Se você está no Simples Nacional, pode continuar nele, mas analise se vale a pena migrar para Lucro Presumido para aproveitar os créditos. Use nosso simulador para calcular.",
    category: "Casos Práticos",
    icon: <Building className="h-5 w-5" />,
  },
  {
    id: "caso-3",
    question: "Tenho uma loja de roupas. Vou pagar mais imposto?",
    answer: "Depende da sua situação atual. Se você está no Simples Nacional com faturamento baixo, provavelmente continua sendo vantajoso. Se está no Lucro Presumido, pode haver aumento porque o comércio hoje paga ICMS com créditos, e o IBS terá alíquota mais alta. Porém, a simplificação reduz custos operacionais. Simule sua situação específica.",
    category: "Casos Práticos",
    icon: <Building className="h-5 w-5" />,
  },
  {
    id: "caso-4",
    question: "Sou médico com consultório. Como fica minha tributação?",
    answer: "Profissionais de saúde (médicos, dentistas, psicólogos) terão alíquota reduzida de 70% sobre a padrão, ou seja, cerca de 18,5%. Se você atende pelo SUS, a alíquota é ainda menor. Compare com o Simples Nacional: dependendo do seu anexo e faturamento, pode ser melhor migrar. Consulte um contador para análise personalizada.",
    category: "Casos Práticos",
    icon: <Building className="h-5 w-5" />,
  },
  {
    id: "caso-5",
    question: "Tenho uma transportadora. O que muda com a reforma?",
    answer: "O transporte de cargas terá alíquota cheia de 26,5%, mas com crédito integral de combustíveis, veículos, manutenção e pedágios. Já o transporte de passageiros terá redução de 60% (alíquota de 15,9%). O setor deve se beneficiar da não-cumulatividade plena, pois hoje há muito crédito perdido.",
    category: "Casos Práticos",
    icon: <Building className="h-5 w-5" />,
  },
  {
    id: "caso-6",
    question: "Tenho uma indústria pequena. Vale sair do Simples?",
    answer: "Indústrias pequenas no Simples pagam alíquotas que variam de 4,5% a 19,5%. Com a reforma, se você sair do Simples, pagará 26,5% mas terá crédito de TUDO: matéria-prima, energia, máquinas, embalagens. Se sua margem de lucro é baixa e você compra muito insumo, pode valer a pena migrar. Faça a simulação com números reais.",
    category: "Casos Práticos",
    icon: <Building className="h-5 w-5" />,
  },
  {
    id: "caso-7",
    question: "Sou advogado. Como fica o ISS que pago hoje?",
    answer: "Advogados pagam hoje cerca de 2% a 5% de ISS, mais PIS/COFINS (3,65% ou 9,25%). Com a reforma, pagarão 26,5% de IBS+CBS, mas com redução de 30% para profissionais liberais regulamentados, ficando em cerca de 18,5%. Parece aumento, mas você terá crédito de aluguel, equipamentos, software e serviços. Para escritórios com muitos custos, pode até diminuir.",
    category: "Casos Práticos",
    icon: <Building className="h-5 w-5" />,
  },
  {
    id: "caso-8",
    question: "Tenho uma farmácia. Os medicamentos têm tratamento especial?",
    answer: "Sim! Medicamentos genéricos e de uso contínuo terão alíquota zero ou muito reduzida. Medicamentos em geral terão redução de 60% na alíquota. Sua farmácia pagará alíquota cheia apenas em produtos não-essenciais (cosméticos, por exemplo). O setor farmacêutico deve ter redução geral de carga tributária.",
    category: "Casos Práticos",
    icon: <Building className="h-5 w-5" />,
  },
  {
    id: "caso-9",
    question: "Sou MEI e quero crescer. Qual o próximo passo?",
    answer: "Quando você ultrapassar R$ 81 mil/ano, tem duas opções: virar ME no Simples Nacional ou abrir empresa no Lucro Presumido. No Simples, você paga uma alíquota única sobre o faturamento (começa em 6% para comércio, 4,5% para indústria, 6% para serviços). Com a reforma, analise também o regime normal para aproveitar créditos.",
    category: "Casos Práticos",
    icon: <Building className="h-5 w-5" />,
  },
  {
    id: "caso-10",
    question: "Tenho imóveis alugados. Como fica a tributação?",
    answer: "Aluguel de imóveis residenciais continua isento para pessoa física. Para pessoa jurídica, a locação de imóveis próprios terá alíquota reduzida. Se você tem muitos imóveis, pode valer a pena constituir uma holding patrimonial. Consulte um contador para analisar se PF ou PJ é melhor no seu caso.",
    category: "Casos Práticos",
    icon: <Building className="h-5 w-5" />,
  },
  // Categoria: Funcionalidades da Plataforma
  {
    id: "plataforma-1",
    question: "Como funciona o Simulador Tributário?",
    answer: "O Simulador Tributário compara quanto você pagaria de impostos no sistema atual (ICMS, ISS, PIS, COFINS) versus o novo sistema (IBS e CBS). Basta informar o faturamento da sua empresa e o tipo de atividade. O sistema calcula automaticamente e mostra se você vai pagar mais ou menos impostos com a reforma.",
    category: "Funcionalidades",
    icon: <Calculator className="h-5 w-5" />,
  },
  {
    id: "plataforma-2",
    question: "O que é o Agente de IA?",
    answer: "O Agente de IA é um assistente virtual especializado em legislação tributária brasileira. Você pode fazer perguntas sobre impostos, a reforma tributária, regimes tributários e muito mais. Ele responde de forma clara e objetiva, ajudando você a entender conceitos complexos de forma simples.",
    category: "Funcionalidades",
    icon: <Bot className="h-5 w-5" />,
  },
  {
    id: "plataforma-3",
    question: "Como funciona o Chat com Contador?",
    answer: "O Chat com Contador permite que você converse diretamente com contadores certificados. Você pode tirar dúvidas específicas sobre a situação da sua empresa, pedir orientações personalizadas e receber ajuda profissional. Os contadores são verificados e especializados em diferentes áreas.",
    category: "Funcionalidades",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    id: "plataforma-4",
    question: "O que é o Comparador PF vs PJ?",
    answer: "O Comparador PF vs PJ ajuda você a decidir se é mais vantajoso trabalhar como Pessoa Física (CLT ou autônomo) ou abrir uma empresa (Pessoa Jurídica). O sistema compara a carga tributária, custos e benefícios de cada opção, considerando seu faturamento e situação específica.",
    category: "Funcionalidades",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    id: "plataforma-5",
    question: "O que é o Piloto Automático Tributário?",
    answer: "O Piloto Automático Tributário monitora continuamente a situação fiscal da sua empresa e sugere otimizações. Ele analisa mudanças na legislação, identifica oportunidades de economia e alerta sobre riscos. É como ter um consultor tributário trabalhando 24 horas para você.",
    category: "Funcionalidades",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    id: "plataforma-6",
    question: "O que são as Notificações?",
    answer: "As Notificações mantêm você informado sobre tudo que é importante: mudanças na legislação, prazos de pagamento, respostas de contadores, alertas do Piloto Automático e novidades da plataforma. Você pode configurar quais notificações deseja receber.",
    category: "Funcionalidades",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    id: "plataforma-7",
    question: "O que é o Glossário Tributário?",
    answer: "O Glossário Tributário é um dicionário com todos os termos e siglas usados no mundo dos impostos. Se você não entende o que significa ICMS, ISS, IBS, CBS ou qualquer outro termo, basta consultar o glossário. Cada termo tem uma explicação simples e exemplos práticos.",
    category: "Funcionalidades",
    icon: <FileText className="h-5 w-5" />,
  },
  // Categoria: Conta e Planos
  {
    id: "conta-1",
    question: "Quais são os planos disponíveis?",
    answer: "Oferecemos quatro planos: Gratuito (simulador básico e 3 perguntas por dia à IA), Simulador (R$ 39,99/mês com simulador ilimitado e comparador de regimes), Autônomo (R$ 65/mês) e Premium (R$ 98/mês com IA ilimitada e suporte prioritário). Você pode fazer upgrade a qualquer momento.",
    category: "Conta e Planos",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    id: "conta-2",
    question: "Como faço para cancelar minha assinatura?",
    answer: "Para cancelar sua assinatura, acesse seu Perfil, clique em 'Gerenciar Assinatura' e depois em 'Cancelar'. O cancelamento é imediato, mas você continua tendo acesso aos recursos pagos até o final do período já pago. Não há multa ou taxa de cancelamento.",
    category: "Conta e Planos",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    id: "conta-3",
    question: "Como entro em contato com o suporte?",
    answer: "Você pode entrar em contato com nosso suporte de várias formas: pelo chat de suporte dentro da plataforma, pelo email suporte@atentai.com.br, ou abrindo um ticket na seção de Ajuda. Nossa equipe responde em até 24 horas úteis.",
    category: "Conta e Planos",
    icon: <Headphones className="h-5 w-5" />,
  },
];

const categories = [
  "Todos",
  "Reforma Tributária",
  "Regimes Tributários",
  "Casos Práticos",
  "Funcionalidades",
  "Conta e Planos",
];

export default function FAQ() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeakingId, setCurrentSpeakingId] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    // Check if speech synthesis is supported
    if (!("speechSynthesis" in window)) {
      setSpeechSupported(false);
    }
    
    // Cleanup on unmount
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todos" || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const speakText = (text: string, id: string) => {
    if (!speechSupported) return;

    // If already speaking this item, stop it
    if (currentSpeakingId === id && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Try to find a Portuguese voice
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(
      (voice) => voice.lang.includes("pt") || voice.lang.includes("BR")
    );
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setCurrentSpeakingId(id);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentSpeakingId(null);
    }
  };

  const speakAll = () => {
    if (!speechSupported) return;

    const allText = filteredFAQs
      .map((faq) => `Pergunta: ${faq.question}. Resposta: ${faq.answer}`)
      .join(". ");

    speakText(allText, "all");
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <HelpCircle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Central de Ajuda
              </h1>
              <p className="text-muted-foreground">
                Tire suas dúvidas sobre impostos e a plataforma
              </p>
            </div>
          </div>

          {/* Audio Assistant Banner */}
          <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-full animate-pulse">
                  <Headphones className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    Prefere ouvir? Use o assistente de voz!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Clique no ícone de som em qualquer pergunta para ouvir a resposta
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {isSpeaking && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopSpeaking}
                    className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                  >
                    <VolumeX className="h-4 w-4 mr-2" />
                    Parar
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={speakAll}
                  disabled={isSpeaking || !speechSupported}
                  className="border-blue-500/50 text-blue-500 hover:bg-blue-500/10"
                >
                  <Volume2 className="h-4 w-4 mr-2" />
                  Ouvir Tudo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Categorias</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                    {category !== "Todos" && (
                      <Badge variant="secondary" className="ml-auto">
                        {faqData.filter((f) => f.category === category).length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar perguntas ou termos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-lg"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground">
              {filteredFAQs.length} resultado(s) encontrado(s)
              {selectedCategory !== "Todos" && ` em "${selectedCategory}"`}
            </p>

            {/* FAQ List */}
            <ScrollArea className="h-[calc(100vh-400px)]">
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="border rounded-lg px-4 bg-card"
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3 text-left">
                        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                          {faq.icon}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {faq.question}
                          </p>
                          <Badge variant="outline" className="mt-1">
                            {faq.category}
                          </Badge>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="pl-12 space-y-4">
                        <p className="text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            speakText(
                              `${faq.question}. ${faq.answer}`,
                              faq.id
                            )
                          }
                          disabled={!speechSupported}
                          className={
                            currentSpeakingId === faq.id && isSpeaking
                              ? "border-primary text-primary"
                              : ""
                          }
                        >
                          {currentSpeakingId === faq.id && isSpeaking ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pausar Áudio
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Ouvir Resposta
                            </>
                          )}
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-12">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground">
                    Nenhum resultado encontrado
                  </p>
                  <p className="text-muted-foreground">
                    Tente buscar por outros termos ou selecione outra categoria
                  </p>
                </div>
              )}
            </ScrollArea>

            {/* Help Card */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/20 rounded-full">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      Não encontrou o que procurava?
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Converse com nosso Agente de IA ou fale com um contador
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/ai-chat")}
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Agente IA
                  </Button>
                  <Button onClick={() => navigate("/contadores")}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Falar com Contador
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    </PublicLayout>
  );
}
