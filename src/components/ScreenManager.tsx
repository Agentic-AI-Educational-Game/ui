// src/components/ScreenManager.tsx
import React from 'react';
import { useAppContext, SCREEN_TYPES } from '../context/AppContext';
import { MainMenuScreen } from '../screens/MainMenuScreen';
import { QcmScreen } from '../screens/QcmScreen';
import { InputScreen } from '../screens/InputScreen';
import { AudioScreen } from '../screens/AudioScreen';
import { FinalScore } from '../screens/FinalScore';

export const ScreenManager: React.FC = () => {
  const {
    currentScreen,
    navigateToMenu,
    startGame,
    finalScore,
    quizState,
    submitQcmAnswer,
    inputState,
    submitInputAnswer,
    audioState,
    handleAudioSubmitted,
  } = useAppContext();

  switch (currentScreen) {
    case SCREEN_TYPES.MENU:
      return <MainMenuScreen startGame={startGame} />;

    case SCREEN_TYPES.QCM:
      return (
        <QcmScreen
          question={quizState.currentQuestion!}
          onAnswer={submitQcmAnswer}
          onNavigateBack={navigateToMenu}
          key={`qcm-${quizState.currentQuestionIndex}`}
        />
      );

    case SCREEN_TYPES.INPUT:
      return (
        <InputScreen
          question={inputState.currentQuestion!}
          onAnswerSubmit={submitInputAnswer}
          onNavigateBack={navigateToMenu}
          key={`input-${inputState.currentQuestionIndex}`}
        />
      );

    case SCREEN_TYPES.AUDIO:
      return (
        <AudioScreen
          question={audioState.currentQuestion!}
          onRecordingSubmitted={handleAudioSubmitted}
          onNavigateBack={navigateToMenu}
          key={`audio-${audioState.currentQuestionIndex}`}
        />
      );

    case SCREEN_TYPES.SCORE:
      return (
        <FinalScore
          finalScore={finalScore}
          totalQuestions={quizState.totalQuestions + inputState.totalQuestions}
          playAgain={startGame}
          goToMenu={navigateToMenu}
        />
      );

    default:
      return <MainMenuScreen startGame={startGame} />;
  }
};