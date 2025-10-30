/**
 * Utility functions to extract guest and platform information from booking details
 */

import type { StaysBooking } from './api/bookingTypes';
import { getPlatformImage } from '@/config/platformImages';

/**
 * Extracts the primary guest name from booking details
 * Looks for guest with primary: true, falls back to first guest in list
 * @param booking - Complete booking details
 * @returns Guest name or 'Sem nome' if not found
 */
export function extractGuestName(booking: StaysBooking): string {
  // Check if guestsDetails has a list of guests
  const guestsList = booking.guestsDetails?.list;

  if (guestsList && guestsList.length > 0) {
    // Find the primary guest
    const primaryGuest = guestsList.find(guest => guest.primary === true);

    if (primaryGuest?.name) {
      return primaryGuest.name;
    }

    // If no primary guest, get first guest with a name
    const firstGuestWithName = guestsList.find(guest => guest.name);
    if (firstGuestWithName?.name) {
      return firstGuestWithName.name;
    }
  }

  // Fallback to simple name field
  if (booking.guestsDetails?.name) {
    return booking.guestsDetails.name;
  }

  // Last resort fallback
  return 'Sem nome';
}

/**
 * Extracts the platform/channel name from booking details
 * @param booking - Complete booking details
 * @returns Platform name or 'Direto' if no partner found
 */
export function extractPlatform(booking: StaysBooking): string {
  // Check partner information first (most reliable)
  if (booking.partner?.name) {
    return booking.partner.name;
  }

  // Fallback to channelName
  if (booking.channelName) {
    return booking.channelName;
  }

  // Fallback to source
  if (booking.source) {
    return booking.source;
  }

  // If no platform info, it's a direct booking
  return 'Direto';
}

/**
 * Extracts the property/unit internal name from booking details
 * @param booking - Complete booking details
 * @returns Unit internal name or undefined if not found
 */
export function extractUnitName(booking: StaysBooking): string | undefined {
  // Check if listing information is available
  if (booking.listing?.internalName) {
    return booking.listing.internalName;
  }

  // Fallback to name field
  if (booking.listing?.name) {
    return booking.listing.name;
  }

  // If no listing info, return undefined (will use unit ID as fallback)
  return undefined;
}

/**
 * Extracts all guest-related information from booking details
 * Convenience function that combines all extraction methods
 * @param booking - Complete booking details
 * @returns Object with guestName, platform, and platformImage
 */
export function extractGuestInfo(booking: StaysBooking): {
  guestName: string;
  platform: string;
  platformImage: string;
} {
  const platform = extractPlatform(booking);
  const platformConfig = getPlatformImage(platform);

  return {
    guestName: extractGuestName(booking),
    platform: platformConfig.name,
    platformImage: platformConfig.imagePath,
  };
}
