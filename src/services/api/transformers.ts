/**
 * Data transformation utilities
 * Converts Stays API responses to Dashboard component format
 */

import type { StaysCalendarDay } from './types';
import type { OccupancyStats } from '@/components/Dashboard/types';

/**
 * Calculates occupancy statistics from calendar data
 *
 * Note: This assumes each listing represents one unit.
 * The 'avail' field indicates how many units are available.
 * - avail = 0 means occupied
 * - avail > 0 means available
 */
export function calculateOccupancyStats(
  calendarData: Map<string, StaysCalendarDay[]>,
  dateFilter?: (date: string) => boolean
): OccupancyStats {
  const totalListings = calendarData.size;
  let totalAvailable = 0;
  let totalOccupied = 0;

  calendarData.forEach((days) => {
    // Filter days if a filter function is provided
    const relevantDays = dateFilter
      ? days.filter(day => dateFilter(day.date))
      : days;

    if (relevantDays.length === 0) return;

    // Calculate average availability for this listing
    const avgAvailability = relevantDays.reduce((sum, day) => sum + day.avail, 0) / relevantDays.length;

    // If average availability is 0, consider it occupied
    if (avgAvailability === 0) {
      totalOccupied++;
    } else {
      totalAvailable++;
    }
  });

  return {
    available: totalAvailable,
    occupied: totalOccupied,
    total: totalListings,
  };
}

/**
 * Calculates occupancy trend over time
 * Returns daily occupancy rates for visualization
 */
export function calculateOccupancyTrend(
  calendarData: Map<string, StaysCalendarDay[]>
): { date: string; rate: number }[] {
  // Get all unique dates from all listings
  const allDates = new Set<string>();
  calendarData.forEach((days) => {
    days.forEach((day) => allDates.add(day.date));
  });

  // Sort dates
  const sortedDates = Array.from(allDates).sort();

  // Calculate occupancy rate for each date
  return sortedDates.map((date) => {
    let occupiedCount = 0;
    let totalCount = 0;

    calendarData.forEach((days) => {
      const dayData = days.find((d) => d.date === date);
      if (dayData) {
        totalCount++;
        if (dayData.avail === 0) {
          occupiedCount++;
        }
      }
    });

    const rate = totalCount > 0 ? (occupiedCount / totalCount) * 100 : 0;

    return { date, rate };
  });
}

/**
 * Gets list of available (empty) units on a specific date
 * Returns listing IDs that have availability
 */
export function getAvailableUnits(
  calendarData: Map<string, StaysCalendarDay[]>,
  targetDate: string
): string[] {
  const availableUnits: string[] = [];

  calendarData.forEach((days, listingId) => {
    const dayData = days.find((d) => d.date === targetDate);
    if (dayData && dayData.avail > 0) {
      availableUnits.push(listingId);
    }
  });

  return availableUnits;
}

/**
 * Utility to get date range
 */
export function getDateRange(startDate: Date, days: number): { from: string; to: string } {
  const start = new Date(startDate);
  const end = new Date(startDate);
  end.setDate(end.getDate() + days);

  return {
    from: start.toISOString().split('T')[0],
    to: end.toISOString().split('T')[0],
  };
}

/**
 * Utility to check if a date is within the next N days
 */
export function isWithinNextDays(dateStr: string, days: number): boolean {
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + days);

  return date >= now && date <= futureDate;
}

/**
 * Gets the next N days starting from today
 */
export function getNextDays(count: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}
