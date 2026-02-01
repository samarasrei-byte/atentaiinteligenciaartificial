import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PremiumOnboardingFlow, OnboardingServiceType } from '@/components/onboarding/PremiumOnboardingFlow';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const VALID_SERVICES: OnboardingServiceType[] = ['bi-contabilidade', 'analise-fiscal', 'abertura-empresa', 'ir'];

export default function ServiceOnboardingPage() {
  const { serviceType } = useParams<{ serviceType: string }>();
  const navigate = useNavigate();

  // Validate service type
  if (!serviceType || !VALID_SERVICES.includes(serviceType as OnboardingServiceType)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">Serviço não encontrado</h1>
          <p className="text-slate-600">O serviço solicitado não existe ou não está disponível.</p>
          <Button onClick={() => navigate('/servicos')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Ver Serviços
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PremiumOnboardingFlow 
      serviceType={serviceType as OnboardingServiceType}
      onComplete={(requestId) => {
        console.log('Onboarding completed, request:', requestId);
      }}
    />
  );
}
