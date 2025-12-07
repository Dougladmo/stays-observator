/**
 * Hook for Calendar view using backend API
 * Data comes pre-transformed from unified collection - no local transformations needed
 */

import { useEffect, useMemo } from 'react';
import { useBackendData } from '../contexts/BackendDataContext';
import type { Unit, Reservation } from '../components/Calendar/types';

interface UseBackendCalendarOptions {
  from?: string;
  to?: string;
}

export function useBackendCalendar(options: UseBackendCalendarOptions = {}) {
  const {
    calendarData,
    syncStatus,
    loading,
    error,
    lastFetchTime,
    refreshCalendar,
  } = useBackendData();

  // Fetch calendar data when component mounts or date range changes
  useEffect(() => {
    if (!calendarData) {
      refreshCalendar(options.from, options.to);
    }
  }, [options.from, options.to, calendarData, refreshCalendar]);

  // Transform API calendar data to Calendar component format
  const units: Unit[] = useMemo(() => {
    if (!calendarData?.units) return [];

    return calendarData.units.map((unit) => {
      const reservations: Reservation[] = unit.reservations.map((res) => ({
        id: res.id,
        bookingId: res.bookingId,
        apartmentCode: unit.code,
        guestName: res.guestName,
        type: res.type === 'blocked' ? 'blocked' : 'reserved',
        startDate: new Date(res.startDate + 'T00:00:00'),
        endDate: new Date(res.endDate + 'T00:00:00'),
        platform: res.platform || 'Direct',
        platformImage: res.platformImage, // Already calculated by backend
        nights: res.nights,
        guestCount: res.guestCount,
        checkInTime: res.checkInTime || undefined,
        checkOutTime: res.checkOutTime || undefined,
      }));

      return {
        id: unit.id,
        code: unit.code,
        thumbnail: '', // Not used in current UI
        reservations,
      };
    });
  }, [calendarData?.units]);

  return {
    // Calendar units with reservations
    units,

    // Sync status
    lastSyncAt: syncStatus?.lastSyncAt || calendarData?.lastSyncAt || null,
    syncStatusValue: syncStatus?.status || calendarData?.syncStatus || 'never',

    // State
    loading,
    error,
    configValid: true, // Backend handles config validation
    lastFetchTime,

    // Actions
    refresh: (from?: string, to?: string) => refreshCalendar(from, to),
  };
}
