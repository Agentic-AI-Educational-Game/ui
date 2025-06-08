// src/context/AppContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import allQuestionsData from '../../data/qcm.json';
import allAudioData from '../../data/audio_text.json';
import allInputData from '../../data/input.json';

import type QuestionQcm from '@/interface/QuestionQcm';
import type AudioQuestion from '@/interface/AudioQuestion';
import type InputQuestion from '@/interface/InputQuestion';

export const SCREEN_TYPES = {
  MENU: 'menu',
  QCM: 'qcm',
  INPUT: 'input',
  AUDIO: 'audio',
  SCORE: 'score',
} as const;

export type ScreenType = (typeof SCREEN_TYPES)[keyof typeof SCREEN_TYPES];

const qcmQuestions: QuestionQcm[] = allQuestionsData as QuestionQcm[];
const audioQuestions: AudioQuestion[] = allAudioData as AudioQuestion[];
const inputQuestions: InputQuestion[] = allInputData as InputQuestion[];

// State interfaces
interface QuizState {
  qcmQuestions: QuestionQcm[];
  currentQuestionIndex: number;
  score: number;
  currentQuestion: QuestionQcm | undefined;
  isQuizFinished: boolean;
  totalQuestions: number;
}

interface InputState {
  inputQuestions: InputQuestion[];
  currentQuestionIndex: number;
  score: number;
  currentQuestion: InputQuestion | undefined;
  isInputFinished: boolean;
  totalQuestions: number;
}

interface AudioState {
  audioQuestions: AudioQuestion[];
  currentQuestionIndex: number;
  currentQuestion: AudioQuestion | undefined;
  isAudioFinished: boolean;
  totalQuestions: number;
}

interface AppContextType {
  currentScreen: ScreenType;
  finalScore: number;
  navigateToMenu: () => void;
  startGame: () => void;
  quizState: QuizState;
  submitQcmAnswer: (selectedChoiceKey: string) => void;
  inputState: InputState;
  submitInputAnswer: (answer: string) => void;
  audioState: AudioState;
  handleAudioSubmitted: (audioBlob: Blob) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(
    SCREEN_TYPES.MENU
  );
  const [finalScore, setFinalScore] = useState(0);

  // --- State for each quiz ---
  const initialQuizState: QuizState = {
    qcmQuestions,
    currentQuestionIndex: 0,
    score: 0,
    currentQuestion: qcmQuestions[0],
    isQuizFinished: false,
    totalQuestions: qcmQuestions.length,
  };

  const initialInputState: InputState = {
    inputQuestions,
    currentQuestionIndex: 0,
    score: 0,
    currentQuestion: inputQuestions[0],
    isInputFinished: false,
    totalQuestions: inputQuestions.length,
  };

  const initialAudioState: AudioState = {
    audioQuestions,
    currentQuestionIndex: 0,
    currentQuestion: audioQuestions[0],
    isAudioFinished: false,
    totalQuestions: audioQuestions.length,
  };

  const [quizState, setQuizState] = useState<QuizState>(initialQuizState);
  const [inputState, setInputState] = useState<InputState>(initialInputState);
  const [audioState, setAudioState] = useState<AudioState>(initialAudioState);

  const resetAllQuizzes = () => {
    setQuizState(initialQuizState);
    setInputState(initialInputState);
    setAudioState(initialAudioState);
    setFinalScore(0);
  };

  const navigateToMenu = useCallback(() => {
    resetAllQuizzes();
    setCurrentScreen(SCREEN_TYPES.MENU);
  }, []);

  const startGame = useCallback(() => {
    resetAllQuizzes();
    setCurrentScreen(SCREEN_TYPES.QCM);
  }, []);

  const navigateToInputScreen = useCallback(
    () => setCurrentScreen(SCREEN_TYPES.INPUT),
    []
  );
  const navigateToAudioScreen = useCallback(
    () => setCurrentScreen(SCREEN_TYPES.AUDIO),
    []
  );

  const navigateToScoreScreen = useCallback((score: number) => {
    setFinalScore(score);
    setCurrentScreen(SCREEN_TYPES.SCORE);
  }, []);

  // --- Submission Logic with Sequential Navigation ---
  const submitQcmAnswer = useCallback(
    (selectedChoiceKey: string) => {
      if (!quizState.currentQuestion) return;
      const isCorrect =
        selectedChoiceKey === quizState.currentQuestion.correct_option;
      const newScore = isCorrect ? quizState.score + 1 : quizState.score;

      if (quizState.currentQuestionIndex < qcmQuestions.length - 1) {
        setQuizState((prev) => ({
          ...prev,
          score: newScore,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          currentQuestion: qcmQuestions[prev.currentQuestionIndex + 1],
        }));
      } else {
        setQuizState((prev) => ({
          ...prev,
          score: newScore,
          isQuizFinished: true,
        }));
        navigateToInputScreen();
      }
    },
    [quizState, navigateToInputScreen]
  );

  const submitInputAnswer = useCallback(
    (submittedAnswer: string) => {
      if (!inputState.currentQuestion) return;
      const isCorrect =
        submittedAnswer.trim().toLowerCase() ===
        inputState.currentQuestion.correct_answer.toLowerCase();
      const newScore = isCorrect ? inputState.score + 1 : inputState.score;

      if (inputState.currentQuestionIndex < inputQuestions.length - 1) {
        setInputState((prev) => ({
          ...prev,
          score: newScore,
          currentQuestionIndex: prev.currentQuestionIndex + 1,
          currentQuestion: inputQuestions[prev.currentQuestionIndex + 1],
        }));
      } else {
        setInputState((prev) => ({
          ...prev,
          score: newScore,
          isInputFinished: true,
        }));
        navigateToAudioScreen();
      }
    },
    [inputState, navigateToAudioScreen]
  );

  const handleAudioSubmitted = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (audioBlob: Blob) => {
      if (!audioState.currentQuestion) return;
      console.log(audioBlob)
      // You can add your API submission logic for the blob here

      if (audioState.currentQuestionIndex < audioQuestions.length - 1) {
        const newIndex = audioState.currentQuestionIndex + 1;
        setAudioState((prev) => ({
          ...prev,
          currentQuestionIndex: newIndex,
          currentQuestion: audioQuestions[newIndex],
        }));
      } else {
        setAudioState((prev) => ({ ...prev, isAudioFinished: true }));
        const totalScore = quizState.score + inputState.score;
        navigateToScoreScreen(totalScore);
      }
    },
    [audioState, inputState.score, quizState.score, navigateToScoreScreen]
  );

  const contextValue: AppContextType = {
    currentScreen,
    finalScore,
    navigateToMenu,
    startGame,
    quizState,
    submitQcmAnswer,
    inputState,
    submitInputAnswer,
    audioState,
    handleAudioSubmitted,
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