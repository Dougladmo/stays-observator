import type { DayData, Guest } from './types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import MarqueeText from '@/components/ui/MarqueeText';

interface DashboardProps {
  weekData: DayData[];
  variousUnits: string[];
}

function GuestCard({ guest }: { guest: Guest }) {
  const statusStyles = {
    staying: 'bg-[#3498db]',
    checkin: 'bg-[#27ae60]',
    checkout: 'bg-[#e74c3c]',
  };

  // Format date from YYYY-MM-DD to DD/MMM (ex: 30/out)
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    const day = date.getDate();
    const month = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    return `${day}/${month}`;
  };

  return (
    <div className={cn(
      'flex flex-col justify-center rounded-md px-[0.5vw] py-[0.4vh] text-white cursor-pointer w-full relative',
      statusStyles[guest.status],
      'h-auto'
    )}>
      <div className="flex items-start justify-between gap-1">
        <div className="text-[clamp(12px,1.1vh,13px)] font-bold overflow-hidden  flex-1">
          {guest.code}
        </div>
        
      </div>
      <div className="text-[clamp(11px,0.9vh,11px)] leading-snug opacity-90 overflow-hidden text-ellipsis whitespace-nowrap">
        {guest.guestName || 'Sem nome'}
      </div>
      <div className="text-[clamp(10px,0.85vh,10px)] leading-snug opacity-80 overflow-hidden text-ellipsis whitespace-nowrap">
        {formatDate(guest.checkInDate)} → {formatDate(guest.checkOutDate)}
        
      </div>
      <div className="text-[clamp(10px,0.85vh,10px)] leading-snug opacity-80 overflow-hidden text-ellipsis whitespace-nowrap">
        {guest.nights || 0} {guest.nights === 1 ? 'noite' : 'noites'}
        {guest.guestCount !== undefined && guest.guestCount > 0 && (
          <> | {guest.guestCount} hosp</>
        )}
        {guest.platformImage && (
          <img
            src={guest.platformImage}
            alt={guest.platform || 'Plataforma'}
            title={guest.platform || 'Plataforma'}
            className="w-[clamp(22px,1.4vh,16px)] absolute right-1 bottom-1 h-[clamp(22px,1.4vh,18px)] object-contain shrink-0"
          />
        )}
      </div>
    </div>
  );
}

export default function Dashboard({
  weekData,
  variousUnits,
}: DashboardProps) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f5f5f5] p-[1vh_1vw] flex flex-col">

      <div className="grid grid-cols-7 gap-[0.5vw] mb-[1vh] h-[83vh] overflow-hidden shrink-0">
        {weekData.map((day) => (
          <Card key={day.date.toISOString()} className="flex flex-col h-full overflow-hidden">
            <div className="bg-[#5D6D7E] text-white p-[0.5vh_0.5vw] text-center">
              <div className="flex items-center justify-between gap-[0.5vw]">
                <div className="flex flex-col items-start flex-1">
                  <div className="text-[clamp(12px,1.4vh,16px)] font-bold leading-none">
                    {day.dayOfMonth}/{day.month}
                  </div>
                  <div className="text-[clamp(8px,0.85vh,10px)] font-semibold uppercase tracking-wide opacity-90">
                    {day.dayOfWeek}
                  </div>
                </div>
                <div className="flex gap-[0.3vw]">
                  <Badge
                    variant="outline"
                    className="bg-[#3498db] text-white px-[0.5vw] py-[0.2vh] text-[clamp(10px,0.9vh,11px)] font-semibold border-[#3498db] leading-none"
                  >
                    {day.guests.filter(g => g.status === 'staying').length}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-[#27ae60] text-white px-[0.5vw] py-[0.2vh] text-[clamp(10px,0.9vh,11px)] font-semibold border-[#27ae60] leading-none"
                  >
                    {day.guests.filter(g => g.status === 'checkin').length}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-[#e74c3c] text-white px-[0.5vw] py-[0.2vh] text-[clamp(10px,0.9vh,11px)] font-semibold border-[#e74c3c] leading-none"
                  >
                    {day.guests.filter(g => g.status === 'checkout').length}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="p-[0.6vh_0.3vw] columns-2 gap-[0.5vw] overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-[#F8F9FA] [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-[#BDC3C7] [&::-webkit-scrollbar-thumb]:rounded hover:[&::-webkit-scrollbar-thumb]:bg-[#95A5A6]">
              {day.guests.map((guest) => (
                <div key={guest.id} className="mb-[0.2vw] break-inside-avoid">
                  <GuestCard guest={guest} />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="h-[10vh] overflow-hidden shrink-0">
        <Card className="flex flex-col h-full overflow-hidden">
          <CardContent className="p-[1vh_1vw] flex flex-col">
            <h3 className="m-0 mb-[1vh] text-[clamp(11px,1.2vh,14px)] font-semibold text-[#2C3E50] shrink-0">
              Acomodações vazias
            </h3>
            <div className="flex flex-wrap gap-[0.5vw] overflow-y-auto flex-1 content-start [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-[#F8F9FA] [&::-webkit-scrollbar-track]:rounded [&::-webkit-scrollbar-thumb]:bg-[#BDC3C7] [&::-webkit-scrollbar-thumb]:rounded hover:[&::-webkit-scrollbar-thumb]:bg-[#95A5A6]">
              {variousUnits.map((unit, i) => (
                <div
                  key={i}
                  className="w-[4vw] h-[3.5vh] bg-[#F8F9FA] rounded border-l-2 border-[#27AE60] shrink-0 overflow-hidden"
                >
                  <MarqueeText
                    className="h-full px-[0.3vw] flex items-center"
                    speed={50}
                  >
                    <span className="text-[clamp(9px,0.9vh,11px)] font-medium text-[#495057]">
                      {unit}
                    </span>
                  </MarqueeText>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
