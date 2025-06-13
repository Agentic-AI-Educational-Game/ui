import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import type { FinalResults } from '../context/QuizContext';

interface FinalScoreProps {
  results: FinalResults | null;
  playAgain: () => void;
  goToMenu: () => void;
}

const ScoreItem: FC<{ label: string; score: number }> = ({ label, score }) => (
  <div className="flex justify-between items-center bg-white/70 p-3 rounded-lg text-lg">
    <span className="font-semibold text-slate-600">{label}</span>
    <span className="font-bold text-blue-700">{score} / 100</span>
  </div>
);

export const FinalScore: FC<FinalScoreProps> = ({ results, playAgain, goToMenu }) => {
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
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <Button onClick={goToMenu} className="h-14 text-lg font-bold rounded-2xl bg-slate-300 border-b-8 border-slate-400 text-slate-700 hover:bg-slate-200">
              Menu Principal
            </Button>
            <Button onClick={playAgain} className="h-14 text-lg font-bold rounded-2xl bg-orange-400 border-b-8 border-orange-600 text-white hover:bg-orange-300">
              Rejouer !
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};