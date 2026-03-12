import { useState, useEffect, useCallback, useRef } from 'react';
import { useAudio } from './use-audio';

export type TimerMode = 'focus' | 'break';

export function useTimer() {
  const [focusDuration, setFocusDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [sessionCount, setSessionCount] = useState(1);
  const [isFlashing, setIsFlashing] = useState(false);
  
  const { playTick, playAlarm } = useAudio();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-adjust break time when focus time changes
  useEffect(() => {
    const calculatedBreak = Math.max(1, Math.round((focusDuration / 25) * 5));
    setBreakDuration(calculatedBreak);
    
    if (!isActive && mode === 'focus') {
      setTimeLeft(focusDuration * 60);
    }
  }, [focusDuration, isActive, mode]);

  // Timer countdown logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = useCallback(() => {
    setIsActive(false);
    playAlarm();
    
    // Trigger visual flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 3000);

    if (mode === 'focus') {
      setMode('break');
      setTimeLeft(breakDuration * 60);
    } else {
      setMode('focus');
      setTimeLeft(focusDuration * 60);
      setSessionCount(prev => (prev % 4) + 1);
    }
  }, [mode, breakDuration, focusDuration, playAlarm]);

  const toggleTimer = useCallback(() => {
    setIsActive(prev => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setMode('focus');
    setTimeLeft(focusDuration * 60);
    setSessionCount(1);
  }, [focusDuration]);

  // Adjust focus duration by a delta (used by both scroll and tap buttons)
  const adjustFocus = useCallback((delta: number) => {
    if (isActive) return;
    setFocusDuration(prev => {
      const next = Math.max(1, Math.min(120, prev + delta));
      if (next !== prev) playTick();
      return next;
    });
  }, [isActive, playTick]);

  // Handle scroll to adjust time (desktop)
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    if (isActive) return;
    adjustFocus(e.deltaY < 0 ? 1 : -1);
  }, [isActive, adjustFocus]);

  return {
    timeLeft,
    focusDuration,
    breakDuration,
    isActive,
    mode,
    sessionCount,
    isFlashing,
    toggleTimer,
    resetTimer,
    handleWheel,
    adjustFocus,
  };
}
