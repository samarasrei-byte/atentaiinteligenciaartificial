import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { AIDemoSection } from "@/components/sections/AIDemoSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { ServicesHubModern } from "@/components/dashboard/ServicesHubModern";

import { useEffect, lazy, Suspense } from "react";
import { Helmet } from "react-helmet-async";

// Lazy load below-the-fold sections for performance
const SimulatorSection = lazy(() => import("@/components/sections/SimulatorSection").then(m => ({ default: m.SimulatorSection })));
const AISection = lazy(() => import("@/components/sections/AISection").then(m => ({ default: m.AISection })));
const ProfilesSection = lazy(() => import("@/components/sections/ProfilesSection").then(m => ({ default: m.ProfilesSection })));
const PricingSection = lazy(() => import("@/components/sections/PricingSection").then(m => ({ default: m.PricingSection })));
const TestimonialsSection = lazy(() => import("@/components/sections/TestimonialsSection").then(m => ({ default: m.TestimonialsSection })));
const LimpaNomeSection = lazy(() => import("@/components/sections/LimpaNomeSection").then(m => ({ default: m.LimpaNomeSection })));
const FiscalModuleSection = lazy(() => import("@/components/sections/FiscalModuleSection").then(m => ({ default: m.FiscalModuleSection })));
const FiscalTestimonialsSection = lazy(() => import("@/components/sections/FiscalTestimonialsSection").then(m => ({ default: m.FiscalTestimonialsSection })));
const FAQSection = lazy(() => import("@/components/sections/FAQSection").then(m => ({ default: m.FAQSection })));
const SuccessCasesSection = lazy(() => import("@/components/sections/SuccessCasesSection").then(m => ({ default: m.SuccessCasesSection })));

const Index = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const scrollToSection = (section: string) => {
    if (section === "hero") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    const element = document.getElementById(section);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const SectionFallback = () => (
    <div className="py-20 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AtentAI",
    "url": "https://atentaiinteligenciaartificial.lovable.app",
    "description": "Plataforma de inteligência artificial para a Reforma Tributária 2026. Simule impostos, tire dúvidas com IA e conecte-se com contadores.",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "39.99",
      "priceCurrency": "BRL"
    },
    "provider": {
      "@type": "Organization",
      "name": "AtentAI",
      "url": "https://atentaiinteligenciaartificial.lovable.app"
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        <title>AtentAI - Seu Guia da Reforma Tributária 2026 | IBS + CBS</title>
        <meta name="description" content="Prepare-se para a Reforma Tributária 2026 com IA. Simule impostos IBS e CBS, análise fiscal automatizada e contadores especializados. A partir de R$39,99/mês." />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://atentaiinteligenciaartificial.lovable.app" />
        <meta property="og:title" content="AtentAI - Inteligência Artificial para Reforma Tributária 2026" />
        <meta property="og:description" content="Simule o impacto do IBS e CBS no seu negócio. Análise fiscal com IA, limpa nome e marketplace de serviços contábeis." />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Header onNavigate={scrollToSection} />
      
      <main className="animate-page-enter">
        {/* Above the fold - loaded eagerly */}
        <HeroSection onNavigate={scrollToSection} />
        <AIDemoSection />
        <FeaturesSection />
        <StatsSection />

        {/* Below the fold - lazy loaded */}
        <Suspense fallback={<SectionFallback />}>
          <ProfilesSection />
        </Suspense>
        
        <section id="servicos" className="py-20 relative overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.08)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(20,184,166,0.08)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <ServicesHubModern />
          </div>
        </section>
        
        <Suspense fallback={<SectionFallback />}>
          <section id="fiscal">
            <FiscalModuleSection />
          </section>
          <FiscalTestimonialsSection />
          <section id="limpa-nome">
            <LimpaNomeSection />
          </section>
          <SuccessCasesSection />
          <SimulatorSection />
          <AISection />
          <section id="pricing">
            <PricingSection />
          </section>
          <FAQSection />
          <TestimonialsSection />
        </Suspense>
      </main>

      <Footer onNavigate={scrollToSection} />
    </div>
  );
};

export default Index;
