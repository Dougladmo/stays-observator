import { useMemo, useState, useEffect } from 'react';
import type { Unit, CalendarDay, Reservation } from './types';
import { cn } from '@/lib/utils';

interface CalendarViewProps {
  units: Unit[];
  startDate?: Date;
}

export default function CalendarView({
  units,
  startDate = new Date(2025, 9, 27), // Oct 27, 2025
}: CalendarViewProps) {
  const [daysToShow, setDaysToShow] = useState(14);

  useEffect(() => {
    const calculateDaysToShow = () => {
      const availableWidth = window.innerWidth - 200; // Subtract sidebar width
      const dayWidth = Math.max(50, Math.min(70, window.innerWidth * 0.05)); // clamp(50px, 5vw, 70px)
      const calculatedDays = Math.floor(availableWidth / dayWidth);
      const finalDays = Math.max(14, Math.min(28, calculatedDays));
      setDaysToShow(finalDays);
    };

    calculateDaysToShow();
    window.addEventListener('resize', calculateDaysToShow);
    return () => window.removeEventListener('resize', calculateDaysToShow);
  }, []);

  const calendarDays: CalendarDay[] = useMemo(() => {
    const days: CalendarDay[] = [];
    const highlightedDates = [28, 29]; // Oct 28-29 highlighted in design

    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'][date.getDay()];
      const month = ['JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
                     'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'][date.getMonth()];

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

    // Calculate day width dynamically based on viewport
    const dayWidth = Math.max(50, Math.min(70, window.innerWidth * 0.05));

    return {
      left: daysDiff * dayWidth,
      width: duration * dayWidth,
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
      <div className="flex bg-white border-b border-[#E0E0E0] h-[10vh] shrink-0">
        <div className="w-[200px] p-[1vh_1vw] flex items-center justify-between border-r border-[#E0E0E0] shrink-0">
          <h3 className="m-0 text-[clamp(11px,1.2vh,14px)] font-semibold text-[#333333]">
            Unidades Individuais
          </h3>
          <button className="bg-[#0F5B78] text-white border-none rounded px-[0.8vw] py-[0.5vh] text-[clamp(9px,1vh,12px)] font-medium cursor-pointer transition-opacity hover:opacity-90">
            Reservar
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="flex min-w-max h-full">
            {groupedDays.map((group, idx) => {
              const dayWidth = Math.max(50, Math.min(70, window.innerWidth * 0.05));
              return (
                <div
                  key={idx}
                  className="flex flex-col h-full"
                  style={{ width: `${group.days.length * dayWidth}px` }}
                >
                  <div className="p-[1vh_1vw] text-[clamp(10px,1.1vh,13px)] font-semibold text-[#333333] uppercase tracking-wide border-r border-[#E0E0E0] shrink-0">
                    {group.month} DE {group.year}
                  </div>
                  <div className="flex border-t border-[#E0E0E0] flex-1">
                    {group.days.map((day, dayIdx) => (
                      <div
                        key={dayIdx}
                        className={cn(
                          "w-[clamp(50px,5vw,70px)] p-[0.5vh_0.3vw] flex flex-col items-center gap-[0.2vh] border-r border-[#E0E0E0] bg-white transition-colors",
                          day.isHighlighted && "bg-[#FFE5D9]"
                        )}
                      >
                        <div className="text-[clamp(8px,0.9vh,10px)] font-semibold text-[#666666] uppercase tracking-wide">
                          {day.dayOfWeek}
                        </div>
                        <div className="text-[clamp(12px,1.4vh,16px)] font-medium text-[#333333]">
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
      <div className="flex-1 flex overflow-hidden h-[86vh]">
        {/* Units Sidebar */}
        <div className="w-[200px] bg-white border-r border-[#E0E0E0] overflow-hidden shrink-0">
          {units.map(unit => (
            <div key={unit.id} className="h-[8.6vh] flex items-center gap-[0.8vw] px-[1vw] border-b border-[#E0E0E0]">
              <img
                src={unit.thumbnail}
                alt={unit.code}
                className="w-[5vh] h-[5vh] rounded object-cover shrink-0"
              />
              <span className="flex-1 text-[clamp(10px,1.1vh,13px)] font-medium text-[#333333] overflow-hidden text-ellipsis whitespace-nowrap">
                {unit.code}
              </span>
              <button className="w-[2.5vh] h-[2.5vh] border border-[#E0E0E0] rounded-full bg-white text-[#666666] text-[clamp(12px,1.4vh,16px)] font-semibold flex items-center justify-center cursor-pointer transition-all hover:bg-[#FAFAFA] hover:border-[#666666] shrink-0">
                +
              </button>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-hidden">
          <div className="min-w-max h-full">
            {units.map(unit => (
              <div key={unit.id} className="h-[8.6vh] relative border-b border-[#E0E0E0]">
                {/* Grid Background */}
                <div className="flex h-full absolute inset-0">
                  {calendarDays.map((day, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "w-[clamp(50px,5vw,70px)] border-r border-[#E0E0E0] bg-white transition-colors hover:bg-[#F5F9FC]",
                        day.isHighlighted && "bg-[#FFE5D9]"
                      )}
                    />
                  ))}
                </div>

                {/* Reservations Layer */}
                <div className="absolute inset-0 pointer-events-none">
                  {unit.reservations.map(reservation => {
                    const pos = getReservationPosition(reservation, startDate);
                    const isReserved = reservation.type === 'reserved';
                    return (
                      <div
                        key={reservation.id}
                        className={cn(
                          "absolute top-[0.8vh] h-[7vh] rounded p-[0.6vh_0.8vw] flex items-center pointer-events-auto cursor-pointer transition-all hover:-translate-y-px hover:shadow-md shadow-sm",
                          isReserved ? "bg-[#0F5B78]" : "bg-[#E74C3C]"
                        )}
                        style={{
                          left: `${pos.left}px`,
                          width: `${pos.width}px`,
                        }}
                      >
                        <span className="text-white text-[clamp(8px,0.9vh,11px)] font-medium whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
                          {reservation.guestName}
                        </span>
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
