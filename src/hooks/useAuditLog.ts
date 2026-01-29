import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AuditActionType = 
  | 'login_success'
  | 'login_failed'
  | 'signup_success'
  | 'signup_failed'
  | 'logout'
  | 'route_access_allowed'
  | 'route_access_denied'
  | 'dashboard_route'
  | 'admin_action'
  | 'role_change'
  | 'profile_update'
  | 'subscription_change'
  | 'service_purchase'
  | 'partner_action'
  | 'affiliate_action';

interface AuditLogParams {
  actionType: AuditActionType;
  resourceType?: string;
  resourceId?: string;
  routeAttempted?: string;
  success?: boolean;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export const useAuditLog = () => {
  const { user } = useAuth();

  const logAudit = useCallback(async ({
    actionType,
    resourceType,
    resourceId,
    routeAttempted,
    success = true,
    failureReason,
    metadata = {}
  }: AuditLogParams) => {
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id || null,
          action_type: actionType,
          resource_type: resourceType || null,
          resource_id: resourceId || null,
          route_attempted: routeAttempted || null,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
          success,
          failure_reason: failureReason || null,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            user_email: user?.email || null,
          }
        });

      if (error) {
        console.error('Failed to log audit:', error);
      }
    } catch (err) {
      console.error('Error logging audit:', err);
    }
  }, [user]);

  return { logAudit };
};

// Standalone function for logging without hook (for use in contexts)
export const logAuditEvent = async ({
  userId,
  userEmail,
  actionType,
  resourceType,
  resourceId,
  routeAttempted,
  success = true,
  failureReason,
  metadata = {}
}: {
  userId?: string;
  userEmail?: string;
  actionType: AuditActionType;
  resourceType?: string;
  resourceId?: string;
  routeAttempted?: string;
  success?: boolean;
  failureReason?: string;
  metadata?: Record<string, any>;
}) => {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId || null,
        action_type: actionType,
        resource_type: resourceType || null,
        resource_id: resourceId || null,
        route_attempted: routeAttempted || null,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
        success,
        failure_reason: failureReason || null,
        metadata: {
          ...metadata,
          timestamp: new Date().toISOString(),
          user_email: userEmail || null,
        }
      });

    if (error) {
      console.error('Failed to log audit event:', error);
    }
  } catch (err) {
    console.error('Error logging audit event:', err);
  }
};
