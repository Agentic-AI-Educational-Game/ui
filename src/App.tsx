// src/App.tsx
import { AppFlowManager, AppProvider } from './context/AppContext';
import { DataProvider } from './context/DataContext';
import { QuizProvider } from './context/QuizContext';
import { AuthProvider } from './context/AuthContext';
import { useImagePreloader } from './hooks/useImagePreloader';

const imageUrls = [
  '/assets/background.png',
  '/assets/story-image-1.png',
  '/assets/story-image-2.png',
  '/assets/story-end.png',
  '/assets/running-character.png',
  '/assets/finish-line.png'
];

function App() {
  useImagePreloader(imageUrls);

  return (
    <AuthProvider>
      <DataProvider>
        <QuizProvider>
          <AppProvider>
            {/* --- CRITICAL FIX: Removed justify-center and items-center --- */}
            {/* This div now acts purely as a full-screen container with a background. */}
            <div className="h-screen w-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/assets/background.png')" }}
            >
              {/* --- CRITICAL FIX: The AppFlowManager's container now controls its own layout and centering --- */}
              {/* Added padding here instead of the parent */}
              <div className="h-full w-full max-w-7xl mx-auto flex flex-col p-2 sm:p-4">
                <AppFlowManager />
              </div>
            </div>
          </AppProvider>
        </QuizProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;