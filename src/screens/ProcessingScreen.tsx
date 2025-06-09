// src/screens/ProcessingScreen.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ProcessingScreen: React.FC = () => {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
      <Card className="w-full max-w-md text-center bg-sky-100/90 backdrop-blur-sm border-4 border-sky-400 shadow-2xl rounded-3xl p-8">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-sky-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
            Calculating Your Score...
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-6">
          <motion.div
            className="w-20 h-20 border-8 border-t-sky-500 border-sky-200 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-lg text-sky-700 font-semibold">
            Just a moment while we gather your results!
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};