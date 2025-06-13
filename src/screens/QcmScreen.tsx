import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type QuestionQcm from '../interface/QuestionQcm';
import { motion } from 'framer-motion';
import { HintModal } from '../components/HintModal'; // Import the new modal
import { Lightbulb } from 'lucide-react'; // Import an icon for the button

interface QcmScreenProps {
  question: QuestionQcm;
  onAnswer: (selectedChoiceKey: string) => void;
  onNavigateBack: () => void;
}

const getChoicesFromQuestion = (q: QuestionQcm): [string, string][] => {
  const choices: [string, string][] = [];
  for (const key in q) {
    if (key.toLowerCase().startsWith('option')) {
      const label = key.split(/[\s_]/).pop()?.toUpperCase() ?? '';
      if (label && typeof q[key] === 'string') {
        choices.push([label, q[key]]);
      }
    }
  }
  choices.sort((a, b) => a[0].localeCompare(b[0]));
  return choices;
};

export const QcmScreen: React.FC<QcmScreenProps> = ({
  question,
  onAnswer,
  onNavigateBack,
}) => {
  const [selectedChoiceKey, setSelectedChoiceKey] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isHintVisible, setIsHintVisible] = useState(false); // State for the modal
  const choices = getChoicesFromQuestion(question);

  const handleSelectAndSubmit = (choiceKey: string) => {
    setSelectedChoiceKey(choiceKey);
    setShowFeedback(true);
    setTimeout(() => {
      onAnswer(choiceKey);
      setSelectedChoiceKey(null);
      setShowFeedback(false);
    }, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="w-full max-w-lg bg-blue-100/80 backdrop-blur-sm border-4 border-blue-400 shadow-2xl rounded-3xl p-2 sm:p-4">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
            Pick One!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white/80 p-5 rounded-2xl shadow-inner">
            <p className="text-xl text-center font-semibold text-slate-800 leading-relaxed">{question.question}</p>
          </div>
          
          {/* --- NEW HINT BUTTON --- */}
          {question.source_text && (
            <div className="text-center">
                <Button variant="outline" onClick={() => setIsHintVisible(true)} className="bg-blue-200 border-blue-300 text-blue-800 hover:bg-blue-300">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Show Source Text
                </Button>
            </div>
          )}
          {/* --- END NEW HINT BUTTON --- */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {choices.map(([label, text]) => {
              const isSelected = selectedChoiceKey === label;
              const isCorrect = question.correct_option === label;
              let buttonStyle = 'h-full text-lg font-bold rounded-2xl border-b-8 transition-all duration-100 p-4 whitespace-normal break-words';
              
              if (showFeedback) {
                if(isCorrect) {
                    buttonStyle += ' bg-green-400 border-green-600 text-white transform-none';
                } else if(isSelected) {
                    buttonStyle += ' bg-red-400 border-red-600 text-white transform-none';
                } else {
                    buttonStyle += ' bg-slate-200 border-slate-300 text-slate-400 opacity-70 transform-none';
                }
              } else {
                  buttonStyle += ' bg-white text-blue-700 border-blue-200 hover:bg-blue-50 active:border-b-2 active:mt-2';
              }

              return (
                <Button
                  key={label}
                  variant="outline"
                  size="lg"
                  onClick={() => handleSelectAndSubmit(label)}
                  disabled={showFeedback}
                  className={buttonStyle}
                >
                  {text}
                </Button>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-4">
            <Button onClick={onNavigateBack} variant="link" className="text-blue-600 font-semibold">
                Back to Menu
            </Button>
        </CardFooter>
      </Card>

      {/* --- RENDER THE MODAL --- */}
      <HintModal
        isOpen={isHintVisible}
        onClose={() => setIsHintVisible(false)}
        title="Source Text"
        content={question.source_text}
      />
      {/* --- END RENDER THE MODAL --- */}
    </motion.div>
  );
};