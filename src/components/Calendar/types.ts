export interface Reservation {
  id: string;
  bookingId: string; // ID da reserva (ex: "CJ01G")
  apartmentCode: string; // Código do apartamento (ex: "L-AF-32-704")
  guestName: string;
  type: 'reserved' | 'blocked';
  startDate: Date;
  endDate: Date;
  platform: string; // Nome da plataforma (Airbnb, Booking, etc)
  platformImage: string; // Path da imagem da plataforma
  nights: number; // Número de noites
  guestCount: number; // Número de hóspedes
  checkInTime?: string; // HH:MM
  checkOutTime?: string; // HH:MM
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
