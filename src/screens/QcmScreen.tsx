import { Button } from "@/components/ui/button";
import type { FC } from "react";

interface QcmScreenProps{
  goToMenu:() => void;
  goToAudio:()=> void;
}

export const QcmScreen : FC<QcmScreenProps> = ({ goToMenu  , goToAudio}) => {
    const questions = {
    question: "What is 2 + 2?",
    choices: {
      A: "3 azeazeazeazeazeazaz",
      B: "4 rrrrrrrrrrrrrrrrrrrr",
      C: "5 rrrrrrrrrrrtttttttttttttt",
      D: "6 tttttttttttttttttttttttttt",
    },
    correct: "B",
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="bg-green-600 rounded-2xl p-3 text-white m-2 mb-5">
          <p>
            {questions.question}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          {Object.entries(questions.choices).map(([label, text]) => (
            <Button className="bg-blue-900 text-white hover:bg-amber-500">
              {label}:{text}
            </Button>
          ))}
        </div>
        <div className="flex justify-around m-2 p-2 gap-2">
            <Button onClick={goToAudio} className="bg-blue-700">Next</Button>
            <Button onClick={goToMenu}>Main Menu </Button>
        </div>
        
      </div>
    </>
  );
}