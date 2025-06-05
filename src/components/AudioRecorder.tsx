// src/components/AudioRecorder.tsx
import React, { useState, useRef, useEffect } from 'react';
import audioBufferToWav from 'audiobuffer-to-wav'; // For WAV conversion

// Import your image paths
// Vite will handle these imports correctly if images are in public folder
import micIcon from '/assets/microphone.png';
import activeMicIcon from '/assets/active_microphone.png';
// If your images are in src/assets, you'd import them differently and Vite/Webpack would bundle them:
// import micIcon from '../assets/microphone.png';
// import activeMicIcon from '../assets/active_microphone.png';


interface AudioRecorderProps {
  onRecordingComplete: (wavBlob: Blob) => void; // Callback with the WAV audio blob
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
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

  // --- Combined Start/Stop Logic ---
  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        // setIsRecording(false) will be handled in onstop or if stop is immediate
      }
    } else {
      // Start recording
      setError(null);
      setAudioBlob(null); // Clear previous blob if starting a new recording
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('getUserMedia not supported on your browser!');
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
          setIsRecording(false); // Set isRecording to false when MediaRecorder actually stops
          const rawAudioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });

          if (audioContextRef.current) {
            try {
              const arrayBuffer = await rawAudioBlob.arrayBuffer();
              const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
              const wavArrayBuffer = audioBufferToWav(audioBuffer);
              const wavBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' });
              setAudioBlob(wavBlob);
              onRecordingComplete(wavBlob);
            } catch (e) {
              console.error("Error converting to WAV:", e);
              setError("Failed to convert to WAV. Using original format.");
              setAudioBlob(rawAudioBlob);
              onRecordingComplete(rawAudioBlob);
            }
          } else {
            console.warn("AudioContext not available for WAV conversion.");
            setAudioBlob(rawAudioBlob);
            onRecordingComplete(rawAudioBlob);
          }
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
        if (err instanceof Error) {
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
            setError("Microphone access denied. Please allow microphone access in app settings.");
          } else {
            setError(`Error accessing microphone: ${err.message}`);
          }
        } else {
          setError("An unknown error occurred while accessing the microphone.");
        }
        setIsRecording(false); // Ensure isRecording is false if start fails
      }
    }
  };
  // --- End Combined Start/Stop Logic ---


  // No longer needed as separate functions
  // const startRecording = async () => { ... };
  // const stopRecording = () => { ... };

  // const handleDownload = () => {
  //   if (audioBlob) {
  //     const url = URL.createObjectURL(audioBlob);
  //     const a = document.createElement('a');
  //     document.body.appendChild(a);
  //     a.style.display = 'none';
  //     a.href = url;
  //     a.download = `recording.${audioBlob.type === 'audio/wav' ? 'wav' : 'webm'}`;
  //     a.click();
  //     window.URL.revokeObjectURL(url);
  //     a.remove();
  //   }
  // };

  return (
    <div className="p-4 rounded-lg   flex flex-col items-center">
      {/* Removed the h2 title to make the mic icon more prominent */}
      {/* <h2 className="text-xl font-semibold mb-4 text-sky-400">Record Audio</h2> */}

      {error && <p className="text-red-400 bg-red-900/60 p-3 rounded-md mb-4 text-sm w-full text-center">{error}</p>}

      {/* --- Microphone Image Button --- */}
      <button
        onClick={toggleRecording}
        className="p-0 bg-transparent border-none rounded-full focus:outline-none focus:ring-4 focus:ring-sky-500/50 hover:opacity-80 transition-opacity"
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        <img
          src={isRecording ? activeMicIcon : micIcon}
          alt={isRecording ? "Active Microphone" : "Microphone"}
          className="w-50 h-50 sm:w-24 sm:h-24 md:w-28 md:h-28" // Adjust size as needed
        />
      </button>
      {isRecording && (
        <p className="mt-2 text-sm text-sky-300 animate-pulse">Recording...</p>
      )}
      {/* --- End Microphone Image Button --- */}

      { audioBlob && 
      (
        <h2 className='text-blue-700 shadow-2xs'>finished recording you can retry</h2>
      )
      }
      {/* {audioBlob && (
        <div className="mt-6 p-4 bg-slate-700/50 rounded-lg w-full">
          <h3 className="text-lg font-medium mb-2 text-sky-300 text-center">Recording Complete</h3>
          <audio controls src={URL.createObjectURL(audioBlob)} className="w-full rounded mb-3" />
          <button
            onClick={handleDownload}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md "
          >
            Download ({audioBlob.type === 'audio/wav' ? 'WAV' : 'Original'})
          </button>
          <p className="text-xs text-slate-400 mt-1 text-center">
            Type: {audioBlob.type}, Size: {(audioBlob.size / 1024).toFixed(2)} KB
          </p>
        </div>
      )} */}
    </div>
  );
};