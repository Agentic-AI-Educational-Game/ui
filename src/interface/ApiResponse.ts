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
  accuracy: string | number; // Can be "18.37" or "18.37%"
  speed: string;
  fluency: string;
  pron_feedback: string;
  score: number;
  transcript: string;
}