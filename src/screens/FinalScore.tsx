import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import type { FinalResults } from '../context/QuizContext';
import { PartyPopper } from 'lucide-react'; // Import a fun icon

interface FinalScoreProps {
  results: FinalResults | null;
  playAgain: () => void;
  goToMenu: () => void;
  onSeeEnding: () => void; // --- NEW: Add prop for the new function ---
}

const ScoreItem: FC<{ label: string; score: number }> = ({ label, score }) => (
  <div className="flex justify-between items-center bg-white/70 p-3 rounded-lg text-lg">
    <span className="font-semibold text-slate-600">{label}</span>
    <span className="font-bold text-blue-700">{score} / 100</span>
  </div>
);

// --- NEW: Destructure onSeeEnding from props ---
export const FinalScore: FC<FinalScoreProps> = ({ results, playAgain, goToMenu, onSeeEnding }) => {
  if (!results) {
    return (
      <Card className="w-full max-w-md text-center p-8">
        <CardTitle>Chargement des résultats...</CardTitle>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }}>
      <Card className="w-full max-w-md text-center bg-yellow-100/90 backdrop-blur-sm border-4 border-yellow-400 shadow-2xl rounded-3xl p-4">
        <CardHeader>
          <motion.div className="text-7xl mb-4" animate={{ rotate: [-10, 10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 1 }}>
            🌟
          </motion.div>
          <CardTitle className="text-4xl font-bold text-amber-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
            Excellent Travail !
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xl text-amber-700 font-semibold">Votre Score Final Est</p>
          <p className="text-8xl font-bold text-green-600 drop-shadow-lg">
            {results.finalAverageScore}
          </p>
          <div className="space-y-2 text-left pt-4">
            <ScoreItem label="Choix Multiple (QCM)" score={results.qcmScoreTotal} />
            <ScoreItem label="Réponses Textuelles" score={results.textScoreTotal} />
            <ScoreItem label="Précision de Lecture" score={results.audioAccuracyTotal} />
            <ScoreItem label="Prononciation" score={results.audioPronunciationTotal} />
          </div>
          {/* --- UPDATED: Button layout is now a single column for better hierarchy --- */}
          <div className="flex flex-col justify-center gap-3 pt-6">
            {/* The new, primary button to see the story's end */}
            <Button
              onClick={onSeeEnding}
              className="h-16 text-xl font-bold rounded-2xl bg-purple-500 border-b-8 border-purple-700 text-white hover:bg-purple-400"
            >
              Voir la fin de l'histoire <PartyPopper className="ml-2 h-6 w-6" />
            </Button>
            
            {/* Secondary options */}
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