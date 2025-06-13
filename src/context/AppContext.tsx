/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';
import { useQuiz } from './QuizContext';
import { useData } from './DataContext';
import { useAuth } from './AuthContext';
import { ScreenManager } from '@/components/ScreenManager';
import { LoginScreen } from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';
import { TeacherDashboardScreen } from '@/screens/TeacherDashboardScreen';

// Add new screen types
export const SCREEN_TYPES = {
  LOGIN: 'login',
  REGISTER: 'register',
  TEACHER_DASHBOARD: 'teacher_dashboard',
  MENU: 'menu',
  QCM: 'qcm',
  INPUT: 'input',
  AUDIO: 'audio',
  PROCESSING: 'processing',
  SCORE: 'score',
  LOADING: 'loading',
  ERROR: 'error',
} as const;

// CORRECTED LINE: Removed the extra `typeof`
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

// This component is now the main router for the entire app flow
export const AppFlowManager: React.FC = () => {
    const { isLoading, error } = useData();
    const { currentUser } = useAuth();
    const { currentScreen } = useAppContext();
    const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');

    if (isLoading) {
      return <div className="flex items-center justify-center h-screen text-white text-2xl font-bold">Loading Game...</div>;
    }
  
    if (error) {
      return <div className="flex items-center justify-center h-screen text-red-500 text-2xl font-bold">Failed to load game data. Please try again.</div>;
    }

    // If no user is logged in, show the appropriate auth screen
    if (!currentUser) {
        if (authScreen === 'login') {
            return <LoginScreen switchToRegister={() => setAuthScreen('register')} />;
        }
        return <RegisterScreen switchToLogin={() => setAuthScreen('login')} />;
    }

    // If user is a teacher, show the dashboard
    if (currentUser.role === 'teacher') {
        return <TeacherDashboardScreen />;
    }

    // If user is a student, show the game flow
    if (currentUser.role === 'student') {
        return <ScreenManager currentScreen={currentScreen} />;
    }

    return <div>Something went wrong.</div>;
}