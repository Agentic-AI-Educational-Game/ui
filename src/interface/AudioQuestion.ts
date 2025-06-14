// src/interface/AudioQuestion.ts
export default interface AudioQuestion {
  _id: string; // assuming ObjectId is stringified in the API response
  texte: string;
  niveau?: string;
  difficulty?: string;
  timestamp?: number; 
}