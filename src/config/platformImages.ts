/**
 * Platform image mapping configuration
 * Maps platform names to their logo image paths
 */

export interface PlatformImageConfig {
  name: string;
  imagePath: string;
  alt: string;
}

/**
 * Platform image mapping
 * TODO: Add image paths for each platform
 *
 * Based on actual API responses:
 * - "API airbnb" for Airbnb bookings
 * - "API booking.com" for Booking.com bookings
 * - "Website" for direct website bookings
 * - "Direto" for direct bookings
 */
export const PLATFORM_IMAGES: Record<string, PlatformImageConfig> = {
  // Airbnb (API returns "API airbnb")
  'API airbnb': {
    name: 'Airbnb',
    imagePath: '/images/platforms/airbnb.png', // TODO: Add image
    alt: 'Airbnb',
  },

  // Booking.com (API returns "API booking.com")
  'API booking.com': {
    name: 'Booking.com',
    imagePath: '/images/platforms/booking.svg', // TODO: Add image
    alt: 'Booking.com',
  },

  // Website bookings (API returns "Website")
  'Website': {
    name: 'Website',
    imagePath: '/images/platforms/website.png', // TODO: Add image
    alt: 'Reserva pelo Site',
  },

  // Direct bookings (API returns "Direto")
  'Direto': {
    name: 'Direto',
    imagePath: '/images/platforms/direct.png', // TODO: Add image
    alt: 'Reserva Direta',
  },
  // Additional platforms (for future use)
  'API expedia': {
    name: 'Expedia',
    imagePath: '/images/platforms/expedia.png', // TODO: Add image
    alt: 'Expedia',
  },
  'API vrbo': {
    name: 'VRBO',
    imagePath: '/images/platforms/vrbo.png', // TODO: Add image
    alt: 'VRBO',
  },
  
  // 'API homeaway': {
  //   name: 'HomeAway',
  //   imagePath: '/images/platforms/homeaway.png', // TODO: Add image
  //   alt: 'HomeAway',
  // },
  // 'API hotels.com': {
  //   name: 'Hotels.com',
  //   imagePath: '/images/platforms/hotels.png', // TODO: Add image
  //   alt: 'Hotels.com',
  // },
  // 'API tripadvisor': {
  //   name: 'TripAdvisor',
  //   imagePath: '/images/platforms/tripadvisor.png', // TODO: Add image
  //   alt: 'TripAdvisor',
  // },
  // 'API agoda': {
  //   name: 'Agoda',
  //   imagePath: '/images/platforms/agoda.png', // TODO: Add image
  //   alt: 'Agoda',
  // },
};

/**
 * Default platform configuration for unknown platforms
 */
export const DEFAULT_PLATFORM: PlatformImageConfig = {
  name: 'Outro',
  imagePath: '/images/platforms/default.png', // TODO: Add image
  alt: 'Plataforma Desconhecida',
};

/**
 * Gets platform image configuration by platform name
 * Supports case-insensitive partial matching
 */
export function getPlatformImage(platform: string): PlatformImageConfig {
  // Try exact match first
  if (PLATFORM_IMAGES[platform]) {
    return PLATFORM_IMAGES[platform];
  }

  // Try case-insensitive partial match
  const normalizedPlatform = platform.toLowerCase();
  for (const [key, config] of Object.entries(PLATFORM_IMAGES)) {
    if (normalizedPlatform.includes(key.toLowerCase())) {
      return config;
    }
  }

  // Return default configuration
  return DEFAULT_PLATFORM;
}
