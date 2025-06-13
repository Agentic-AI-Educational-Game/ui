/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

interface RegisterScreenProps {
  switchToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ switchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await register({ username, password, role });
      // On successful registration, AppFlowManager will handle the redirect.
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try another username.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="w-full max-w-sm bg-white/90 backdrop-blur-sm border-2 border-gray-200 shadow-xl rounded-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
            Create Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg text-sm">{error}</p>}
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="h-12 text-lg"
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 text-lg"
            />
            <div className="flex gap-4">
                <Button type="button" onClick={() => setRole('student')} className={`flex-1 h-12 text-lg ${role === 'student' ? 'bg-blue-600' : 'bg-gray-400'}`}>I am a Student</Button>
                <Button type="button" onClick={() => setRole('teacher')} className={`flex-1 h-12 text-lg ${role === 'teacher' ? 'bg-green-600' : 'bg-gray-400'}`}>I am a Teacher</Button>
            </div>
            <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Register'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={switchToLogin}>
            Already have an account? Log in
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};