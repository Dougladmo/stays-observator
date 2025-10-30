export type GuestStatus = 'checkin' | 'checkout' | 'staying';

export interface Guest {
  id: string;
  code: string;
  unit: string;
  status: GuestStatus;
}

export interface DayData {
  date: Date;
  dayOfWeek: string;
  dayOfMonth: number;
  month: string;
  guests: Guest[];
}

export interface OccupancyStats {
  available: number;
  occupied: number;
  total: number;
}

export interface ReservationOrigin {
  name: string;
  count: number;
  color: string;
}
