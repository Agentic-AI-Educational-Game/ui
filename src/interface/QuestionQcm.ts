export default interface QuestionQcm {
  question: string;
  choices: { [key: string]: string }; // e.g., { "A": "Choice A", "B": "Choice B" }
  correct: string; // The key of the correct choice (e.g., "B")
}