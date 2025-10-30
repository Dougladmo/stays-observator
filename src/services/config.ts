/**
 * Application configuration from environment variables
 */

export const config = {
  api: {
    baseUrl: import.meta.env.VITE_STAYS_API_BASE_URL || 'https://play.stays.net',
    clientId: import.meta.env.VITE_STAYS_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_STAYS_CLIENT_SECRET || '',
    listingIds: (import.meta.env.VITE_STAYS_LISTING_IDS || '')
      .split(',')
      .map((id: string) => id.trim())
      .filter(Boolean),
  },
} as const;

/**
 * Validates that all required configuration is present
 * Note: Booking API doesn't require LISTING_IDS (it retrieves all reservations automatically)
 */
export function validateConfig(): { valid: boolean; missingVars: string[] } {
  const missingVars: string[] = [];

  if (!config.api.clientId) missingVars.push('VITE_STAYS_CLIENT_ID');
  if (!config.api.clientSecret) missingVars.push('VITE_STAYS_CLIENT_SECRET');
  // Booking API doesn't require listing IDs - removed validation

  return {
    valid: missingVars.length === 0,
    missingVars,
  };
}
