// src/screens/QcmScreen.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type QuestionQcm from '../interface/QuestionQcm'; // This now imports the new interface

interface QcmScreenProps {
  goToMenu: () => void;
  goToNext?: () => void;
  onAnswer: (selectedChoiceKey: string) => void;
  questions: QuestionQcm; // Prop now expects the new question format
}

// Helper function to extract choices from the new question format.
// It finds keys starting with "option", handles different separators (' ' or '_'), and sorts them.
const getChoicesFromQuestion = (q: QuestionQcm): [string, string][] => {
    const choices: [string, string][] = [];
    for (const key in q) {
        if (key.toLowerCase().startsWith('option')) {
            // Extracts 'A' from 'option A' or 'option_B'
            const label = key.split(/[\s_]/).pop()?.toUpperCase() ?? '';
            if (label && typeof q[key] === 'string') {
                choices.push([label, q[key]]);
            }
        }
    }
    // Sort choices by label (A, B, C, D) to ensure a consistent order
    choices.sort((a, b) => a[0].localeCompare(b[0]));
    return choices;
};


export const QcmScreen: React.FC<QcmScreenProps> = ({
  questions,
  goToMenu,
  onAnswer,
  goToNext
}) => {
  const [selectedChoiceKey, setSelectedChoiceKey] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Call the helper function to get choices in a usable format: [["A", "Text A"], ["B", "Text B"], ...]
  const choices = getChoicesFromQuestion(questions);

  const handleSelectAndSubmit = (choiceKey: string) => {
    setSelectedChoiceKey(choiceKey);
    setShowFeedback(true);

    setTimeout(() => {
      onAnswer(choiceKey);
      setSelectedChoiceKey(null);
      setShowFeedback(false);
    }, 1500);
  };

  return (
    <Card className="w-full max-w-lg bg-emerald-50/80 dark:bg-slate-900/80 backdrop-blur-md border-emerald-300 dark:border-slate-700 shadow-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400 text-center">
          Answer the Question
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-lime-100 dark:bg-emerald-800/50 p-5 rounded-lg shadow text-lime-800 dark:text-emerald-100">
          <p className="text-lg md:text-xl leading-relaxed">
            {questions.question}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* CHANGE: We now map over the `choices` array we created instead of `questions.choices` */}
          {choices.map(([label, text]) => {
            const isSelected = selectedChoiceKey === label;
            // CHANGE: Use `correct_option` to check for the correct answer
            const isCorrect = questions.correct_option === label;
            let buttonClasses = `
              justify-start text-left h-auto py-3 px-4 break-words whitespace-normal
              border-2 transition-all duration-150 ease-in-out
              shadow-sm hover:shadow-md
              text-green-700 dark:text-emerald-200
              focus:ring-2 focus:ring-green-500 dark:focus:ring-emerald-400
            `;

            if (showFeedback && isSelected) {
              buttonClasses += isCorrect
                ? ' bg-green-200 dark:bg-green-700 border-green-500 dark:border-green-500'
                : ' bg-red-200 dark:bg-red-700 border-red-500 dark:border-red-500';
            } else if (showFeedback && isCorrect) {
              buttonClasses += ' bg-green-100 dark:bg-green-800 border-green-400 dark:border-green-600';
            }
            else if (isSelected) {
              buttonClasses += ' bg-sky-100 dark:bg-sky-700 border-sky-500 dark:border-sky-500';
            } else {
              buttonClasses += ' border-green-400 dark:border-emerald-600 bg-white hover:bg-green-50 dark:bg-slate-800 dark:hover:bg-slate-700/70';
            }

            return (
              <Button
                key={label}
                variant="outline"
                size="lg"
                onClick={() => handleSelectAndSubmit(label)}
                disabled={showFeedback}
                className={buttonClasses}
              >
                <span className="font-bold mr-3 text-green-600 dark:text-emerald-400">
                  {label}:
                </span>
                {text}
              </Button>
            );
          })}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-around pt-6 gap-4">
        {showFeedback && (
            <Button
                onClick={() => {
                                alert("App.tsx will advance to the next question automatically after selection.");
                              }}
                size="lg"
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white"
                disabled={!selectedChoiceKey}
            >
                Next Question (Handled by App)
            </Button>
        )}
        <Button
          onClick={goToMenu}
          variant="ghost"
          size="lg"
          className="w-full sm:w-auto text-emerald-700 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-slate-300 hover:bg-emerald-500/10 dark:hover:bg-slate-700/50"
        >
          Main Menu
        </Button>
          {goToNext && (
            <Button variant="ghost" onClick={goToNext}>Go to Audio</Button>
          )}      
        </CardFooter>
    </Card>
  );
};