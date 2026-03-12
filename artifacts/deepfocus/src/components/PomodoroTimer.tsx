import { useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAmbientSound } from '@/hooks/use-ambient-sound';
import { AmbientSoundSelector } from './AmbientSoundSelector';

interface PomodoroTimerProps {
  timeLeft: number;
  focusDuration: number;
  breakDuration: number;
  isActive: boolean;
  mode: 'focus' | 'break';
  sessionCount: number;
  toggleTimer: () => void;
  resetTimer: () => void;
  handleWheel: (e: WheelEvent) => void;
  adjustFocus: (delta: number) => void;
}

export function PomodoroTimer({
  timeLeft,
  focusDuration,
  breakDuration,
  isActive,
  mode,
  sessionCount,
  toggleTimer,
  resetTimer,
  handleWheel,
  adjustFocus,
}: PomodoroTimerProps) {
  const timerRef = useRef<HTMLDivElement>(null);
  const { selectedSound, isMuted, volume, cycleSound, handleSoundWheel, toggleMute, handleVolumeChange } =
    useAmbientSound(isActive);

  useEffect(() => {
    const el = timerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const canAdjust = !isActive && mode === 'focus';

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12">

      {/* Mode Indicator */}
      <motion.div
        layout
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-card border border-border/50 shadow-sm mb-8"
      >
        <div className={`w-2 h-2 rounded-full ${mode === 'focus' ? 'bg-primary' : 'bg-accent-foreground/50'}`} />
        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {mode === 'focus' ? 'Deep Focus' : 'Rest & Recharge'}
        </span>
      </motion.div>

      {/* Timer Display with +/- tap buttons */}
      <div className="flex items-center gap-4 sm:gap-6">

        {/* Decrease button — always visible, essential on mobile */}
        <button
          onClick={() => adjustFocus(-1)}
          disabled={!canAdjust}
          className="flex flex-col items-center justify-center w-11 h-11 rounded-full border border-border/50 bg-card text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
          aria-label="Decrease focus time"
        >
          <ChevronDown className="w-5 h-5" />
        </button>

        {/* Timer clock face */}
        <div
          ref={timerRef}
          className="cursor-ns-resize touch-none select-none"
          title={canAdjust ? 'Scroll or tap arrows to adjust' : undefined}
        >
          <motion.h1
            key={timeLeft}
            initial={{ opacity: 0.8, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
            className="text-7xl sm:text-9xl font-semibold tracking-tighter text-foreground tabular-nums drop-shadow-sm"
          >
            {formatTime(timeLeft)}
          </motion.h1>
        </div>

        {/* Increase button */}
        <button
          onClick={() => adjustFocus(1)}
          disabled={!canAdjust}
          className="flex flex-col items-center justify-center w-11 h-11 rounded-full border border-border/50 bg-card text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-20 disabled:cursor-not-allowed active:scale-95"
          aria-label="Increase focus time"
        >
          <ChevronUp className="w-5 h-5" />
        </button>

      </div>

      {/* Settings Summary */}
      <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground/80 font-medium">
        <span>{focusDuration}m Focus</span>
        <span className="w-1 h-1 rounded-full bg-border" />
        <span>{breakDuration}m Break</span>
      </div>

      {/* Ambient Sound Selector */}
      <AmbientSoundSelector
        selectedSound={selectedSound}
        isMuted={isMuted}
        volume={volume}
        cycleSound={cycleSound}
        handleSoundWheel={handleSoundWheel}
        toggleMute={toggleMute}
        handleVolumeChange={handleVolumeChange}
      />

      {/* Controls */}
      <div className="mt-10 flex items-center gap-6">
        <button
          onClick={toggleTimer}
          className={`
            flex items-center gap-2 px-8 py-4 rounded-full font-medium text-lg transition-all duration-300
            ${isActive
              ? 'bg-card text-foreground hover:bg-card/80 border border-border'
              : 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5'
            }
          `}
        >
          {isActive ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          {isActive ? 'Pause' : 'Start Focus'}
        </button>

        <button
          onClick={resetTimer}
          className="p-4 rounded-full text-muted-foreground hover:text-foreground hover:bg-card transition-colors border border-transparent hover:border-border"
          aria-label="Reset Timer"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Session Counter */}
      <div className="mt-12 flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-10 h-1.5 rounded-full transition-colors duration-500 ${
              s < sessionCount ? 'bg-primary' :
              s === sessionCount ? 'bg-primary/50' : 'bg-border'
            }`}
          />
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground font-medium uppercase tracking-widest">
        Session {sessionCount} of 4
      </p>

    </div>
  );
}
