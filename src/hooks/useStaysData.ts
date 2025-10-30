/**
 * React hook for fetching and managing Stays API data
 * Integrates real API data with mock guest information
 */

import { useState, useEffect } from 'react';
import { config, validateConfig } from '@/services/config';
import { staysApi } from '@/services/api/staysApi';
import type { StaysCalendarDay } from '@/services/api/types';
import type { DayData, OccupancyStats, ReservationOrigin } from '@/components/Dashboard/types';
import {
  calculateOccupancyStats,
  calculateOccupancyTrend,
  getAvailableUnits,
  getDateRange,
  isWithinNextDays,
} from '@/services/api/transformers';

export interface UseStaysDataResult {
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
 * Hook to fetch and manage Stays API data
 *
 * Note: Currently, the Stays API only provides availability/calendar data.
 * Guest details (codes, units, check-in/out status) are not available via the API,
 * so we continue using mock data for those fields until additional API endpoints are provided.
 */
export function useStaysData(): UseStaysDataResult {
  const [calendarData, setCalendarData] = useState<Map<string, StaysCalendarDay[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate configuration
  const configValidation = validateConfig();

  const fetchData = async () => {
    // Skip API call if configuration is invalid
    if (!configValidation.valid) {
      setError(`Configuração inválida. Variáveis faltando: ${configValidation.missingVars.join(', ')}`);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch calendar data for the next 37 days (7 days for week view + 30 for trends)
      const { from, to } = getDateRange(new Date(), 37);

      const data = await staysApi.getCalendarForMultipleListings(
        config.api.listingIds,
        from,
        to
      );

      setCalendarData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar dados da API Stays';
      setError(errorMessage);
      console.error('Stays API error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate occupancy statistics from API data
  const occupancyStats: OccupancyStats = calendarData.size > 0
    ? calculateOccupancyStats(calendarData, (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const checkDate = new Date(date + 'T00:00:00');
        return checkDate.toDateString() === today.toDateString();
      })
    : { available: 0, occupied: 0, total: config.api.listingIds.length };

  // Calculate 30-day occupancy statistics from API data
  const occupancyNext30Days: OccupancyStats = calendarData.size > 0
    ? calculateOccupancyStats(calendarData, (date) => isWithinNextDays(date, 30))
    : { available: 0, occupied: 0, total: config.api.listingIds.length };

  // Calculate occupancy trend from API data
  const occupancyTrend = calendarData.size > 0
    ? calculateOccupancyTrend(calendarData).slice(0, 30) // First 30 days
    : [];

  // Get currently available units from API data
  const today = new Date().toISOString().split('T')[0];
  const availableUnits = calendarData.size > 0
    ? getAvailableUnits(calendarData, today)
    : [];

  return {
    // Note: This hook is deprecated. Use useBookingData for complete reservation data.
    weekData: [],

    // Occupancy statistics from API
    occupancyStats,
    occupancyNext30Days,

    // Reservation origins (empty - use useBookingData instead)
    reservationOrigins: [],

    // Occupancy trend from API
    occupancyTrend,

    // Available units from API
    availableUnits,

    // State management
    loading,
    error,
    configValid: configValidation.valid,
    refetch: fetchData,
  };
}
