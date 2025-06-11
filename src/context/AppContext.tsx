/* eslint-disable @typescript-eslint/no-explicit-any */

// src/context/AppContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
  useEffect,
} from 'react';

// Interfaces
import type QuestionQcm from '@/interface/QuestionQcm';
import type AudioQuestion from '@/interface/AudioQuestion';
import type InputQuestion from '@/interface/InputQuestion';
import type { TextInputApiResponse } from '@/interface/ApiResponse';

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
const MONGO_API_BASE_URL = 'http://192.168.3.161:8080/api'; // For fetching questions
const EVALUATION_API_URL = 'http://192.168.3.161:5000/evaluate_answer'; // For submitting answers

// State and Result Interfaces
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
export interface FinalResults {
  qcmScoreTotal: number;
  textScoreTotal: number;
  // Audio score is now removed from the final results
  finalAverageScore: number;
}
interface AppContextType {
  currentScreen: ScreenType;
  finalResults: FinalResults | null;
  navigateToMenu: () => void;
  startGame: () => void;
  quizState: QuizState;
  submitQcmAnswer: (selectedChoiceKey: string) => void;
  inputState: InputState;
  submitInputAnswer: (userAnswer: string) => void;
  audioState: AudioState;
  handleAudioSubmitted: (audioBlob: Blob) => void;
}

