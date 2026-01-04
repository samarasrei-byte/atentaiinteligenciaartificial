import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { SimulatorSection } from "@/components/sections/SimulatorSection";
import { AISection } from "@/components/sections/AISection";
import { ProfilesSection } from "@/components/sections/ProfilesSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { LimpaNomeSection } from "@/components/sections/LimpaNomeSection";
import { FiscalModuleSection } from "@/components/sections/FiscalModuleSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { SuccessCasesSection } from "@/components/sections/SuccessCasesSection";
import { LandingAIAgent } from "@/components/ai/LandingAIAgent";

const Index = () => {
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
        <HeroSection onNavigate={scrollToSection} />
        <FeaturesSection />
        <StatsSection />
        <SuccessCasesSection />
        <div id="limpa-nome">
          <LimpaNomeSection />
        </div>
        <div id="modulo-fiscal">
          <FiscalModuleSection />
        </div>
        <SimulatorSection />
        <AISection />
        <ProfilesSection />
        <PricingSection />
        <FAQSection />
        <TestimonialsSection />
      </main>

      <Footer onNavigate={scrollToSection} />
      
      {/* Agente de IA flutuante para conversão */}
      <LandingAIAgent />
    </div>
  );
};

export default Index;
