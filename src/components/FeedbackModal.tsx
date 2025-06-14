import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquareQuote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackList: string[];
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, feedbackList, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
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
            <Card className="shadow-2xl border-2 flex flex-col max-h-[80vh]">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                        Conseils de Prononciation
                    </CardTitle>
                    <p className="text-slate-500">Voici quelques astuces pour vous améliorer !</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} aria-label="Fermer la fenêtre">
                  <X className="h-6 w-6" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3 flex-grow overflow-y-auto">
                {feedbackList.length > 0 ? (
                    feedbackList.map((feedback, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-slate-100 rounded-lg">
                            <MessageSquareQuote className="h-5 w-5 mt-1 text-slate-500 flex-shrink-0" />
                            <p className="text-slate-700">{feedback}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-slate-500 py-8">Aucun conseil spécifique pour cette session. Excellent travail !</p>
                )}
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-4">
                  <Button onClick={onClose} className="h-11 text-base">Fermer</Button>
              </CardFooter>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};