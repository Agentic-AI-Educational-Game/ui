/* eslint-disable no-case-declarations */
import  { useState } from 'react'; // Import React
import { MainMenuScreen } from './screens/MainMenuScreen';
import { QcmScreen } from './screens/QcmScreen';
import { AudioScreen } from './screens/AudioScreen';
import allQuestions from '../data/qcm.json';
import type QuestionQcm from './interface/QuestionQcm';

const BACKGROUND_IMAGE_URL = 'assets/background.png';

type screenType = 'menu' | 'qcm' | 'audio' | 'score';

function App() {
  const [screenType, setScreenType] = useState<screenType>('menu');
  const qcmQuestions: QuestionQcm[] = allQuestions as QuestionQcm[];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [finalScoreDisplay, setFinalScoreDisplay] = useState<number>(0);

  const navigateToQcm = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setFinalScoreDisplay(0); // Reset for a new quiz attempt
    setScreenType('qcm');
  };

  const navigateToMenu = () => {
    setScreenType('menu');
  };

  const navigateToAudioScreen = () => setScreenType('audio');

  // navigateToScoreScreen will now be called with the final score
  const navigateToScoreScreen = (finalScoreValue: number) => {
    setFinalScoreDisplay(finalScoreValue); // Set the score to be displayed
    setScreenType('score');
  };

  const handleAnswerSelected = (
    selectedChoiceKey: string,
    currentQuestion: QuestionQcm
  ) => {
    console.log(
      `User selected: ${selectedChoiceKey} for question: "${currentQuestion.question}"`
    );

    const isCorrect = selectedChoiceKey === currentQuestion.correct;
    let newScore = score; // Start with the current score

    if (isCorrect) {
      newScore = score + 1; // Calculate what the new score will be
      setScore(newScore); // Schedule the state update
      console.log('Correct!');
    } else {
      console.log('Incorrect. Correct was: ' + currentQuestion.correct);
      // Score remains 'newScore' which is the current 'score'
    }

    // Move to the next question or finish
    if (currentQuestionIndex < qcmQuestions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      // This is the last question. 'newScore' now holds the definitive final score.
      console.log('QCM Finished! Final Score:', newScore);
      navigateToScoreScreen(newScore); // Pass the calculated final score
    }
  };

  const handleAudioSubmitted = (audioBlob: Blob) => {
    console.log('App: Audio submitted!', audioBlob);
    alert(
      `Audio of size ${(audioBlob.size / 1024).toFixed(
        2
      )} KB ready for processing (simulated submission).`
    );
    navigateToMenu();
  };

  const renderActiveScreen = () => {
    const isLastQuestion = currentQuestionIndex === qcmQuestions.length - 1;

    switch (screenType) {
      case 'qcm':
        const currentQuestion = qcmQuestions[currentQuestionIndex];
        if (!currentQuestion) {
          console.warn('No current question found, navigating to score or menu.');
          navigateToScoreScreen(score);
          return null;
        }
        return (
          <QcmScreen
            onAnswer={(selectedKey) =>
              handleAnswerSelected(selectedKey, currentQuestion)
            }
            goToAudio={isLastQuestion ? navigateToAudioScreen : undefined}
            goToMenu={navigateToMenu}
            questions={currentQuestion}
            key={currentQuestion.question || currentQuestionIndex}
          />
        );
      case 'score':
        return (
          <div className="bg-slate-900/80 backdrop-blur-sm p-8 md:p-12 rounded-xl shadow-2xl text-center w-full max-w-md text-white">
            <h1 className="text-3xl font-bold mb-6 text-sky-400">
              Quiz Finished!
            </h1>
            <p className="text-xl mb-8">
              Your final score is: {finalScoreDisplay} / {qcmQuestions.length}
            </p>
            <button
              onClick={navigateToMenu}
              className="px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold"
            >
              Back to Menu
            </button>
          </div>
        );
      case 'audio':
        return (
          <AudioScreen
            passageToRead="The sun dipped below the horizon, painting the sky in hues of orange and purple. A gentle breeze rustled the leaves in the tall oak trees."
            onRecordingSubmitted={handleAudioSubmitted}
            onNavigateBack={navigateToMenu}
          />
        );
      case 'menu':
      default:
        return (
          <MainMenuScreen
            onStartMCQ={navigateToQcm}
          // onStartAudioPractice={navigateToAudioScreen} // If your MainMenuScreen has this
          />
        );
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat p-4 sm:p-6 md:p-8"
      style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }}
    >
      <div className="w-full max-w-3xl flex justify-center">
        {renderActiveScreen()}
      </div>
    </div>
  );
}

export default App;