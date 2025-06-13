import React from 'react';
import { useAppContext, SCREEN_TYPES } from '../context/AppContext';
import { useQuiz } from '../context/QuizContext';
import { MainMenuScreen } from '../screens/MainMenuScreen';
import { StoryScreen } from '../screens/StoryScreen'; // --- NEW: Import StoryScreen ---
import { QcmScreen } from '../screens/QcmScreen';
import { InputScreen } from '../screens/InputScreen';
import { AudioScreen } from '../screens/AudioScreen';
import { ProcessingScreen } from '../screens/ProcessingScreen';
import { FinalScore } from '../screens/FinalScore';

interface ScreenManagerProps {
    currentScreen: (typeof SCREEN_TYPES)[keyof typeof SCREEN_TYPES];
}

export const ScreenManager: React.FC<ScreenManagerProps> = ({ currentScreen }) => {
  const { navigateToMenu, startGame, advanceToNextScreen, handleFinalSubmission } = useAppContext();
  const { quizState, inputState, audioState, finalResults, submitQcmAnswer, submitInputAnswer, handleAudioSubmitted } = useQuiz();

  switch (currentScreen) {
    // --- NEW: Add the case for the story screen ---
    case SCREEN_TYPES.STORY:
      return <StoryScreen onComplete={navigateToMenu} />; // When story is done, go to menu

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
          goToMenu={navigateToMenu}
        />
      );

    default:
      // If something goes wrong, default to the menu
      return <MainMenuScreen startGame={startGame} />;
  }
};