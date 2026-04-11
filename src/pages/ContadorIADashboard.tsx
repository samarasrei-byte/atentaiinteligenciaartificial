import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ContadorIADashboard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/empresa?tab=ir-declaracao', { replace: true });
  }, [navigate]);
  return null;
};

export default ContadorIADashboard;
