/**
 * Data transformation utilities for Calendar view
 * Converts Stays Booking API responses to Calendar component format
 */

import type { StaysBooking } from './api/bookingTypes';
import type { Unit, Reservation } from '@/components/Calendar/types';
import { extractGuestInfo } from './bookingDetailsExtractor';

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
 * Converts a single booking to a Calendar Reservation
 */
function bookingToCalendarReservation(booking: StaysBooking): Reservation {
  // Extract guest info (name, platform, platform image)
  const { guestName, platform, platformImage } = extractGuestInfo(booking);

  // Calculate nights
  const nights = booking.stats?.nights || calculateNights(booking.checkInDate, booking.checkOutDate);

  // Get guest count
  const guestCount = booking.guests ||
    (booking.stats ? (booking.stats.adults || 0) + (booking.stats.children || 0) + (booking.stats.babies || 0) : 0);

  // Extract apartment code (internalName) and split to get only the part before "|"
  const internalName = booking.listing?.internalName;
  const apartmentCode = internalName
    ? internalName.split('|')[0].trim()
    : booking._idlisting;

  // Determine reservation type
  // 'blocked' type comes from booking.type === 'blocked' or specific sources
  const type: 'reserved' | 'blocked' = booking.type === 'blocked' ? 'blocked' : 'reserved';

  return {
    id: booking._id,
    bookingId: booking.id,
    apartmentCode,
    guestName,
    type,
    startDate: new Date(booking.checkInDate + 'T00:00:00'),
    endDate: new Date(booking.checkOutDate + 'T00:00:00'),
    platform,
    platformImage,
    nights,
    guestCount,
    checkInTime: booking.checkInTime,
    checkOutTime: booking.checkOutTime,
  };
}

/**
 * Groups bookings by listing and converts to Calendar Units
 * @param bookings - Array of enriched bookings from API
 * @returns Array of Calendar Units with reservations
 */
export function bookingsToCalendarUnits(bookings: StaysBooking[]): Unit[] {
  // Group bookings by listing ID
  const listingMap = new Map<string, StaysBooking[]>();

  bookings.forEach(booking => {
    if (!booking._idlisting) return;

    const existing = listingMap.get(booking._idlisting) || [];
    existing.push(booking);
    listingMap.set(booking._idlisting, existing);
  });

  // Convert grouped bookings to Units
  const units: Unit[] = [];

  listingMap.forEach((listingBookings, listingId) => {
    // Get apartment code from first booking with internalName
    const bookingWithName = listingBookings.find(b => b.listing?.internalName);
    const internalName = bookingWithName?.listing?.internalName;
    const code = internalName
      ? internalName.split('|')[0].trim()
      : listingId;

    // Convert all bookings to reservations
    const reservations: Reservation[] = listingBookings.map(bookingToCalendarReservation);

    // Sort reservations by start date
    reservations.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    units.push({
      id: listingId,
      code,
      thumbnail: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=200&h=150&fit=crop', // Placeholder
      reservations,
    });
  });

  // Sort units by code
  units.sort((a, b) => a.code.localeCompare(b.code));

  return units;
}
