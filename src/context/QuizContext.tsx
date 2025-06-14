/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState, useCallback, type ReactNode, useRef, useMemo } from 'react';
import { useData } from './DataContext';
import { useAuth } from './AuthContext'; // Import useAuth
import { submitTextAnswerForEvaluation, submitAudioForEvaluation, parseAudioScore, parseAccuracyScore } from '@/services/api';
import type QuestionQcm from '@/interface/QuestionQcm';
import type AudioQuestion from '@/interface/AudioQuestion';
import type InputQuestion from '@/interface/InputQuestion';

// State and Result Interfaces
interface QuizState { qcmQuestions: QuestionQcm[]; currentQuestionIndex: number; score: number; currentQuestion: QuestionQcm | undefined; isQuizFinished: boolean; totalQuestions: number; }
interface InputState { inputQuestions: InputQuestion[]; currentQuestionIndex: number; currentQuestion: InputQuestion | undefined; isInputFinished: boolean; totalQuestions: number; }
interface AudioState { audioQuestions: AudioQuestion[]; currentQuestionIndex: number; currentQuestion: AudioQuestion | undefined; isAudioFinished: boolean; totalQuestions: number; }
export interface FinalResults { qcmScoreTotal: number; textScoreTotal: number; audioPronunciationTotal: number; audioAccuracyTotal: number; finalAverageScore: number; }interface QuizContextType {
  quizState: QuizState;
  inputState: InputState;
  audioState: AudioState;
  finalResults: FinalResults | null;
  pronunciationFeedback: string[]; // --- NEW: To store feedback strings ---
  totalProgress: number;
  resetAndInitializeGame: () => void;
  submitQcmAnswer: (selectedChoiceKey: string, onComplete: () => void) => void;
  submitInputAnswer: (userAnswer: string, onComplete: () => void) => void;
  handleAudioSubmitted: (audioBlob: Blob, onComplete: (promises: Promise<any>[]) => void) => void;
  calculateFinalScores: (promises: Promise<any>[], onComplete: () => void) => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

const initialQuizState: QuizState = { qcmQuestions: [], currentQuestionIndex: 0, score: 0, currentQuestion: undefined, isQuizFinished: false, totalQuestions: 0 };
const initialInputState: InputState = { inputQuestions: [], currentQuestionIndex: 0, currentQuestion: undefined, isInputFinished: false, totalQuestions: 0 };
const initialAudioState: AudioState = { audioQuestions: [], currentQuestionIndex: 0, currentQuestion: undefined, isAudioFinished: false, totalQuestions: 0 };

export const QuizProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { qcmQuestions, inputQuestions, audioQuestions } = useData();
  const { currentUser, updateScore } = useAuth();

  const [quizState, setQuizState] = useState<QuizState>(initialQuizState);
  const [inputState, setInputState] = useState<InputState>(initialInputState);
  const [audioState, setAudioState] = useState<AudioState>(initialAudioState);
  const [finalResults, setFinalResults] = useState<FinalResults | null>(null);
  const [pronunciationFeedback, setPronunciationFeedback] = useState<string[]>([]); // --- NEW: State for feedback ---

  const apiPromisesRef = useRef<Promise<any>[]>([]);

  const resetAndInitializeGame = useCallback(() => {
    apiPromisesRef.current = [];
    setFinalResults(null);
    setPronunciationFeedback([]); 
    setQuizState({ qcmQuestions, currentQuestionIndex: 0, score: 0, currentQuestion: qcmQuestions.length > 0 ? qcmQuestions[0] : undefined, isQuizFinished: false, totalQuestions: qcmQuestions.length });
    setInputState({ inputQuestions, currentQuestionIndex: 0, currentQuestion: inputQuestions.length > 0 ? inputQuestions[0] : undefined, isInputFinished: false, totalQuestions: inputQuestions.length });
    setAudioState({ audioQuestions, currentQuestionIndex: 0, currentQuestion: audioQuestions.length > 0 ? audioQuestions[0] : undefined, isAudioFinished: false, totalQuestions: audioQuestions.length });
  }, [qcmQuestions, inputQuestions, audioQuestions]);
  
  // --- NEW: Calculate total progress across all quiz sections ---
  const totalProgress = useMemo(() => {
    const totalQcm = quizState.totalQuestions;
    const totalInput = inputState.totalQuestions;
    const totalAudio = audioState.totalQuestions;

    const totalSteps = totalQcm + totalInput + totalAudio;
    if (totalSteps === 0) return 0;

    // Calculate completed steps based on which section the user is in
    const completedQcm = quizState.currentQuestionIndex;
    const completedInput = inputState.currentQuestionIndex;
    const completedAudio = audioState.currentQuestionIndex;
    
    // The total completed is the sum of all *previous* sections plus the progress in the *current* section.
    const completedSteps = completedQcm + completedInput + completedAudio;

    return (completedSteps / totalSteps) * 100;
  }, [quizState, inputState, audioState]);
  // --- END NEW ---

  const submitQcmAnswer = useCallback((selectedChoiceKey: string, onComplete: () => void) => {
    if (!quizState.currentQuestion) return;
    const isCorrect = selectedChoiceKey === quizState.currentQuestion.correct_option;
    const newScore = quizState.score + (isCorrect ? 1 : 0);
    // Move to next question or finish section
    if (quizState.currentQuestionIndex < qcmQuestions.length - 1) {
      setQuizState(prev => ({ ...prev, score: newScore, currentQuestionIndex: prev.currentQuestionIndex + 1, currentQuestion: qcmQuestions[prev.currentQuestionIndex + 1] }));
    } else {
      setQuizState(prev => ({ ...prev, score: newScore, isQuizFinished: true, currentQuestionIndex: prev.currentQuestionIndex + 1 })); // Increment index one last time for progress
      onComplete();
    }
  }, [quizState, qcmQuestions]);
  
