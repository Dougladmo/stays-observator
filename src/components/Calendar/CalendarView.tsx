import { useMemo, useState, useEffect } from 'react';
import type { Unit, CalendarDay, Reservation } from './types';
import { cn } from '@/lib/utils';
import MarqueeText from '@/components/ui/MarqueeText';

interface CalendarViewProps {
  units: Unit[];
  startDate?: Date;
}

export default function CalendarView({
  units,
  startDate = new Date(), // Always start from today
}: CalendarViewProps) {
  const daysToShow = 45; // Show 45 days (1.5 months)
  const [dayWidth, setDayWidth] = useState(50);

  useEffect(() => {
    const calculateDayWidth = () => {
      const availableWidth = window.innerWidth - 200; // Subtract sidebar width
      // Calculate width to fill 100% of available space
      const calculatedWidth = availableWidth / daysToShow;
      setDayWidth(calculatedWidth);
    };

    calculateDayWidth();
    window.addEventListener('resize', calculateDayWidth);
    return () => window.removeEventListener('resize', calculateDayWidth);
  }, []);

  const calendarDays: CalendarDay[] = useMemo(() => {
    const days: CalendarDay[] = [];
    const highlightedDates = [28, 29]; // Oct 28-29 highlighted in design

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][date.getDay()];
      const month = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                     'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][date.getMonth()];

      days.push({
        date,
        dayOfWeek,
        dayOfMonth: date.getDate(),
        month,
        year: date.getFullYear(),
        isHighlighted: date.getMonth() === 9 && highlightedDates.includes(date.getDate()),
      });
    }

    return days;
  }, [startDate, daysToShow]);

  const getReservationPosition = (reservation: Reservation, startDate: Date) => {
    const daysDiff = Math.floor(
      (reservation.startDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const duration = Math.floor(
      (reservation.endDate.getTime() - reservation.startDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1; // +1 to include end date

    // Start at the middle of the first day (check-in at noon)
    // End at the middle of the last day (check-out at noon)
    return {
      left: daysDiff * dayWidth + (dayWidth / 2),
      width: (duration - 1) * dayWidth,
    };
  };

  const groupedDays = useMemo(() => {
    const groups: { month: string; year: number; days: CalendarDay[] }[] = [];

    calendarDays.forEach(day => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.month === day.month && lastGroup.year === day.year) {
        lastGroup.days.push(day);
      } else {
        groups.push({
          month: day.month,
          year: day.year,
          days: [day],
        });
      }
    });

    return groups;
  }, [calendarDays]);

  return (
    <div className="w-screen h-[96vh] bg-[#FAFAFA] overflow-hidden flex flex-col">
      {/* Header Section */}
      <div className="flex bg-white border-b border-[#E0E0E0] h-[7vh] shrink-0">
        <div className="w-[200px] p-[1vh_1vw] flex items-center border-r border-[#E0E0E0] shrink-0">
          <h3 className="m-0 text-[clamp(15px,1.2vh,14px)] font-semibold text-[#333333]">
            Unidades Individuais
          </h3>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex h-full min-w-max">
            {groupedDays.map((group, idx) => {
              return (
                <div
                  key={idx}
                  className="flex flex-col"
                  style={{ width: `${group.days.length * dayWidth}px` }}
                >
                  <div className="p-[0.5vh_0.3vw] text-[clamp(10px,1vh,12px)] font-semibold text-[#333333] tracking-wide border-r border-[#E0E0E0] shrink-0">
                    {group.month}
                  </div>
                  <div className="flex border-t border-[#E0E0E0] flex-1">
                    {group.days.map((day, dayIdx) => (
                      <div
                        key={dayIdx}
                        style={{ width: `${dayWidth}px` }}
                        className={cn(
                          "p-[0.5vh_0.3vw] flex flex-col items-center gap-[0.2vh] border-r border-[#E0E0E0] bg-white transition-colors",
                          day.isHighlighted && "bg-[#FFE5D9]"
                        )}
                      >
                        <div className="text-[clamp(7px,0.8vh,9px)] font-semibold text-[#666666] uppercase tracking-wide">
                          {day.dayOfWeek}
                        </div>
                        <div className="text-[clamp(11px,1.2vh,14px)] font-medium text-[#333333]">
                          {day.dayOfMonth}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Calendar Body */}
      <div className="flex-1 flex overflow-hidden h-[88vh]">
        {/* Units Sidebar */}
        <div className="w-[200px] bg-white border-r border-[#E0E0E0] overflow-hidden shrink-0">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="h-[2.97vh] flex items-center gap-[0.8vw] px-[1vw] border-b border-[#E0E0E0]"
            >
              <span className="flex-1 text-[clamp(16x,1vh,11px)] font-medium text-[#333333] overflow-hidden text-ellipsis whitespace-nowrap">
                {unit.code}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full min-w-max">
            {units.map((unit) => (
              <div
                key={unit.id}
                className="h-[2.97vh] relative border-b border-[#E0E0E0]"
              >
                {/* Grid Background */}
                <div className="absolute inset-0 flex h-full">
                  {calendarDays.map((day, idx) => (
                    <div
                      key={idx}
                      style={{ width: `${dayWidth}px` }}
                      className={cn(
                        "border-r border-[#E0E0E0] bg-white transition-colors hover:bg-[#F5F9FC]",
                        day.isHighlighted && "bg-[#FFE5D9]"
                      )}
                    />
                  ))}
                </div>

                {/* Reservations Layer */}
                <div className="absolute inset-0 pointer-events-none">
                  {unit.reservations.map((reservation) => {
                    const pos = getReservationPosition(reservation, startDate);
                    const isReserved = reservation.type === "reserved";
                    return (
                      <div
                        key={reservation.id}
                        className={cn(
                          "absolute top-[0.25vh] h-[2vh] rounded-full px-[0.6vw] py-[0.2vh] flex items-center gap-[0.5vw] pointer-events-auto cursor-pointer transition-all hover:-translate-y-px hover:shadow-md shadow-sm overflow-hidden",
                          isReserved ? "bg-[#0F5B78]" : "bg-[#E74C3C]"
                        )}
                        style={{
                          left: `${pos.left}px`,
                          width: `${pos.width}px`,
                        }}
                      >
                        <MarqueeText className="flex items-center w-full h-full">
                          {/* Ícone da plataforma */}
                          {reservation.platformImage && (
                            <img
                              src={reservation.platformImage}
                              alt={reservation.platform}
                              title={reservation.platform}
                              className="w-[clamp(14px,1.4vh,16px)] h-[clamp(14px,1.4vh,16px)] object-contain mx-1 shrink-0"
                            />
                          )}
                          {/* Nome do hóspede */}
                          <span className="text-white text-[clamp(10px,0.9vh,11px)] font-semibold whitespace-nowrap mx-1">
                            {reservation.guestName}
                          </span>

                          {/* Quantidade de hóspedes */}
                          <span className="text-white text-[clamp(10px,0.9vh,11px)] font-semibold whitespace-nowrap mx-1 shrink-0">
                            {reservation.guestCount}{" "}
                            {reservation.guestCount === 1
                              ? "hospede"
                              : "hospedes"}
                          </span>
                        </MarqueeText>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
