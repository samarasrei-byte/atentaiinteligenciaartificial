import { useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { SimulatorSection } from "@/components/sections/SimulatorSection";
import { AISection } from "@/components/sections/AISection";
import { AccountantSection } from "@/components/sections/AccountantSection";
import { FAQSection } from "@/components/sections/FAQSection";

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
    <div className="min-h-screen bg-background">
      <Header onNavigate={scrollToSection} />
      
      <main>
        <HeroSection onNavigate={scrollToSection} />
        <FeaturesSection />
        <SimulatorSection />
        <AISection />
        <AccountantSection />
        <FAQSection />
      </main>

      <Footer onNavigate={scrollToSection} />
    </div>
  );
};

export default Index;
