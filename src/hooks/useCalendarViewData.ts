/**
 * Hook for Calendar-specific data transformation
 * Uses shared booking data from context (no duplicate API calls)
 */

import { useMemo } from 'react';
import { useBookingDataContext } from '../contexts/BookingDataContext';
import type { Unit } from '../components/Calendar/types';
import { bookingsToCalendarUnits } from '../services/calendarTransformers';

export interface UseCalendarViewDataResult {
  /** Calendar units with reservations */
  units: Unit[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Configuration validation result */
  configValid: boolean;
}

export function useCalendarViewData(): UseCalendarViewDataResult {
  const { bookings, loading, error, configValid } = useBookingDataContext();

  // Transform bookings to calendar units (memoized)
  const units: Unit[] = useMemo(
    () => bookings.length > 0 ? bookingsToCalendarUnits(bookings) : [],
    [bookings]
  );

  console.log(`📅 Calendar: ${units.length} units loaded`);

  return {
    units,
    loading,
    error,
    configValid,
  };
}
