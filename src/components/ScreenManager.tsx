// src/components/ScreenManager.tsx
import React from 'react';
import { useAppContext, SCREEN_TYPES } from '../context/AppContext';
import { MainMenuScreen } from '../screens/MainMenuScreen';
import { QcmScreen } from '../screens/QcmScreen';
import { AudioScreen } from '../screens/AudioScreen';
import { FinalScore } from '../screens/FinalScore'; // Assuming you have this component
export const ScreenManager: React.FC = () => {
  const {
    currentScreen,
    navigateToMenu,
    navigateToQcm,
    navigateToAudioScreen,
    quizState,
    submitQcmAnswer,
    handleAudioSubmitted,
  } = useAppContext();

  const isLastQuestion = quizState.currentQuestionIndex === quizState.totalQuestions - 1;

  switch (currentScreen) {
    case SCREEN_TYPES.QCM:
      if (!quizState.currentQuestion) {
        // This should ideally be prevented by the logic in AppProvider
        console.warn("Attempting to render QCM without a question.");
        navigateToMenu(); // Fallback
        return null;
      }
      return (
        <QcmScreen
          questions={quizState.currentQuestion}
          onAnswer={submitQcmAnswer} // QcmScreen now calls submitQcmAnswer from context
          goToMenu={navigateToMenu}
          goToAudio={isLastQuestion && !quizState.isQuizFinished ? navigateToAudioScreen : undefined}
          key={quizState.currentQuestion.question || quizState.currentQuestionIndex}
        />
      );
    case SCREEN_TYPES.SCORE:
      return (
        <FinalScore
          finalScoreDisplay={quizState.score} // Score comes from quizState
          qcmQuestions={quizState.qcmQuestions} // This might not be needed if totalQuestions is enough
          navigateToAudio={navigateToAudioScreen}
          navigateToMenu={navigateToMenu}
          // navigateToAudio={navigateToAudioScreen} // If you want this option from score screen
        />
      );
    case SCREEN_TYPES.AUDIO:
      return (
        <AudioScreen
          onRecordingSubmitted={handleAudioSubmitted}
          onNavigateBack={navigateToMenu}
        />
      );
    case SCREEN_TYPES.MENU:
    default:
      return (
        <MainMenuScreen
          onStartMCQ={navigateToQcm}
          // onStartAudioPractice={navigateToAudioScreen} // If MainMenu can go to Audio
        />
      );
  }
};