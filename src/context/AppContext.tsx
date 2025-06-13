/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';
import { useQuiz } from './QuizContext';
import { useData } from './DataContext';
import { useAuth } from './AuthContext';
import { ScreenManager } from '@/components/ScreenManager';
import { LoginScreen } from '@/screens/LoginScreen';
import { RegisterScreen } from '@/screens/RegisterScreen';
import { TeacherDashboardScreen } from '@/screens/TeacherDashboardScreen';
import { QuizProgressBar } from '@/components/QuizProgressBar';

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

// --- CORRECTED HELPER FUNCTION ---
const isQuizScreen = (screen: ScreenType) => {
    // We explicitly type the array to satisfy TypeScript's strict checking.
    const quizScreens: ScreenType[] = [SCREEN_TYPES.QCM, SCREEN_TYPES.INPUT, SCREEN_TYPES.AUDIO];
    return quizScreens.includes(screen);
}
// --- END CORRECTION ---

export const AppFlowManager: React.FC = () => {
    const { isLoading, error } = useData();
    const { currentUser } = useAuth();
    const { currentScreen } = useAppContext();
    const { totalProgress } = useQuiz();
    const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');

    if (isLoading) {
      return <div className="flex items-center justify-center h-screen text-white text-2xl font-bold">Loading Game...</div>;
    }
  
    if (error) {
      return <div className="flex items-center justify-center h-screen text-red-500 text-2xl font-bold">Failed to load game data. Please try again.</div>;
    }

    if (!currentUser) {
        if (authScreen === 'login') {
            return <LoginScreen switchToRegister={() => setAuthScreen('register')} />;
        }
        return <RegisterScreen switchToLogin={() => setAuthScreen('login')} />;
    }

    if (currentUser.role === 'teacher') {
        return <TeacherDashboardScreen />;
    }

    if (currentUser.role === 'student') {
        return (
            <div className="w-full flex flex-col items-center">
                {isQuizScreen(currentScreen) && (
                    <QuizProgressBar 
                        progress={totalProgress}
                        cursorImage="/assets/running-character.png"
                        finishImage="/assets/finish-line.png"
                    />
                )}
                <ScreenManager currentScreen={currentScreen} />
            </div>
        );
    }

    return <div>Something went wrong.</div>;
}