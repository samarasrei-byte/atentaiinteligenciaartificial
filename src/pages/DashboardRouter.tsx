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
 * If user has multiple roles, redirect to profile selector.
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
          actionType: 'route_access_allowed',
          routeAttempted: '/dashboard',
          metadata: { 
            available_profiles: availableProfiles, 
            profile_count: availableProfilesCount 
          }
        });

        // If multiple roles, go to profile selector
        if (availableProfilesCount > 2) {
          navigate('/selecionar-perfil', { replace: true });
          return;
        }

        // Single role - route directly
        // Priority-based routing: admin > contador > partner > affiliate > autonomo > empresa
        if (hasRole('admin')) {
          navigate('/admin', { replace: true });
          return;
        }
        
        if (hasRole('contador')) {
          navigate('/contador', { replace: true });
          return;
        }

        // Check if user is a partner (special access via credit_repair_partner_users)
        if (isPartner) {
          navigate('/parceiro', { replace: true });
          return;
        }

        // Check if user is an affiliate (has record in affiliates table)
        if (isAffiliate || hasRole('affiliate')) {
          navigate('/afiliado/painel', { replace: true });
          return;
        }

        if (hasRole('autonomo')) {
          navigate('/autonomo', { replace: true });
          return;
        }

        // Check if user has any specific role
        const hasAnySpecificRole = roles.length > 0 && !roles.every(r => r === 'user');
        
        // If user only has 'user' role (default), check if they need onboarding
        if (!hasAnySpecificRole) {
          // Check if user has company data (completed onboarding)
          const { data: companyData } = await supabase
            .from('companies')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!companyData) {
            // No company data - send to welcome page to choose profile
            navigate('/bem-vindo', { replace: true });
            return;
          }
        }

        // Default user goes to empresa panel
        navigate('/empresa', { replace: true });
      } catch (error) {
        console.error('Error determining destination:', error);
        // Fallback to empresa panel on error
        navigate('/empresa', { replace: true });
      } finally {
        setIsChecking(false);
      }
    };

    determineDestination();
  }, [user, loading, hasRole, roles, navigate, checkAffiliateStatus, checkPartnerStatus]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground">Redirecionando para seu painel...</p>
      </div>
    </div>
  );
};

export default DashboardRouter;
