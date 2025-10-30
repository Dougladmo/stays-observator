/**
 * Type definitions for Stays.net Booking API responses
 * Based on Stays.net Booking API documentation
 */

/**
 * Booking type classification
 */
export type BookingType = 'normal' | 'provisional' | 'blocked';

/**
 * Date type filter for API queries
 */
export type DateType = 'arrival' | 'departure' | 'creation' | 'creationorig' | 'included';

/**
 * Booking price information
 */
export interface BookingPrice {
  currency: string;
  value: number;
  cleaning?: number;
  securityDeposit?: number;
  extras?: number;
}

/**
 * Booking statistics
 */
export interface BookingStats {
  nights: number;
  pricePerNight: number;
  adults: number;
  children: number;
  babies: number;
}

/**
 * Guest details information
 */
export interface GuestsDetails {
  name?: string;
  email?: string;
  phone?: string;
  document?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}

/**
 * Complete booking response from Stays API
 */
export interface StaysBooking {
  _id: string;
  id: string; // Guest code like "STA-7767", "CHE-6442"
  creationDate: string;
  checkInDate: string; // YYYY-MM-DD
  checkInTime: string; // HH:MM
  checkOutDate: string; // YYYY-MM-DD
  checkOutTime: string; // HH:MM
  _idlisting: string;
  _idclient: string;
  type: BookingType;
  price: BookingPrice;
  stats: BookingStats;
  guests: number;
  guestsDetails: GuestsDetails;
  source?: string;
  channelName?: string;
  status?: string;
}

/**
 * Request parameters for retrieving booking data
 */
export interface GetBookingsParams {
  /** Start date (YYYY-MM-DD) */
  from: string;
  /** End date (YYYY-MM-DD) */
  to: string;
  /** Date type filter - determines which date field to use */
  dateType?: DateType;
  /** Number of records to skip (pagination) */
  skip?: number;
  /** Maximum number of records to return (max 20) */
  limit?: number;
}

/**
 * API error response
 */
export interface StaysApiError {
  message: string;
  statusCode: number;
  details?: unknown;
}

/**
 * Guest status classification for dashboard
 */
export type GuestStatus = 'checkin' | 'checkout' | 'staying';

/**
 * Guest information for dashboard display
 */
export interface GuestInfo {
  id: string;
  code: string; // Display code like "STA-7767"
  status: GuestStatus;
  checkIn: string;
  checkOut: string;
  nights: number;
  guestName?: string;
}
