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
import type AudioQuestion from '@/interface/AudioQuestion'; // This now imports the updated interface
import type InputQuestion from '@/interface/InputQuestion';
import type { TextInputApiResponse, AudioApiResponse } from '@/interface/ApiResponse';

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
const API_BASE_URL = 'http://192.168.1.122:8080/api';

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
  audioScoreTotal: number;
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

// Helper and API Simulation Functions
const parseAudioScore = (scoreString: string): number => {
  const match = scoreString.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : 0;
};
const fetchTextApi = async (body: any): Promise<TextInputApiResponse> => {
  console.log("Submitting to TEXT API (non-blocking)...", body);
  return new Promise(resolve => {
    setTimeout(() => {
      const score = Math.floor(Math.random() * 21) + 80;
      const response: TextInputApiResponse = { _id: "text_resp_123", text: body.input_text, question: body.question, student_answer: body.student_answer, final_score: score, feedback: "Good job on this text!", timestamp: new Date().toISOString(), };
      resolve(response);
    }, 1500 + Math.random() * 1500);
  });
};
const fetchAudioApi = async (formData: FormData): Promise<AudioApiResponse> => {
    console.log("Submitting to AUDIO API (non-blocking)...", formData);
    return new Promise(resolve => {
        setTimeout(() => {
            const scoreVal = (Math.random() * (5 - 3.5) + 3.5).toFixed(1);
            const response: AudioApiResponse = { accuracy: "98%", speed: "120 WPM", fluency: "good", pron_feedback: "Très bien joué ! Essaie de mieux articuler quelques mots.", score: `${scoreVal} / 5 stars`, transcript: "This is the transcribed text from the audio.", };
            resolve(response);
        }, 1500 + Math.random() * 1500);
    });
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
          fetch(`${API_BASE_URL}/qcm-questions`),
          fetch(`${API_BASE_URL}/input-questions`),
          fetch(`${API_BASE_URL}/audio-questions`)
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
        console.log("✅ Game data loaded successfully!");
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

    // IMPROVEMENT: Add checks to prevent crash if API returns empty arrays
    setQuizState({
      qcmQuestions: qcmQuestions,
      currentQuestionIndex: 0,
      score: 0,
      currentQuestion: qcmQuestions.length > 0 ? qcmQuestions[0] : undefined,
      isQuizFinished: false,
      totalQuestions: qcmQuestions.length,
    });
    setInputState({
      inputQuestions: inputQuestions,
      currentQuestionIndex: 0,
      currentQuestion: inputQuestions.length > 0 ? inputQuestions[0] : undefined,
      isInputFinished: false,
      totalQuestions: inputQuestions.length,
    });
    setAudioState({
      audioQuestions: audioQuestions,
      currentQuestionIndex: 0,
      currentQuestion: audioQuestions.length > 0 ? audioQuestions[0] : undefined,
      isAudioFinished: false,
      totalQuestions: audioQuestions.length,
    });
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
      setQuizState(prev => ({
        ...prev,
        score: newScore,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        currentQuestion: qcmQuestions[prev.currentQuestionIndex + 1],
      }));
    } else {
      setQuizState(prev => ({ ...prev, score: newScore, isQuizFinished: true }));
      navigateToInputScreen();
    }
  }, [quizState, navigateToInputScreen, qcmQuestions]);

  const submitInputAnswer = useCallback((userAnswer: string) => {
    const currentQuestion = inputState.currentQuestion;
    if (!currentQuestion) return;
    const textPromise = fetchTextApi({
      input_text: currentQuestion.input_text,
      question: currentQuestion.question,
      student_answer: userAnswer,
    }).then(response => ({ type: 'text', score: response.final_score }));

    setApiPromises(prev => [...prev, textPromise]);

    if (inputState.currentQuestionIndex < inputQuestions.length - 1) {
      setInputState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        currentQuestion: inputQuestions[prev.currentQuestionIndex + 1],
      }));
    } else {
      setInputState(prev => ({ ...prev, isInputFinished: true }));
      navigateToAudioScreen();
    }
  }, [inputState, navigateToAudioScreen, inputQuestions]);

  const handleAudioSubmitted = useCallback(async (audioBlob: Blob) => {
    if (!audioState.currentQuestion) return;
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');

    const audioPromise = fetchAudioApi(formData)
        .then(response => ({ type: 'audio', score: parseAudioScore(response.score) }));
    
    setApiPromises(prev => [...prev, audioPromise]);

    if (audioState.currentQuestionIndex < audioQuestions.length - 1) {
      setAudioState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        currentQuestion: audioQuestions[prev.currentQuestionIndex + 1],
      }));
    } else {
      setAudioState(prev => ({ ...prev, isAudioFinished: true }));
      setCurrentScreen(SCREEN_TYPES.PROCESSING);
    }
  }, [audioState, audioQuestions]);

  useEffect(() => {
    if (currentScreen === SCREEN_TYPES.PROCESSING) {
      const calculateFinalScores = async () => {
        console.log(`Awaiting ${apiPromises.length} API responses...`);
        try {
            const results = await Promise.all(apiPromises);
            let textScoreSum = 0;
            let audioScoreSum = 0;
            
            results.forEach(res => {
                if (res.type === 'text') {
                    textScoreSum += res.score;
                } else if (res.type === 'audio') {
                    audioScoreSum += (res.score / 5) * 100;
                }
            });

            const textScoreTotal = inputQuestions.length > 0 ? textScoreSum / inputQuestions.length : 0;
            const audioScoreTotal = audioQuestions.length > 0 ? audioScoreSum / audioQuestions.length : 0;
            const qcmScoreTotal = qcmQuestions.length > 0 ? (quizState.score / qcmQuestions.length) * 100 : 0;
            
            const finalAverageScore = (qcmScoreTotal + textScoreTotal + audioScoreTotal) / 3;

            setFinalResults({
                qcmScoreTotal: Math.round(qcmScoreTotal),
                textScoreTotal: Math.round(textScoreTotal),
                audioScoreTotal: Math.round(audioScoreTotal),
                finalAverageScore: Math.round(finalAverageScore),
            });
        } catch (error) {
            console.error("An error occurred while processing API responses:", error);
            setFinalResults({ qcmScoreTotal: 0, textScoreTotal: 0, audioScoreTotal: 0, finalAverageScore: 0 });
        } finally {
            navigateToScoreScreen();
        }
      };
      calculateFinalScores();
    }
  }, [currentScreen, apiPromises, quizState.score, navigateToScoreScreen, inputQuestions.length, audioQuestions.length, qcmQuestions.length]);

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