import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAutoRotation } from '@/contexts/AutoRotationContext';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const location = useLocation();
  const { enabled, intervalSeconds, toggleEnabled, setInterval } = useAutoRotation();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(intervalSeconds || 30));
  const [timeLeft, setTimeLeft] = useState(intervalSeconds || 30);

  // Sync input value when intervalSeconds changes externally
  useEffect(() => {
    if (!isEditing) {
      setInputValue(String(intervalSeconds));
    }
  }, [intervalSeconds, isEditing]);

  // Countdown timer for next rotation
  useEffect(() => {
    // Validate intervalSeconds
    const validInterval = intervalSeconds && !isNaN(intervalSeconds) ? intervalSeconds : 30;

    if (!enabled) {
      setTimeLeft(validInterval);
      return;
    }

    // Reset countdown on location change
    setTimeLeft(validInterval);
    const startTime = Date.now();
    const intervalMs = validInterval * 1000;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((intervalMs - elapsed) / 1000));

      setTimeLeft(remaining);
    }, 100); // Update every 100ms for smoother countdown

    return () => {
      clearInterval(timer);
    };
  }, [enabled, intervalSeconds, location.pathname]);

  const handleIntervalChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 3600) {
      setInterval(numValue);
      setInputValue(value);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    // Reset to current value if invalid
    setInputValue(String(intervalSeconds));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleIntervalChange(inputValue);
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setInputValue(String(intervalSeconds));
      setIsEditing(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 h-[4vh] bg-[#667eea] shadow-md">
      <div className="mx-auto flex h-full max-w-full items-center justify-between px-[2vw]">
        <div className="flex items-center">
          <h1 className="m-0 text-[clamp(14px,1.5vh,18px)] font-bold tracking-tight text-white">
            Dashboard Hóspedes
          </h1>
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

              {/* Countdown message */}
              {enabled && (
                <span className="text-[clamp(9px,1vh,11px)] text-white/70 font-medium whitespace-nowrap">
                  próx. em {!isNaN(timeLeft) && timeLeft >= 0 ? timeLeft : intervalSeconds || 30}s
                </span>
              )}
            </div>

            {/* Interval input */}
            <div className="flex items-center gap-[0.3vw]">
              <span className="text-[clamp(10px,1.1vh,12px)] font-semibold text-white">
                ⏱️
              </span>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="3600"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={handleInputBlur}
                  onKeyDown={handleInputKeyDown}
                  autoFocus
                  className="w-[60px] rounded-md bg-white px-[0.5vw] py-[0.3vh] text-[clamp(10px,1.1vh,12px)] font-semibold text-gray-800 border-2 border-[#667eea] focus:outline-none"
                  placeholder="seg"
                />
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
