import { useState, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, useInView } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calculator, Scale, ShieldCheck, TrendingUp, ArrowRight, CheckCircle2,
  Sparkles, FileText, GitCompare, FileCheck, Users, PieChart, Layers,
  HelpCircle, Eye, Info, MapPin
} from 'lucide-react';
import { UFS } from '@/lib/difal/types';
import { brl, perc } from '@/lib/difal/format';
import { BRAZIL_STATES_TAX_DATA, calcularDifalRapido } from '@/lib/difal/taxTable';

export default function DifalLanding() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

  // Simulador rápido na Landing com parâmetros padrão
  const [origem, setOrigem] = useState('SP');
  const [destino, setDestino] = useState('BA');
  const [valorStr, setValorStr] = useState('1000');
  const [tipoDest, setTipoDest] = useState<'nao_contribuinte' | 'contribuinte'>('nao_contribuinte');
  const [comFcp, setComFcp] = useState(true);

  const valor = Math.max(0, Number(valorStr) || 0);

  // Cálculo preciso usando a base das 27 UFs do Brasil
  const resultado = useMemo(() => {
    return calcularDifalRapido({
      origem,
      destino,
      valor,
      destinatarioContribuinte: tipoDest === 'contribuinte',
      comFcp,
    });
  }, [origem, destino, valor, tipoDest, comFcp]);

  const handleComecar = () => {
    sessionStorage.setItem('postAuthRedirect', '/difal/nova-simulacao');
    navigate('/difal');
  };

  const handleNavigateHeader = (section: string) => {
    if (section === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/#${section}`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Helmet>
        <title>DIFAL Marketplace & Operações Interestaduais | AtentAI</title>
        <meta 
          name="description" 
          content="Simule, gerencie e calcule o DIFAL (Diferencial de Alíquota) em operações interestaduais com inteligência artificial, regras por estado, FCP e relatórios em PDF auditáveis." 
        />
      </Helmet>

      <Header onNavigate={handleNavigateHeader} />

      {/* ━━━ HERO SECTION ━━━ */}
      <section ref={heroRef} className="relative pt-32 pb-20 md:py-36 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-background text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.15)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,hsl(var(--accent)/0.08)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Coluna de texto */}
            <motion.div 
              className="lg:col-span-7 space-y-6 text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary-foreground text-xs sm:text-sm font-medium">
                <Scale className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-300">Módulo DIFAL Inteligente & Marketplace</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
                Domine o cálculo do <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 bg-clip-text text-transparent">DIFAL Interestadual</span> sem erros fiscais
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                Automatize a apuração de diferencial de alíquotas (EC 87/2015 e LC 190/2022), FCP de todos os 26 estados e DF, memória de cálculo transparente e laudos auditáveis.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Button 
                  size="lg"
                  onClick={handleComecar}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold h-14 px-8 text-base shadow-lg shadow-emerald-500/25 rounded-xl group"
                >
                  <Calculator className="h-5 w-5 mr-2" />
                  Simular Operação Agora
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button 
                  variant="outline" 
                  size="lg"
                  asChild
                  className="h-14 px-6 text-base bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-xl"
                >
                  <a href="#como-funciona">
                    <Eye className="h-5 w-5 mr-2 text-slate-400" />
                    Como funciona
                  </a>
                </Button>
              </div>

              {/* Badges de confiança */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>26 Estados + Distrito Federal</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Base Simples e Base Dupla</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>FCP automático</span>
                </div>
              </div>
            </motion.div>

            {/* Coluna da Calculadora Rápida no Hero */}
            <motion.div 
              className="lg:col-span-5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isHeroInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative rounded-2xl bg-card border border-border p-6 shadow-2xl text-foreground">
                <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Calculator className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Simulador Rápido</p>
                      <p className="text-xs text-muted-foreground">Teste em tempo real</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200">
                    Tempo Real
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Origem</label>
                      <Select value={origem} onValueChange={setOrigem}>
                        <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {UFS.map((uf) => (
                            <SelectItem key={uf} value={uf}>
                              {uf} - {BRAZIL_STATES_TAX_DATA[uf]?.nome ?? uf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Destino</label>
                      <Select value={destino} onValueChange={setDestino}>
                        <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {UFS.map((uf) => (
                            <SelectItem key={uf} value={uf}>
                              {uf} - {BRAZIL_STATES_TAX_DATA[uf]?.nome ?? uf}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Valor da Mercadoria (R$)</label>
                    <Input
                      type="number"
                      value={valorStr}
                      onChange={(e) => setValorStr(e.target.value)}
                      className="mt-1 h-9 font-medium"
                      placeholder="Ex: 1000"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Destinatário</label>
                    <Select value={tipoDest} onValueChange={(v) => setTipoDest(v as any)}>
                      <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nao_contribuinte">Não Contribuinte (Consumidor Final)</SelectItem>
                        <SelectItem value="contribuinte">Contribuinte de ICMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Resultados da prévia */}
                  <div className="bg-muted/40 rounded-xl p-4 border border-border/70 space-y-2 mt-4">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Alíquota Interestadual ({origem} → {destino})</span>
                      <span className="font-semibold text-foreground">{perc(resultado.aliquotaInterestadual)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Alíquota Interna de Destino ({destino})</span>
                      <span className="font-semibold text-foreground">{perc(resultado.aliquotaInternaDestino)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Diferencial apurado</span>
                      <span className="font-semibold text-foreground">{perc(resultado.diferencialApurado)}</span>
                    </div>
                    {resultado.fcpPercentual > 0 && (
                      <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400">
                        <span>Fundo de Combate à Pobreza (FCP)</span>
                        <span className="font-semibold">+{perc(resultado.fcpPercentual)}</span>
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-border/80 flex items-center justify-between">
                      <span className="font-medium text-sm">DIFAL Estimado:</span>
                      <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {brl(Math.round(resultado.totalEstimado * 100))}
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={handleComecar}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-sm"
                  >
                    Abrir Simulação Completa
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ━━━ RECURSOS E DIFERENCIAIS ━━━ */}
      <section id="como-funciona" className="py-20 md:py-28 bg-muted/20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="px-3.5 py-1 text-xs font-semibold text-primary border-primary/30">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Funcionalidades Essenciais
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Tudo que seu negócio precisa para operar interestadual
            </h2>
            <p className="text-muted-foreground text-base">
              Desenvolvido para e-commerces, indústrias, distribuidores, marketplaces e contabilidades que realizam vendas para outros estados.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Calculator}
              title="Cálculo Inteligente e Instantâneo"
              description="Motor em conformidade com as regras vigentes de todos os 26 estados e DF. Considera ICMS interestadual, alíquota interna e FCP."
            />
            <FeatureCard 
              icon={Layers}
              title="Base Simples vs Base Dupla"
              description="Aplica com precisão o cálculo por dentro (base dupla) nos estados que o exigem por decreto estadual, prevenindo autuações."
            />
            <FeatureCard 
              icon={GitCompare}
              title="Comparador Multi-Estados"
              description="Compare a mesma operação simulada em múltiplos estados destinos lado a lado para encontrar a melhor estratégia de precificação e frete."
            />
            <FeatureCard 
              icon={FileCheck}
              title="Memória de Cálculo e Auditoria"
              description="Passo a passo transparente demonstrando cada fórmula, base de cálculo, alíquota e deduções sem esconder nenhum parâmetro."
            />
            <FeatureCard 
              icon={FileText}
              title="Relatórios e Laudos em PDF"
              description="Gere relatórios completos para anexar a pedidos, NFe e processos fiscais com dados da empresa, itens e assinatura eletrônica."
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Radar de Alertas Legislativos"
              description="Acompanhe mudanças nas alíquotas modais, leis estaduais de FCP e novas normas tributárias publicadas em tempo real."
            />
          </div>
        </div>
      </section>

      {/* ━━━ O QUE É O DIFAL & COMO IMPACTA ━━━ */}
      <section className="py-20 bg-background border-t border-border/50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <HelpCircle className="h-3.5 w-3.5 mr-1" />
                Entendendo a Obrigação
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Por que o DIFAL é o maior desafio tributário das vendas interestaduais?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                O Diferencial de Alíquota (DIFAL) é o valor resultante da diferença entre a alíquota de ICMS interestadual (4%, 7% ou 12%) e a alíquota interna de ICMS do estado de destino.
              </p>
              
              <div className="space-y-3.5">
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">1</div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">EC 87/2015 e LC 190/2022:</strong> Regulamentaram a cobrança do DIFAL nas vendas para consumidor final não contribuinte em outro estado.
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">2</div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">FCP (Fundo de Combate à Pobreza):</strong> Adicional de 1% a 4% que varia por UF e por categoria de produto (NCM).
                  </p>
                </div>
                <div className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">3</div>
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Risco de Multas e Retenção:</strong> Erro na GNRE ou recolhimento a menor pode travar a mercadoria nos postos fiscais de fronteira.
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <Button onClick={handleComecar} size="lg" className="rounded-xl font-semibold">
                  Acessar Painel DIFAL
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            {/* Tabela de Alíquotas Resumo */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" />
                Alíquotas Interestaduais Constitucionais
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="p-3.5 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-foreground">Sul e Sudeste (exceto ES) → Norte, Nordeste, Centro-Oeste e ES</span>
                    <Badge variant="secondary" className="font-mono font-bold text-emerald-600">7%</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Alíquota interestadual reduzida para fomentar o desenvolvimento regional.</p>
                </div>

                <div className="p-3.5 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-foreground">Demais operações interestaduais entre estados</span>
                    <Badge variant="secondary" className="font-mono font-bold">12%</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Aplicável a operações entre estados do mesmo bloco regional ou N/NE/CO para S/SE.</p>
                </div>

                <div className="p-3.5 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-foreground">Produtos Importados (Resolução do Senado 13/2012)</span>
                    <Badge variant="secondary" className="font-mono font-bold text-blue-600">4%</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Bens e mercadorias importados ou com conteúdo de importação superior a 40%.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ━━━ TABELA COMPLETA DAS 27 UFs ━━━ */}
      <section className="py-20 bg-muted/20 border-t border-border/50">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <Badge variant="outline" className="px-3 py-1 text-xs">
              <MapPin className="h-3.5 w-3.5 mr-1 text-primary" />
              Cobertura Nacional Completa
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Alíquotas Internas e FCP de Todos os Estados
            </h2>
            <p className="text-muted-foreground text-sm">
              Consulte os parâmetros cadastrados para todas as 27 Unidades Federativas do Brasil.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {UFS.map((uf) => {
              const info = BRAZIL_STATES_TAX_DATA[uf];
              if (!info) return null;
              return (
                <div 
                  key={uf}
                  onClick={() => {
                    setDestino(uf);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="p-3.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted/40 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">{uf}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{info.regiao}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{info.nome}</p>
                  <div className="mt-2 pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Interna:</span>
                    <span className="font-semibold text-foreground">{perc(info.aliquotaInterna)}</span>
                  </div>
                  {info.fcpPadrao > 0 && (
                    <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                      <span>FCP:</span>
                      <span className="font-semibold">+{perc(info.fcpPadrao)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ━━━ PARA QUEM É O MÓDULO DIFAL ━━━ */}
      <section className="py-20 bg-background">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-4">
            <Users className="h-3.5 w-3.5 mr-1" />
            Público-Alvo
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-12">
            Desenvolvido para operações de alto volume e precisão
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <Card className="hover:border-primary/50 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">
                  🛒
                </div>
                <h3 className="font-bold text-base">E-commerces & Lojas Virtuais</h3>
                <p className="text-xs text-muted-foreground">
                  Precifique seus produtos com a margem correta considerando o imposto interestadual de cada estado de entrega.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold">
                  🏢
                </div>
                <h3 className="font-bold text-base">Sellers de Marketplace</h3>
                <p className="text-xs text-muted-foreground">
                  Simule o impacto de comissões, frete e DIFAL nas vendas feitas pelo Mercado Livre, Amazon, Shopee e Magalu.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold">
                  📊
                </div>
                <h3 className="font-bold text-base">Contadores & Analistas</h3>
                <p className="text-xs text-muted-foreground">
                  Tenha um ambiente centralizado para validar parametrização fiscal dos seus clientes sem planilhas desatualizadas.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-all">
              <CardContent className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold">
                  🏭
                </div>
                <h3 className="font-bold text-base">Indústrias & Distribuidores</h3>
                <p className="text-xs text-muted-foreground">
                  Simulação de grandes pedidos, venda de bens para consumo ou ativo imobilizado de filiais interestaduais.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ━━━ CTA FINAL ━━━ */}
      <section className="py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.15)_0%,transparent_70%)]" />
        <div className="container max-w-4xl mx-auto px-4 text-center relative z-10 space-y-6">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 mb-2">
            <Calculator className="h-8 w-8" />
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Pronto para simplificar sua apuração fiscal?
          </h2>
          
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Acesse o Módulo DIFAL Marketplace agora mesmo dentro do AtentAI e execute simulações em segundos.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg"
              onClick={handleComecar}
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold h-14 px-10 text-lg rounded-xl shadow-xl shadow-emerald-500/30"
            >
              Começar a Simular
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>

          <p className="text-xs text-slate-400 pt-4">
            * O resultado é uma estimativa baseada nas regras cadastradas. Não substitui parecer de contador habilitado.
          </p>
        </div>
      </section>

      <Footer onNavigate={handleNavigateHeader} />
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) {
  return (
    <Card className="hover:border-primary/40 hover:shadow-md transition-all duration-300">
      <CardContent className="p-6 space-y-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-bold text-lg text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}
