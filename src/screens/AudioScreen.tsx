// src/screens/AudioScreen.tsx
import React, { useState } from 'react';
import { AudioRecorder } from '../components/AudioRecorder'; // Adjust path if AudioRecorder is elsewhere
import { Button } from '@/components/ui/button'; // Assuming you use shadcn/ui button

interface AudioScreenProps {
  passageToRead?: string; // The text the user should read
  onRecordingSubmitted: (audioBlob: Blob) => void; // Callback when user is "done" with this screen
  onNavigateBack?: () => void; // Optional: to go back to a previous screen
}

export const AudioScreen: React.FC<AudioScreenProps> = ({
  onRecordingSubmitted,
  onNavigateBack,
  passageToRead = "The quick brown fox mps over the lazy dog. She sells seashells by the seashore.", // Default passage

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
      console.log('AudioScreen: Submitting recording to parent/API.');
      onRecordingSubmitted(recordedAudio);
      setIsSubmitted(true);
      setStatusMessage('Recording submitted successfully!');
     
    } else {
      setStatusMessage('No recording available to submit. Please record first.');
    }
  };

  return (
    <div className=" p-6 md:p-8 rounded-xl  text-white w-full max-w-xl mx-auto">

      <div className="mb-6 p-4 bg-slate-700/60 rounded-md border border-slate-600">
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