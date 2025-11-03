/**
 * Shared booking data context
 * Prevents duplicate API calls when switching between Dashboard and Calendar
 * Maintains a 5-minute cache for all booking data
 * Uses localStorage for instant loading on subsequent visits
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { validateConfig, config } from '../services/config';
import { staysBookingApi } from '../services/staysBookingApi';
import { staysContentApi } from '../services/staysContentApi';
import type { StaysBooking } from '../services/api/bookingTypes';
import { enrichBookingsWithDetails } from '../services/bookingDetailsCache';

interface BookingDataContextType {
  /** All bookings (raw data) */
  bookings: StaysBooking[];
  /** Complete map of all listing IDs to their internal names/codes */
  allListingsMap: Map<string, string>;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Configuration validation result */
  configValid: boolean;
  /** Last fetch timestamp */
  lastFetchTime: number | null;
  /** Force refresh data */
  refresh: () => Promise<void>;
}

const BookingDataContext = createContext<BookingDataContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const STORAGE_KEY = 'stays-observator-booking-data';
const STORAGE_VERSION = 1;

/**
 * Cached data structure for localStorage
 */
interface CachedBookingData {
  version: number;
  bookings: StaysBooking[];
  listingsMap: [string, string][]; // Map serialized as array of pairs
  timestamp: number;
  lastFetchTime: number;
}

/**
 * Save booking data to localStorage for instant loading on next visit
 */
function saveToLocalStorage(
  bookings: StaysBooking[],
  listingsMap: Map<string, string>,
  lastFetchTime: number
): void {
  try {
    const data: CachedBookingData = {
      version: STORAGE_VERSION,
      bookings,
      listingsMap: Array.from(listingsMap.entries()),
      timestamp: Date.now(),
      lastFetchTime,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    console.log('💾 Saved to localStorage:', {
      bookingsCount: bookings.length,
      listingsCount: listingsMap.size,
    });
  } catch (error) {
    console.error('❌ Failed to save to localStorage:', error);
    // Non-blocking error - continue without localStorage
  }
}

/**
 * Load booking data from localStorage
 * Returns null if no data, corrupted data, or version mismatch
 */
function loadFromLocalStorage(): {
  bookings: StaysBooking[];
  listingsMap: Map<string, string>;
  timestamp: number;
  lastFetchTime: number;
} | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      console.log('📭 No cached data in localStorage');
      return null;
    }

    const data: CachedBookingData = JSON.parse(raw);

    // Version validation
    if (data.version !== STORAGE_VERSION) {
      console.warn('⚠️ localStorage version mismatch, clearing cache');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Structure validation
    if (!Array.isArray(data.bookings) || !Array.isArray(data.listingsMap)) {
      console.warn('⚠️ Invalid localStorage data structure, clearing cache');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    const age = Date.now() - data.timestamp;
    const ageMinutes = Math.floor(age / 60000);
    console.log(`📦 Loaded from localStorage (age: ${ageMinutes} minutes)`, {
      bookingsCount: data.bookings.length,
      listingsCount: data.listingsMap.length,
    });

    return {
      bookings: data.bookings,
      listingsMap: new Map(data.listingsMap),
      timestamp: data.timestamp,
      lastFetchTime: data.lastFetchTime,
    };
  } catch (error) {
    console.error('❌ Failed to load from localStorage:', error);
    // Clear corrupted data
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignore cleanup errors
    }
    return null;
  }
}

