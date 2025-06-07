import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import allQuestionsData from '../../data/qcm.json';
import type QuestionQcm from '@/interface/QuestionQcm';
import type AudioQuestion from '@/interface/AudioQuestion';

import allQuestionAudio from '../../data/audio_text.json';
import { AudioScreen } from '@/screens/AudioScreen';
const allAudioQuestions = allQuestionAudio as AudioQuestion[];

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
  qcmQuestions: QuestionQcm[];
  currentQuestionIndex: number;
  score: number;
  currentQuestion: QuestionQcm | undefined;
  isQuizFinished: boolean;
  totalQuestions: number;
}

interface AudioState {
  audioQuestions: AudioQuestion[];
  currentQuestionIndex: number;
  score?: number;
  currentQuestion: AudioQuestion | undefined;
  isAudioQuestionFinished: boolean;
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
  audioState: AudioState;
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
    qcmQuestions: qcmQuestions,
    currentQuestionIndex: 0,
    score: 0,
    currentQuestion: qcmQuestions[0],
    isQuizFinished: false,
    totalQuestions: qcmQuestions.length,
  });
  const navigateToMenu = useCallback(
    () => setCurrentScreen(SCREEN_TYPES.MENU),
    []
  );

  const navigateToQcm = useCallback(() => {
    setQuizState({
      qcmQuestions: qcmQuestions,

      currentQuestionIndex: 0,
      score: 0,
      currentQuestion: qcmQuestions[0],
      isQuizFinished: false,
      totalQuestions: qcmQuestions.length,
    });
    setCurrentScreen(SCREEN_TYPES.QCM);
  }, []);

  const navigateToAudioScreen = useCallback(
    () => setCurrentScreen(SCREEN_TYPES.AUDIO),
    []
  );

  const navigateToScoreScreen = useCallback((finalScore: number) => {
    // Update quizState to reflect the final score if needed, or just navigate
    setQuizState((prev) => ({
      ...prev,
      score: finalScore,
      isQuizFinished: true,
    }));
    setCurrentScreen(SCREEN_TYPES.SCORE);
  }, []);

  const submitQcmAnswer = useCallback(
    (selectedChoiceKey: string) => {
      if (!quizState.currentQuestion || quizState.isQuizFinished) return;

      const isCorrect = selectedChoiceKey === quizState.currentQuestion.correct;
      const newScore = isCorrect ? quizState.score + 1 : quizState.score;

      if (quizState.currentQuestionIndex < qcmQuestions.length - 1) {
        setQuizState((prev) => ({
          ...prev,
          score: newScore,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          currentQuestion: qcmQuestions[prev.currentQuestionIndex + 1],
        }));
      } else {
        // Last question
        console.log('QCM Finished! Final Score:', newScore);
        setQuizState((prev) => ({
          ...prev,
          score: newScore,
          isQuizFinished: true,
        }));

        navigateToScoreScreen(newScore);
      }
    },
    [quizState, navigateToScoreScreen]
  );

  const [audioState, setAudioState] = useState<AudioState>({
    audioQuestions: allAudioQuestions,
    currentQuestionIndex: 0,
    score: 0,
    currentQuestion: allAudioQuestions[0],
    isAudioQuestionFinished: false,
    totalQuestions: allAudioQuestions.length,
  });

  const handleAudioSubmitted = useCallback(
    async (audioBlob: Blob) => {
      if (!audioState.currentQuestion || audioState.isAudioQuestionFinished)
        return;

      if (
        audioState.currentQuestionIndex <
        audioState.audioQuestions.length - 1
      ) {
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.wav');

        // try {
        //   // 2. Send the POST request
        //   const response = await fetch('http://localhost:8080/upload', {
        //     method: 'POST',
        //     body: formData,
        //   });

        //   if (!response.ok) {
        //     throw new Error(`Upload failed: ${response.statusText}`);
        //   }

        //   console.log('✅ Audio uploaded successfully.');
        // } catch (error) {
        //   console.error('❌ Error uploading audio:', error);
        // }

        const newIndex = audioState.currentQuestionIndex + 1;
        const newQuestion = audioState.audioQuestions[newIndex];
        setAudioState((prev) => {
          return {
            ...prev,
            currentQuestionIndex: newIndex,
            currentQuestion: newQuestion,
          };
        });
      } else {
        navigateToQcm();
      }
    },
    [audioState, AudioScreen]
  );

  const contextValue: AppContextType = {
    currentScreen,
    navigateToMenu,
    navigateToQcm,
    navigateToAudioScreen,
    navigateToScoreScreen,
    quizState,
    submitQcmAnswer,
    handleAudioSubmitted,
    audioState,
  };
  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
