/**
 * Data transformation utilities
 * Converts Stays Booking API responses to Dashboard component format
 */

import type { StaysBooking, GuestStatus } from './api/bookingTypes';
import type { DayData, Guest, OccupancyStats, ReservationOrigin } from '@/components/Dashboard/types';
import { extractGuestInfo } from './bookingDetailsExtractor';

/**
 * Date formatting utilities
 */
function getDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase();
}

function getDayOfMonth(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00');
  return date.getDate();
}

function getMonth(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
}

/**
 * Classifies a booking's status based on a target date
 * Returns null if the booking is not relevant to the target date
 */
export function classifyBookingStatus(
  booking: StaysBooking,
  targetDate: string
): GuestStatus | null {
  const checkIn = booking.checkInDate;
  const checkOut = booking.checkOutDate;

  if (checkIn === targetDate) return 'checkin';
  if (checkOut === targetDate) return 'checkout';
  if (checkIn < targetDate && checkOut > targetDate) return 'staying';

  return null;
}

/**
 * Calculate nights between two dates
 */
function calculateNights(checkInDate: string, checkOutDate: string): number {
  const checkIn = new Date(checkInDate + 'T00:00:00');
  const checkOut = new Date(checkOutDate + 'T00:00:00');
  const diffTime = checkOut.getTime() - checkIn.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Converts a booking to a Guest object for a specific date
 */
export function bookingToGuest(booking: StaysBooking, status: GuestStatus): Guest {
  // Calculate nights as fallback if not provided by API
  const nights = booking.stats?.nights || calculateNights(booking.checkInDate, booking.checkOutDate);

  // Extract guest name, platform, and image
  const { guestName, platform, platformImage } = extractGuestInfo(booking);

  // Get guest count (total number of guests)
  const guestCount = booking.guests ||
    (booking.stats ? (booking.stats.adults || 0) + (booking.stats.children || 0) + (booking.stats.babies || 0) : 0);

  return {
    id: booking._id,
    code: booking.id, // Guest code like "STA-7767"
    unit: booking._idlisting, // Using listing ID as unit identifier
    status,
    guestName,
    checkInDate: booking.checkInDate,
    checkOutDate: booking.checkOutDate,
    nights,
    guestCount,
    platform,
    platformImage,
  };
}

/**
 * Processes all bookings for a specific date and returns Guest list
 */
export function processBookingsForDate(
  bookings: StaysBooking[],
  targetDate: string
): Guest[] {
  const guests: Guest[] = [];

  for (const booking of bookings) {
    const status = classifyBookingStatus(booking, targetDate);
    if (status) {
      guests.push(bookingToGuest(booking, status));
    }
  }

  return guests;
}

/**
 * Creates week data from bookings for calendar display
 */
export function createWeekDataFromBookings(
  bookings: StaysBooking[],
  startDate: Date,
  days: number = 7
): DayData[] {
  const weekData: DayData[] = [];

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    const guests = processBookingsForDate(bookings, dateStr);

    weekData.push({
      date: currentDate,
      dayOfWeek: getDayOfWeek(dateStr),
      dayOfMonth: getDayOfMonth(dateStr),
      month: getMonth(dateStr),
      guests,
    });
  }

  return weekData;
}

/**
 * Calculates occupancy statistics for a specific date
 */
export function calculateOccupancyFromBookings(
  bookings: StaysBooking[],
  targetDate: string
): OccupancyStats {
  // Get all unique listings from bookings
  const allListings = new Set(bookings.map((b) => b._idlisting));
  const totalUnits = allListings.size;

  // Get occupied listings on target date
  const occupiedListings = new Set<string>();

  for (const booking of bookings) {
    const status = classifyBookingStatus(booking, targetDate);
    if (status === 'staying' || status === 'checkin') {
      occupiedListings.add(booking._idlisting);
    }
  }

  const occupied = occupiedListings.size;
  const available = totalUnits - occupied;

  return {
    available,
    occupied,
    total: totalUnits,
  };
}

/**
 * Calculates occupancy for the next N days
 */
export function calculateOccupancyNext30Days(
  bookings: StaysBooking[],
  startDate: Date,
  days: number = 30
): OccupancyStats {
  const allListings = new Set(bookings.map((b) => b._idlisting));
  const totalUnits = allListings.size;

  let totalOccupiedDays = 0;
  let totalAvailableDays = 0;

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    const stats = calculateOccupancyFromBookings(bookings, dateStr);
    totalOccupiedDays += stats.occupied;
    totalAvailableDays += stats.available;
  }

  // Average occupancy over the period
  const avgOccupied = Math.round(totalOccupiedDays / days);
  const avgAvailable = Math.round(totalAvailableDays / days);

  return {
    available: avgAvailable,
    occupied: avgOccupied,
    total: totalUnits,
  };
}

/**
 * Extracts reservation origins from bookings
 */
export function getReservationOrigins(bookings: StaysBooking[]): ReservationOrigin[] {
  const originCounts = new Map<string, number>();

  for (const booking of bookings) {
    const origin = booking.channelName || booking.source || 'Direct';
    originCounts.set(origin, (originCounts.get(origin) || 0) + 1);
  }

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  let colorIndex = 0;

  return Array.from(originCounts.entries())
    .map(([name, count]) => ({
      name,
      count,
      color: colors[colorIndex++ % colors.length],
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculates occupancy trend over time for chart
 */
export function calculateOccupancyTrend(
  bookings: StaysBooking[],
  startDate: Date,
  days: number = 30
): { date: string; rate: number }[] {
  const allListings = new Set(bookings.map((b) => b._idlisting));
  const totalUnits = allListings.size;

  const trend: { date: string; rate: number }[] = [];

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    const stats = calculateOccupancyFromBookings(bookings, dateStr);
    const rate = totalUnits > 0 ? (stats.occupied / totalUnits) * 100 : 0;

    trend.push({
      date: dateStr,
      rate: Math.round(rate),
    });
  }

  return trend;
}

/**
 * Gets list of available (empty) units on a specific date
 */
export function getAvailableUnits(
  bookings: StaysBooking[],
  targetDate: string
): string[] {
  const allListings = new Set(bookings.map((b) => b._idlisting));
  const occupiedListings = new Set<string>();

  for (const booking of bookings) {
    const status = classifyBookingStatus(booking, targetDate);
    if (status === 'staying' || status === 'checkin') {
      occupiedListings.add(booking._idlisting);
    }
  }

  return Array.from(allListings).filter((listing) => !occupiedListings.has(listing));
}

/**
 * Utility to get date range for API queries
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
