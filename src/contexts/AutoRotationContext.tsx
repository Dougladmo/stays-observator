/**
 * Auto-rotation context for automatic screen transitions
 * Controls the interval and enabled state for rotating between Dashboard and Calendar
 */

import { createContext, useContext, useState, ReactNode } from 'react';

export interface AutoRotationContextType {
  /** Whether auto-rotation is enabled */
  enabled: boolean;
  /** Interval in seconds between transitions */
  intervalSeconds: number;
  /** Toggle auto-rotation on/off */
  toggleEnabled: () => void;
  /** Set the rotation interval */
  setInterval: (seconds: number) => void;
}

const AutoRotationContext = createContext<AutoRotationContextType | undefined>(undefined);

export function AutoRotationProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [intervalSeconds, setIntervalSeconds] = useState(30); // Default 30 seconds

  const toggleEnabled = () => {
    setEnabled(prev => !prev);
  };

  const setInterval = (seconds: number) => {
    setIntervalSeconds(seconds);
  };

  return (
    <AutoRotationContext.Provider
      value={{
        enabled,
        intervalSeconds,
        toggleEnabled,
        setInterval,
      }}
    >
      {children}
    </AutoRotationContext.Provider>
  );
}

export function useAutoRotation() {
  const context = useContext(AutoRotationContext);
  if (context === undefined) {
    throw new Error('useAutoRotation must be used within an AutoRotationProvider');
  }
  return context;
}
