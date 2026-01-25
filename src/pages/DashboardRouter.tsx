import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { logAuditEvent } from '@/hooks/useAuditLog';

/**
 * Smart router that redirects users to their appropriate panel based on role:
 * - Admin → /admin
 * - Contador → /contador
 * - Autônomo → /autonomo
 * - Afiliado → /afiliado/painel
 * - Parceiro → /parceiro
 * - Empresa (user default) → /empresa
 * 
 * Priority order ensures users with multiple roles go to the most appropriate panel.
 */
const DashboardRouter = () => {
  const navigate = useNavigate();
  const { user, loading, hasRole, roles, checkAffiliateStatus, checkPartnerStatus } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const determineDestination = async () => {
      if (loading) return;
      
      if (!user) {
        navigate('/auth', { replace: true });
        return;
      }

      setIsChecking(true);

      try {
        // Check affiliate and partner status in parallel
        const [isAffiliate, isPartner] = await Promise.all([
          checkAffiliateStatus(),
          checkPartnerStatus()
        ]);

        // Count available profiles
        let availableProfilesCount = 0;
        const availableProfiles: string[] = [];

        if (hasRole('admin')) {
          availableProfilesCount++;
          availableProfiles.push('admin');
        }
        if (hasRole('contador')) {
          availableProfilesCount++;
          availableProfiles.push('contador');
        }
        if (isPartner) {
          availableProfilesCount++;
          availableProfiles.push('parceiro');
        }
        if (isAffiliate || hasRole('affiliate')) {
          availableProfilesCount++;
          availableProfiles.push('afiliado');
        }
        if (hasRole('autonomo')) {
          availableProfilesCount++;
          availableProfiles.push('autonomo');
        }
        
        // Always count empresa/user as available
        availableProfilesCount++;
        availableProfiles.push('empresa');

        // Log the routing decision
        await logAuditEvent({
          userId: user.id,
          userEmail: user.email,
          actionType: 'dashboard_route',
          routeAttempted: '/dashboard',
          metadata: { 
            available_profiles: availableProfiles, 
            profile_count: availableProfilesCount 
          }
        });

        // If user has 3+ profiles (excluding the default empresa), go to profile selector
        if (availableProfilesCount > 2) {
          navigate('/selecionar-perfil', { replace: true });
          return;
        }

        // Priority-based routing: admin > contador > partner > affiliate > autonomo > empresa
        if (hasRole('admin')) {
          navigate('/admin', { replace: true });
          return;
        }
        
        if (hasRole('contador')) {
          navigate('/contador', { replace: true });
          return;
        }

        if (isPartner) {
          navigate('/parceiro', { replace: true });
          return;
        }

        if (isAffiliate || hasRole('affiliate')) {
          navigate('/afiliado/painel', { replace: true });
          return;
        }

        if (hasRole('autonomo')) {
          navigate('/autonomo', { replace: true });
          return;
        }

        // Check if user only has 'user' role (default)
        const hasAnySpecificRole = roles.length > 0 && !roles.every(r => r === 'user');
        
        // If user only has 'user' role, check if they need onboarding
        if (!hasAnySpecificRole) {
          const { data: companyData } = await supabase
            .from('companies')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!companyData) {
            navigate('/bem-vindo', { replace: true });
            return;
          }
        }

        // Default user goes to empresa panel
        navigate('/empresa', { replace: true });
      } catch (error) {
        console.error('Error determining destination:', error);
        navigate('/empresa', { replace: true });
      } finally {
        setIsChecking(false);
      }
    };

    determineDestination();
  }, [user, loading, hasRole, roles, navigate, checkAffiliateStatus, checkPartnerStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="text-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
        <p className="text-white/60 font-medium">Redirecionando para seu painel...</p>
      </div>
    </div>
  );
};

export default DashboardRouter;
