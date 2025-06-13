/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState, type ReactNode } from 'react';
import { loginUser, registerUser, updateStudentScore } from '@/services/api';
import type { FinalResults } from './QuizContext';

// Define the User type based on what the backend returns
export interface User {
  _id: string;
  username: string;
  role: 'student' | 'teacher';
  score: FinalResults | null;
  status: 'Not Started' | 'Completed' | 'In Progress';
}

interface AuthContextType {
  currentUser: User | null;
  login: (credentials: any) => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => void;
  updateScore: (userId: string, results: FinalResults) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const login = async (credentials: any) => {
    const user = await loginUser(credentials);
    setCurrentUser(user);
    return user;
  };

  const register = async (userData: any) => {
    const user = await registerUser(userData);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
  };
  
  const updateScore = async (userId: string, results: FinalResults) => {
      await updateStudentScore(userId, results);
      // Optionally refresh user data after score update
      if(currentUser) {
          setCurrentUser(prev => prev ? {...prev, score: results, status: 'Completed'} : null);
      }
  }

  const value = { currentUser, login, register, logout, updateScore };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};