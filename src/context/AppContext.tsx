/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useCallback, useState, type ReactNode, useEffect, Suspense } from 'react';
import { useQuiz } from './QuizContext';
import { useData } from './DataContext';
import { useAuth } from './AuthContext';
import { motion } from 'framer-motion';
import { QuizProgressBar } from '@/components/QuizProgressBar';

// --- OPTIMIZATION: We are lazy-loading all major screen components ---
const ScreenManager = React.lazy(() => import('../components/ScreenManager').then(module => ({ default: module.ScreenManager })));
const LoginScreen = React.lazy(() => import('../screens/LoginScreen').then(module => ({ default: module.LoginScreen })));
const RegisterScreen = React.lazy(() => import('../screens/RegisterScreen').then(module => ({ default: module.RegisterScreen })));
const TeacherDashboardScreen = React.lazy(() => import('../screens/TeacherDashboardScreen').then(module => ({ default: module.TeacherDashboardScreen })));


export const SCREEN_TYPES = {
  LOGIN: 'login',
  REGISTER: 'register',
  TEACHER_DASHBOARD: 'teacher_dashboard',
  STORY: 'story',
  END_STORY: 'end_story',
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
  navigateToStory: () => void;
  navigateToEnding: () => void;
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

  const navigateToStory = useCallback(() => {
    setCurrentScreen(SCREEN_TYPES.STORY);
  }, []);

  const navigateToEnding = useCallback(() => {
    setCurrentScreen(SCREEN_TYPES.END_STORY);
  }, []);

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


  const value = { currentScreen, navigateToMenu, navigateToStory, navigateToEnding, startGame, advanceToNextScreen, handleFinalSubmission };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};

const isQuizScreen = (screen: ScreenType) => {
    const quizScreens: ScreenType[] = [SCREEN_TYPES.QCM, SCREEN_TYPES.INPUT, SCREEN_TYPES.AUDIO];
    return quizScreens.includes(screen);
}

// A generic loading spinner for all lazy-loaded components at this level
const TopLevelLoader: React.FC = () => (
    <div className="flex items-center justify-center h-full">
        <motion.div
            className="w-20 h-20 border-8 border-t-blue-500 border-blue-200 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
    </div>
);

// --- THIS IS THE COMPLETE, FULLY LOGICAL APP FLOW MANAGER ---
export const AppFlowManager: React.FC = () => {
    const { isLoading, error } = useData();
    const { currentUser } = useAuth();
    const { currentScreen, navigateToStory } = useAppContext();
    const { totalProgress } = useQuiz();
    const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');

    useEffect(() => {
       if (currentUser && currentUser.role === 'student' && !sessionStorage.getItem('story_seen')) {
        navigateToStory();
        sessionStorage.setItem('story_seen', 'true');
      }

      // --- CRITICAL FIX: Clear story flag on logout ---
      // This effect runs when `currentUser` becomes null (i.e., on logout).
      if (!currentUser) {
        sessionStorage.removeItem('story_seen');
      }
    }, [currentUser, navigateToStory]);
    // Top-level loading state for initial data fetch
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full text-white text-2xl font-bold">
            Chargement du jeu...
        </div>
      );
    }
  
    // Top-level error state if data fails to load
    if (error) {
      return (
        <div className="flex items-center justify-center h-full text-red-500 text-2xl font-bold">
            Impossible de charger les données du jeu. Veuillez réessayer plus tard.
        </div>
      );
    }
    const CenteredLayout: React.FC<{children: React.ReactNode}> = ({ children }) => (
        <div className="w-full h-full flex flex-col items-center justify-center">
            {children}
        </div>
    );
    // --- Suspense boundary wraps all conditional rendering ---
     return (
        <Suspense fallback={<TopLevelLoader />}>
            {!currentUser ? (
                // AUTH FLOW
                <CenteredLayout>
                  {/* The side-effect is now correctly handled in useEffect */}
                  {authScreen === 'login' ? (
                      <LoginScreen switchToRegister={() => setAuthScreen('register')} />
                  ) : (
                      <RegisterScreen switchToLogin={() => setAuthScreen('login')} />
                  )}
                </CenteredLayout>
            ) : currentUser.role === 'teacher' ? (
                // TEACHER FLOW
                <TeacherDashboardScreen />
            ) : (
                // STUDENT FLOW
                <CenteredLayout>
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
                </CenteredLayout>
            )}
        </Suspense>
    );
}