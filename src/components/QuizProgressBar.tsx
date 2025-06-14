import React from 'react';
import { motion } from 'framer-motion';

interface QuizProgressBarProps {
  progress: number; // A percentage from 0 to 100
  cursorImage: string;
  finishImage: string;
}

export const QuizProgressBar: React.FC<QuizProgressBarProps> = ({ progress, cursorImage, finishImage }) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full max-w-2xl mx-auto px-4 sm:px-0 mb-4">
      <div className="relative h-8 w-full">
        {/* The background track of the progress bar */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-3 bg-white/50 rounded-full shadow-inner" />

        {/* --- OPTIMIZATION: Animate `scaleX` instead of `width` --- */}
        {/* We use a container and animate a child div inside it. */}
        <div className="absolute top-1/2 -translate-y-1/2 h-3 w-full overflow-hidden rounded-full">
            <motion.div
              className="h-full bg-gradient-to-r from-green-300 to-green-500 origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: clampedProgress / 100 }} // scaleX works from 0 to 1
              transition={{ type: 'spring', stiffness: 50, damping: 20 }}
              style={{ willChange: 'transform' }} // Hint to the browser about the animation
            />
        </div>
        
        {/* The running character cursor, also animated */}
        <motion.div
          className="absolute top-1/2 z-10"
          style={{
            transform: 'translateY(-50%) translateX(-50%)', 
            willChange: 'transform', // This is a good hint for performance
          }}
          initial={{ left: '0%' }}
          animate={{ left: `${clampedProgress}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        >
          <img src={cursorImage} alt="Progress cursor" className="h-12 w-auto drop-shadow-lg" />
        </motion.div>

        {/* The finish line at the end */}
        <div className="absolute top-1/2 right-0 z-0" style={{ transform: 'translateY(-50%)' }}>
          <img src={finishImage} alt="Finish line" className="h-10 w-auto" />
        </div>
      </div>
    </div>
  );
};