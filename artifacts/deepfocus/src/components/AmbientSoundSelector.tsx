import { useRef, useEffect } from 'react';
import { Volume2, VolumeX, Volume1, ChevronLeft, ChevronRight } from 'lucide-react';
import { AMBIENT_OPTIONS, type AmbientSound } from '@/hooks/use-ambient-sound';

interface AmbientSoundSelectorProps {
  selectedSound: AmbientSound;
  isMuted: boolean;
  volume: number;
  cycleSound: (dir: 1 | -1) => void;
  handleSoundWheel: (e: WheelEvent) => void;
  toggleMute: () => void;
  handleVolumeChange: (v: number) => void;
}

export function AmbientSoundSelector({
  selectedSound,
  isMuted,
  volume,
  cycleSound,
  handleSoundWheel,
  toggleMute,
  handleVolumeChange,
}: AmbientSoundSelectorProps) {
  const selectorRef = useRef<HTMLDivElement>(null);
  const current     = AMBIENT_OPTIONS.find(o => o.id === selectedSound)!;

  useEffect(() => {
    const el = selectorRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleSoundWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleSoundWheel);
  }, [handleSoundWheel]);

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 45 ? Volume1 : Volume2;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">

      {/* Prev sound button */}
      <button
        onClick={() => cycleSound(-1)}
        className="p-2 rounded-full border border-border/50 bg-card text-muted-foreground hover:text-foreground hover:border-border transition-colors"
        aria-label="Previous ambient sound"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Sound label (also scroll target on desktop) */}
      <div
        ref={selectorRef}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card cursor-ns-resize select-none hover:border-border transition-colors min-w-[110px] justify-center"
        title="Scroll or tap arrows to change ambient sound"
      >
        <span className="text-base leading-none">{current.emoji}</span>
        <span className="text-sm font-medium text-muted-foreground">
          {current.label}
        </span>
      </div>

      {/* Next sound button */}
      <button
        onClick={() => cycleSound(1)}
        className="p-2 rounded-full border border-border/50 bg-card text-muted-foreground hover:text-foreground hover:border-border transition-colors"
        aria-label="Next ambient sound"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Volume slider — only visible when a sound is selected */}
      {selectedSound !== 'none' && (
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={isMuted ? 0 : volume}
          onChange={e => {
            const v = Number(e.target.value);
            if (isMuted && v > 0) toggleMute();
            handleVolumeChange(v);
          }}
          className="lumino-slider w-20 cursor-pointer"
          style={{ '--slider-fill': `${isMuted ? 0 : volume}%` } as React.CSSProperties}
          aria-label="Ambient volume"
          title={`Volume: ${isMuted ? 0 : volume}%`}
        />
      )}

      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        disabled={selectedSound === 'none'}
        className="p-2 rounded-full border border-border/50 bg-card text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label={isMuted ? 'Unmute ambient sound' : 'Mute ambient sound'}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        <VolumeIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
