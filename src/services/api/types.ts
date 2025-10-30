/**
 * Type definitions for Stays.net API responses
 * Based on Stays.net Listing Calendar API documentation
 */

/**
 * Multi-currency value object
 */
export interface MultiCurrencyValue {
  USD?: number;
  BRL?: number;
  EUR?: number;
  [currency: string]: number | undefined;
}

/**
 * Price information for a specific minimum stay requirement
 */
export interface PriceInfo {
  minStay: number;
  _mcval: MultiCurrencyValue;
}

/**
 * Monthly price information (optional, exists if monthly pricing is configured)
 */
export interface MonthlyPriceInfo {
  minStay: number;
  _mcval: MultiCurrencyValue;
}

/**
 * Calendar day response from Stays API
 */
export interface StaysCalendarDay {
  /** Date in YYYY-MM-DD format */
  date: string;
  /** Number of available units */
  avail: number;
  /** Whether arrivals are restricted on this date */
  closedToArrival: boolean;
  /** Whether departures are restricted on this date */
  closedToDeparture: boolean;
  /** Price information for different minimum stay requirements */
  prices: PriceInfo[];
  /** Optional monthly pricing information */
  monthlyPrice?: MonthlyPriceInfo;
}

/**
 * Request parameters for retrieving calendar data
 */
export interface GetCalendarParams {
  /** Listing ID (short or long format) */
  listingId: string;
  /** Start date (YYYY-MM-DD) */
  from: string;
  /** End date (YYYY-MM-DD) */
  to: string;
  /** Ignore price group units availability */
  ignorePriceGroupUnits?: boolean;
  /** Ignore clone group units availability */
  ignoreCloneGroupUnits?: boolean;
}

/**
 * API error response
 */
export interface StaysApiError {
  message: string;
  statusCode: number;
  details?: unknown;
}
