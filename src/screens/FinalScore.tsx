import React from 'react';
import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import type { FinalResults } from '../context/QuizContext';
import { PartyPopper } from 'lucide-react';

interface FinalScoreProps {
  results: FinalResults | null;
  playAgain: () => void;
  goToMenu: () => void;
  onSeeEnding: () => void;
}

const ScoreItem = React.memo(function ScoreItem({ label, score }: { label: string; score: number }) {
    return (
        <div className="flex justify-between items-center bg-white/70 p-3 rounded-lg text-lg">
            <span className="font-semibold text-slate-600">{label}</span>
            <span className="font-bold text-blue-700">{score} / 100</span>
        </div>
    );
});
ScoreItem.displayName = "ScoreItem";

export const FinalScore: FC<FinalScoreProps> = ({ results, playAgain, goToMenu, onSeeEnding }) => {
  if (!results) {
    return (
      <Card className="w-full max-w-md text-center p-8">
        <CardTitle>Chargement des résultats...</CardTitle>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }} className="w-full max-w-md">
      {/* --- UPDATED: Added flex and flex-col --- */}
      <Card className="w-full max-w-md text-center bg-yellow-100/90 backdrop-blur-sm border-4 border-yellow-400 shadow-2xl rounded-3xl p-4 flex flex-col">
        <CardHeader className="flex-shrink-0">
          {/* Responsive emoji size */}
          <motion.div className="text-6xl sm:text-7xl mb-2" animate={{ rotate: [-10, 10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 1 }}>
            🌟
          </motion.div>
          <CardTitle className="text-3xl sm:text-4xl font-bold text-amber-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
            Excellent Travail !
          </CardTitle>
        </CardHeader>
        {/* --- UPDATED: This content area will now scroll if it overflows --- */}
        <CardContent className="space-y-2 sm:space-y-4 flex-grow overflow-y-auto py-2">
          <p className="text-lg sm:text-xl text-amber-700 font-semibold">Votre Score Final Est</p>
          {/* Responsive score font size */}
          <p className="text-7xl sm:text-8xl font-bold text-green-600 drop-shadow-lg">
            {results.finalAverageScore}
          </p>
          <div className="space-y-2 text-left pt-2 sm:pt-4">
            <ScoreItem label="Choix Multiple (QCM)" score={results.qcmScoreTotal} />
            <ScoreItem label="Réponses Textuelles" score={results.textScoreTotal} />
            <ScoreItem label="Précision de Lecture" score={results.audioAccuracyTotal} />
            <ScoreItem label="Prononciation" score={results.audioPronunciationTotal} />
          </div>
          <div className="flex flex-col justify-center gap-3 pt-4 sm:pt-6">
            <Button
              onClick={onSeeEnding}
              className="h-16 text-xl font-bold rounded-2xl bg-purple-500 border-b-8 border-purple-700 text-white hover:bg-purple-400"
            >
              Voir la fin de l'histoire <PartyPopper className="ml-2 h-6 w-6" />
            </Button>
            
            <div className="flex gap-3">
              <Button onClick={goToMenu} className="flex-1 h-12 text-lg font-bold rounded-2xl bg-slate-300 border-b-8 border-slate-400 text-slate-700 hover:bg-slate-200">
                Menu
              </Button>
              <Button onClick={playAgain} className="flex-1 h-12 text-lg font-bold rounded-2xl bg-orange-400 border-b-8 border-orange-600 text-white hover:bg-orange-300">
                Rejouer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};