/**
 * Hook for Dashboard-specific data transformation
 * Uses shared booking data from context (no duplicate API calls)
 */

import { useMemo } from 'react';
import { useBookingDataContext } from '../contexts/BookingDataContext';
import type { DayData, OccupancyStats, ReservationOrigin } from '../components/Dashboard/types';
import {
  createWeekDataFromBookings,
  calculateOccupancyFromBookings,
  calculateOccupancyNext30Days,
  getReservationOrigins,
  calculateOccupancyTrend,
  getAvailableUnits,
} from '../services/bookingTransformers';

export interface UseDashboardDataResult {
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
}

export function useDashboardData(): UseDashboardDataResult {
  const { bookings, allListingsMap, loading, error, configValid } = useBookingDataContext();

  // Get today's date for calculations
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Memoized transformations (only recalculate when bookings change)
  const weekData: DayData[] = useMemo(
    () => bookings.length > 0 ? createWeekDataFromBookings(bookings, today, 7) : [],
    [bookings, todayStr]
  );

  const occupancyStats: OccupancyStats = useMemo(
    () => bookings.length > 0 ? calculateOccupancyFromBookings(bookings, todayStr) : { available: 0, occupied: 0, total: 0 },
    [bookings, todayStr]
  );

  const occupancyNext30Days: OccupancyStats = useMemo(
    () => bookings.length > 0 ? calculateOccupancyNext30Days(bookings, today, 30) : { available: 0, occupied: 0, total: 0 },
    [bookings, todayStr]
  );

  const reservationOrigins: ReservationOrigin[] = useMemo(
    () => bookings.length > 0 ? getReservationOrigins(bookings) : [],
    [bookings]
  );

  const occupancyTrend = useMemo(
    () => bookings.length > 0 ? calculateOccupancyTrend(bookings, today, 30) : [],
    [bookings, todayStr]
  );

  const availableUnits = useMemo(
    () => bookings.length > 0 ? getAvailableUnits(bookings, todayStr, allListingsMap) : [],
    [bookings, todayStr, allListingsMap]
  );

  return {
    weekData,
    occupancyStats,
    occupancyNext30Days,
    reservationOrigins,
    occupancyTrend,
    availableUnits,
    loading,
    error,
    configValid,
  };
}
