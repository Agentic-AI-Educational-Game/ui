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

  const handleSubmit = () => {
    const trimmedAnswer = userAnswer.trim();
    if (!trimmedAnswer) return;

    onAnswerSubmit(trimmedAnswer);
    setUserAnswer(''); // Reset for next question
  };

  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="w-full max-w-lg bg-orange-100/80 backdrop-blur-sm border-4 border-orange-400 shadow-2xl rounded-3xl p-2 sm:p-4">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-orange-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
            Type Your Answer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white/80 p-5 rounded-2xl shadow-inner">
            {/* ONLY THE QUESTION IS SHOWN HERE */}
            <p className="text-xl text-center font-semibold text-slate-800 leading-relaxed">{question.question}</p>
          </div>
          <div className="space-y-4 pt-2">
            <Input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="Your answer..."
              className="h-16 text-2xl text-center font-bold border-4 rounded-2xl border-orange-300 focus:border-orange-500 transition-colors"
            />
            <Button
              onClick={handleSubmit}
              size="lg"
              className="w-full h-16 text-2xl font-bold rounded-2xl border-b-8 transition-all duration-100 active:border-b-2 active:mt-2 bg-yellow-400 border-yellow-600 text-yellow-900 hover:bg-yellow-300 disabled:bg-slate-300"
              disabled={!userAnswer.trim()}
            >
              Next!
            </Button>
          </div>
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