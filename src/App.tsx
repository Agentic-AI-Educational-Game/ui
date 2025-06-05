import { MainMenuScreen } from "./screens/MainMenuScreen";
import { useState } from "react";
import { QcmScreen } from "./screens/QcmScreen";
import { AudioScreen } from "./screens/AudioScreen";
const BACKGROUND_IMAGE_URL = "assets/background.png";

type screenType = "menu" | "qcm" | "audio";

function App() {
  const [screenType, setScreenType] = useState<screenType>("menu");

  const navigateToQcm = ()=>{
     setScreenType("qcm")
  }
  const navigateToMenu = ()=>{
     setScreenType("menu")
  }
  const navigateToAudioScreen = () => setScreenType('audio');

  const handleAudioSubmitted = (audioBlob: Blob) => {
    console.log('App: Audio submitted!', audioBlob);
    // Here you would send the audioBlob to your backend API for evaluation
    // For now, let's just navigate back to the menu after "submission"
    alert(`Audio of size ${(audioBlob.size / 1024).toFixed(2)} KB ready for processing (simulated submission).`);
    navigateToMenu(); // Or navigate to a results screen
  };

  const renderActiveScreen = () => {
    switch (screenType) {
      case 'qcm': 
        return (
        <>
        <QcmScreen goToMenu={navigateToMenu} goToAudio={navigateToAudioScreen} />
        </>
        );
      case 'audio': 
       return (
          <AudioScreen
            // You can fetch this passage from an API or have a list
            passageToRead="The sun dipped below the horizon, painting the sky in hues of orange and purple. A gentle breeze rustled the leaves in the tall oak trees."
            onRecordingSubmitted={handleAudioSubmitted}
            onNavigateBack={navigateToMenu}
          />
        );
      case 'menu':
      default:
        return (
        <>
        <MainMenuScreen onStartMCQ={navigateToQcm} />
        </>
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
