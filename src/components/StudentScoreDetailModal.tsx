import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Brain, Type, Mic, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { User } from '../context/AuthContext';

interface StudentScoreDetailModalProps {
  student: User | null;
  onClose: () => void;
}

const ScoreDetailItem: React.FC<{ icon: React.ElementType, label: string, score: number }> = ({ icon: Icon, label, score }) => (
    <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
        <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-slate-500" />
            <span className="font-medium text-slate-700">{label}</span>
        </div>
        <span className="font-bold text-lg text-blue-600">{score} / 100</span>
    </div>
);


export const StudentScoreDetailModal: React.FC<StudentScoreDetailModalProps> = ({ student, onClose }) => {
  return (
    <AnimatePresence>
      {student && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg"
          >
            <Card className="shadow-2xl border-2">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                        Détails du score de {student.username}
                    </CardTitle>
                    <p className="text-green-600 font-semibold flex items-center gap-2 mt-1">
                        <CheckCircle className="h-5 w-5" />
                        Quiz Terminé
                    </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer la fenêtre">
                  <X className="h-6 w-6" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {student.score ? (
                    <>
                        <ScoreDetailItem icon={Brain} label="Choix Multiple (QCM)" score={student.score.qcmScoreTotal} />
                        <ScoreDetailItem icon={Type} label="Réponses Textuelles" score={student.score.textScoreTotal} />
                        <ScoreDetailItem icon={Mic} label="Prononciation" score={student.score.audioPronunciationTotal} />
                        <ScoreDetailItem icon={Target} label="Précision de Lecture" score={student.score.audioAccuracyTotal} />
                    </>
                ) : (
                    <p className="text-center text-slate-500 py-8">Aucun détail de score disponible.</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                  <Button onClick={onClose} className="h-11 text-base">Fermer</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};