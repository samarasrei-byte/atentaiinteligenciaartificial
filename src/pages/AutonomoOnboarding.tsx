import { useNavigate } from 'react-router-dom';
import AutonomoOnboarding from '@/components/onboarding/AutonomoOnboarding';

export default function AutonomoOnboardingPage() {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/autonomo');
  };

  return <AutonomoOnboarding onComplete={handleComplete} />;
}
