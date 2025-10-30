export interface Reservation {
  id: string;
  guestName: string;
  type: 'reserved' | 'blocked';
  startDate: Date;
  endDate: Date;
}

export interface Unit {
  id: string;
  code: string;
  thumbnail: string;
  reservations: Reservation[];
}

export interface CalendarDay {
  date: Date;
  dayOfWeek: string;
  dayOfMonth: number;
  month: string;
  year: number;
  isHighlighted: boolean;
}
