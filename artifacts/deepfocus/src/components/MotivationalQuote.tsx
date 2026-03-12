import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUOTES = [
  "An investment in knowledge pays the best interest. — Benjamin Franklin",
  "The more that you read, the more things you will know. — Dr. Seuss",
  "Focus is not about saying yes. It's about saying no to everything else.",
  "Deep work is the superpower of the 21st century. — Cal Newport",
  "Discipline is choosing between what you want now and what you want most.",
  "The secret of getting ahead is getting started. — Mark Twain",
  "Concentrate all your thoughts upon the work at hand. — Alexander Graham Bell",
  "Either you run the day or the day runs you. — Jim Rohn",
  "You don't have to be great to start, but you have to start to be great.",
  "The difference between ordinary and extraordinary is that little extra.",
  "Study hard what interests you the most in the most undisciplined way possible. — Richard Feynman",
  "Lost time is never found again. — Benjamin Franklin",
  "Knowledge is power. — Francis Bacon"
];

export function MotivationalQuote({ sessionCount }: { sessionCount: number }) {
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    // Change quote deterministically based on session count or randomly, 
    // let's do deterministic based on session so it feels purposeful
    setQuoteIndex((sessionCount - 1) % QUOTES.length);
  }, [sessionCount]);

  const [quote, author] = QUOTES[quoteIndex].split(' — ');

  return (
    <div className="py-8 min-h-[120px] flex items-center justify-center text-center px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={quoteIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-md"
        >
          <p className="font-serif text-xl sm:text-2xl text-foreground/80 leading-relaxed italic">
            "{quote}"
          </p>
          {author && (
            <p className="mt-3 text-sm font-medium text-muted-foreground tracking-wide">
              — {author}
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
