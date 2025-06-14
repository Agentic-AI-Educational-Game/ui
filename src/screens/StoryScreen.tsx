import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface StoryScreenProps {
  onComplete: () => void;
}

const storyPages = [
  {
    page: 1,
    description: "Bassam, une petite tortue, est perdu dans la forêt magique. Il pleure devant un panneau étrange, ne sachant plus où aller. Il a besoin d’aide pour retrouver sa maison.",
    image: "/assets/story-image-1.png",
  },
  {
    page: 2,
    description: "Le soleil se couche. Bassam est triste et regarde le pont avec espoir. Il veut rentrer chez lui. Le joueur doit l’accompagner pour l’aider à retrouver son chemin.",
    image: "/assets/story-image-2.png",
  },
];

export const StoryScreen: React.FC<StoryScreenProps> = ({ onComplete }) => {
  const [currentPage, setCurrentPage] = useState(1);

  const handleNext = () => {
    if (currentPage < storyPages.length) {
      setCurrentPage(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const currentStory = storyPages[currentPage - 1];

  return (
    // --- UPDATED: Added flex and flex-col to make the card layout flexible ---
    <Card className="w-full max-w-lg bg-purple-100/90 backdrop-blur-sm border-4 border-purple-400 shadow-2xl rounded-3xl p-4 sm:p-6 flex flex-col">
      {/* --- UPDATED: This content area will now grow/shrink and scroll if needed --- */}
      <CardContent className="p-0 flex-grow overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex flex-col items-center gap-4"
            style={{ willChange: 'transform, opacity' }}
          >
            <div className="bg-white/80 p-5 rounded-2xl shadow-inner w-full">
              <p className="text-lg text-center font-semibold text-slate-800 leading-relaxed">
                {currentStory.description}
              </p>
            </div>
            
            <div className="w-full aspect-video bg-white/50 rounded-2xl overflow-hidden shadow-lg">
                <img 
                    src={currentStory.image} 
                    alt={`Page d'histoire ${currentStory.page}`} 
                    className="w-full h-full object-cover"
                />
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>

      {/* --- UPDATED: Added flex-shrink-0 to prevent the footer from shrinking --- */}
      <CardFooter className="pt-6 flex flex-col items-center gap-2 flex-shrink-0">
        <div className="flex gap-2">
            {storyPages.map(p => (
                <div key={p.page} className={`h-3 w-3 rounded-full transition-colors ${currentPage === p.page ? 'bg-purple-600' : 'bg-purple-300'}`} />
            ))}
        </div>
        
        <Button
          onClick={handleNext}
          size="lg"
          className="mt-2 w-full h-14 text-xl font-bold rounded-2xl bg-purple-500 hover:bg-purple-600 text-white"
        >
          Suivant <ArrowRight className="ml-2 h-6 w-6" />
        </Button>
      </CardFooter>
    </Card>
  );
};