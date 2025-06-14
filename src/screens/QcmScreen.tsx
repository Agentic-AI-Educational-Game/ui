import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type QuestionQcm from '../interface/QuestionQcm';
import { motion } from 'framer-motion';
import { HintModal } from '../components/HintModal';
import { Lightbulb } from 'lucide-react';

// --- HELPER FUNCTION (Moved outside the component for cleaner code) ---
// It's a pure function and doesn't need to be redefined on every render.
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


// --- OPTIMIZATION: Memoized Button Component ---
// This prevents the button from re-rendering if its props haven't changed.
const ChoiceButton = React.memo(function ChoiceButton({
  label,
  text,
  onClick,
  isSelected,
  isCorrect,
  showFeedback,
}: {
  label: string;
  text: string;
  onClick: (label: string) => void;
  isSelected: boolean;
  isCorrect: boolean;
  showFeedback: boolean;
}) {
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
          onClick={() => onClick(label)}
          disabled={showFeedback}
          className={buttonStyle}
        >
          {text}
        </Button>
    );
});


interface QcmScreenProps {
  question: QuestionQcm;
  onAnswer: (selectedChoiceKey: string) => void;
  onNavigateBack: () => void;
}

export const QcmScreen: React.FC<QcmScreenProps> = ({
  question,
  onAnswer,
  onNavigateBack,
}) => {
  const [selectedChoiceKey, setSelectedChoiceKey] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isHintVisible, setIsHintVisible] = useState(false);

  // --- OPTIMIZATION: Memoize the choices array ---
  // This ensures the `getChoicesFromQuestion` function only runs when the `question` prop changes.
  const choices = useMemo(() => getChoicesFromQuestion(question), [question]);

  // --- OPTIMIZATION: Memoize the callback function ---
  // This ensures the function isn't recreated on every render, allowing child components (ChoiceButton) to be memoized effectively.
  const handleSelectAndSubmit = useCallback((choiceKey: string) => {
    setSelectedChoiceKey(choiceKey);
    setShowFeedback(true);
    setTimeout(() => {
      onAnswer(choiceKey);
      setSelectedChoiceKey(null);
      setShowFeedback(false);
    }, 2000);
  }, [onAnswer]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      // --- HEIGHT/WIDTH CONTROL: Ensure it fills width but doesn't exceed screen height ---
      className="w-full max-w-lg max-h-[95vh]"
      style={{ willChange: 'transform, opacity' }} // Performance hint
    >
      {/* --- HEIGHT/WIDTH CONTROL: Use flexbox for a flexible layout --- */}
      <Card className="w-full h-full bg-blue-100/80 backdrop-blur-sm border-4 border-blue-400 shadow-2xl rounded-3xl p-2 sm:p-4 flex flex-col">
        {/* --- HEIGHT CONTROL: Header doesn't shrink --- */}
        <CardHeader className="text-center flex-shrink-0">
          <CardTitle className="text-3xl font-bold text-blue-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
            Faites un choix !
          </CardTitle>
        </CardHeader>

        {/* --- HEIGHT CONTROL: Content area grows and scrolls internally if needed --- */}
        <CardContent className="space-y-4 flex-grow overflow-y-auto p-4">
          <div className="bg-white/80 p-5 rounded-2xl shadow-inner">
            <p className="text-xl text-center font-semibold text-slate-800 leading-relaxed">{question.question}</p>
          </div>
          
          {question.source_text && (
            <div className="text-center">
                <Button variant="outline" onClick={() => setIsHintVisible(true)} className="bg-blue-200 border-blue-300 text-blue-800 hover:bg-blue-300">
                    <Lightbulb className="mr-2 h-4 w-4" />
                    Afficher le Texte Source
                </Button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {choices.map(([label, text]) => (
              <ChoiceButton
                key={label}
                label={label}
                text={text}
                onClick={handleSelectAndSubmit}
                isSelected={selectedChoiceKey === label}
                isCorrect={question.correct_option === label}
                showFeedback={showFeedback}
              />
            ))}
          </div>
        </CardContent>
        
        {/* --- HEIGHT CONTROL: Footer doesn't shrink --- */}
        <CardFooter className="flex justify-center pt-4 flex-shrink-0">
            <Button onClick={onNavigateBack} variant="link" className="text-blue-600 font-semibold">
                Retour au menu
            </Button>
        </CardFooter>
      </Card>

      {/* This modal logic remains the same */}
      <HintModal
        isOpen={isHintVisible}
        onClose={() => setIsHintVisible(false)}
        title="Texte Source"
        content={question.source_text}
      />
    </motion.div>
  );
};