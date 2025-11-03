/**
 * Auto-rotation context for automatic screen transitions
 * Controls the interval and enabled state for rotating between Dashboard and Calendar
 * Persists configuration in localStorage
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

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

const STORAGE_KEY = 'stays-observator-autorotation-config';

interface RotationConfig {
  enabled: boolean;
  intervalSeconds: number;
}

/**
 * Load auto-rotation configuration from localStorage
 */
function loadConfig(): RotationConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const config = JSON.parse(raw);
      console.log('⚙️ Loaded auto-rotation config:', config);
      return config;
    }
  } catch (error) {
    console.error('❌ Failed to load rotation config:', error);
  }
  return { enabled: false, intervalSeconds: 30 };
}

/**
 * Save auto-rotation configuration to localStorage
 */
function saveConfig(config: RotationConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    console.log('💾 Saved auto-rotation config:', config);
  } catch (error) {
    console.error('❌ Failed to save rotation config:', error);
  }
}

export function AutoRotationProvider({ children }: { children: ReactNode }) {
  // Load initial state from localStorage
  const initialConfig = loadConfig();
  const [enabled, setEnabled] = useState(initialConfig.enabled);
  const [intervalSeconds, setIntervalSeconds] = useState(initialConfig.intervalSeconds);

  // Save to localStorage whenever config changes
  useEffect(() => {
    saveConfig({ enabled, intervalSeconds });
  }, [enabled, intervalSeconds]);

  const toggleEnabled = () => {
    setEnabled(prev => {
      const newValue = !prev;
      console.log(`🔄 Auto-rotation ${newValue ? 'ENABLED' : 'DISABLED'}`);
      return newValue;
    });
  };

  const setInterval = (seconds: number) => {
    console.log(`⏱️ Setting rotation interval to ${seconds}s`);
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
