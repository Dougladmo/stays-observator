import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAutoRotation } from '@/contexts/AutoRotationContext';
import { useBookingDataContext } from '@/contexts/BookingDataContext';

export default function Navigation() {
  const location = useLocation();
  const { enabled, intervalSeconds, toggleEnabled, setInterval: setRotationInterval } = useAutoRotation();
  const { lastFetchTime } = useBookingDataContext();

  // Format sync status
  const getSyncStatus = () => {
    if (!lastFetchTime) return null;

    const now = Date.now();
    const minutesAgo = Math.floor((now - lastFetchTime) / 60000);
    const timeText = minutesAgo === 0 ? 'agora' : `${minutesAgo}min atrás`;

    return {
      icon: '📦',
      label: 'Última atualização',
      time: timeText
    };
  };

  const syncStatus = getSyncStatus();

  return (
    <nav className="sticky top-0 z-50 h-[4vh] bg-[#667eea] shadow-md">
      <div className="mx-auto flex h-full max-w-full items-center justify-between px-[2vw]">
        <div className="flex items-center gap-[1vw]">
          <h1 className="m-0 text-[clamp(14px,1.5vh,18px)] font-bold tracking-tight text-white">
            Dashboard Hóspedes
          </h1>

          {/* Sync Status Indicator */}
          {syncStatus && (
            <div
              className="flex items-center gap-[0.3vw] px-[0.6vw] py-[0.3vh] bg-white/10 rounded-md backdrop-blur-[10px]"
              title={`${syncStatus.label} - ${syncStatus.time}`}
            >
              <span className="text-[clamp(10px,1vh,12px)]">{syncStatus.icon}</span>
              <span className="text-[clamp(9px,0.9vh,10px)] text-white/70 font-medium whitespace-nowrap">
                {syncStatus.time}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-[1vw]">
          {/* Auto-rotation controls */}
          <div className="flex items-center gap-[0.5vw]">
            {/* Toggle button with countdown */}
            <div className="flex items-center gap-[0.4vw]">
              <button
                onClick={toggleEnabled}
                className={cn(
                  "rounded-md px-[1vw] py-[0.5vh] text-[clamp(10px,1.1vh,12px)] font-semibold transition-all hover:-translate-y-px",
                  enabled
                    ? "bg-green-500 text-white shadow-md hover:bg-green-600"
                    : "bg-white/10 text-white backdrop-blur-[10px] hover:bg-white/20"
                )}
                title={enabled ? "Desativar rotação automática" : "Ativar rotação automática"}
              >
                {enabled ? '🔄 Auto' : '⏸️ Manual'}
              </button>

            </div>

            {/* Interval dropdown */}
            <select
              value={intervalSeconds}
              onChange={(e) => setRotationInterval(Number(e.target.value))}
              className="rounded-md bg-white/10 px-[0.8vw] py-[0.5vh] text-[clamp(10px,1.1vh,12px)] font-semibold text-white backdrop-blur-[10px] transition-all hover:bg-white/20 border border-white/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
              title="Selecione o intervalo de rotação"
            >
              <option value={10} className="bg-[#667eea] text-white">10s</option>
              <option value={20} className="bg-[#667eea] text-white">20s</option>
              <option value={30} className="bg-[#667eea] text-white">30s</option>
              <option value={40} className="bg-[#667eea] text-white">40s</option>
              <option value={50} className="bg-[#667eea] text-white">50s</option>
              <option value={60} className="bg-[#667eea] text-white">60s</option>
              <option value={90} className="bg-[#667eea] text-white">90s</option>
              <option value={120} className="bg-[#667eea] text-white">2min</option>
            </select>
          </div>

          {/* Navigation links */}
          <div className="flex gap-[0.5vw]">
            <Link
              to="/"
              className={cn(
                "rounded-md bg-white/10 px-[1.5vw] py-[0.5vh] text-[clamp(11px,1.2vh,14px)] font-semibold text-white backdrop-blur-[10px] transition-all hover:-translate-y-px hover:bg-white/20",
                location.pathname === '/' && "bg-white/25 shadow-md"
              )}
            >
              Dashboard
            </Link>
            <Link
              to="/calendar"
              className={cn(
                "rounded-md bg-white/10 px-[1.5vw] py-[0.5vh] text-[clamp(11px,1.2vh,14px)] font-semibold text-white backdrop-blur-[10px] transition-all hover:-translate-y-px hover:bg-white/20",
                location.pathname === '/calendar' && "bg-white/25 shadow-md"
              )}
            >
              Calendário
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
