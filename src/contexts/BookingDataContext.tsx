/**
 * Shared booking data context
 * Prevents duplicate API calls when switching between Dashboard and Calendar
 * Maintains a 5-minute cache for all booking data
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { validateConfig, config } from '../services/config';
import { staysBookingApi } from '../services/staysBookingApi';
import { staysContentApi } from '../services/staysContentApi';
import type { StaysBooking } from '../services/api/bookingTypes';
import { enrichBookingsWithDetails } from '../services/bookingDetailsCache';
import { getDateRange } from '../services/bookingTransformers';

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

export function BookingDataProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<StaysBooking[]>([]);
  const [allListingsMap, setAllListingsMap] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  const configValidation = validateConfig();

  const fetchData = useCallback(async (force = false) => {
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

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching fresh booking data...');

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
        const bookingIds = new Set(enrichedBookings.map(b => b._idlisting));
        const missingIds = Array.from(configIds).filter(id => !bookingIds.has(id));

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

      setBookings(enrichedBookings);
      setAllListingsMap(listingsMap);
      setLastFetchTime(Date.now());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar dados da API Stays Booking';
      setError(errorMessage);
      console.error('Booking data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [configValidation, lastFetchTime]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('⏰ Auto-refresh: 5 minutes elapsed');
      fetchData();
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [fetchData]);

  // Midnight refresh
  useEffect(() => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      console.log('🌙 Midnight refresh');
      fetchData(true);

      // After first midnight, repeat every 24h
      const dailyInterval = setInterval(() => {
        fetchData(true);
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
