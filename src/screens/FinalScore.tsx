// src/screens/FinalScore.tsx
import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface FinalScoreProps {
  finalScore: number;
  totalQuestions: number;
  playAgain: () => void;
  goToMenu: () => void;
}

export const FinalScore: FC<FinalScoreProps> = ({
  finalScore,
  totalQuestions,
  playAgain,
  goToMenu,
}) => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }}>
      <Card className="w-full max-w-md text-center bg-yellow-100/90 backdrop-blur-sm border-4 border-yellow-400 shadow-2xl rounded-3xl p-4">
        <CardHeader>
          <motion.div
            animate={{ rotate: [-10, 10, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-7xl mb-4"
          >
            🏆
          </motion.div>
          <CardTitle className="text-4xl font-bold text-amber-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
            You did it!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xl text-amber-700 font-semibold">Your final score is:</p>
          <p className="text-8xl font-bold text-green-600 drop-shadow-lg">
            {finalScore}
            <span className="text-4xl text-slate-500"> / {totalQuestions}</span>
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <Button
              onClick={goToMenu}
              className="h-14 text-lg font-bold rounded-2xl border-b-8 bg-slate-300 border-slate-400 text-slate-700 hover:bg-slate-200 active:border-b-2 active:mt-2"
            >
              Go Home
            </Button>
            <Button
              onClick={playAgain}
              className="h-14 text-lg font-bold rounded-2xl border-b-8 bg-orange-400 border-orange-600 text-white hover:bg-orange-300 active:border-b-2 active:mt-2"
            >
              Play Again!
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};