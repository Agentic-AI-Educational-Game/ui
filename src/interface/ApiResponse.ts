// src/interface/ApiResponse.ts

export interface TextInputApiResponse {
  _id: string;
  text: string;
  question: string;
  student_answer: string;
  final_score: number; // The score we need
  feedback: string;
  timestamp: string | null;
}

export interface AudioApiResponse {
  accuracy: string;
  speed: string;
  fluency: string;
  pron_feedback: string;
  score: string; // e.g., "4.5 / 5 stars"
  transcript: string;
}