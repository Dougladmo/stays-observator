/**
 * Caching and batch processing utilities for booking details
 * Optimizes API calls and prevents rate limiting
 */

import type { StaysBooking } from './api/bookingTypes';
import { staysBookingApi } from './staysBookingApi';

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
      console.log(`📦 Cache hit for reservation ${reservationId}`);
      return cached.data;
    }

    // Fetch from API
    console.log(`🌐 Fetching details from API for reservation ${reservationId}`);
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
    const batchNumber = Math.floor(i / batchSize) + 1;

    console.log(`📥 Processing batch ${batchNumber}/${totalBatches} (${batch.length} items)`);

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
      console.log(`⏳ Waiting ${delayMs}ms before next batch...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  console.log(`✅ Fetched details for ${results.length}/${reservationIds.length} bookings`);

  // Cleanup expired cache entries
  bookingDetailsCache.cleanup();

  return results;
}

/**
 * Enriches basic bookings with detailed information
 * @param basicBookings - Array of basic bookings from list endpoint
 * @param batchSize - Number of concurrent requests
 * @returns Array of bookings with complete details
 */
export async function enrichBookingsWithDetails(
  basicBookings: StaysBooking[],
  batchSize: number = 10
): Promise<StaysBooking[]> {
  // Extract reservation IDs
  const reservationIds = basicBookings.map((booking) => booking.id);

  // Fetch details in batches
  const detailedBookings = await fetchBookingDetailsInBatches(reservationIds, batchSize);

  // Create a map for quick lookup
  const detailsMap = new Map(detailedBookings.map((booking) => [booking.id, booking]));

  // Merge basic bookings with detailed information
  return basicBookings.map((basicBooking) => {
    const details = detailsMap.get(basicBooking.id);

    // If details were fetched successfully, use them; otherwise keep basic booking
    return details || basicBooking;
  });
}
