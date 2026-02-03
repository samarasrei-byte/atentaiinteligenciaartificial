/**
 * Global currency formatting utilities
 * 
 * ALWAYS use these functions for consistent currency display across the app.
 * All values are displayed with 2 decimal places (e.g., R$ 0,00)
 */

/**
 * Format cents to Brazilian Real currency string
 * @param cents - Value in cents (e.g., 10000 = R$ 100,00)
 * @returns Formatted currency string (e.g., "R$ 100,00")
 */
export function formatCurrency(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

/**
 * Format a decimal/float value to Brazilian Real currency string
 * @param value - Value in reais (e.g., 100.50 = R$ 100,50)
 * @returns Formatted currency string (e.g., "R$ 100,50")
 */
export function formatCurrencyFromValue(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'R$ 0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format cents to compact currency (without "R$" prefix, just the number)
 * @param cents - Value in cents
 * @returns Formatted number string (e.g., "100,00")
 */
export function formatCurrencyCompact(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) {
    return '0,00';
  }
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
