// src/interface/QuestionQcm.ts

export default interface QuestionQcm {
  _id: number;
  question: string;
  correct_option: string; // Changed from 'correct'
  source_text: string;
  created_at: string;

  // This is an index signature. It tells TypeScript that this object
  // can have any number of other properties where the key is a string.
  // This is how we handle flexible keys like "option A", "option B", "option_C"
  // without having to list every single possibility.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}