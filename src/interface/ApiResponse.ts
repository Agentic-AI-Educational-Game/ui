// src/interface/ApiResponse.ts
export interface TextInputApiResponse {
  _id: string;
  text: string;
  question: string;
  student_answer: string;
  final_score: number;
  feedback: string;
  timestamp: string | null;
}

export interface AudioApiResponse {
  accuracy: string;
  speed: string;
  fluency: string;
  pron_feedback: string;
  score: string;
  transcript: string;
}