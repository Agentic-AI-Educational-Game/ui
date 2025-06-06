import { AppProvider } from './context/AppContext';
import { ScreenManager } from './components/ScreenManager';

const BACKGROUND_IMAGE_URL = 'assets/background.png';

function App() {
  return (
    <AppProvider> {/* Wrap the app with the context provider */}
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-center bg-no-repeat p-4 sm:p-6 md:p-8"
        style={{ backgroundImage: `url(${BACKGROUND_IMAGE_URL})` }}
      >
        <div className="w-full max-w-3xl flex justify-center">
          <ScreenManager /> {/* ScreenManager handles rendering the active screen */}
        </div>
      </div>
    </AppProvider>
  );
}

export default App;