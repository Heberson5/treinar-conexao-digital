import { useState, useEffect, useRef, useCallback } from "react";

interface UseActiveTimerOptions {
  targetDuration?: number; // in minutes
  onTimeUpdate?: (activeTime: number, totalTime: number) => void;
  onCompletion?: () => void;
  autoStart?: boolean;
}

export function useActiveTimer({
  targetDuration = 60,
  onTimeUpdate,
  onCompletion,
  autoStart = true
}: UseActiveTimerOptions = {}) {
  const [activeTime, setActiveTime] = useState(0); // in seconds
  const [totalTime, setTotalTime] = useState(0); // in seconds
  const [isActive, setIsActive] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(!document.hidden);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const targetDurationSeconds = targetDuration * 60;

  // Check if page is visible/focused
  const handleVisibilityChange = useCallback(() => {
    const visible = !document.hidden;
    setIsPageVisible(visible);
    
    // If page becomes visible and timer was active, resume counting
    if (visible && isActive) {
      // Timer will resume automatically due to useEffect dependency
    }
  }, [isActive]);

  // Handle window focus/blur for additional visibility detection
  const handleWindowFocus = useCallback(() => {
    setIsPageVisible(true);
  }, []);

  const handleWindowBlur = useCallback(() => {
    setIsPageVisible(false);
  }, []);

  useEffect(() => {
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [handleVisibilityChange, handleWindowFocus, handleWindowBlur]);

  // Timer logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTotalTime(prev => {
          const newTotal = prev + 1;
          onTimeUpdate?.(activeTime, newTotal);
          return newTotal;
        });

        // Only count active time when page is visible
        if (isPageVisible) {
          setActiveTime(prev => {
            const newActiveTime = prev + 1;
            
            // Check if target duration is reached
            if (newActiveTime >= targetDurationSeconds) {
              setIsActive(false);
              onCompletion?.();
            }
            
            return newActiveTime;
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPageVisible, targetDurationSeconds, onTimeUpdate, onCompletion, activeTime]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      setIsActive(true);
    }
  }, [autoStart]);

  const start = useCallback(() => {
    setIsActive(true);
  }, []);

  const pause = useCallback(() => {
    setIsActive(false);
  }, []);

  const reset = useCallback(() => {
    setIsActive(false);
    setActiveTime(0);
    setTotalTime(0);
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getProgress = useCallback(() => {
    return Math.min((activeTime / targetDurationSeconds) * 100, 100);
  }, [activeTime, targetDurationSeconds]);

  const getRemainingTime = useCallback(() => {
    return Math.max(targetDurationSeconds - activeTime, 0);
  }, [activeTime, targetDurationSeconds]);

  const isCompleted = activeTime >= targetDurationSeconds;
  const canComplete = isCompleted;

  return {
    // State
    activeTime,
    totalTime,
    isActive,
    isPageVisible,
    isCompleted,
    canComplete,
    
    // Actions
    start,
    pause,
    reset,
    
    // Computed values
    progress: getProgress(),
    remainingTime: getRemainingTime(),
    formattedActiveTime: formatTime(activeTime),
    formattedTotalTime: formatTime(totalTime),
    formattedRemainingTime: formatTime(getRemainingTime()),
    formattedTargetTime: formatTime(targetDurationSeconds),
    
    // Utilities
    formatTime
  };
}