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

        // Count special profiles (NOT including empresa/user as it's always available as fallback)
        // Partner status takes priority - if user is a partner, they should go directly to partner panel
        let specialProfilesCount = 0;
        const availableProfiles: string[] = [];

        // Partner gets highest priority and is NOT counted with other profiles
        // If user is a partner, they go to partner panel directly
        if (isPartner) {
          // Partner is their primary role - skip profile selection
          availableProfiles.push('parceiro');
        } else {
          // Only count other special profiles if user is NOT a partner
          if (hasRole('admin')) {
            specialProfilesCount++;
            availableProfiles.push('admin');
          }
          if (hasRole('contador')) {
            specialProfilesCount++;
            availableProfiles.push('contador');
          }
          if (isAffiliate || hasRole('affiliate')) {
            specialProfilesCount++;
            availableProfiles.push('afiliado');
          }
          if (hasRole('autonomo')) {
            specialProfilesCount++;
            availableProfiles.push('autonomo');
          }
        }
        
        // Add empresa as last option
        availableProfiles.push('empresa');

        // Log the routing decision
        await logAuditEvent({
          userId: user.id,
          userEmail: user.email,
          actionType: 'dashboard_route',
          routeAttempted: '/dashboard',
          metadata: { 
            available_profiles: availableProfiles, 
            profile_count: specialProfilesCount 
          }
        });

        // If user is a partner, go directly to partner panel (highest priority for partners)
        if (isPartner) {
          navigate('/parceiro', { replace: true });
          return;
        }

        // If user has 2+ special profiles, go to profile selector to let them choose
        if (specialProfilesCount >= 2) {
          navigate('/selecionar-perfil', { replace: true });
          return;
        }

        // Priority-based routing: admin > contador > affiliate > autonomo > empresa
        if (hasRole('admin')) {
          navigate('/admin', { replace: true });
          return;
        }
        
        if (hasRole('contador')) {
          navigate('/contador', { replace: true });
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
