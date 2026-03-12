import { useRef, useEffect } from 'react';
import { Volume2, VolumeX, Volume1 } from 'lucide-react';
import { AMBIENT_OPTIONS, type AmbientSound } from '@/hooks/use-ambient-sound';

interface AmbientSoundSelectorProps {
  selectedSound: AmbientSound;
  isMuted: boolean;
  volume: number;
  handleSoundWheel: (e: WheelEvent) => void;
  toggleMute: () => void;
  handleVolumeChange: (v: number) => void;
}

export function AmbientSoundSelector({
  selectedSound,
  isMuted,
  volume,
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
      {/* Sound selector pill */}
      <div
        ref={selectorRef}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card cursor-ns-resize select-none hover:border-border transition-colors group"
        title="Scroll to change ambient sound"
      >
        <span className="text-base leading-none">{current.emoji}</span>
        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {current.label}
        </span>
        <div className="flex flex-col items-center gap-0 opacity-0 group-hover:opacity-60 transition-opacity ml-1">
          <span className="text-[9px] leading-none text-muted-foreground">▲</span>
          <span className="text-[9px] leading-none text-muted-foreground">▼</span>
        </div>
      </div>

      {/* Volume slider — only visible when a sound is selected */}
      {selectedSound !== 'none' && (
        <div className="flex items-center gap-2">
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
        </div>
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
