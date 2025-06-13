// src/screens/AudioScreen.tsx
import React, { useState } from 'react';
import { AudioRecorder } from '../components/AudioRecorder';
import { Button } from '@/components/ui/button';
import type AudioQuestion from '../interface/AudioQuestion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Badge } from "@/components/ui/badge"

interface AudioScreenProps {
  question: AudioQuestion;
  onRecordingSubmitted: (audioBlob: Blob) => void;
  onNavigateBack: () => void;
}

export const AudioScreen: React.FC<AudioScreenProps> = ({
  question,
  onRecordingSubmitted,
  onNavigateBack,
}) => {
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRecordingComplete = (wavBlob: Blob) => {
    setRecordedAudio(wavBlob);
    setIsSubmitted(false);
  };

  const handleSubmitRecording = () => {
    if (recordedAudio) {
      onRecordingSubmitted(recordedAudio);
      setIsSubmitted(true);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="w-full max-w-lg bg-purple-100/80 backdrop-blur-sm border-4 border-purple-400 shadow-2xl rounded-3xl p-2 sm:p-4">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-bold text-purple-800" style={{ fontFamily: "'Fredoka One', cursive" }}>
            Let's Read Aloud!
            <br />
            {/* FIX: Use `niveau` as defined in your AudioQuestion interface */}
            <Badge>{question.niveau}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white/80 p-5 rounded-2xl shadow-inner max-h-48 overflow-y-auto">
            {/* FIX: Use `texte` as defined in your AudioQuestion interface */}
            <p className="text-xl text-center font-semibold text-slate-800 leading-relaxed">{question.texte}</p>
          </div>
          
          <AudioRecorder onRecordingComplete={handleRecordingComplete} />
          
          {recordedAudio && (
            <div className="text-center">
              <Button
                onClick={handleSubmitRecording}
                size="lg"
                className="h-16 text-2xl font-bold rounded-2xl border-b-8 transition-all duration-100 active:border-b-2 active:mt-2 bg-pink-400 border-pink-600 text-white hover:bg-pink-300 disabled:bg-slate-300 disabled:text-slate-500 disabled:border-slate-400"
                disabled={isSubmitted}
              >
                {isSubmitted ? 'Sent! 👍' : 'All Done! 🎉'}
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center pt-4">
            <Button onClick={onNavigateBack} variant="link" className="text-purple-600 font-semibold">
                Back to Menu
            </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};