// src/screens/InputScreen.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type InputQuestion from '../interface/InputQuestion';
import { motion } from 'framer-motion';

interface InputScreenProps {
  question: InputQuestion;
  onAnswerSubmit: (answer: string) => void;
  onNavigateBack: () => void;
}

export const InputScreen: React.FC<InputScreenProps> = ({
  question,
  onAnswerSubmit,
  onNavigateBack,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = () => {
    const trimmedAnswer = userAnswer.trim();
    if (!trimmedAnswer) return;

    const correct = trimmedAnswer.toLowerCase() === question.correct_answer.toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);

    setTimeout(() => {
      onAnswerSubmit(trimmedAnswer);
      setShowFeedback(false);
      setUserAnswer('');
      setIsCorrect(null);
    }, 2500);
  };

  const getFeedbackColor = () => {
    if (!showFeedback) return 'border-orange-300 focus-within:border-orange-500';
    return isCorrect ? 'border-green-500' : 'border-red-500';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="w-full max-w-lg bg-orange-100/80 backdrop-blur-sm border-4 border-orange-400 shadow-2xl rounded-3xl p-2 sm:p-4">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-orange-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
            What's the Word?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white/80 p-5 rounded-2xl shadow-inner">
            <p className="text-xl text-center font-semibold text-slate-800 leading-relaxed">{question.question}</p>
          </div>
          <div className="text-center text-orange-700 font-semibold">
            Hint: {question.hint}
          </div>
          <div className="space-y-4 pt-2">
            <Input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Type here!"
              disabled={showFeedback}
              className={`h-16 text-2xl text-center font-bold border-4 rounded-2xl transition-colors duration-300 ${getFeedbackColor()}`}
            />
            <Button
              onClick={handleSubmit}
              size="lg"
              className="w-full h-16 text-2xl font-bold rounded-2xl border-b-8 transition-all duration-100 active:border-b-2 active:mt-2 bg-yellow-400 border-yellow-600 text-yellow-900 hover:bg-yellow-300 disabled:bg-slate-300 disabled:text-slate-500 disabled:border-slate-400"
              disabled={!userAnswer.trim() || showFeedback}
            >
              {showFeedback ? (isCorrect ? 'Awesome! 😄' : 'Not quite...') : 'Check!'}
            </Button>
          </div>
          {showFeedback && !isCorrect && (
             <div className="text-center font-bold text-red-600 bg-red-100 p-3 rounded-xl">
               Correct answer: {question.correct_answer}
             </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center pt-4">
            <Button onClick={onNavigateBack} variant="link" className="text-orange-600 font-semibold">
                Back to Menu
            </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};