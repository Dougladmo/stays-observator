/**
 * React hook for fetching and managing Calendar data from Stays Booking API
 * Provides 60 days of reservation data for calendar view
 */

import { useState, useEffect } from 'react';
import { validateConfig } from '../services/config';
import { staysBookingApi } from '../services/staysBookingApi';
import type { StaysBooking } from '../services/api/bookingTypes';
import type { Unit } from '../components/Calendar/types';
import { bookingsToCalendarUnits } from '../services/calendarTransformers';
import { enrichBookingsWithDetails } from '../services/bookingDetailsCache';
import { getDateRange } from '../services/bookingTransformers';

export interface UseCalendarDataResult {
  /** Calendar units with reservations */
  units: Unit[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Configuration validation result */
  configValid: boolean;
  /** Refetch data manually */
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage Calendar data from Stays Booking API
 * Fetches 60 days of reservation data and transforms to calendar format
 */
export function useCalendarData(): UseCalendarDataResult {
  const [bookings, setBookings] = useState<StaysBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate configuration
  const configValidation = validateConfig();

  const fetchData = async () => {
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
      // Fetch booking data for 60 days (calendar view)
      const today = new Date();
      const { from, to } = getDateRange(today, 60);

      // Get all bookings with automatic pagination
      const basicBookings = await staysBookingApi.getAllBookings(from, to, 'included');

      // Enrich bookings with detailed information (guest names, platform info, internalName)
      const enrichedBookings = await enrichBookingsWithDetails(basicBookings, 10);

      setBookings(enrichedBookings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar dados da API Stays Booking';
      setError(errorMessage);
      console.error('Calendar data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Timer 1: Update at midnight to refresh calendar
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      fetchData();

      // After first update, repeat every 24h
      const dailyInterval = setInterval(() => {
        fetchData();
      }, 24 * 60 * 60 * 1000);

      return () => clearInterval(dailyInterval);
    }, msUntilMidnight);

    // Timer 2: Periodic update to capture new reservations (every 5 minutes)
    const periodicInterval = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000); // 5 minutes

    // Cleanup timers
    return () => {
      clearTimeout(midnightTimer);
      clearInterval(periodicInterval);
    };
  }, []);

  // Transform bookings to calendar units
  const units: Unit[] = bookings.length > 0
    ? bookingsToCalendarUnits(bookings)
    : [];

  return {
    units,
    loading,
    error,
    configValid: configValidation.valid,
    refetch: fetchData,
  };
}
