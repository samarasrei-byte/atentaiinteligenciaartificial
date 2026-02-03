/**
 * Feature Flags System
 * 
 * Centralized feature flag management for reversible feature toggles.
 * This allows temporarily hiding features without removing code.
 * 
 * USAGE:
 * import { FEATURE_FLAGS, isFeatureEnabled } from '@/lib/featureFlags';
 * 
 * if (isFeatureEnabled('CONTADOR_EXPERIENCE')) {
 *   // Show contador-related UI
 * }
 */

export const FEATURE_FLAGS = {
  /**
   * CONTADOR_EXPERIENCE
   * 
   * Controls the entire contador (accountant) experience visibility.
   * When FALSE:
   * - Hides contador profile option from signup/onboarding
   * - Hides contador panel and dashboard routing
   * - Hides contador plans from pricing pages
   * - Hides "Para Contadores" sections
   * - PRESERVES: "Falar com contador" and "Procurar contador" features
   * 
   * Set to TRUE to re-enable the full contador experience.
   */
  CONTADOR_EXPERIENCE: false,

  /**
   * LEGACY_SERVICES
   * 
   * Controls visibility of legacy accounting services:
   * - Abertura de Empresa
   * - Emissão de Certidões
   * - Declaração IR Simples
   * - Declaração IR Completo
   * 
   * When FALSE: These services are hidden from ALL panels (admin, empresa, autonomo, afiliado)
   * When TRUE: Services are visible as before
   * 
   * This is reversible - set to TRUE to restore these services.
   */
  LEGACY_SERVICES: false,
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

/**
 * Check if a feature is enabled
 * @param flag - The feature flag key to check
 * @returns boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlagKey): boolean {
  return FEATURE_FLAGS[flag] ?? false;
}

/**
 * Check if contador experience is enabled
 * Convenience function for the most commonly checked flag
 */
export function isContadorEnabled(): boolean {
  return isFeatureEnabled('CONTADOR_EXPERIENCE');
}
