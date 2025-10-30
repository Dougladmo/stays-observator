/**
 * Stays.net Booking API client
 * Handles authentication and API requests to Stays.net Booking API
 */

import { config } from './config';
import type { GetBookingsParams, StaysBooking, StaysApiError } from './api/bookingTypes';

/**
 * Creates Basic Authentication header value
 */
function createBasicAuthHeader(clientId: string, clientSecret: string): string {
  const credentials = `${clientId}:${clientSecret}`;
  const base64Credentials = btoa(credentials);
  return `Basic ${base64Credentials}`;
}

/**
 * Booking API client with authentication and automatic pagination
 */
class StaysBookingApiClient {
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
   * Makes an authenticated GET request to the Stays Booking API
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
        message: `Stays Booking API error: ${response.statusText}`,
        statusCode: response.status,
        details: await response.text().catch(() => null),
      };
      throw error;
    }

    return response.json();
  }

  /**
   * Retrieves booking/reservation data
   * @see Stays.net Booking API documentation
   */
  async getBookings(params: GetBookingsParams): Promise<StaysBooking[]> {
    const { from, to, dateType = 'included', skip = 0, limit = 20 } = params;

    const queryParams: Record<string, string> = {
      from,
      to,
      dateType,
      skip: String(skip),
      limit: String(limit),
    };

    return this.get<StaysBooking[]>(
      '/external/v1/booking/reservations',
      queryParams
    );
  }

  /**
   * Retrieves all bookings with automatic pagination
   * The API returns maximum 20 records per request, this method fetches all
   */
  async getAllBookings(
    from: string,
    to: string,
    dateType: GetBookingsParams['dateType'] = 'included'
  ): Promise<StaysBooking[]> {
    const allBookings: StaysBooking[] = [];
    let skip = 0;
    const limit = 20;
    let hasMore = true;

    while (hasMore) {
      const bookings = await this.getBookings({
        from,
        to,
        dateType,
        skip,
        limit,
      });

      allBookings.push(...bookings);

      // If we got less than limit, we've reached the end
      hasMore = bookings.length === limit;
      skip += limit;

      // Safety limit to prevent infinite loops
      if (skip > 1000) {
        console.warn('Reached safety limit of 1000 bookings');
        break;
      }
    }

    return allBookings;
  }
}

// Export singleton instance
export const staysBookingApi = new StaysBookingApiClient();

// Export factory function for testing or custom configurations
export function createBookingApiClient(
  baseUrl: string,
  clientId: string,
  clientSecret: string
): StaysBookingApiClient {
  const client = new StaysBookingApiClient();
  (client as any).baseUrl = baseUrl;
  (client as any).authHeader = createBasicAuthHeader(clientId, clientSecret);
  return client;
}
