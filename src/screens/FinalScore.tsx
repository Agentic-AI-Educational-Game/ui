import type QuestionQcm from '@/interface/QuestionQcm';

interface FinalScoreProps {
  finalScoreDisplay: number;
  qcmQuestions: QuestionQcm[];
  navigateToMenu: () => void;
  navigateToAudio: () => void;
}

export const FinalScore: React.FC<FinalScoreProps> = ({
  finalScoreDisplay,
  qcmQuestions,
  navigateToAudio,
  navigateToMenu,
}) => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-sm p-8 md:p-12 rounded-xl shadow-2xl text-center w-full max-w-md text-white">
      <h1 className="text-3xl font-bold mb-6 text-sky-400">Quiz Finished!</h1>
      <p className="text-xl mb-8">
        Your final score is: {finalScoreDisplay} / {qcmQuestions.length}
      </p>
      <div className="flex gap-2">
        <button
          onClick={navigateToMenu}
          className="px-6 py-3 bg-gray-600 hover:bg-teal-700 rounded-lg font-semibold"
        >
          Back to Menu
        </button>
        <button
          onClick={navigateToAudio}
          className="px-6 py-3 bg-green-500 hover:bg-teal-700 rounded-lg font-semibold"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
