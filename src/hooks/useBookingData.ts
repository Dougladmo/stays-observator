/**
 * React hook for fetching and managing Stays Booking API data
 * Provides real reservation data with guest codes and check-in/out information
 */

import { useState, useEffect } from 'react';
import { validateConfig } from '../services/config';
import { staysBookingApi } from '../services/staysBookingApi';
import type { StaysBooking } from '../services/api/bookingTypes';
import type { DayData, OccupancyStats, ReservationOrigin } from '../components/Dashboard/types';
import {
  createWeekDataFromBookings,
  calculateOccupancyFromBookings,
  calculateOccupancyNext30Days,
  getReservationOrigins,
  calculateOccupancyTrend,
  getAvailableUnits,
  getDateRange,
} from '../services/bookingTransformers';

export interface UseBookingDataResult {
  /** Week data for the dashboard (7 days) */
  weekData: DayData[];
  /** Current occupancy statistics */
  occupancyStats: OccupancyStats;
  /** Occupancy statistics for next 30 days */
  occupancyNext30Days: OccupancyStats;
  /** Reservation origins distribution */
  reservationOrigins: ReservationOrigin[];
  /** Occupancy trend data for chart */
  occupancyTrend: { date: string; rate: number }[];
  /** List of currently available units */
  availableUnits: string[];
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
 * Hook to fetch and manage Stays Booking API data
 *
 * Uses the Booking API to get real reservation data including:
 * - Guest codes (e.g., "STA-7767", "CHE-6442")
 * - Check-in/check-out dates and times
 * - Guest status classification (checkin/checkout/staying)
 * - Reservation origins (booking channels)
 */
export function useBookingData(): UseBookingDataResult {
  const [bookings, setBookings] = useState<StaysBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate configuration (only client credentials needed, no listing IDs)
  const configValidation = validateConfig();

  const fetchData = async () => {
    // Skip API call if configuration is invalid
    if (!configValidation.valid) {
      // Filter out LISTING_IDS from error message since it's not needed for Booking API
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
      // Fetch booking data for the next 37 days (7 days for week view + 30 for trends)
      const today = new Date();
      const { from, to } = getDateRange(today, 37);

      // Get all bookings with automatic pagination
      const allBookings = await staysBookingApi.getAllBookings(from, to, 'included');

      setBookings(allBookings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar dados da API Stays Booking';
      setError(errorMessage);
      console.error('Stays Booking API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get today's date for calculations
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Create week data from bookings (7 days starting today)
  const weekData: DayData[] = bookings.length > 0
    ? createWeekDataFromBookings(bookings, today, 7)
    : [];

  // Calculate current occupancy statistics
  const occupancyStats: OccupancyStats = bookings.length > 0
    ? calculateOccupancyFromBookings(bookings, todayStr)
    : { available: 0, occupied: 0, total: 0 };

  // Calculate 30-day occupancy statistics
  const occupancyNext30Days: OccupancyStats = bookings.length > 0
    ? calculateOccupancyNext30Days(bookings, today, 30)
    : { available: 0, occupied: 0, total: 0 };

  // Get reservation origins distribution
  const reservationOrigins: ReservationOrigin[] = bookings.length > 0
    ? getReservationOrigins(bookings)
    : [];

  // Calculate occupancy trend for chart (30 days)
  const occupancyTrend = bookings.length > 0
    ? calculateOccupancyTrend(bookings, today, 30)
    : [];

  // Get currently available units
  const availableUnits = bookings.length > 0
    ? getAvailableUnits(bookings, todayStr)
    : [];

  return {
    weekData,
    occupancyStats,
    occupancyNext30Days,
    reservationOrigins,
    occupancyTrend,
    availableUnits,
    loading,
    error,
    configValid: configValidation.valid,
    refetch: fetchData,
  };
}
