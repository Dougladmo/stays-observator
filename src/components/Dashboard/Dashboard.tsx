import type { DayData, Guest, OccupancyStats, ReservationOrigin } from './types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface DashboardProps {
  weekData: DayData[];
  occupancyStats: OccupancyStats;
  occupancyNext30Days: OccupancyStats;
  reservationOrigins: ReservationOrigin[];
  occupancyTrend: { date: string; rate: number }[];
  variousUnits: string[];
}

function GuestCard({ guest }: { guest: Guest }) {
  const statusStyles = {
    staying: 'bg-[#3498db]',
    checkin: 'bg-[#27ae60]',
    checkout: 'bg-[#e74c3c]',
  };

  // Format date from YYYY-MM-DD to DD/MM
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const [, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  const isCheckinOrCheckout = guest.status === 'checkin' || guest.status === 'checkout';

  return (
    <div className={cn(
      'flex flex-col justify-center rounded-md px-[0.5vw] py-[0.8vh] text-white cursor-pointer',
      statusStyles[guest.status]
    )}>
      <div className="text-[clamp(14px,1.1vh,13px)] font-bold overflow-hidden text-ellipsis whitespace-nowrap">
        {guest.code}
      </div>
      {!isCheckinOrCheckout && (
        <div className="text-[clamp(11px,0.9vh,11px)] opacity-90 overflow-hidden text-ellipsis whitespace-nowrap">
          {guest.unit}
        </div>
      )}
      {isCheckinOrCheckout && (
        <>
          <div className="text-[clamp(11px,0.9vh,11px)] opacity-90 overflow-hidden text-ellipsis whitespace-nowrap">
            {guest.guestName || 'Sem nome'}
          </div>
          <div className="text-[clamp(10px,0.85vh,10px)] opacity-80 overflow-hidden text-ellipsis whitespace-nowrap">
            Entrada: {formatDate(guest.checkInDate)}
          </div>
          <div className="text-[clamp(10px,0.85vh,10px)] opacity-80 overflow-hidden text-ellipsis whitespace-nowrap">
            Saída: {formatDate(guest.checkOutDate)}
          </div>
          <div className="text-[clamp(10px,0.85vh,10px)] opacity-80 overflow-hidden text-ellipsis whitespace-nowrap">
            {guest.nights || 0} {guest.nights === 1 ? 'noite' : 'noites'}
          </div>
        </>
      )}
    </div>
  );
}

function DonutChart({ stats, label }: { stats: OccupancyStats; label: string }) {
  const occupiedPercentage = (stats.occupied / stats.total) * 100;
  const availablePercentage = (stats.available / stats.total) * 100;

  const occupiedDegrees = (occupiedPercentage / 100) * 360;
  const availableDegrees = (availablePercentage / 100) * 360;

  return (
    <Card className="flex flex-col items-center justify-center overflow-hidden">
      <CardContent className="p-[1vh_1vw] flex flex-col items-center justify-center w-full">
        <svg viewBox="0 0 100 100" className="w-[14vh] h-[14vh] shrink-0">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#E74C3C"
            strokeWidth="20"
            strokeDasharray={`${occupiedDegrees} 360`}
            transform="rotate(-90 50 50)"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#27AE60"
            strokeWidth="20"
            strokeDasharray={`${availableDegrees} 360`}
            strokeDashoffset={-occupiedDegrees}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="text-[clamp(10px,1.1vh,13px)] font-semibold text-[#2C3E50] text-center mt-[1vh] leading-tight">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}

function OriginDonutChart({ origins }: { origins: ReservationOrigin[] }) {
  const total = origins.reduce((sum, origin) => sum + origin.count, 0);
  let currentRotation = -90;

  return (
    <Card className="flex flex-col items-center justify-center overflow-hidden">
      <CardContent className="p-[1vh_1vw] flex flex-col items-center justify-center w-full">
        <svg viewBox="0 0 100 100" className="w-[14vh] h-[14vh] shrink-0">
          {origins.map((origin) => {
            const percentage = (origin.count / total) * 100;
            const degrees = (percentage / 100) * 360;
            const slice = (
              <circle
                key={origin.name}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={origin.color}
                strokeWidth="20"
                strokeDasharray={`${degrees} 360`}
                strokeDashoffset={0}
                transform={`rotate(${currentRotation} 50 50)`}
              />
            );
            currentRotation += degrees;
            return slice;
          })}
        </svg>
        <div className="text-[clamp(10px,1.1vh,13px)] font-semibold text-[#2C3E50] text-center mt-[1vh] leading-tight">
          Origem das reservas
        </div>
      </CardContent>
    </Card>
  );
}

function OccupancyTrendChart({ data }: { data: { date: string; rate: number }[] }) {
  const maxRate = Math.max(...data.map(d => d.rate));
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = 100 - (d.rate / maxRate) * 80;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Card className="flex flex-col justify-center overflow-hidden">
      <CardContent className="p-[1vh_1vw] flex flex-col items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-[14vh] h-[14vh] shrink-0" preserveAspectRatio="none">
          <polyline
            points={points}
            fill="none"
            stroke="#E74C3C"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = 100 - (d.rate / maxRate) * 80;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="2"
                fill="#E74C3C"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        <div className="text-[clamp(10px,1.1vh,13px)] font-semibold text-[#2C3E50] text-center mt-[1vh] leading-tight">
          Taxa de ocupação - próximos 30 dias
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard({
  weekData,
  occupancyStats,
  occupancyNext30Days,
  reservationOrigins,
  occupancyTrend,
  variousUnits,
}: DashboardProps) {
  return (
    <div className="h-[96vh] w-screen overflow-hidden bg-[#ecf0f1] p-[1vh_1vw] flex flex-col">

      <div className="grid grid-cols-7 gap-[0.5vw] mb-[1vh] h-[56vh] overflow-hidden shrink-0">
        {weekData.map((day) => (
          <Card key={day.date.toISOString()} className="flex flex-col h-full overflow-hidden">
            <div className="bg-[#2C3E50] text-white p-[1vh_0.5vw] text-center shrink-0">
              <div className="text-[clamp(14px,1.8vh,20px)] font-bold mb-[0.3vh]">
                {day.dayOfMonth}/{day.month}
              </div>
              <div className="text-[clamp(9px,1vh,12px)] font-semibold uppercase tracking-wide opacity-90 mb-[0.5vh]">
                {day.dayOfWeek}
              </div>
              <div className="grid grid-cols-3 gap-[0.5vw] justify-center mt-[0.5vh]">
                <Badge
                  variant="outline"
                  className="bg-[#3498db] text-white px-[0.8vw] py-[0.3vh] text-[clamp(16px,1.1vh,12px)] font-semibold border-[#3498db]"
                >
                  {day.guests.filter(g => g.status === 'staying').length}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-[#27ae60] text-white px-[0.8vw] py-[0.3vh] text-[clamp(16px,1.1vh,12px)] font-semibold border-[#27ae60]"
                >
                  {day.guests.filter(g => g.status === 'checkin').length}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-[#e74c3c] text-white px-[0.8vw] py-[0.3vh] text-[clamp(16px,1.1vh,12px)] font-semibold border-[#e74c3c]"
                >
                  {day.guests.filter(g => g.status === 'checkout').length}
                </Badge>
              </div>
            </div>
            <div className="p-[0.8vh_0.5vw] grid grid-cols-2 gap-[0.5vw] overflow-hidden flex-1 auto-rows-min content-start">
              {day.guests.slice(0, 10).map((guest) => (
                <GuestCard key={guest.id} guest={guest} />
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-[4fr_1fr] gap-[1vw] h-[32vh] overflow-hidden shrink-0">
        <div className="grid grid-cols-4 gap-[1vw] h-full">
          <DonutChart stats={occupancyStats} label="Acomodações disponíveis vs. ocupadas" />
          <DonutChart stats={occupancyNext30Days} label="Ocupação nos próximos 30 dias" />
          <OriginDonutChart origins={reservationOrigins} />
          <OccupancyTrendChart data={occupancyTrend} />
        </div>

        <Card className="flex flex-col overflow-hidden">
          <CardContent className="p-[1vh_1vw] flex flex-col h-full">
            <h3 className="m-0 mb-[1vh] text-[clamp(11px,1.2vh,14px)] font-semibold text-[#2C3E50] shrink-0">
              Acomodações vazias
            </h3>
            <div className="flex flex-col gap-[0.5vh] overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-[#F8F9FA] [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-[#BDC3C7] [&::-webkit-scrollbar-thumb]:rounded hover:[&::-webkit-scrollbar-thumb]:bg-[#95A5A6]">
              {variousUnits.map((unit, i) => (
                <div
                  key={i}
                  className="p-[0.8vh_1vw] bg-[#F8F9FA] rounded text-[clamp(9px,1vh,11px)] font-medium text-[#495057] border-l-2 border-[#27AE60] whitespace-nowrap overflow-hidden text-ellipsis shrink-0"
                >
                  {unit}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
