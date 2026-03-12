import { useRef, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { AMBIENT_OPTIONS, type AmbientSound } from '@/hooks/use-ambient-sound';

interface AmbientSoundSelectorProps {
  selectedSound: AmbientSound;
  isMuted: boolean;
  handleSoundWheel: (e: WheelEvent) => void;
  toggleMute: () => void;
}

export function AmbientSoundSelector({
  selectedSound,
  isMuted,
  handleSoundWheel,
  toggleMute,
}: AmbientSoundSelectorProps) {
  const selectorRef = useRef<HTMLDivElement>(null);
  const current     = AMBIENT_OPTIONS.find(o => o.id === selectedSound)!;

  useEffect(() => {
    const el = selectorRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleSoundWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleSoundWheel);
  }, [handleSoundWheel]);

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
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

      <button
        onClick={toggleMute}
        disabled={selectedSound === 'none'}
        className="p-2 rounded-full border border-border/50 bg-card text-muted-foreground hover:text-foreground hover:border-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label={isMuted ? 'Unmute ambient sound' : 'Mute ambient sound'}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
  );
}
