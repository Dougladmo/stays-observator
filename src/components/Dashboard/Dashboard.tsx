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
    staying: 'bg-gradient-to-br from-[#3498db] to-[#2980b9]',
    checkin: 'bg-gradient-to-br from-[#27ae60] to-[#229954]',
    checkout: 'bg-gradient-to-br from-[#e74c3c] to-[#c0392b]',
  };

  return (
    <div className={cn(
      'h-[4.5vh] shrink-0 flex flex-col justify-center rounded-md px-[0.5vw] py-[0.8vh] text-white cursor-pointer',
      statusStyles[guest.status]
    )}>
      <div className="text-[clamp(10px,1vh,12px)] font-bold mb-[0.2vh] overflow-hidden text-ellipsis whitespace-nowrap">
        {guest.code}
      </div>
      <div className="text-[clamp(8px,0.8vh,10px)] opacity-90 overflow-hidden text-ellipsis whitespace-nowrap">
        {guest.unit}
      </div>
    </div>
  );
}

function DonutChart({ stats, label }: { stats: OccupancyStats; label: string }) {
  const occupiedPercentage = (stats.occupied / stats.total) * 100;
  const availablePercentage = (stats.available / stats.total) * 100;

  const occupiedDegrees = (occupiedPercentage / 100) * 360;
  const availableDegrees = (availablePercentage / 100) * 360;

  return (
    <Card className="flex flex-col items-center overflow-hidden">
      <CardContent className="p-[1vh_1vw] flex flex-col items-center w-full">
        <svg viewBox="0 0 100 100" className="w-[12vh] h-[12vh] mb-[1vh] shrink-0">
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
        <div className="text-[clamp(10px,1.1vh,13px)] font-semibold text-[#2C3E50] text-center mb-[1vh] leading-tight">
          {label}
        </div>
        <div className="flex flex-col gap-[0.5vh] w-full">
          <div className="flex items-center gap-[0.5vw] text-[clamp(9px,1vh,12px)] text-[#7F8C8D]">
            <span className="w-[10px] h-[10px] rounded-full shrink-0 bg-[#27AE60]"></span>
            <span>Disponíveis: {stats.available}</span>
          </div>
          <div className="flex items-center gap-[0.5vw] text-[clamp(9px,1vh,12px)] text-[#7F8C8D]">
            <span className="w-[10px] h-[10px] rounded-full shrink-0 bg-[#E74C3C]"></span>
            <span>Ocupadas: {stats.occupied}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OriginDonutChart({ origins }: { origins: ReservationOrigin[] }) {
  const total = origins.reduce((sum, origin) => sum + origin.count, 0);
  let currentRotation = -90;

  return (
    <Card className="flex flex-col items-center overflow-hidden">
      <CardContent className="p-[1vh_1vw] flex flex-col items-center w-full">
        <svg viewBox="0 0 100 100" className="w-[12vh] h-[12vh] mb-[1vh] shrink-0">
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
        <div className="text-[clamp(10px,1.1vh,13px)] font-semibold text-[#2C3E50] text-center mb-[1vh] leading-tight">
          Origem das reservas
        </div>
        <div className="flex flex-col gap-[0.5vh] w-full">
          {origins.map((origin) => (
            <div key={origin.name} className="flex items-center gap-[0.5vw] text-[clamp(9px,1vh,12px)] text-[#7F8C8D]">
              <span
                className="w-[10px] h-[10px] rounded-full shrink-0"
                style={{ backgroundColor: origin.color }}
              ></span>
              <span>{origin.name}</span>
            </div>
          ))}
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
    <Card className="col-span-2 overflow-hidden">
      <CardContent className="p-[1vh_1vw]">
        <div className="text-[clamp(10px,1.1vh,13px)] font-semibold text-[#2C3E50] mb-[1vh] text-center">
          Taxa de ocupação - próximos 30 dias
        </div>
        <svg viewBox="0 0 100 100" className="w-full h-[10vh] mb-[1vh]" preserveAspectRatio="none">
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
        <div className="flex justify-between px-[0.5vw]">
          {data.map((d, i) => (
            <span key={i} className="text-[clamp(8px,0.8vh,10px)] text-[#7F8C8D]">{d.date}</span>
          ))}
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
    <div className="h-[96vh] w-screen overflow-hidden bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] p-[1vh_1vw] flex flex-col">
      <Card className="mb-[1vh] shrink-0 h-[5vh]">
        <CardContent className="p-[1vh_2vw] flex justify-between items-center h-full">
          <h1 className="m-0 text-[clamp(16px,2vh,24px)] font-bold text-[#2C3E50]">
            Dashboard de Ocupação
          </h1>
          <div className="text-[clamp(10px,1.2vh,14px)] text-[#7F8C8D] capitalize">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-7 gap-[0.5vw] mb-[1vh] h-[56vh] overflow-hidden shrink-0">
        {weekData.map((day) => (
          <Card key={day.date.toISOString()} className="overflow-hidden flex flex-col h-full">
            <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white p-[1vh_0.5vw] text-center shrink-0">
              <div className="text-[clamp(14px,1.8vh,20px)] font-bold mb-[0.3vh]">
                {day.dayOfMonth}/{day.month}
              </div>
              <div className="text-[clamp(9px,1vh,12px)] font-semibold uppercase tracking-wide opacity-90 mb-[0.5vh]">
                {day.dayOfWeek}
              </div>
              <div className="flex gap-[0.5vw] justify-center mt-[0.5vh]">
                <Badge
                  variant="outline"
                  className="bg-white/20 backdrop-blur-[10px] px-[0.8vw] py-[0.3vh] text-[clamp(9px,1vh,11px)] font-semibold border-[rgba(39,174,96,0.5)]"
                >
                  {day.guests.filter(g => g.status === 'checkin').length}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-white/20 backdrop-blur-[10px] px-[0.8vw] py-[0.3vh] text-[clamp(9px,1vh,11px)] font-semibold border-[rgba(231,76,60,0.5)]"
                >
                  {day.guests.filter(g => g.status === 'checkout').length}
                </Badge>
              </div>
            </div>
            <div className="p-[0.8vh_0.5vw] flex flex-col gap-[0.5vh] overflow-hidden flex-1">
              {day.guests.slice(0, 10).map((guest) => (
                <GuestCard key={guest.id} guest={guest} />
              ))}
              {day.guests.length > 10 && (
                <div className="p-[0.5vh] text-center text-[clamp(9px,1vh,11px)] text-[#7F8C8D] font-semibold bg-[#F8F9FA] rounded mt-[0.5vh]">
                  +{day.guests.length - 10} mais
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-[3fr_1fr] gap-[1vw] h-[32vh] overflow-hidden shrink-0">
        <div className="grid grid-cols-2 gap-[1vw] h-full">
          <DonutChart stats={occupancyStats} label="Acomodações disponíveis vs. ocupadas" />
          <DonutChart stats={occupancyNext30Days} label="Ocupação nos próximos 30 dias" />
          <OriginDonutChart origins={reservationOrigins} />
          <OccupancyTrendChart data={occupancyTrend} />
        </div>

        <Card className="overflow-hidden flex flex-col">
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
