import type { TextInputApiResponse, AudioApiResponse } from '@/interface/ApiResponse';

const MONGO_API_BASE_URL = 'http://localhost:8080/api';
const TEXT_EVALUATION_API_URL = 'http://localhost:5000/evaluate_answer';
const AUDIO_EVALUATION_API_URL = 'http://localhost:5002/evaluate'; // Corrected to match your context

/**
 * Fetches all initial question data from the MongoDB backend.
 */
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

/**
 * Submits a text answer for evaluation.
 */
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

/**
 * Submits an audio recording for evaluation.
 */
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

/**
 * Helper to parse the score from the audio API response.
 */
export const parseAudioScore = (scoreValue: number): number => {
  if (typeof scoreValue === 'number' && !isNaN(scoreValue)) {
    return scoreValue;
  }
  return 0;
};

/**
 * Helper to parse the accuracy score from the audio API response.
 */
export const parseAccuracyScore = (accuracy: string | number): number => {
    if (typeof accuracy === 'number') {
        return accuracy;
    }
    const match = accuracy.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[0]) : 0;
}