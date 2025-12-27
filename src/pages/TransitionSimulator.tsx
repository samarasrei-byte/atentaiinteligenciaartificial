import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TaxTransitionSimulator from '@/components/simulator/TaxTransitionSimulator';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TransitionSimulator = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onNavigate={() => navigate('/')} />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-20">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <TaxTransitionSimulator />
      </main>

      <Footer onNavigate={() => navigate('/')} />
    </div>
  );
};

export default TransitionSimulator;
