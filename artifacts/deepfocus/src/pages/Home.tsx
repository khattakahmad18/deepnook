import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useTimer } from '@/hooks/use-timer';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { MotivationalQuote } from '@/components/MotivationalQuote';
import { TaskPlanner } from '@/components/TaskPlanner';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const timerState = useTimer();

  // The isFlashing state triggers an animation class on a full-screen overlay
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden selection:bg-primary/30">
      {/* Flashing Overlay */}
      <div 
        className={`pointer-events-none fixed inset-0 z-50 transition-colors duration-1000 ${
          timerState.isFlashing ? 'animate-flash' : ''
        }`} 
      />

      <div className="max-w-3xl mx-auto px-6 py-8 sm:py-12">
        {/* Header */}
        <header className="flex items-center justify-between mb-12 sm:mb-20">
          <div className="flex items-center gap-3 cursor-default select-none">
            {/* Lumino candle icon — SVG */}
            <svg width="26" height="38" viewBox="0 0 26 38" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* Outer glow */}
              <ellipse cx="13" cy="10" rx="10" ry="10" fill="#C9B99A" fillOpacity="0.18"/>
              {/* Flame outer */}
              <path d="M13 1C13 1 19.5 8.5 19.5 13C19.5 16.6 16.6 19 13 19C9.4 19 6.5 16.6 6.5 13C6.5 8.5 13 1 13 1Z" fill="#C9B99A"/>
              {/* Flame inner highlight */}
              <path d="M13 7C13 7 16 10.5 16 13C16 14.7 14.7 15.5 13 15.5C11.3 15.5 10 14.7 10 13C10 10.5 13 7 13 7Z" fill="white" fillOpacity="0.35"/>
              {/* Wick */}
              <line x1="13" y1="19" x2="13" y2="21.5" stroke="#C9B99A" strokeWidth="1.4" strokeLinecap="round"/>
              {/* Candle body */}
              <rect x="7" y="21" width="12" height="15" rx="2" fill="#C9B99A" fillOpacity="0.72"/>
              {/* Top rim / wax pool */}
              <rect x="7" y="21" width="12" height="3.5" rx="1.5" fill="#C9B99A"/>
              {/* Subtle wax drip left */}
              <path d="M7 26 Q5.5 28 7 30" stroke="#C9B99A" strokeWidth="1" strokeOpacity="0.45" fill="none" strokeLinecap="round"/>
            </svg>
            {/* Wordmark */}
            <div className="leading-none">
              <div className="font-serif text-xl font-semibold tracking-[0.2em] text-foreground uppercase">
                Lumino
              </div>
              <div className="text-[9px] tracking-[0.18em] text-muted-foreground/60 mt-0.5 uppercase">
                focus · learn · grow
              </div>
            </div>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-card border border-border/50 text-foreground hover:bg-accent transition-colors shadow-sm"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        <main className="space-y-16">
          <section>
            <PomodoroTimer {...timerState} />
          </section>

          <section className="relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
            </div>
            <MotivationalQuote sessionCount={timerState.sessionCount} />
          </section>

          <section>
            <TaskPlanner />
          </section>
        </main>
        
        <footer className="mt-24 pb-8 text-center text-sm font-medium text-muted-foreground/60">
          <p>Stay focused. Stay disciplined.</p>
        </footer>
      </div>
    </div>
  );
}
