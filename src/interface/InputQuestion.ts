// src/interface/InputQuestion.ts
export default interface InputQuestion {
  _id: string;
  input_text: string; // The text to be processed by the API
  question: string; // The question to show the user
  timestamp: string | null;
}