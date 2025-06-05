// src/screens/AudioScreen.tsx
import React, { useState } from 'react';
import { AudioRecorder } from '../components/AudioRecorder'; // Adjust path if AudioRecorder is elsewhere
import { Button } from '@/components/ui/button'; // Assuming you use shadcn/ui button

interface AudioScreenProps {
  passageToRead: string; // The text the user should read
  onRecordingSubmitted: (audioBlob: Blob) => void; // Callback when user is "done" with this screen
  onNavigateBack?: () => void; // Optional: to go back to a previous screen
}

export const AudioScreen: React.FC<AudioScreenProps> = ({
  passageToRead = "The quick brown fox jumps over the lazy dog. She sells seashells by the seashore.", // Default passage
  onRecordingSubmitted,
  onNavigateBack,
}) => {
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleRecordingComplete = (wavBlob: Blob) => {
    console.log('AudioScreen: Recording complete, WAV Blob received.', wavBlob);
    setRecordedAudio(wavBlob);
    setStatusMessage('Recording complete! Review and submit.');
    setIsSubmitted(false); // Reset submitted state if re-recording
  };

  const handleSubmitRecording = () => {
    if (recordedAudio) {
      setStatusMessage('Submitting recording...');
      // Here you would typically send the 'recordedAudio' blob to your API
      // For now, we'll just call the onRecordingSubmitted prop
      console.log('AudioScreen: Submitting recording to parent/API.');
      onRecordingSubmitted(recordedAudio);
      setIsSubmitted(true);
      setStatusMessage('Recording submitted successfully!');
      // You might want to navigate away or show a success message before navigating
      // For example, after 2 seconds:
      // setTimeout(() => {
      //   if(onNavigateBack) onNavigateBack();
      // }, 2000);
    } else {
      setStatusMessage('No recording available to submit. Please record first.');
    }
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-sm p-6 md:p-8 rounded-xl shadow-2xl text-white w-full max-w-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center text-sky-400">Reading Aloud Practice</h1>

      <div className="mb-6 p-4 bg-slate-700/60 rounded-md border border-slate-600">
        <h2 className="text-xl font-semibold mb-2 text-sky-300">Read this passage:</h2>
        <p className="text-slate-200 leading-relaxed text-lg">{passageToRead}</p>
      </div>

      <AudioRecorder onRecordingComplete={handleRecordingComplete} />

      {statusMessage && (
        <p className={`mt-4 text-sm p-3 rounded-md ${isSubmitted ? 'bg-green-700/50 text-green-300' : 'bg-sky-700/50 text-sky-300'}`}>
          {statusMessage}
        </p>
      )}

      {recordedAudio && !isSubmitted && (
        <Button
          onClick={handleSubmitRecording}
          size="lg"
          className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white"
        >
          Submit My Reading
        </Button>
      )}

      {onNavigateBack && (
        <div className="mt-6 text-center">
          <Button onClick={onNavigateBack} variant="link" className="text-slate-400 hover:text-sky-300">
            {isSubmitted ? 'Back to Menu' : 'Cancel / Back to Menu'}
          </Button>
        </div>
      )}
    </div>
  );
};