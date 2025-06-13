import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface StoryScreenProps {
  onComplete: () => void;
}

// Define the content for each page of the story
const storyPages = [
  {
    page: 1,
    description: "In a world buzzing with questions, a brave adventurer sets out on a quest. The path is challenging, filled with puzzles of words, numbers, and sounds. The first challenge is just ahead!",
    image: "/assets/story-image-1.png",
  },
  {
    page: 2,
    description: "With courage and a sharp mind, the adventurer prepares to face the final trials. Each correct answer brings them closer to becoming a true Quiz Master. Your journey to greatness begins now!",
    image: "/assets/story-image-2.png",
  },
];

export const StoryScreen: React.FC<StoryScreenProps> = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const handleNext = () => {
    if (currentPage < storyPages.length) {
      setCurrentPage(prev => prev + 1);
    } else {
      // If it's the last page, call the onComplete callback
      onComplete();
    }
  };

  const currentStory = storyPages[currentPage - 1];

  return (
    <Card className="w-full max-w-lg bg-purple-100/90 backdrop-blur-sm border-4 border-purple-400 shadow-2xl rounded-3xl p-4 sm:p-6">
      <CardContent className="p-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage} // This key is crucial for AnimatePresence to detect changes
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col items-center gap-4"
          >
            {/* Story Description */}
            <div className="bg-white/80 p-5 rounded-2xl shadow-inner w-full">
              <p className="text-lg text-center font-semibold text-slate-800 leading-relaxed">
                {currentStory.description}
              </p>
            </div>
            
            {/* Story Image */}
            <div className="w-full aspect-video bg-white/50 rounded-2xl overflow-hidden shadow-lg">
                <img 
                    src={currentStory.image} 
                    alt={`Story page ${currentStory.page}`} 
                    className="w-full h-full object-cover"
                />
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>

      <CardFooter className="pt-6 flex flex-col items-center gap-2">
        {/* Page indicator dots */}
        <div className="flex gap-2">
            {storyPages.map(p => (
                <div key={p.page} className={`h-3 w-3 rounded-full transition-colors ${currentPage === p.page ? 'bg-purple-600' : 'bg-purple-300'}`} />
            ))}
        </div>
        
        {/* Next Button */}
        <Button
          onClick={handleNext}
          size="lg"
          className="mt-2 w-full h-14 text-xl font-bold rounded-2xl bg-purple-500 hover:bg-purple-600 text-white"
        >
          Next <ArrowRight className="ml-2 h-6 w-6" />
        </Button>
      </CardFooter>
    </Card>
  );
};