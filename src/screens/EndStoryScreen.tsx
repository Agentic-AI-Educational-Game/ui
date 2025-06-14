import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';

interface EndStoryScreenProps {
  onComplete: () => void;
}

// Define the content for the final page
const endStory = {
  description: "Grâce à ton aide, Bassam la tortue a surmonté tous les défis et a enfin retrouvé le chemin de sa maison ! Il est heureux et te remercie pour cette incroyable aventure. Tu es un vrai héros !",
  image: "/assets/story-end.png", // Make sure you have this image
};

export const EndStoryScreen: React.FC<EndStoryScreenProps> = ({ onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 150, damping: 25 }}
    >
      <Card className="w-full max-w-lg bg-green-100/90 backdrop-blur-sm border-4 border-green-400 shadow-2xl rounded-3xl p-4 sm:p-6">
        <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-green-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
                Félicitations !
            </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
            {/* Story Description */}
            <div className="bg-white/80 p-5 rounded-2xl shadow-inner w-full">
              <p className="text-lg text-center font-semibold text-slate-800 leading-relaxed">
                {endStory.description}
              </p>
            </div>
            
            {/* Story Image */}
            <div className="w-full aspect-video bg-white/50 rounded-2xl overflow-hidden shadow-lg">
                <img 
                    src={endStory.image} 
                    alt="La fin de l'histoire de Bassam" 
                    className="w-full h-full object-cover"
                />
            </div>
        </CardContent>

        <CardFooter className="pt-6 flex justify-center">
            <Button
              onClick={onComplete}
              size="lg"
              className="w-full h-14 text-xl font-bold rounded-2xl bg-green-500 hover:bg-green-600 text-white"
            >
              Retour au Menu <Home className="ml-2 h-6 w-6" />
            </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};