// --- UPDATED API FUNCTION ---
// This now makes a real POST request to your Python/Flask server
const fetchTextApi = async (body: {
  text_input: string;
  question_input: string;
  student_answer_input: string;
}): Promise<TextInputApiResponse> => {
  console.log("Submitting to Evaluation API (non-blocking)...", body);
  try {
    const response = await fetch(EVALUATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Handle server errors (e.g., 500 Internal Server Error)
      throw new Error(`Evaluation API responded with status: ${response.status}`);
    }

    const data: TextInputApiResponse = await response.json();
    console.log("Evaluation API responded:", data);
    return data;

  } catch (error) {
    console.error("Error submitting to Evaluation API:", error);
    // Return a default error response so the app doesn't crash
    return {
      _id: "error",
      text: body.text_input,
      question: body.question_input,
      student_answer: body.student_answer_input,
      final_score: 0, // Assign 0 score on error
      feedback: "Could not evaluate answer.",
      timestamp: new Date().toISOString(),
    };
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Define default/empty states for initialization
const initialQuizState: QuizState = { qcmQuestions: [], currentQuestionIndex: 0, score: 0, currentQuestion: undefined, isQuizFinished: false, totalQuestions: 0 };
const initialInputState: InputState = { inputQuestions: [], currentQuestionIndex: 0, currentQuestion: undefined, isInputFinished: false, totalQuestions: 0 };
const initialAudioState: AudioState = { audioQuestions: [], currentQuestionIndex: 0, currentQuestion: undefined, isAudioFinished: false, totalQuestions: 0 };

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(SCREEN_TYPES.LOADING);
  const [finalResults, setFinalResults] = useState<FinalResults | null>(null);
  const [apiPromises, setApiPromises] = useState<Promise<any>[]>([]);
  const [qcmQuestions, setQcmQuestions] = useState<QuestionQcm[]>([]);
  const [inputQuestions, setInputQuestions] = useState<InputQuestion[]>([]);
  const [audioQuestions, setAudioQuestions] = useState<AudioQuestion[]>([]);
  const [quizState, setQuizState] = useState<QuizState>(initialQuizState);
  const [inputState, setInputState] = useState<InputState>(initialInputState);
  const [audioState, setAudioState] = useState<AudioState>(initialAudioState);
  
  useEffect(() => {
    const loadGameData = async () => {
      setCurrentScreen(SCREEN_TYPES.LOADING);
      try {
        const [qcmResponse, inputResponse, audioResponse] = await Promise.all([
          fetch(`${MONGO_API_BASE_URL}/qcm-questions`),
          fetch(`${MONGO_API_BASE_URL}/input-questions`),
          fetch(`${MONGO_API_BASE_URL}/audio-questions`)
        ]);

        if (!qcmResponse.ok || !inputResponse.ok || !audioResponse.ok) {
          throw new Error('One or more network responses were not ok');
        }

        const qcmData: QuestionQcm[] = await qcmResponse.json();
        const inputData: InputQuestion[] = await inputResponse.json();
        const audioData: AudioQuestion[] = await audioResponse.json();

        setQcmQuestions(qcmData);
        setInputQuestions(inputData);
        setAudioQuestions(audioData);

        setCurrentScreen(SCREEN_TYPES.MENU);
      } catch (error) {
        console.error("❌ Failed to load game data:", error);
        setCurrentScreen(SCREEN_TYPES.ERROR);
      }
    };
    loadGameData();
  }, []);

  const resetAndInitializeGame = useCallback(() => {
    setApiPromises([]);
    setFinalResults(null);
    setQuizState({ qcmQuestions, currentQuestionIndex: 0, score: 0, currentQuestion: qcmQuestions[0], isQuizFinished: false, totalQuestions: qcmQuestions.length });
    setInputState({ inputQuestions, currentQuestionIndex: 0, currentQuestion: inputQuestions[0], isInputFinished: false, totalQuestions: inputQuestions.length });
    setAudioState({ audioQuestions, currentQuestionIndex: 0, currentQuestion: audioQuestions[0], isAudioFinished: false, totalQuestions: audioQuestions.length });
  }, [qcmQuestions, inputQuestions, audioQuestions]);

  const navigateToMenu = useCallback(() => { resetAndInitializeGame(); setCurrentScreen(SCREEN_TYPES.MENU); }, [resetAndInitializeGame]);
  const startGame = useCallback(() => { resetAndInitializeGame(); setCurrentScreen(SCREEN_TYPES.QCM); }, [resetAndInitializeGame]);
  const navigateToInputScreen = useCallback(() => setCurrentScreen(SCREEN_TYPES.INPUT), []);
  const navigateToAudioScreen = useCallback(() => setCurrentScreen(SCREEN_TYPES.AUDIO), []);
  const navigateToScoreScreen = useCallback(() => setCurrentScreen(SCREEN_TYPES.SCORE), []);

  const submitQcmAnswer = useCallback((selectedChoiceKey: string) => {
    if (!quizState.currentQuestion) return;
    const isCorrect = selectedChoiceKey === quizState.currentQuestion.correct_option;
    const newScore = quizState.score + (isCorrect ? 1 : 0);
    if (quizState.currentQuestionIndex < qcmQuestions.length - 1) {
      setQuizState(prev => ({ ...prev, score: newScore, currentQuestionIndex: prev.currentQuestionIndex + 1, currentQuestion: qcmQuestions[prev.currentQuestionIndex + 1] }));
    } else {
      setQuizState(prev => ({ ...prev, score: newScore, isQuizFinished: true }));
      navigateToInputScreen();
    }
  }, [quizState, navigateToInputScreen, qcmQuestions]);

  const submitInputAnswer = useCallback((userAnswer: string) => {
    const currentQuestion = inputState.currentQuestion;
    if (!currentQuestion) return;
    // Create the body in the new required format
    const requestBody = {
      text_input: currentQuestion.input_text,
      question_input: currentQuestion.question,
      student_answer_input: userAnswer,
    };
    // Call the updated fetchTextApi function
    const textPromise = fetchTextApi(requestBody)
      .then(response => ({ type: 'text', score: response.final_score || 0 })); // Use 0 if final_score is null

    setApiPromises(prev => [...prev, textPromise]);
    if (inputState.currentQuestionIndex < inputQuestions.length - 1) {
      setInputState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1, currentQuestion: inputQuestions[prev.currentQuestionIndex + 1] }));
    } else {
      setInputState(prev => ({ ...prev, isInputFinished: true }));
      navigateToAudioScreen();
    }
  }, [inputState, navigateToAudioScreen, inputQuestions]);

  // --- UPDATED AUDIO SUBMISSION ---
  const handleAudioSubmitted = useCallback(async (audioBlob: Blob) => {
    console.log("Audio submission skipped (under development). Blob size:", audioBlob.size);
    // Don't make an API call. Just proceed to the next step.
    if (audioState.currentQuestionIndex < audioQuestions.length - 1) {
      setAudioState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        currentQuestion: audioQuestions[prev.currentQuestionIndex + 1],
      }));
    } else {
      setAudioState(prev => ({ ...prev, isAudioFinished: true }));
      // Since this is the last step, go to processing.
      setCurrentScreen(SCREEN_TYPES.PROCESSING);
    }
  }, [audioState, audioQuestions]);

  // --- UPDATED SCORE CALCULATION ---
  useEffect(() => {
    if (currentScreen === SCREEN_TYPES.PROCESSING) {
      const calculateFinalScores = async () => {
        console.log(`Awaiting ${apiPromises.length} API responses...`);
        try {
            const results = await Promise.all(apiPromises);
            let textScoreSum = 0;
            
            // Only process text scores
            results.forEach(res => {
                if (res.type === 'text') {
                    textScoreSum += res.score;
                }
            });

            const textScoreTotal = inputQuestions.length > 0 ? textScoreSum / inputQuestions.length : 0;
            const qcmScoreTotal = qcmQuestions.length > 0 ? (quizState.score / qcmQuestions.length) * 100 : 0;
            
            // Average is now only between QCM and Text
            const finalAverageScore = (qcmScoreTotal + textScoreTotal) / 2;

            setFinalResults({
                qcmScoreTotal: Math.round(qcmScoreTotal),
                textScoreTotal: Math.round(textScoreTotal),
                finalAverageScore: Math.round(finalAverageScore)
            });
        } catch (error) {
            console.error("An error occurred while processing API responses:", error);
            setFinalResults({ qcmScoreTotal: 0, textScoreTotal: 0,  finalAverageScore: 0 });
        } finally {
            navigateToScoreScreen();
        }
      };
      calculateFinalScores();
    }
  }, [currentScreen, apiPromises, quizState.score, navigateToScoreScreen, inputQuestions.length, qcmQuestions.length]);

  const contextValue: AppContextType = {
    currentScreen,
    finalResults,
    navigateToMenu,
    startGame,
    quizState,
    submitQcmAnswer,
    inputState,
    submitInputAnswer,
    audioState,
    handleAudioSubmitted,
  };

  if (currentScreen === SCREEN_TYPES.LOADING) {
    return <div className="flex items-center justify-center h-screen text-white text-2xl font-bold">Loading Game...</div>;
  }
  
  if (currentScreen === SCREEN_TYPES.ERROR) {
    return <div className="flex items-center justify-center h-screen text-red-500 text-2xl font-bold">Failed to load game data. Please try again later.</div>;
  }

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