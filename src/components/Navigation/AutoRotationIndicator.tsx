/**
 * Visual indicator showing progress until next screen rotation
 */

import { useEffect, useState } from 'react';
import { useAutoRotation } from '@/contexts/AutoRotationContext';
import { useLocation } from 'react-router-dom';

export default function AutoRotationIndicator() {
  const { enabled, intervalSeconds } = useAutoRotation();
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(intervalSeconds);

  useEffect(() => {
    if (!enabled) {
      setProgress(0);
      setTimeLeft(intervalSeconds);
      return;
    }

    // Reset when route changes
    setProgress(0);
    setTimeLeft(intervalSeconds);

    const startTime = Date.now();
    const intervalMs = intervalSeconds * 1000;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = (elapsed / intervalMs) * 100;
      const newTimeLeft = Math.ceil((intervalMs - elapsed) / 1000);

      if (newProgress >= 100) {
        setProgress(100);
        setTimeLeft(0);
      } else {
        setProgress(newProgress);
        setTimeLeft(newTimeLeft);
      }
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(timer);
  }, [enabled, intervalSeconds, location.pathname]);

  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-3 rounded-lg bg-white/90 backdrop-blur-md shadow-lg px-4 py-3">
      {/* Circular progress */}
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="#E5E7EB"
            strokeWidth="4"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="24"
            cy="24"
            r="20"
            stroke="#667eea"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress / 100)}`}
            className="transition-all duration-100 ease-linear"
          />
        </svg>
        {/* Time left */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-700">{timeLeft}s</span>
        </div>
      </div>

      {/* Info text */}
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-gray-700">
          Próxima tela
        </span>
        <span className="text-xs text-gray-500">
          {location.pathname === '/' ? 'Calendário' : 'Dashboard'}
        </span>
      </div>
    </div>
  );
}
