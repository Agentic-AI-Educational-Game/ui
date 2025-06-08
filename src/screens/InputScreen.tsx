import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; // Import the Input component
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For feedback
import type InputQuestion from '../interface/InputQuestion';

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
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = () => {
    // Trim answer to avoid issues with whitespace
    const trimmedAnswer = userAnswer.trim();
    if (!trimmedAnswer) return; // Don't submit empty answers

    const correct = trimmedAnswer.toLowerCase() === question.correct_answer.toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);

    // Give user time to see the feedback before advancing
    setTimeout(() => {
      onAnswerSubmit(trimmedAnswer);
      // Reset state for the next question automatically
      setShowFeedback(false);
      setUserAnswer('');
      setIsCorrect(null);
    }, 2000); // 2-second delay
  };

  const getBorderColor = () => {
    if (!showFeedback) return 'border-slate-300 dark:border-slate-600 focus-within:border-emerald-500';
    return isCorrect ? 'border-green-500' : 'border-red-500';
  };

  return (
    <Card className="w-full max-w-lg bg-emerald-50/80 dark:bg-slate-900/80 backdrop-blur-md border-emerald-300 dark:border-slate-700 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400 text-center">
          Type the Answer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question Box */}
        <div className="bg-lime-100 dark:bg-emerald-800/50 p-5 rounded-lg shadow text-lime-800 dark:text-emerald-100">
          <p className="text-lg md:text-xl leading-relaxed">{question.question}</p>
        </div>
        
        {/* Hint Box */}
        <div className="text-sm text-slate-500 dark:text-slate-400 italic px-2">
            Hint: {question.hint}
        </div>

        {/* Input and Submit Area */}
        <div className="space-y-4">
          <Input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Your answer..."
            disabled={showFeedback}
            className={`h-12 text-lg border-2 transition-colors duration-300 ${getBorderColor()}`}
          />
          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={!userAnswer.trim() || showFeedback}
          >
            {showFeedback ? (isCorrect ? 'Correct!' : 'Incorrect') : 'Submit Answer'}
          </Button>
        </div>

        {/* Feedback Alert */}
        {showFeedback && !isCorrect && (
           <Alert variant="destructive">
             <AlertTitle>Not quite!</AlertTitle>
             <AlertDescription>
               The correct answer was: <strong>{question.correct_answer}</strong>
             </AlertDescription>
           </Alert>
        )}
         {showFeedback && isCorrect && (
           <Alert className="bg-green-100 border-green-400 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300">
             <AlertTitle>Well done!</AlertTitle>
             <AlertDescription>
               You got it right! Moving to the next question...
             </AlertDescription>
           </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-center pt-6">
        <Button
          onClick={onNavigateBack}
          variant="ghost"
          className="text-emerald-700 dark:text-slate-400 hover:bg-emerald-500/10"
        >
          Back to Main Menu
        </Button>
      </CardFooter>
    </Card>
  );
};