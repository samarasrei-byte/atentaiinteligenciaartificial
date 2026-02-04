import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { AIDemoSection } from "@/components/sections/AIDemoSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { SimulatorSection } from "@/components/sections/SimulatorSection";
import { AISection } from "@/components/sections/AISection";
import { ProfilesSection } from "@/components/sections/ProfilesSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { LimpaNomeSection } from "@/components/sections/LimpaNomeSection";
import { FiscalModuleSection } from "@/components/sections/FiscalModuleSection";
import { FiscalTestimonialsSection } from "@/components/sections/FiscalTestimonialsSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { SuccessCasesSection } from "@/components/sections/SuccessCasesSection";
import { ServicesHubModern } from "@/components/dashboard/ServicesHubModern";

import { useEffect } from "react";

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

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header onNavigate={scrollToSection} />
      
      <main className="animate-page-enter">
        {/* 1. HERO - Primeira impressão: O que é, para quem, CTA forte */}
        <HeroSection onNavigate={scrollToSection} />
        
        {/* 2. AI DEMO - Demonstração gratuita para engajamento imediato */}
        <AIDemoSection />
        
        {/* 3. FEATURES - O que oferecemos (benefícios claros) */}
        <FeaturesSection />
        
        {/* 3. STATS - Prova social com números (credibilidade) */}
        <StatsSection />
        
        {/* 4. PROFILES - Para quem é (PF, CNPJ, Autônomo, Parceiro) */}
        <ProfilesSection />
        
        {/* 5. MARKETPLACE - Serviços em destaque com preço e CTA direto */}
        <section id="servicos" className="py-20 relative overflow-hidden bg-gradient-to-b from-background via-muted/30 to-background">
          {/* Clean Light Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(16,185,129,0.08)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(20,184,166,0.08)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <ServicesHubModern />
          </div>
        </section>
        
        {/* 6. MÓDULO FISCAL - Serviço premium de alta conversão */}
        <section id="fiscal">
          <FiscalModuleSection />
        </section>
        
        {/* 7. FISCAL TESTIMONIALS - Prova social do módulo fiscal */}
        <FiscalTestimonialsSection />
        
        {/* 8. LIMPA NOME - Serviço secundário com atendimento humano */}
        <section id="limpa-nome">
          <LimpaNomeSection />
        </section>
        
        {/* 9. SUCCESS CASES - Cases de sucesso (prova social) */}
        <SuccessCasesSection />
        
        {/* 10. SIMULATOR - Engajamento interativo (CTA intermediário) */}
        <SimulatorSection />
        
        {/* 11. AI SECTION - Diferencial tecnológico */}
        <AISection />
        
        {/* 12. PRICING - Conversão (CTA final de decisão) */}
        <section id="pricing">
          <PricingSection />
        </section>
        
        {/* 13. FAQ - Objeções resolvidas */}
        <FAQSection />
        
        {/* 14. TESTIMONIALS - Prova social final */}
        <TestimonialsSection />
      </main>

      <Footer onNavigate={scrollToSection} />
    </div>
  );
};

export default Index;
