import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { IRRequestForm } from '@/components/ir/IRRequestForm';
import { Badge } from '@/components/ui/badge';
import { FileText, Crown } from 'lucide-react';

const IRPage = () => {
  const navigate = useNavigate();
  const { subscription } = useAuth();

  const scrollToSection = (section: string) => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onNavigate={scrollToSection} />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <FileText className="w-3 h-3 mr-1" />
              Imposto de Renda {new Date().getFullYear() - 1}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Declaração de Imposto de Renda
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Deixe um contador especializado fazer sua declaração. 
              {subscription.subscribed ? (
                <span className="text-success font-medium"> Você tem 20% de desconto como assinante!</span>
              ) : (
                ' Assinantes têm 20% de desconto.'
              )}
            </p>
            {subscription.subscribed && (
              <Badge className="mt-4 bg-success/20 text-success border-success/30">
                <Crown className="w-3 h-3 mr-1" />
                Desconto de Assinante Ativo
              </Badge>
            )}
          </div>

          {/* Form */}
          <IRRequestForm onSuccess={() => navigate('/dashboard')} />
        </div>
      </main>

      <Footer onNavigate={scrollToSection} />
    </div>
  );
};

export default IRPage;
