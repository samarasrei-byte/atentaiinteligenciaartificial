import React from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import TaxTransitionSimulator from '@/components/simulator/TaxTransitionSimulator';

const TransitionSimulator = () => {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-8">
          <TaxTransitionSimulator />
        </main>
      </div>
    </PublicLayout>
  );
};

export default TransitionSimulator;