/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TextInputApiResponse, AudioApiResponse } from '@/interface/ApiResponse';
import type { User } from '@/context/AuthContext';
import type { FinalResults } from '@/context/QuizContext';

const MONGO_API_BASE_URL = 'http://192.168.0.107:8080/api';
const TEXT_EVALUATION_API_URL = 'http://192.168.0.107:5000/evaluate_answer';
const AUDIO_EVALUATION_API_URL = 'http://192.168.0.107:5002/evaluate';

// --- NEW AUTH AND USER FUNCTIONS ---

export const loginUser = async (credentials: any): Promise<User> => {
  const response = await fetch(`${MONGO_API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }
  return response.json();
};

export const registerUser = async (userData: any): Promise<User> => {
  const response = await fetch(`${MONGO_API_BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Registration failed');
  }
  return response.json();
};

export const fetchAllStudents = async (): Promise<User[]> => {
    const response = await fetch(`${MONGO_API_BASE_URL}/students`);
    if(!response.ok) {
        throw new Error('Could not fetch student list.');
    }
    return response.json();
}

export const updateStudentScore = async (userId: string, finalResults: FinalResults): Promise<void> => {
    const response = await fetch(`${MONGO_API_BASE_URL}/students/${userId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalResults }),
    });
    if (!response.ok) {
        throw new Error('Failed to update score.');
    }
}


// --- EXISTING GAME DATA FUNCTIONS ---

export const fetchInitialGameData = async () => {
  const [qcmResponse, inputResponse, audioResponse] = await Promise.all([
    fetch(`${MONGO_API_BASE_URL}/qcm-questions`),
    fetch(`${MONGO_API_BASE_URL}/input-questions`),
    fetch(`${MONGO_API_BASE_URL}/audio-questions`),
  ]);

  if (!qcmResponse.ok || !inputResponse.ok || !audioResponse.ok) {
    throw new Error('Failed to fetch initial game data from the server.');
  }

  return {
    qcmData: await qcmResponse.json(),
    inputData: await inputResponse.json(),
    audioData: await audioResponse.json(),
  };
};

export const submitTextAnswerForEvaluation = async (body: {
  text_input: string;
  question_input: string;
  student_answer_input: string;
}): Promise<TextInputApiResponse> => {
  console.log("Submitting to TEXT Evaluation API (non-blocking)...", body);
  try {
    const response = await fetch(TEXT_EVALUATION_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`Text Evaluation API responded with status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error submitting to Text Evaluation API:", error);
    return { _id: "error", text: body.text_input, question: body.question_input, student_answer: body.student_answer_input, final_score: 0, feedback: "Could not evaluate answer.", timestamp: new Date().toISOString() };
  }
};

export const submitAudioForEvaluation = async (formData: FormData): Promise<AudioApiResponse> => {
  console.log("Submitting to AUDIO Evaluation API (non-blocking)...");
  try {
    const response = await fetch(AUDIO_EVALUATION_API_URL, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`Audio Evaluation API responded with status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error submitting to Audio Evaluation API:", error);
    return { accuracy: "0%", speed: "0 WPM", fluency: "error", pron_feedback: "Could not evaluate audio.", score: 0, transcript: "Error in processing." };
  }
};

export const parseAudioScore = (scoreValue: number): number => {
  if (typeof scoreValue === 'number' && !isNaN(scoreValue)) {
    return scoreValue;
  }
  return 0;
};

export const parseAccuracyScore = (accuracy: string | number): number => {
    if (typeof accuracy === 'number') {
        return accuracy;
    }
    const match = accuracy.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
};