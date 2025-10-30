import type { DayData, Guest, OccupancyStats, ReservationOrigin } from './types';

const generateMockGuests = (count: number, status: 'checkin' | 'checkout' | 'staying'): Guest[] => {
  const units = ['LAG-323-Z', 'C-VIL-78-203', 'L-AP-220-106', 'C-VZ-326-403', 'L-VL-375-103',
                 'C-RZ-405-403', 'L-VJC-326-406', 'C-AA-380-603', 'L-AP-455-603', 'C-SC-153-1191'];

  return Array.from({ length: count }, (_, i) => ({
    id: `guest-${status}-${i}`,
    code: `${status.toUpperCase().substring(0, 3)}-${Math.floor(Math.random() * 9000) + 1000}`,
    unit: units[Math.floor(Math.random() * units.length)],
    status,
  }));
};

export const mockDashboardData: DayData[] = [
  {
    date: new Date(2025, 9, 10),
    dayOfWeek: 'SEX',
    dayOfMonth: 10,
    month: 'OUT',
    guests: [
      ...generateMockGuests(8, 'staying'),
      ...generateMockGuests(2, 'checkin'),
      ...generateMockGuests(1, 'checkout'),
    ],
  },
  {
    date: new Date(2025, 9, 11),
    dayOfWeek: 'SÁB',
    dayOfMonth: 11,
    month: 'OUT',
    guests: [
      ...generateMockGuests(12, 'staying'),
      ...generateMockGuests(3, 'checkin'),
    ],
  },
  {
    date: new Date(2025, 9, 12),
    dayOfWeek: 'DOM',
    dayOfMonth: 12,
    month: 'OUT',
    guests: [
      ...generateMockGuests(10, 'staying'),
      ...generateMockGuests(4, 'checkout'),
    ],
  },
  {
    date: new Date(2025, 9, 13),
    dayOfWeek: 'SEG',
    dayOfMonth: 13,
    month: 'OUT',
    guests: [
      ...generateMockGuests(6, 'staying'),
      ...generateMockGuests(2, 'checkin'),
      ...generateMockGuests(3, 'checkout'),
    ],
  },
  {
    date: new Date(2025, 9, 14),
    dayOfWeek: 'TER',
    dayOfMonth: 14,
    month: 'OUT',
    guests: [
      ...generateMockGuests(9, 'staying'),
      ...generateMockGuests(5, 'checkin'),
    ],
  },
  {
    date: new Date(2025, 9, 15),
    dayOfWeek: 'QUA',
    dayOfMonth: 15,
    month: 'OUT',
    guests: [
      ...generateMockGuests(11, 'staying'),
      ...generateMockGuests(2, 'checkout'),
    ],
  },
  {
    date: new Date(2025, 9, 16),
    dayOfWeek: 'QUI',
    dayOfMonth: 16,
    month: 'OUT',
    guests: [
      ...generateMockGuests(7, 'staying'),
      ...generateMockGuests(3, 'checkin'),
      ...generateMockGuests(1, 'checkout'),
    ],
  },
];

export const mockOccupancyStats: OccupancyStats = {
  available: 23,
  occupied: 177,
  total: 200,
};

export const mockOccupancyNext30Days: OccupancyStats = {
  available: 45,
  occupied: 155,
  total: 200,
};

export const mockReservationOrigins: ReservationOrigin[] = [
  { name: 'Airbnb', count: 85, color: '#FF5A5F' },
  { name: 'Booking', count: 62, color: '#003580' },
  { name: 'Direto', count: 30, color: '#34A853' },
];

export const mockOccupancyTrend = [
  { date: '12/25', rate: 0.75 },
  { date: '12/26', rate: 0.78 },
  { date: '12/27', rate: 0.82 },
  { date: '12/28', rate: 0.85 },
  { date: '12/29', rate: 0.88 },
  { date: '12/30', rate: 0.91 },
  { date: '12/31', rate: 0.95 },
  { date: '01/01', rate: 0.92 },
  { date: '01/02', rate: 0.87 },
  { date: '01/03', rate: 0.83 },
  { date: '01/04', rate: 0.79 },
  { date: '01/05', rate: 0.76 },
];

export const mockVariousUnits = [
  'LAG-323-Z',
  'L-VJA-375-1962',
  'L-VJA-375-1936',
  'L-BL-78-393',
  'G-AAP-238-787',
  'L-BL-79-381',
  'C-VZ-2-1509-1032',
  'C-VJA-455-603',
  'L-BL-455-603',
  'L-BL-455-603',
];
