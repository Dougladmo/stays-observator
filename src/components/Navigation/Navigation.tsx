import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAutoRotation } from '@/contexts/AutoRotationContext';
import { useBookingDataContext } from '@/contexts/BookingDataContext';
import { useState, useEffect, useRef } from 'react';

export default function Navigation() {
  const location = useLocation();
  const { enabled, intervalSeconds, toggleEnabled, setInterval } = useAutoRotation();
  const { syncType, lastFetchTime } = useBookingDataContext();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(intervalSeconds || 30));
  const [timeLeft, setTimeLeft] = useState(intervalSeconds || 30);

  // Use ref to track current interval without causing re-renders
  const intervalRef = useRef(intervalSeconds);

  // Update ref when intervalSeconds changes
  useEffect(() => {
    intervalRef.current = intervalSeconds;
  }, [intervalSeconds]);

  // Sync input value when intervalSeconds changes externally
  useEffect(() => {
    if (!isEditing) {
      setInputValue(String(intervalSeconds));
    }
  }, [intervalSeconds, isEditing]);

  // Countdown timer for next rotation
  useEffect(() => {
    if (!enabled) {
      setTimeLeft(intervalRef.current || 30);
      return;
    }

    // Capture fixed interval value at start - prevents calculation issues if interval changes mid-countdown
    const fixedInterval = intervalRef.current || 30;
    console.log('🔄 Starting countdown with fixed interval:', fixedInterval);
    setTimeLeft(fixedInterval);
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const intervalMs = fixedInterval * 1000; // Use FIXED value, not ref
      const remaining = Math.max(0, Math.ceil((intervalMs - elapsed) / 1000));

      setTimeLeft(remaining);
      console.log('⏱️ Countdown:', remaining);
    }, 1000); // Update every 1 second

    return () => {
      console.log('🛑 Clearing countdown timer');
      clearInterval(timer);
    };
  }, [enabled, location.pathname]); // Only recreate on enabled/location change

  const handleSaveInterval = () => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 3600) {
      setInterval(numValue);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setInputValue(String(intervalSeconds));
    setIsEditing(false);
  };

  // Format sync status
  const getSyncStatus = () => {
    if (!syncType || !lastFetchTime) return null;

    const now = Date.now();
    const minutesAgo = Math.floor((now - lastFetchTime) / 60000);

    const syncIcons = {
      full: '🔄',
      incremental: '⚡',
      cached: '📦'
    };

    const syncLabels = {
      full: 'Sincronização completa',
      incremental: 'Atualização incremental',
      cached: 'Dados em cache'
    };

    const timeText = minutesAgo === 0 ? 'agora' : `${minutesAgo}min atrás`;

    return {
      icon: syncIcons[syncType],
      label: syncLabels[syncType],
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

            {/* Interval input */}
            <div className="flex items-center gap-[0.3vw]">
              
              {isEditing ? (
                <div className="flex items-center gap-[0.3vw]">
                  <input
                    type="number"
                    min="1"
                    max="3600"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    autoFocus
                    className="w-[60px] rounded-md bg-white px-[0.5vw] py-[0.3vh] text-[clamp(10px,1.1vh,12px)] font-semibold text-gray-800 border-2 border-[#667eea] focus:outline-none"
                    placeholder="seg"
                  />
                  <button
                    onClick={handleSaveInterval}
                    className="rounded-md bg-green-500 px-[0.6vw] py-[0.3vh] text-[clamp(10px,1.1vh,12px)] font-semibold text-white transition-all hover:bg-green-600"
                    title="Salvar intervalo"
                  >
                    ✓
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="rounded-md bg-red-500 px-[0.6vw] py-[0.3vh] text-[clamp(10px,1.1vh,12px)] font-semibold text-white transition-all hover:bg-red-600"
                    title="Cancelar"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-md bg-white/10 px-[0.8vw] py-[0.3vh] text-[clamp(10px,1.1vh,12px)] font-semibold text-white backdrop-blur-[10px] transition-all hover:-translate-y-px hover:bg-white/20 min-w-[50px] text-center"
                  title="Clique para editar o intervalo em segundos"
                >
                  {intervalSeconds && !isNaN(intervalSeconds) ? intervalSeconds : 30}s
                </button>
              )}
            </div>
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
