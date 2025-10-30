/**
 * Caching and batch processing utilities for booking details
 * Optimizes API calls and prevents rate limiting
 */

import type { StaysBooking } from './api/bookingTypes';
import { staysBookingApi } from './staysBookingApi';
import { staysContentApi, type ListingDetails } from './staysContentApi';

/**
 * Cache entry structure
 */
interface CacheEntry {
  data: StaysBooking;
  timestamp: number;
}

/**
 * Booking details cache manager
 * Implements in-memory cache with TTL (time-to-live)
 */
class BookingDetailsCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly cacheDuration: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Gets booking details from cache or fetches from API
   * @param reservationId - Booking ID
   * @returns Complete booking details
   */
  async getDetails(reservationId: string): Promise<StaysBooking> {
    const now = Date.now();
    const cached = this.cache.get(reservationId);

    // Return cached data if valid
    if (cached && now - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    const details = await staysBookingApi.getBookingDetails(reservationId);

    // Store in cache
    this.cache.set(reservationId, {
      data: details,
      timestamp: now,
    });

    return details;
  }

  /**
   * Clears the entire cache
   */
  clear(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  /**
   * Removes expired entries from cache
   */
  cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.cacheDuration) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`🧹 Removed ${removed} expired cache entries`);
    }
  }

  /**
   * Gets current cache size
   */
  getSize(): number {
    return this.cache.size;
  }
}

// Singleton instance
export const bookingDetailsCache = new BookingDetailsCache();

/**
 * Cache entry structure for listing details
 */
interface ListingCacheEntry {
  data: ListingDetails;
  timestamp: number;
}

/**
 * Listing details cache manager
 * Implements in-memory cache with TTL for listing/apartment information
 */
class ListingDetailsCache {
  private cache: Map<string, ListingCacheEntry> = new Map();
  private readonly cacheDuration: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Gets listing details from cache or fetches from Content API
   * @param listingId - Listing ID (from booking._idlisting)
   * @returns Complete listing details including internalName
   */
  async getDetails(listingId: string): Promise<ListingDetails | null> {
    if (!listingId) {
      return null;
    }

    const now = Date.now();
    const cached = this.cache.get(listingId);

    // Return cached data if valid
    if (cached && now - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    try {
      const details = await staysContentApi.getListingDetails(listingId);

      // Store in cache
      this.cache.set(listingId, {
        data: details,
        timestamp: now,
      });

      return details;
    } catch (error) {
      console.error(`❌ Error fetching listing details for ${listingId}:`, error);
      return null;
    }
  }

  /**
   * Clears the entire cache
   */
  clear(): void {
    this.cache.clear();
    console.log('🗑️ Listing cache cleared');
  }

  /**
   * Removes expired entries from cache
   */
  cleanup(): void {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= this.cacheDuration) {
        this.cache.delete(key);
        removed++;
      }
    }

    if (removed > 0) {
      console.log(`🧹 Removed ${removed} expired listing cache entries`);
    }
  }

  /**
   * Gets current cache size
   */
  getSize(): number {
    return this.cache.size;
  }
}

// Singleton instance
export const listingDetailsCache = new ListingDetailsCache();

/**
 * Fetches booking details in batches to avoid overwhelming the API
 * @param reservationIds - Array of booking IDs
 * @param batchSize - Number of concurrent requests
 * @param delayMs - Delay between batches in milliseconds
 * @returns Array of complete booking details
 */
