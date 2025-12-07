/**
 * Hook for Dashboard view using backend API
 * Transforms API data to match Dashboard component types
 */

import { useMemo } from 'react';
import { useBackendData } from '../contexts/BackendDataContext';
import type { DayData, Guest } from '../components/Dashboard/types';

export function useBackendDashboard() {
  const {
    dashboardData,
    syncStatus,
    loading,
    error,
    lastFetchTime,
    refreshDashboard,
    triggerSync,
  } = useBackendData();

  // Transform API weekData to Dashboard component format
  const weekData: DayData[] = useMemo(() => {
    if (!dashboardData?.weekData) return [];

    return dashboardData.weekData.map((day) => {
      const date = new Date(day.date + 'T00:00:00');

      const guests: Guest[] = day.guests.map((g) => ({
        id: g.id,
        code: g.apartmentCode,
        unit: g.apartmentCode,
        status: g.status,
        guestName: g.guestName,
        checkInDate: g.checkInDate,
        checkOutDate: g.checkOutDate,
        nights: g.nights,
        guestCount: g.guestCount,
        platform: g.platform || undefined,
        platformImage: g.platformImage,
      }));

      return {
        date,
        dayOfWeek: day.dayOfWeek,
        dayOfMonth: date.getDate(),
        month: date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        guests,
      };
    });
  }, [dashboardData?.weekData]);

  return {
    // Week data for the main display
    weekData,

    // Occupancy statistics
    occupancyStats: dashboardData?.occupancyStats || { available: 0, occupied: 0, total: 0 },
    occupancyNext30Days: dashboardData?.occupancyNext30Days || { available: 0, occupied: 0, total: 0 },

    // Charts data
    reservationOrigins: dashboardData?.reservationOrigins || [],
    occupancyTrend: dashboardData?.occupancyTrend || [],

    // Available units
    availableUnits: dashboardData?.availableUnits || [],

    // Sync status
    lastSyncAt: syncStatus?.lastSyncAt || dashboardData?.lastSyncAt || null,
    syncStatusValue: syncStatus?.status || dashboardData?.syncStatus || 'never',

    // State
    loading,
    error,
    configValid: true, // Backend handles config validation
    lastFetchTime,

    // Actions
    refresh: refreshDashboard,
    triggerSync,
  };
}
