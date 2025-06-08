// src/components/AudioRecorder.tsx
import React, { useState, useRef, useEffect } from 'react';
import audioBufferToWav from 'audiobuffer-to-wav';
import { motion } from 'framer-motion';

// Import your image paths (make sure they are in the /public folder)
import micIcon from '/assets/microphone.png';
import activeMicIcon from '/assets/active_microphone.png';

interface AudioRecorderProps {
  onRecordingComplete: (wavBlob: Blob) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
    } else {
      setError(null);
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Your browser does not support audio recording.');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
          setIsRecording(false);
          const rawAudioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

          if (audioContextRef.current) {
            try {
              const arrayBuffer = await rawAudioBlob.arrayBuffer();
              const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
              const wavArrayBuffer = audioBufferToWav(audioBuffer);
              const wavBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' });
              onRecordingComplete(wavBlob);
            } catch (e) {
              console.error("Error converting to WAV:", e);
              onRecordingComplete(rawAudioBlob);
            }
          } else {
            onRecordingComplete(rawAudioBlob);
          }
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        if (err instanceof Error && (err.name === "NotAllowedError" || err.name === "PermissionDeniedError")) {
          setError("Please allow microphone access to play!");
        } else {
          setError("Could not access the microphone.");
        }
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="p-4 rounded-lg flex flex-col items-center gap-4">
      {error && <p className="text-red-500 font-bold bg-red-100 p-3 rounded-xl w-full text-center">{error}</p>}
      
      <motion.button
        onClick={toggleRecording}
        className="p-0 bg-transparent border-none rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-pink-400"
        aria-label={isRecording ? "Stop recording" : "Start recording"}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <img
          src={isRecording ? activeMicIcon : micIcon}
          alt={isRecording ? "Active Microphone" : "Microphone"}
          className="w-32 h-32 md:w-36 md:h-36 drop-shadow-xl" // Increased size
        />
      </motion.button>

      {isRecording && (
        <motion.p 
          className="font-bold text-2xl text-pink-600"
          style={{ fontFamily: "'Fredoka One', cursive" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          Recording...
        </motion.p>
      )}
    </div>
  );
};