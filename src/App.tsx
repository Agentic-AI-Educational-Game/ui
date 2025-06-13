// src/App.tsx
import { AppFlowManager, AppProvider } from './context/AppContext';
import { DataProvider } from './context/DataContext';
import { QuizProvider } from './context/QuizContext';

function App() {
  return (
    <DataProvider>
      <QuizProvider>
        <AppProvider>
          <div className="min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat p-4 sm:p-6 md:p-8"
          style={{
      backgroundImage: "url('/assets/background.png')"
    }}
          >
            <div className="w-full max-w-3xl flex justify-center" >
              <AppFlowManager />
            </div>
          </div>
        </AppProvider>
      </QuizProvider>
    </DataProvider>
  );
}

export default App;