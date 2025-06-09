// src/context/AppContext.tsx
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
  useEffect, // FIX: Added missing useEffect import
} from 'react';
import allQuestionsData from '../../data/qcm.json';
import allAudioData from '../../data/audio_text.json';
import allInputData from '../../data/input.json';

import type QuestionQcm from '@/interface/QuestionQcm';
import type AudioQuestion from '@/interface/AudioQuestion';
import type InputQuestion from '@/interface/InputQuestion';
import type { TextInputApiResponse, AudioApiResponse } from '@/interface/ApiResponse';

export const SCREEN_TYPES = {
  MENU: 'menu',
  QCM: 'qcm',
  INPUT: 'input',
  AUDIO: 'audio',
  PROCESSING: 'processing',
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

// Helper Functions
const parseAudioScore = (scoreString: string): number => {
  const match = scoreString.match(/(\d+(\.\d+)?)/);
  return match ? parseFloat(match[0]) : 0;
};

// API Simulation Functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchTextApi = async (body: any): Promise<TextInputApiResponse> => {
  console.log("Submitting to TEXT API (non-blocking)...", body);
  return new Promise(resolve => {
    setTimeout(() => {
      const score = Math.floor(Math.random() * 21) + 80; // Random score 80-100
      const response: TextInputApiResponse = {
        _id: "text_resp_123",
        text: body.input_text,
        question: body.question,
        student_answer: body.student_answer,
        final_score: score,
        feedback: "Good job on this text!",
        timestamp: new Date().toISOString(),
      };
      console.log("TEXT API responded:", response);
      resolve(response);
    }, 2000 + Math.random() * 2000); // Simulate network delay
  });
// eslint-disable-next-line @typescript-eslint/no-unused-vars
};const fetchAudioApi = async (formData: FormData): Promise<AudioApiResponse> => {
    console.log("Submitting to AUDIO API (non-blocking)...");
    return new Promise(resolve => {
        setTimeout(() => {
            const scoreVal = (Math.random() * (5 - 3.5) + 3.5).toFixed(1); // Random score 3.5-5.0
            const response: AudioApiResponse = {
                accuracy: "98%",
                speed: "120 WPM",
                fluency: "good",
                pron_feedback: "Très bien joué ! Essaie de mieux articuler quelques mots.",
                score: `${scoreVal} / 5 stars`,
                transcript: "This is the transcribed text from the audio.",
            };
            console.log("AUDIO API responded:", response);
            resolve(response);
        }, 2000 + Math.random() * 2000); // Simulate network delay
    });
};
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>(SCREEN_TYPES.MENU);
  const [finalResults, setFinalResults] = useState<FinalResults | null>(null); // FIX: Removed unused-vars comment
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [apiPromises, setApiPromises] = useState<Promise<any>[]>([]);

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

  const resetAllQuizzes = useCallback(() => {
    setQuizState(initialQuizState);
    setInputState(initialInputState);
    setAudioState(initialAudioState);
    setApiPromises([]);
    setFinalResults(null);
  }, []);

  const navigateToMenu = useCallback(() => {
    resetAllQuizzes();
    setCurrentScreen(SCREEN_TYPES.MENU);
  }, [resetAllQuizzes]);

  const startGame = useCallback(() => {
    resetAllQuizzes();
    setCurrentScreen(SCREEN_TYPES.QCM);
  }, [resetAllQuizzes]);

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
  }, [quizState, navigateToInputScreen]);

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
      setInputState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1, currentQuestion: inputQuestions[prev.currentQuestionIndex + 1] }));
    } else {
      setInputState(prev => ({ ...prev, isInputFinished: true }));
      navigateToAudioScreen();
    }
  }, [inputState, navigateToAudioScreen]);

  const handleAudioSubmitted = useCallback(async (audioBlob: Blob) => {
    if (!audioState.currentQuestion) return;

    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');

    const audioPromise = fetchAudioApi(formData)
        .then(response => ({ type: 'audio', score: parseAudioScore(response.score) }));
    
    setApiPromises(prev => [...prev, audioPromise]);

    if (audioState.currentQuestionIndex < audioQuestions.length - 1) {
      setAudioState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1, currentQuestion: audioQuestions[prev.currentQuestionIndex + 1] }));
    } else {
      setAudioState(prev => ({ ...prev, isAudioFinished: true }));
      setCurrentScreen(SCREEN_TYPES.PROCESSING);
    }
  }, [audioState, apiPromises]); // FIX: Corrected dependencies

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
  }, [currentScreen, apiPromises, quizState.score, navigateToScoreScreen]);

  // FIX: The contextValue object MUST be populated with all the state and functions.
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

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};