export async function fetchBookingDetailsInBatches(
  reservationIds: string[],
  batchSize: number = 10,
  delayMs: number = 500
): Promise<StaysBooking[]> {
  const results: StaysBooking[] = [];
  const totalBatches = Math.ceil(reservationIds.length / batchSize);

  console.log(
    `🔄 Fetching details for ${reservationIds.length} bookings in ${totalBatches} batches`
  );

  for (let i = 0; i < reservationIds.length; i += batchSize) {
    const batch = reservationIds.slice(i, i + batchSize);

    // Fetch all bookings in current batch in parallel
    const batchResults = await Promise.all(
      batch.map(async (id) => {
        try {
          return await bookingDetailsCache.getDetails(id);
        } catch (error) {
          console.error(`❌ Error fetching details for booking ${id}:`, error);
          // Return null for failed requests, will be filtered later
          return null;
        }
      })
    );

    // Filter out failed requests and add to results
    const successfulResults = batchResults.filter(
      (result): result is StaysBooking => result !== null
    );
    results.push(...successfulResults);

    // Wait between batches (except for the last one)
    if (i + batchSize < reservationIds.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.log(`✅ Fetched details for ${results.length}/${reservationIds.length} bookings`);

  // Cleanup expired cache entries
  bookingDetailsCache.cleanup();

  return results;
}

/**
 * Enriches basic bookings with detailed information including apartment codes
 * @param basicBookings - Array of basic bookings from list endpoint
 * @param batchSize - Number of concurrent requests
 * @returns Array of bookings with complete details and internalName
 */
export async function enrichBookingsWithDetails(
  basicBookings: StaysBooking[],
  batchSize: number = 10
): Promise<StaysBooking[]> {
  // Extract reservation IDs
  const reservationIds = basicBookings.map((booking) => booking.id);

  // Step 1: Fetch booking details in batches
  console.log('📥 Step 1: Fetching booking details...');
  const detailedBookings = await fetchBookingDetailsInBatches(reservationIds, batchSize);

  // Create a map for quick lookup
  const detailsMap = new Map(detailedBookings.map((booking) => [booking.id, booking]));

  // Merge basic bookings with detailed information
  const enrichedWithDetails = basicBookings.map((basicBooking) => {
    const details = detailsMap.get(basicBooking.id);
    return details || basicBooking;
  });

  // Step 2: Fetch listing details (apartment codes) in batches
  console.log('🏠 Step 2: Fetching apartment codes from Content API...');

  // Get unique listing IDs
  const uniqueListingIds = new Set<string>();
  enrichedWithDetails.forEach(booking => {
    if (booking._idlisting) {
      uniqueListingIds.add(booking._idlisting);
    }
  });

  console.log(`🔍 Found ${uniqueListingIds.size} unique listings to fetch`);

  // Fetch all listing details in parallel (with some batching to avoid overwhelming the API)
  const listingIds = Array.from(uniqueListingIds);
  const listingDetailsPromises: Promise<[string, ListingDetails | null]>[] = [];

  for (let i = 0; i < listingIds.length; i += batchSize) {
    const batch = listingIds.slice(i, i + batchSize);

    const batchPromises = batch.map(async (listingId): Promise<[string, ListingDetails | null]> => {
      const details = await listingDetailsCache.getDetails(listingId);
      return [listingId, details];
    });

    listingDetailsPromises.push(...batchPromises);

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < listingIds.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  const listingDetailsResults = await Promise.all(listingDetailsPromises);
  const listingDetailsMap = new Map(listingDetailsResults);

  console.log(`✅ Fetched ${listingDetailsResults.filter(([, details]) => details !== null).length}/${uniqueListingIds.size} listing details`);

  // Step 3: Enrich bookings with listing information
  const fullyEnrichedBookings = enrichedWithDetails.map(booking => {
    if (!booking._idlisting) {
      return booking;
    }

    const listingDetails = listingDetailsMap.get(booking._idlisting);

    if (listingDetails) {
      // Add or update the listing object with internalName
      return {
        ...booking,
        listing: {
          _id: listingDetails._id,
          internalName: listingDetails.internalName,
          name: listingDetails.name,
          address: listingDetails.address,
        }
      };
    }

    return booking;
  });

  // Cleanup expired cache entries
  bookingDetailsCache.cleanup();
  listingDetailsCache.cleanup();

  return fullyEnrichedBookings;
}
