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
          <div className="flex items-center gap-3 cursor-default">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
              <div className="w-3 h-3 rounded-full bg-primary-foreground" />
            </div>
            <h1 className="font-serif text-2xl font-semibold tracking-wide text-foreground">
              DeepFocus
            </h1>
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
