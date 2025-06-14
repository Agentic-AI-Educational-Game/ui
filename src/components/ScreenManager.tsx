import React, { Suspense } from 'react'; // Import Suspense
import { useAppContext, SCREEN_TYPES } from '../context/AppContext';
import { useQuiz } from '../context/QuizContext';
import { motion } from 'framer-motion'; // For the loading fallback

// --- OPTIMIZATION: Lazy load all screens ---
const MainMenuScreen = React.lazy(() => import('../screens/MainMenuScreen').then(module => ({ default: module.MainMenuScreen })));
const StoryScreen = React.lazy(() => import('../screens/StoryScreen').then(module => ({ default: module.StoryScreen })));
const EndStoryScreen = React.lazy(() => import('../screens/EndStoryScreen').then(module => ({ default: module.EndStoryScreen })));
const QcmScreen = React.lazy(() => import('../screens/QcmScreen').then(module => ({ default: module.QcmScreen })));
const InputScreen = React.lazy(() => import('../screens/InputScreen').then(module => ({ default: module.InputScreen })));
const AudioScreen = React.lazy(() => import('../screens/AudioScreen').then(module => ({ default: module.AudioScreen })));
const ProcessingScreen = React.lazy(() => import('../screens/ProcessingScreen').then(module => ({ default: module.ProcessingScreen })));
const FinalScore = React.lazy(() => import('../screens/FinalScore').then(module => ({ default: module.FinalScore })));


// A nice loading spinner for the Suspense fallback
const ScreenLoader: React.FC = () => (
    <div className="flex items-center justify-center h-96">
        <motion.div
            className="w-16 h-16 border-8 border-t-purple-500 border-purple-200 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
    </div>
);

interface ScreenManagerProps {
    currentScreen: (typeof SCREEN_TYPES)[keyof typeof SCREEN_TYPES];
}

export const ScreenManager: React.FC<ScreenManagerProps> = ({ currentScreen }) => {
  const { navigateToMenu, navigateToEnding, startGame, advanceToNextScreen, handleFinalSubmission } = useAppContext();
  const { quizState, inputState, audioState, finalResults, submitQcmAnswer, submitInputAnswer, handleAudioSubmitted } = useQuiz();

  const renderScreen = () => {
    switch (currentScreen) {
      case SCREEN_TYPES.STORY:
        return <StoryScreen onComplete={navigateToMenu} />;
      case SCREEN_TYPES.END_STORY:
          return <EndStoryScreen onComplete={navigateToMenu} />;
      case SCREEN_TYPES.MENU:
        return <MainMenuScreen startGame={startGame} />;
      case SCREEN_TYPES.QCM:
        return (
          <QcmScreen
            question={quizState.currentQuestion!}
            onAnswer={(choice) => submitQcmAnswer(choice, advanceToNextScreen)}
            onNavigateBack={navigateToMenu}
            key={`qcm-${quizState.currentQuestion?._id ?? quizState.currentQuestionIndex}`}
          />
        );
      case SCREEN_TYPES.INPUT:
        return (
          <InputScreen
            question={inputState.currentQuestion!}
            onAnswerSubmit={(answer) => submitInputAnswer(answer, advanceToNextScreen)}
            onNavigateBack={navigateToMenu}
            key={`input-${inputState.currentQuestion?._id ?? inputState.currentQuestionIndex}`}
          />
        );
      case SCREEN_TYPES.AUDIO:
        return (
          <AudioScreen
            question={audioState.currentQuestion!}
            onRecordingSubmitted={(blob) => handleAudioSubmitted(blob, handleFinalSubmission)}
            onNavigateBack={navigateToMenu}
            key={`audio-${audioState.currentQuestion?._id ?? audioState.currentQuestionIndex}`}
          />
        );
      case SCREEN_TYPES.PROCESSING:
        return <ProcessingScreen />;
     case SCREEN_TYPES.SCORE:
        return (
          <FinalScore
            results={finalResults}
            playAgain={startGame}
            onSeeEnding={navigateToEnding} // No more goToMenu
          />
        );
      default:
        return <MainMenuScreen startGame={startGame} />;
    }
  };

  // --- Wrap the output in a <Suspense> component ---
  // This tells React what to show while it's downloading the code for a lazy component.
  return <Suspense fallback={<ScreenLoader />}>{renderScreen()}</Suspense>;
};