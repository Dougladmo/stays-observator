/**
 * Backend API Client
 * Communicates with the centralized stays-api backend
 * All data comes pre-transformed - no need for local transformations
 */

// In development, use Vite proxy; in production, use env variable
const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev ? '' : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001');
const API_KEY = import.meta.env.VITE_API_KEY || '';

/**
 * Makes an authenticated request to the backend API
 */
async function fetchApi<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  // Build URL - in dev mode use relative path (Vite proxy), in prod use full URL
  let url: string;
  if (isDev) {
    // Use relative URL for Vite proxy
    url = endpoint;
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }
  } else {
    // Use full URL in production
    const fullUrl = new URL(`${API_BASE_URL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        fullUrl.searchParams.append(key, value);
      });
    }
    url = fullUrl.toString();
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => null);
    throw new Error(
      `API Error: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}`
    );
  }

  return response.json() as Promise<T>;
}

// ============ Dashboard Types ============

export interface GuestData {
  id: string;
  bookingId: string;
  guestName: string;
  apartmentCode: string;
  status: 'checkin' | 'checkout' | 'staying';
  checkInDate: string;
  checkInTime: string | null;
  checkOutDate: string;
  checkOutTime: string | null;
  guestCount: number;
  nights: number;
  platform: string | null;
  platformImage: string;
}

export interface DayData {
  date: string;
  dayOfWeek: string;
  isToday: boolean;
  guests: GuestData[];
}

export interface OccupancyStats {
  available: number;
  occupied: number;
  total: number;
}

export interface ReservationOrigin {
  name: string;
  count: number;
  color: string;
}

export interface OccupancyTrendPoint {
  date: string;
  rate: number;
}

export interface DashboardResponse {
  weekData: DayData[];
  occupancyStats: OccupancyStats;
  occupancyNext30Days: OccupancyStats;
  reservationOrigins: ReservationOrigin[];
  occupancyTrend: OccupancyTrendPoint[];
  availableUnits: string[];
  lastSyncAt: string | null;
  syncStatus: string;
}

// ============ Calendar Types ============

export interface CalendarReservation {
  id: string;
  bookingId: string;
  guestName: string;
  type: 'reserved' | 'blocked' | 'provisional';
  startDate: string;
  endDate: string;
  platform: string | null;
  platformImage: string;
  nights: number;
  guestCount: number;
  adults: number;
  children: number;
  babies: number;
  checkInTime: string | null;
  checkOutTime: string | null;
}

export interface CalendarUnit {
  id: string;
  code: string;
  name: string | null;
  reservations: CalendarReservation[];
}

export interface CalendarResponse {
  units: CalendarUnit[];
  lastSyncAt: string | null;
  syncStatus: string;
}

// ============ Sync Types ============

export interface SyncStatus {
  lastSyncAt: string | null;
  status: 'success' | 'error' | 'running' | 'never';
  lastError: string | null;
  bookingsCount: number;
  listingsCount: number;
  durationMs: number;
}

// ============ API Functions ============

/**
 * Fetches dashboard data from the backend
 * Data comes pre-transformed and ready to display
 */
export async function getDashboard(): Promise<DashboardResponse> {
  return fetchApi<DashboardResponse>('/api/v1/dashboard');
}

/**
 * Fetches calendar data from the backend
 * @param from Start date (YYYY-MM-DD) - defaults to 1 month ago
 * @param to End date (YYYY-MM-DD) - defaults to 3 months from now
 */
export async function getCalendar(from?: string, to?: string): Promise<CalendarResponse> {
  const params: Record<string, string> = {};
  if (from) params.from = from;
  if (to) params.to = to;

  return fetchApi<CalendarResponse>('/api/v1/calendar', params);
}

/**
 * Gets the current sync status
 */
export async function getSyncStatus(): Promise<SyncStatus> {
  return fetchApi<SyncStatus>('/api/v1/sync/status');
}

/**
 * Triggers a manual sync
 */
export async function triggerSync(): Promise<{ message: string; timestamp: string }> {
  const url = `${API_BASE_URL}/api/v1/sync/trigger`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => null);
    throw new Error(
      `API Error: ${response.status} ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}`
    );
  }

  return response.json();
}

/**
 * Checks if the backend API is available
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}

// Export singleton-like API object for convenience
export const backendApi = {
  getDashboard,
  getCalendar,
  getSyncStatus,
  triggerSync,
  checkHealth,
};
