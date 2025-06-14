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
            {/* --- CRITICAL FIX: Use min-h-screen and bg-fixed. No flex, no centering here. --- */}
            <div className="min-h-screen w-full bg-cover bg-center bg-fixed"
            style={{ backgroundImage: "url('/assets/background.png')" }}
            >
              {/* This inner div now simply provides padding and a max-width for the content. */}
              <div className="w-full max-w-7xl mx-auto p-4">
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