  const submitInputAnswer = useCallback((userAnswer: string, onComplete: () => void) => {
    const currentQuestion = inputState.currentQuestion;
    if (!currentQuestion) return;
    const requestBody = { text_input: currentQuestion.input_text, question_input: currentQuestion.question, student_answer_input: userAnswer };
    const textPromise = submitTextAnswerForEvaluation(requestBody).then(response => ({ type: 'text', score: response.final_score || 0 }));
    apiPromisesRef.current.push(textPromise);

    if (inputState.currentQuestionIndex < inputQuestions.length - 1) {
      setInputState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1, currentQuestion: inputQuestions[prev.currentQuestionIndex + 1] }));
    } else {
      setInputState(prev => ({ ...prev, isInputFinished: true, currentQuestionIndex: prev.currentQuestionIndex + 1 })); // Increment index one last time
      onComplete();
    }
  }, [inputState, inputQuestions]);

  const handleAudioSubmitted = useCallback((audioBlob: Blob, onComplete: (promises: Promise<any>[]) => void) => {
    const currentQuestion = audioState.currentQuestion;
    if (!currentQuestion) return;
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');
    formData.append('expected_text', currentQuestion.texte);
    
  const audioPromise = submitAudioForEvaluation(formData).then(response => ({
        type: 'audio',
        pronunciationScore: parseAudioScore(response.score),
        accuracyScore: parseAccuracyScore(response.accuracy),
        feedback: response.pron_feedback, // Capture the feedback string
    }));
    apiPromisesRef.current.push(audioPromise);

    if (audioState.currentQuestionIndex < audioQuestions.length - 1) {
        // This part is a bit different. Since handleAudioSubmitted is called *after* an answer,
        // we can advance the state immediately for the next question.
        setAudioState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1, currentQuestion: audioQuestions[prev.currentQuestionIndex + 1] }));
    } else {
        // If it's the last audio question, we call the onComplete to finalize.
        setAudioState(prev => ({ ...prev, isAudioFinished: true, currentQuestionIndex: prev.currentQuestionIndex + 1 })); // Final increment
        onComplete(apiPromisesRef.current);
    }
  }, [audioState, audioQuestions]);

  const calculateFinalScores = useCallback(async (promises: Promise<any>[], onComplete: () => void) => {
    console.log(`Awaiting ${promises.length} API responses...`);
    try {
        const results = await Promise.all(promises);
        let textScoreSum = 0;
        let audioPronunciationSum = 0;
        let audioAccuracySum = 0;
        const feedbackList: string[] = []; // --- NEW: Temporary list to gather feedback ---

        results.forEach(res => {
            if (res.type === 'text') { textScoreSum += res.score; } 
            else if (res.type === 'audio') {
                 const MAX_API_SCORE = 10;
                
                // 1. Clamp the score to ensure it's not negative or unexpectedly high.
                const clampedScore = Math.max(0, Math.min(res.pronunciationScore, MAX_API_SCORE));
                
                // 2. Normalize the score to a 0-100 scale.
                const scoreOutOf100 = (clampedScore / MAX_API_SCORE) * 100;
                
                audioPronunciationSum += scoreOutOf100;
                audioAccuracySum += res.accuracyScore;
                
                 if (res.feedback && res.feedback.trim() !== "") {
                    feedbackList.push(res.feedback);
                }
            }
        });
        setPronunciationFeedback(feedbackList);
        const textScoreTotal = inputQuestions.length > 0 ? textScoreSum / inputQuestions.length : 0;
        const audioPronunciationTotal = audioQuestions.length > 0 ? audioPronunciationSum / audioQuestions.length : 0;
        const audioAccuracyTotal = audioQuestions.length > 0 ? audioAccuracySum / audioQuestions.length : 0;
        const qcmScoreTotal = qcmQuestions.length > 0 ? (quizState.score / qcmQuestions.length) * 100 : 0;
        
        const finalAverageScore = (qcmScoreTotal + textScoreTotal + audioPronunciationTotal + audioAccuracyTotal) / 4;

        const finalResultsData: FinalResults = {
            qcmScoreTotal: Math.round(qcmScoreTotal),
            textScoreTotal: Math.round(textScoreTotal),
            audioPronunciationTotal: Math.round(audioPronunciationTotal),
            audioAccuracyTotal: Math.round(audioAccuracyTotal),
            finalAverageScore: Math.round(finalAverageScore),
        };

        setFinalResults(finalResultsData);
        
        if (currentUser && currentUser.role === 'student') {
            await updateScore(currentUser._id, finalResultsData);
            console.log('✅ Final score saved to database for user:', currentUser.username);
        }

    } catch (error) {
        console.error("An error occurred while processing API responses:", error);
        setFinalResults({ qcmScoreTotal: 0, textScoreTotal: 0, audioPronunciationTotal: 0, audioAccuracyTotal: 0, finalAverageScore: 0 });
    } finally {
        onComplete();
    }
  }, [quizState.score, inputQuestions.length, audioQuestions.length, qcmQuestions.length, currentUser, updateScore]);

 // Add `totalProgress` to the returned value
const value = { quizState, inputState, audioState, finalResults, pronunciationFeedback, totalProgress, resetAndInitializeGame, submitQcmAnswer, submitInputAnswer, handleAudioSubmitted, calculateFinalScores };
  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (!context) throw new Error('useQuiz must be used within a QuizProvider');
  return context;
};