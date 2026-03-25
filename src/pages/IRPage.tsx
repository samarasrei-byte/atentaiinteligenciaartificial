import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { IRRequestForm } from '@/components/ir/IRRequestForm';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

const IRPage = () => {
  const navigate = useNavigate();

  const scrollToSection = (section: string) => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={scrollToSection} />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <FileText className="w-3 h-3 mr-1" />
              Imposto de Renda {new Date().getFullYear() - 1}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Declaração de Imposto de Renda
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Declaração 100% automatizada por Inteligência Artificial — rápida, precisa e segura.
            </p>
          </div>

          <IRRequestForm onSuccess={() => navigate('/dashboard')} />
        </div>
      </main>

      <Footer onNavigate={scrollToSection} />
    </div>
  );
};

export default IRPage;
