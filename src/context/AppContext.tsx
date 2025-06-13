/* eslint-disable @typescript-eslint/no-explicit-any */
// src/context/AppContext.tsx
import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';
import { useQuiz } from './QuizContext';
import { useData } from './DataContext';
import { ScreenManager } from '@/components/ScreenManager';

export const SCREEN_TYPES = {
  MENU: 'menu',
  QCM: 'qcm',
  INPUT: 'input',
  AUDIO: 'audio',
  PROCESSING: 'processing',
  SCORE: 'score',
  LOADING: 'loading',
  ERROR: 'error',
} as const;

export type ScreenType = (typeof SCREEN_TYPES)[keyof typeof SCREEN_TYPES];

interface AppContextType {
  currentScreen: ScreenType;
  navigateToMenu: () => void;
  startGame: () => void;
  advanceToNextScreen: () => void;
  handleFinalSubmission: (promises: Promise<any>[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(SCREEN_TYPES.MENU);
  const { resetAndInitializeGame, calculateFinalScores } = useQuiz();

  const navigateToMenu = useCallback(() => {
    resetAndInitializeGame();
    setCurrentScreen(SCREEN_TYPES.MENU);
  }, [resetAndInitializeGame]);

  const startGame = useCallback(() => {
    resetAndInitializeGame();
    setCurrentScreen(SCREEN_TYPES.QCM);
  }, [resetAndInitializeGame]);

  const advanceToNextScreen = useCallback(() => {
    if (currentScreen === SCREEN_TYPES.QCM) {
      setCurrentScreen(SCREEN_TYPES.INPUT);
    } else if (currentScreen === SCREEN_TYPES.INPUT) {
      setCurrentScreen(SCREEN_TYPES.AUDIO);
    }
  }, [currentScreen]);

  const handleFinalSubmission = useCallback((promises: Promise<any>[]) => {
    setCurrentScreen(SCREEN_TYPES.PROCESSING);
    calculateFinalScores(promises, () => setCurrentScreen(SCREEN_TYPES.SCORE));
  }, [calculateFinalScores]);


  const value = { currentScreen, navigateToMenu, startGame, advanceToNextScreen, handleFinalSubmission };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

export const AppFlowManager: React.FC = () => {
    const { isLoading, error } = useData();
    const { currentScreen } = useAppContext();

    if (isLoading) {
      return <div className="flex items-center justify-center h-screen text-white text-2xl font-bold">Loading Game...</div>;
    }
  
    if (error) {
      return <div className="flex items-center justify-center h-screen text-red-500 text-2xl font-bold">Failed to load game data. Please try again later.</div>;
    }
    
    return <ScreenManager currentScreen={currentScreen} />;
}