export function BookingDataProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<StaysBooking[]>([]);
  const [allListingsMap, setAllListingsMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  const configValidation = validateConfig();

  const fetchData = useCallback(async (force = false, backgroundRefresh = false) => {
    // Check if we need to fetch (no data or cache expired or forced)
    const now = Date.now();
    if (!force && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
      console.log('📦 Using cached booking data');
      return;
    }

    // Skip API call if configuration is invalid
    if (!configValidation.valid) {
      const relevantMissingVars = configValidation.missingVars.filter(
        (v) => v !== 'VITE_STAYS_LISTING_IDS'
      );

      if (relevantMissingVars.length > 0) {
        setError(`Configuração inválida. Variáveis faltando: ${relevantMissingVars.join(', ')}`);
        setLoading(false);
        return;
      }
    }

    // Only show loading spinner if not a background refresh
    if (!backgroundRefresh) {
      setLoading(true);
    } else {
      console.log('🔄 Background refresh (UI not blocked)');
    }
    setError(null);

    try {
      const logPrefix = backgroundRefresh ? '🔄 [Background]' : '🔄';
      console.log(`${logPrefix} Fetching fresh booking data...`);

      // Fetch extended period to capture ALL properties
      // 180 days back + 180 days forward = 1 year total
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() - 180);

      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + 180);

      const from = startDate.toISOString().split('T')[0];
      const to = endDate.toISOString().split('T')[0];

      // Get all bookings with automatic pagination
      const basicBookings = await staysBookingApi.getAllBookings(from, to, 'included');

      console.log(`✅ Fetched ${basicBookings.length} bookings from ${from} to ${to}`);

      // Enrich bookings with detailed information
      const enrichedBookings = await enrichBookingsWithDetails(basicBookings, 10);

      // Build complete listings map (IDs from bookings + missing IDs from config)
      const listingsMap = new Map<string, string>();

      // Add all listings from bookings
      enrichedBookings.forEach(booking => {
        if (booking._idlisting && booking.listing?.internalName) {
          const code = booking.listing.internalName.split('|')[0].trim();
          listingsMap.set(booking._idlisting, code);
        }
      });

      console.log(`📊 Found ${listingsMap.size} listings from bookings`);

      // If config has listing IDs, fetch missing ones
      if (config.api.listingIds.length > 0) {
        const configIds = new Set(config.api.listingIds);
        const bookingIds = new Set(enrichedBookings.map(b => b._idlisting).filter((id): id is string => typeof id === 'string'));
        const missingIds = Array.from(configIds).filter((id): id is string => typeof id === 'string' && !bookingIds.has(id));

        if (missingIds.length > 0) {
          console.log(`🔍 Fetching ${missingIds.length} missing listings from Content API...`);

          for (const listingId of missingIds) {
            try {
              const details = await staysContentApi.getListingDetails(listingId);
              const code = details.internalName
                ? details.internalName.split('|')[0].trim()
                : listingId;
              listingsMap.set(listingId, code);
              console.log(`✅ Fetched: ${code}`);
            } catch (err) {
              console.warn(`⚠️ Could not fetch listing ${listingId}:`, err);
              listingsMap.set(listingId, listingId); // Fallback to ID
            }
          }
        }
      }

      console.log(`✅ Total listings map: ${listingsMap.size} properties`);

      const newFetchTime = Date.now();

      // Save to localStorage for instant loading next time
      saveToLocalStorage(enrichedBookings, listingsMap, newFetchTime);

      setBookings(enrichedBookings);
      setAllListingsMap(listingsMap);
      setLastFetchTime(newFetchTime);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar dados da API Stays Booking';
      setError(errorMessage);
      console.error('Booking data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [configValidation, lastFetchTime]);

  // Initial load: Try localStorage first, then fetch in background
  useEffect(() => {
    const cachedData = loadFromLocalStorage();

    if (cachedData) {
      // Load cached data instantly (no loading spinner)
      console.log('⚡ Instant load from localStorage');
      setBookings(cachedData.bookings);
      setAllListingsMap(cachedData.listingsMap);
      setLastFetchTime(cachedData.lastFetchTime);
      setLoading(false);

      // Fetch fresh data in background to keep cache updated
      console.log('🔄 Starting background refresh...');
      fetchData(false, true); // backgroundRefresh = true
    } else {
      // No cache: do normal fetch with loading spinner
      console.log('🆕 First time load - fetching from API...');
      fetchData();
    }
  }, []);

  // Auto-refresh every 5 minutes (background refresh - no loading spinner)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏰ Auto-refresh: 5 minutes elapsed');
      fetchData(false, true); // backgroundRefresh = true
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Midnight refresh (background refresh - no loading spinner)
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      console.log('🌙 Midnight refresh');
      fetchData(true, true); // force = true, backgroundRefresh = true

      // After first midnight, repeat every 24h
      const dailyInterval = setInterval(() => {
        fetchData(true, true); // force = true, backgroundRefresh = true
      }, 24 * 60 * 60 * 1000);

      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    return () => clearTimeout(midnightTimer);
  }, [fetchData]);

  return (
    <BookingDataContext.Provider
      value={{
        bookings,
        allListingsMap,
        loading,
        error,
        configValid: configValidation.valid,
        lastFetchTime,
        refresh: () => fetchData(true),
      }}
    >
      {children}
    </BookingDataContext.Provider>
  );
}

export function useBookingDataContext() {
  const context = useContext(BookingDataContext);
  if (context === undefined) {
    throw new Error('useBookingDataContext must be used within a BookingDataProvider');
  }
  return context;
}
