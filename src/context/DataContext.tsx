/* eslint-disable @typescript-eslint/no-explicit-any */
// src/context/DataContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { fetchInitialGameData } from '@/services/api';
import type QuestionQcm from '@/interface/QuestionQcm';
import type AudioQuestion from '@/interface/AudioQuestion';
import type InputQuestion from '@/interface/InputQuestion';

interface DataContextType {
  qcmQuestions: QuestionQcm[];
  inputQuestions: InputQuestion[];
  audioQuestions: AudioQuestion[];
  isLoading: boolean;
  error: Error | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [qcmQuestions, setQcmQuestions] = useState<QuestionQcm[]>([]);
  const [inputQuestions, setInputQuestions] = useState<InputQuestion[]>([]);
  const [audioQuestions, setAudioQuestions] = useState<AudioQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadGameData = async () => {
      try {
        const { qcmData, inputData, audioData } = await fetchInitialGameData();
        setQcmQuestions(qcmData);
        setInputQuestions(inputData);
        setAudioQuestions(audioData);
      } catch (err: any) {
        console.error("❌ Failed to load game data:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadGameData();
  }, []);

  return (
    <DataContext.Provider value={{ qcmQuestions, inputQuestions, audioQuestions, isLoading, error }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};