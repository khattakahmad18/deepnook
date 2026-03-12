import { useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
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
}: PomodoroTimerProps) {
  const timerRef = useRef<HTMLDivElement>(null);
  const { selectedSound, isMuted, volume, handleSoundWheel, toggleMute, handleVolumeChange } = useAmbientSound(isActive);

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

  return (
    <div className="flex flex-col items-center justify-center py-12">

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

      {/* Timer Display */}
      <div
        ref={timerRef}
        className="relative group cursor-ns-resize touch-none select-none"
        title={!isActive ? 'Scroll to adjust time' : undefined}
      >
        <motion.h1
          key={timeLeft}
          initial={{ opacity: 0.8, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-8xl sm:text-9xl font-semibold tracking-tighter text-foreground tabular-nums drop-shadow-sm"
        >
          {formatTime(timeLeft)}
        </motion.h1>

        {!isActive && mode === 'focus' && (
          <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 text-muted-foreground">
            <span className="text-xs">▲</span>
            <span className="text-xs">▼</span>
          </div>
        )}
      </div>

      {/* Settings Summary */}
      <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground/80 font-medium">
        <span>{focusDuration}m Focus</span>
        <span className="w-1 h-1 rounded-full bg-border" />
        <span>{breakDuration}m Break</span>
      </div>

      {/* Ambient Sound Selector — inline, below time info */}
      <AmbientSoundSelector
        selectedSound={selectedSound}
        isMuted={isMuted}
        volume={volume}
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
