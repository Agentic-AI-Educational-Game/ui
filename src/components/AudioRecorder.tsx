// src/components/AudioRecorder.tsx
import React, { useState, useRef, useEffect } from 'react';
import audioBufferToWav from 'audiobuffer-to-wav'; // For WAV conversion

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

  // Initialize AudioContext once
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      // Clean up AudioContext if necessary, though usually not needed for this use case
      // if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      //   audioContextRef.current.close();
      // }
    };
  }, []);


  const startRecording = async () => {
    setError(null);
    setAudioBlob(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('getUserMedia not supported on your browser!');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = []; // Clear previous chunks

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const rawAudioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });

        // --- Convert to WAV ---
        if (audioContextRef.current) {
          try {
            const arrayBuffer = await rawAudioBlob.arrayBuffer();
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
            const wavArrayBuffer = audioBufferToWav(audioBuffer);
            const wavBlob = new Blob([wavArrayBuffer], { type: 'audio/wav' });
            setAudioBlob(wavBlob); // Set the WAV blob for download/preview
            onRecordingComplete(wavBlob); // Pass WAV blob to parent
          } catch (e) {
            console.error("Error converting to WAV:", e);
            setError("Failed to convert audio to WAV format. Using original format.");
            setAudioBlob(rawAudioBlob); // Fallback to original blob
            onRecordingComplete(rawAudioBlob); // Pass original blob if WAV fails
          }
        } else {
            console.warn("AudioContext not available for WAV conversion. Using original format.");
            setAudioBlob(rawAudioBlob); // Fallback if no AudioContext
            onRecordingComplete(rawAudioBlob);
        }
        // --- End Convert to WAV ---

        // Clean up the stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setError("Microphone access denied. Please allow microphone access in your browser settings.");
        } else {
          setError(`Error accessing microphone: ${err.message}`);
        }
      } else {
        setError("An unknown error occurred while accessing the microphone.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDownload = () => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style.display = 'none';
      a.href = url;
      a.download = `recording.${audioBlob.type === 'audio/wav' ? 'wav' : 'webm'}`; // Dynamic extension
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    }
  };


  return (
    <div className="p-4 border rounded-lg shadow-md bg-slate-800 text-white">
      <h2 className="text-xl font-semibold mb-4 text-sky-400">Audio Recorder</h2>
      {error && <p className="text-red-500 mb-2 p-2 bg-red-900/50 rounded">Error: {error}</p>}
      <div className="flex gap-4 mb-4">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRecording ? 'Recording...' : 'Start Recording'}
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Stop Recording
        </button>
      </div>
      {audioBlob && (
        <div className="mt-4 p-4 bg-slate-700 rounded">
          <h3 className="text-lg font-medium mb-2 text-sky-300">Recording Complete</h3>
          <audio controls src={URL.createObjectURL(audioBlob)} className="w-full rounded mb-2" />
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-md w-full"
          >
            Download Recording ({audioBlob.type === 'audio/wav' ? 'WAV' : 'Original Format'})
          </button>
          <p className="text-xs text-slate-400 mt-1">Type: {audioBlob.type}, Size: {(audioBlob.size / 1024).toFixed(2)} KB</p>
        </div>
      )}
    </div>
  );
};