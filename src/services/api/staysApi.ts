/**
 * Stays.net API client
 * Handles authentication and API requests to Stays.net Listing Calendar API
 */

import { config } from '../config';
import type { GetCalendarParams, StaysCalendarDay, StaysApiError } from './types';

/**
 * Creates Basic Authentication header value
 */
function createBasicAuthHeader(clientId: string, clientSecret: string): string {
  const credentials = `${clientId}:${clientSecret}`;
  const base64Credentials = btoa(credentials);
  return `Basic ${base64Credentials}`;
}

/**
 * Base API client with authentication
 */
class StaysApiClient {
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
   * Makes an authenticated GET request to the Stays API
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
        message: `Stays API error: ${response.statusText}`,
        statusCode: response.status,
        details: await response.text().catch(() => null),
      };
      throw error;
    }

    return response.json();
  }

  /**
   * Retrieves calendar data for a listing
   * @see https://stays.net/external-api/#listing-calendar-api
   */
  async getCalendar(params: GetCalendarParams): Promise<StaysCalendarDay[]> {
    const { listingId, from, to, ignorePriceGroupUnits, ignoreCloneGroupUnits } = params;

    const queryParams: Record<string, string> = {
      from,
      to,
    };

    if (ignorePriceGroupUnits !== undefined) {
      queryParams.ignorePriceGroupUnits = String(ignorePriceGroupUnits);
    }

    if (ignoreCloneGroupUnits !== undefined) {
      queryParams.ignoreCloneGroupUnits = String(ignoreCloneGroupUnits);
    }

    return this.get<StaysCalendarDay[]>(
      `/external/v1/calendar/listing/${listingId}`,
      queryParams
    );
  }

  /**
   * Retrieves calendar data for multiple listings in parallel
   */
  async getCalendarForMultipleListings(
    listingIds: string[],
    from: string,
    to: string
  ): Promise<Map<string, StaysCalendarDay[]>> {
    const promises = listingIds.map(async (listingId) => {
      const data = await this.getCalendar({ listingId, from, to });
      return [listingId, data] as const;
    });

    const results = await Promise.all(promises);
    return new Map(results);
  }
}

// Export singleton instance
export const staysApi = new StaysApiClient();
