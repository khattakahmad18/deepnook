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
            {/* Deepnook icon — arched nook with moon, stars and leaves */}
            <svg width="38" height="46" viewBox="0 0 40 50" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              {/* Left leaf */}
              <path d="M8,38 C2,30 1,22 7,17 C8,25 8,33 8,38 Z" fill="#5C8A5C" opacity="0.90"/>
              <path d="M8,38 C5,31 4,24 8,20 Z" fill="#4A7A4A" opacity="0.40"/>
              {/* Right leaf */}
              <path d="M32,38 C38,30 39,22 33,17 C32,25 32,33 32,38 Z" fill="#5C8A5C" opacity="0.90"/>
              <path d="M32,38 C35,31 36,24 32,20 Z" fill="#4A7A4A" opacity="0.40"/>
              {/* Arch nook body */}
              <path d="M8,43 L8,20 A12,12 0 0,1 32,20 L32,43 Z" fill="#2D1B0E"/>
              {/* Crescent moon — gold circle with dark cutout */}
              <circle cx="19" cy="23" r="7" fill="#C9B99A"/>
              <circle cx="23.5" cy="20.5" r="6" fill="#2D1B0E"/>
              {/* Stars */}
              <circle cx="28" cy="26" r="0.9" fill="#C9B99A" fillOpacity="0.80"/>
              <circle cx="14" cy="15" r="0.8" fill="#C9B99A" fillOpacity="0.75"/>
              <circle cx="27" cy="15" r="0.7" fill="#C9B99A" fillOpacity="0.65"/>
              <circle cx="11" cy="32" r="0.65" fill="#C9B99A" fillOpacity="0.55"/>
              <circle cx="30" cy="35" r="0.55" fill="#C9B99A" fillOpacity="0.50"/>
              {/* Shelf / base */}
              <rect x="5" y="43" width="30" height="2.5" rx="1.2" fill="#C9B99A" fillOpacity="0.65"/>
            </svg>
            {/* Wordmark */}
            <div className="leading-tight">
              <div className="font-serif text-[1.25rem] font-semibold tracking-[0.15em] text-foreground uppercase">
                Deepnook
              </div>
              <div className="font-sans text-[9px] font-medium tracking-[0.2em] text-muted-foreground/60 mt-0.5 uppercase">
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
          <p>Find your nook. Do deep work.</p>
        </footer>
      </div>
    </div>
  );
}
