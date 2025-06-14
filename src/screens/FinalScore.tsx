import React, { useEffect, useState } from 'react';
import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useQuiz, type FinalResults } from '../context/QuizContext';
import { Award, Loader2, MessageCircleQuestion, PartyPopper } from 'lucide-react';
import { FeedbackModal } from '@/components/FeedbackModal';
import type { User } from '@/context/AuthContext';
import { fetchAllStudents } from '@/services/api';

interface FinalScoreProps {
  results: FinalResults | null;
  playAgain: () => void;
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

const TopStudentDisplay: FC<{isLoading: boolean; topStudent: User | null}> = ({isLoading, topStudent}) => {
    if (isLoading) {
        return <div className="flex items-center justify-center gap-2 text-slate-500"><Loader2 className="h-4 w-4 animate-spin"/>Chargement...</div>
    }
    if (!topStudent) {
        return null; // Don't show if there's no top student
    }
    return (
        <div className="flex items-center justify-center gap-2 rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-sm text-amber-800 font-semibold">
            <Award className="h-5 w-5 text-amber-500" />
            <span>Meilleur Score: <strong>{topStudent.username}</strong> ({topStudent.score?.finalAverageScore} pts)</span>
        </div>
    );
};

export const FinalScore: FC<FinalScoreProps> = ({ results, playAgain, onSeeEnding }) => {
  const { pronunciationFeedback } = useQuiz();
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [topStudent, setTopStudent] = useState<User | null>(null);
  const [isTopStudentLoading, setIsTopStudentLoading] = useState(true);

  useEffect(() => {
    const getTopStudent = async () => {
        try {
            const allStudents = await fetchAllStudents();
            const completedStudents = allStudents.filter(s => s.status === 'Completed' && s.score);
            
            if (completedStudents.length > 0) {
                const top = completedStudents.reduce((max, student) => 
                    (student.score!.finalAverageScore > max.score!.finalAverageScore ? student : max), 
                    completedStudents[0]
                );
                setTopStudent(top);
            }
        } catch (error) {
            console.error("Failed to fetch top student:", error);
        } finally {
            setIsTopStudentLoading(false);
        }
    };

    getTopStudent();
  }, []);
    if (!results) {
    return (
      <Card className="w-full max-w-md text-center p-8">
        <CardTitle>Chargement des résultats...</CardTitle>
      </Card>
    );
  }


  return (
    <>
      <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring' }} className="w-full max-w-md">
        <Card className="w-full max-w-md text-center bg-yellow-100/90 backdrop-blur-sm border-4 border-yellow-400 shadow-2xl rounded-3xl p-4 flex flex-col">
          <CardHeader className="flex-shrink-0">
            <motion.div className="text-6xl sm:text-7xl mb-2" /* ... */>🌟</motion.div>
            <CardTitle className="text-3xl sm:text-4xl font-bold text-amber-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
              Excellent Travail !
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 flex-grow overflow-y-auto py-2">
            <TopStudentDisplay isLoading={isTopStudentLoading} topStudent={topStudent} />
            <p className="text-lg sm:text-xl text-amber-700 font-semibold">Votre Score Final Est</p>
            <p className="text-7xl sm:text-8xl font-bold text-green-600 drop-shadow-lg">{results.finalAverageScore}</p>
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
                <Button
                  onClick={() => setIsFeedbackModalOpen(true)}
                  variant="outline"
                  className="flex-1 h-12 text-base font-bold rounded-2xl bg-white border-b-4 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <MessageCircleQuestion className="mr-2 h-5 w-5" />
                  Voir mes retours
                </Button>
                <Button onClick={playAgain} className="flex-1 h-12 text-lg font-bold rounded-2xl bg-orange-400 border-b-8 border-orange-600 text-white hover:bg-orange-300">
                  Rejouer !
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <FeedbackModal 
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        feedbackList={pronunciationFeedback}
      />
    </>
  );
};