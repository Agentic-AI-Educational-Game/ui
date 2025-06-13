import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import type InputQuestion from '../interface/InputQuestion';
import { motion } from 'framer-motion';
import { HintModal } from '../components/HintModal'; // Import the new modal
import { BookText } from 'lucide-react'; // Import a different icon for this button

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
  const [isHintVisible, setIsHintVisible] = useState(false); // State for the modal

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
            <p className="text-xl text-center font-semibold text-slate-800 leading-relaxed">{question.question}</p>
          </div>
          
          {/* --- NEW HINT BUTTON --- */}
          {question.input_text && (
            <div className="text-center">
                <Button variant="outline" onClick={() => setIsHintVisible(true)} className="bg-orange-200 border-orange-300 text-orange-800 hover:bg-orange-300">
                    <BookText className="mr-2 h-4 w-4" />
                    Show Context
                </Button>
            </div>
          )}
          {/* --- END NEW HINT BUTTON --- */}

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
      
      {/* --- RENDER THE MODAL --- */}
      <HintModal
        isOpen={isHintVisible}
        onClose={() => setIsHintVisible(false)}
        title="Context Text"
        content={question.input_text}
      />
      {/* --- END RENDER THE MODAL --- */}

    </motion.div>
  );
};