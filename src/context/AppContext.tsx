import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import allQuestionsData from '../../data/qcm.json';
import type QuestionQcm from '@/interface/QuestionQcm';

// eslint-disable-next-line react-refresh/only-export-components
export const SCREEN_TYPES = {
  MENU: 'menu',
  QCM: 'qcm',
  AUDIO: 'audio',
  SCORE: 'score',
} as const;

export type ScreenType = (typeof SCREEN_TYPES)[keyof typeof SCREEN_TYPES];

const qcmQuestions: QuestionQcm[] = allQuestionsData as QuestionQcm[];

interface QuizState {
  qcmQuestions:QuestionQcm[];
  currentQuestionIndex: number;
  score: number;
  currentQuestion: QuestionQcm | undefined;
  isQuizFinished: boolean;
  totalQuestions: number;
}

interface AppContextType {
  currentScreen: ScreenType;
  navigateToMenu: () => void;
  navigateToQcm: () => void;
  navigateToAudioScreen: () => void;
  navigateToScoreScreen: (finalScore: number) => void;

  quizState: QuizState;
  submitQcmAnswer: (selectedChoiceKey: string) => void;

  // Audio
  handleAudioSubmitted: (audioBlob: Blob) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
// --- Context Provider Component ---
interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(
    SCREEN_TYPES.MENU
  );
  const [quizState, setQuizState] = useState<QuizState>({
    qcmQuestions:qcmQuestions,
    currentQuestionIndex: 0,
    score: 0,
    currentQuestion: qcmQuestions[0],
    isQuizFinished: false,
    totalQuestions: qcmQuestions.length,
  });
  const navigateToMenu = useCallback(() => setCurrentScreen(SCREEN_TYPES.MENU), []);

  const navigateToQcm = useCallback(() => {
    setQuizState({
            qcmQuestions:qcmQuestions,

      currentQuestionIndex: 0,
      score: 0,
      currentQuestion: qcmQuestions[0],
      isQuizFinished: false,
      totalQuestions: qcmQuestions.length,
    });
    setCurrentScreen(SCREEN_TYPES.QCM);
  }, []);

  const navigateToAudioScreen = useCallback(() => setCurrentScreen(SCREEN_TYPES.AUDIO), []);

  const navigateToScoreScreen = useCallback((finalScore: number) => {
    // Update quizState to reflect the final score if needed, or just navigate
    setQuizState(prev => ({ ...prev, score: finalScore, isQuizFinished: true }));
    setCurrentScreen(SCREEN_TYPES.SCORE);
  }, []);

   const submitQcmAnswer = useCallback((selectedChoiceKey: string) => {
    if (!quizState.currentQuestion || quizState.isQuizFinished) return;

    const isCorrect = selectedChoiceKey === quizState.currentQuestion.correct;
    const newScore = isCorrect ? quizState.score + 1 : quizState.score;

    if (quizState.currentQuestionIndex < qcmQuestions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        score: newScore,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        currentQuestion: qcmQuestions[prev.currentQuestionIndex + 1],
      }));
    } else {
      // Last question
      console.log('QCM Finished! Final Score:', newScore);
      setQuizState(prev => ({ ...prev, score: newScore, isQuizFinished: true }));
      // Navigation to score screen will be triggered by useEffect in App or ScreenManager
      // OR call navigateToScoreScreen directly if preferred
      navigateToScoreScreen(newScore);
    }
  }, [quizState, navigateToScoreScreen]);

   const handleAudioSubmitted = useCallback((audioBlob: Blob) => {
    console.log('App: Audio submitted!', audioBlob);
    alert(`Audio of size ${(audioBlob.size / 1024).toFixed(2)} KB ready for processing.`);
    navigateToMenu();
  }, [navigateToMenu]);

  const contextValue: AppContextType = {
    currentScreen,
    navigateToMenu,
    navigateToQcm,
    navigateToAudioScreen,
    navigateToScoreScreen,
    quizState,
    submitQcmAnswer,
    handleAudioSubmitted,
  };
  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;

};



export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};