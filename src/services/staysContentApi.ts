/**
 * Stays.net Content API client
 * Handles authentication and API requests to Stays.net Content API
 * Used to fetch listing details including internalName (apartment code)
 */

import { config } from './config';
import type { StaysApiError } from './api/bookingTypes';

/**
 * Listing information from Content API
 */
export interface ListingDetails {
  _id: string;
  id: string;
  internalName?: string; // Apartment code like "I-VP-455-503"
  name?: string;
  address?: string;
  _mstitle?: Record<string, string>; // Multi-language titles
}

/**
 * Creates Basic Authentication header value
 */
function createBasicAuthHeader(clientId: string, clientSecret: string): string {
  const credentials = `${clientId}:${clientSecret}`;
  const base64Credentials = btoa(credentials);
  return `Basic ${base64Credentials}`;
}

/**
 * Content API client with authentication
 */
class StaysContentApiClient {
  private baseUrl: string;
  private authHeader: string;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.authHeader = createBasicAuthHeader(
      config.api.clientId,
      config.api.clientSecret
    );
  }

  /**
   * Makes an authenticated GET request to the Stays Content API
   */
  private async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    // Use proxy in development to avoid CORS issues
    const isDevelopment = import.meta.env.DEV;
    const baseUrl = isDevelopment ? '/api' : this.baseUrl;
    const url = new URL(`${baseUrl}${endpoint}`, isDevelopment ? window.location.origin : undefined);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': this.authHeader,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error: StaysApiError = {
        message: `Stays Content API error: ${response.statusText}`,
        statusCode: response.status,
        details: await response.text().catch(() => null),
      };
      throw error;
    }

    return response.json();
  }

  /**
   * Retrieves listing details including internalName (apartment code)
   * @param listingId - The listing ID from booking._idlisting
   * @returns Complete listing details
   */
  async getListingDetails(listingId: string): Promise<ListingDetails> {
    return this.get<ListingDetails>(
      `/external/v1/content/listings/${listingId}`
    );
  }
}

// Export singleton instance
export const staysContentApi = new StaysContentApiClient();

// Export factory function for testing or custom configurations
export function createContentApiClient(
  baseUrl: string,
  clientId: string,
  clientSecret: string
): StaysContentApiClient {
  const client = new StaysContentApiClient();
  (client as any).baseUrl = baseUrl;
  (client as any).authHeader = createBasicAuthHeader(clientId, clientSecret);
  return client;
}
