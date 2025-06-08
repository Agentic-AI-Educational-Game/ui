import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import allQuestionsData from '../../data/qcm.json';
import allAudioData from '../../data/audio_text.json';
import allInputData from '../../data/input.json'; // 1. Import new data

import type QuestionQcm from '@/interface/QuestionQcm';
import type AudioQuestion from '@/interface/AudioQuestion';
import type InputQuestion from '@/interface/InputQuestion'; // 2. Import new interface

// 3. Add the new screen type
export const SCREEN_TYPES = {
  MENU: 'menu',
  QCM: 'qcm',
  AUDIO: 'audio',
  INPUT: 'input', // New screen type
  SCORE: 'score',
} as const;

export type ScreenType = (typeof SCREEN_TYPES)[keyof typeof SCREEN_TYPES];

// Load and type all question data
const qcmQuestions: QuestionQcm[] = allQuestionsData as QuestionQcm[];
const audioQuestions: AudioQuestion[] = allAudioData as AudioQuestion[];
const inputQuestions: InputQuestion[] = allInputData as InputQuestion[]; // New

// Define state shapes
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
  currentQuestion: AudioQuestion | undefined;
  isAudioQuestionFinished: boolean;
  totalQuestions: number;
}

// 4. Define state for the new input quiz
interface InputState {
  inputQuestions: InputQuestion[];
  currentQuestionIndex: number;
  score: number;
  currentQuestion: InputQuestion | undefined;
  isInputFinished: boolean;
  totalQuestions: number;
}

// 5. Update the context type
interface AppContextType {
  currentScreen: ScreenType;
  navigateToMenu: () => void;
  navigateToQcm: () => void;
  navigateToAudioScreen: () => void;
  navigateToInputScreen: () => void; // New navigation function
  navigateToScoreScreen: (finalScore: number) => void;

  quizState: QuizState;
  submitQcmAnswer: (selectedChoiceKey: string) => void;

  audioState: AudioState;
  handleAudioSubmitted: (audioBlob: Blob) => void;

  inputState: InputState; // New state
  submitInputAnswer: (answer: string) => void; // New submission handler
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(SCREEN_TYPES.MENU);
  
  // QCM State... (no changes here)
  const [quizState, setQuizState] = useState<QuizState>({
    qcmQuestions: qcmQuestions,
    currentQuestionIndex: 0,
    score: 0,
    currentQuestion: qcmQuestions[0],
    isQuizFinished: false,
    totalQuestions: qcmQuestions.length,
  });

  // Audio State... (no changes here)
  const [audioState, setAudioState] = useState<AudioState>({
    audioQuestions: audioQuestions,
    currentQuestionIndex: 0,
    currentQuestion: audioQuestions[0],
    isAudioQuestionFinished: false,
    totalQuestions: audioQuestions.length,
  });

  // 6. Add state management for the Input Quiz
  const [inputState, setInputState] = useState<InputState>({
    inputQuestions: inputQuestions,
    currentQuestionIndex: 0,
    score: 0,
    currentQuestion: inputQuestions[0],
    isInputFinished: false,
    totalQuestions: inputQuestions.length,
  });

  // Navigation functions...
  const navigateToMenu = useCallback(() => setCurrentScreen(SCREEN_TYPES.MENU), []);
  const navigateToAudioScreen = useCallback(() => setCurrentScreen(SCREEN_TYPES.AUDIO), []);
  const navigateToQcm = useCallback(() => {
    // Reset state when navigating to this quiz
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
  
  // 7. Add navigation function for Input Screen
  const navigateToInputScreen = useCallback(() => {
    // Reset state for the input quiz
    setInputState({
      inputQuestions: inputQuestions,
      currentQuestionIndex: 0,
      score: 0,
      currentQuestion: inputQuestions[0],
      isInputFinished: false,
      totalQuestions: inputQuestions.length,
    });
    setCurrentScreen(SCREEN_TYPES.INPUT);
  }, []);
  
  // Score Screen navigation... (no changes here)
  const navigateToScoreScreen = useCallback((finalScore: number) => {
    // This could be made more generic to handle scores from different quizzes
    setQuizState((prev) => ({ ...prev, score: finalScore, isQuizFinished: true }));
    setCurrentScreen(SCREEN_TYPES.SCORE);
  }, []);


  // Submission handlers...
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
    [audioState, navigateToQcm]
  );

  // 8. Add submission handler for the Input Quiz
  const submitInputAnswer = useCallback((submittedAnswer: string) => {
    if (!inputState.currentQuestion || inputState.isInputFinished) return;

    // Forgiving check: trim whitespace and ignore case
    const isCorrect = submittedAnswer.trim().toLowerCase() === inputState.currentQuestion.correct_answer.toLowerCase();
    const newScore = isCorrect ? inputState.score + 1 : inputState.score;

    if (inputState.currentQuestionIndex < inputQuestions.length - 1) {
      setInputState((prev) => ({
        ...prev,
        score: newScore,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        currentQuestion: inputQuestions[prev.currentQuestionIndex + 1],
      }));
    } else {
      // Last question of this quiz type
      console.log('Input Quiz Finished! Final Score:', newScore);
      setInputState((prev) => ({ ...prev, score: newScore, isInputFinished: true }));
      // Decide where to go next, e.g., to the QCM quiz or a score screen
      navigateToQcm();
    }
  }, [inputState, navigateToQcm]);


  // 9. Add new state and functions to the context value
  const contextValue: AppContextType = {
    currentScreen,
    navigateToMenu,
    navigateToQcm,
    navigateToAudioScreen,
    navigateToInputScreen, // new
    navigateToScoreScreen,
    quizState,
    submitQcmAnswer,
    audioState,
    handleAudioSubmitted,
    inputState, // new
    submitInputAnswer, // new
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};