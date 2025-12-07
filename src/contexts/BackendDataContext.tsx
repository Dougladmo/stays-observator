/**
 * Backend Data Context
 * Simplified data provider that fetches pre-transformed data from the backend API
 * Replaces the complex BookingDataContext that called Stays API directly
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  backendApi,
  type DashboardResponse,
  type CalendarResponse,
  type SyncStatus,
} from '../services/api/backendApi';

interface BackendDataContextType {
  /** Dashboard data (pre-transformed) */
  dashboardData: DashboardResponse | null;
  /** Calendar data (pre-transformed) */
  calendarData: CalendarResponse | null;
  /** Sync status */
  syncStatus: SyncStatus | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Last fetch timestamp */
  lastFetchTime: number | null;
  /** Force refresh dashboard data */
  refreshDashboard: () => Promise<void>;
  /** Force refresh calendar data */
  refreshCalendar: (from?: string, to?: string) => Promise<void>;
  /** Trigger manual sync */
  triggerSync: () => Promise<void>;
}

const BackendDataContext = createContext<BackendDataContextType | undefined>(undefined);

const CACHE_DURATION = 60 * 1000; // 1 minute (backend handles 5-min sync)
const STORAGE_KEY = 'stays-backend-data';
const STORAGE_VERSION = 2;

interface CachedData {
  version: number;
  dashboardData: DashboardResponse | null;
  calendarData: CalendarResponse | null;
  timestamp: number;
}

/**
 * Save data to localStorage for instant loading
 */
function saveToLocalStorage(
  dashboardData: DashboardResponse | null,
  calendarData: CalendarResponse | null
): void {
  try {
    const data: CachedData = {
      version: STORAGE_VERSION,
      dashboardData,
      calendarData,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save to localStorage:', error);
  }
}

/**
 * Load data from localStorage
 */
function loadFromLocalStorage(): CachedData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data: CachedData = JSON.parse(raw);
    if (data.version !== STORAGE_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return data;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function BackendDataProvider({ children }: { children: ReactNode }) {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [calendarData, setCalendarData] = useState<CalendarResponse | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  const fetchDashboard = useCallback(async (force = false, background = false) => {
    const now = Date.now();
    if (!force && lastFetchTime && (now - lastFetchTime) < CACHE_DURATION) {
      return;
    }

    if (!background) setLoading(true);
    setError(null);

    try {
      const [dashboard, status] = await Promise.all([
        backendApi.getDashboard(),
        backendApi.getSyncStatus(),
      ]);

      setDashboardData(dashboard);
      setSyncStatus(status);
      setLastFetchTime(Date.now());

      // Save to localStorage
      saveToLocalStorage(dashboard, calendarData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar dados do dashboard';
      setError(message);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [lastFetchTime, calendarData]);

  const fetchCalendar = useCallback(async (from?: string, to?: string) => {
    setLoading(true);
    setError(null);

    try {
      const [calendar, status] = await Promise.all([
        backendApi.getCalendar(from, to),
        backendApi.getSyncStatus(),
      ]);

      setCalendarData(calendar);
      setSyncStatus(status);
      setLastFetchTime(Date.now());

      // Save to localStorage
      saveToLocalStorage(dashboardData, calendar);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar dados do calendário';
      setError(message);
      console.error('Calendar fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [dashboardData]);

  const handleTriggerSync = useCallback(async () => {
    try {
      await backendApi.triggerSync();
      // Refresh data after triggering sync
      setTimeout(() => {
        fetchDashboard(true);
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao disparar sincronização';
      setError(message);
      console.error('Sync trigger error:', err);
    }
  }, [fetchDashboard]);

  // Initial load
  useEffect(() => {
    const cached = loadFromLocalStorage();

    if (cached && cached.dashboardData) {
      // Load cached data instantly
      setDashboardData(cached.dashboardData);
      setCalendarData(cached.calendarData);
      setLastFetchTime(cached.timestamp);
      setLoading(false);

      // Refresh in background
      fetchDashboard(false, true);
    } else {
      // No cache - fetch with loading spinner
      fetchDashboard(true);
    }
  }, []);

  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard(false, true);
    }, CACHE_DURATION);

    return () => clearInterval(interval);
  }, [fetchDashboard]);

  return (
    <BackendDataContext.Provider
      value={{
        dashboardData,
        calendarData,
        syncStatus,
        loading,
        error,
        lastFetchTime,
        refreshDashboard: () => fetchDashboard(true),
        refreshCalendar: fetchCalendar,
        triggerSync: handleTriggerSync,
      }}
    >
      {children}
    </BackendDataContext.Provider>
  );
}

export function useBackendData() {
  const context = useContext(BackendDataContext);
  if (context === undefined) {
    throw new Error('useBackendData must be used within a BackendDataProvider');
  }
  return context;
}
