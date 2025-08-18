import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { useEffect, type ReactNode } from 'react';

import { AppProvider, useAppContext } from '@contexts/AppContext';
import { SettingsProvider } from '@contexts/SettingsContext';
import LobbyPage from '@pages/LobbyPage';
import PartyPage from '@pages/PartyPage';
import HomePage from '@pages/HomePage';


const GameIdSetter = ({ children }: { children: ReactNode }) => {
  const { setGameId } = useAppContext();
  const [searchParams] = useSearchParams();
  const gameIdFromUrl = searchParams.get('game');

  useEffect(() => {
    setGameId(gameIdFromUrl);
    return () => {
      setGameId(null);
    };
  }, [gameIdFromUrl, setGameId]);

  return <>{children}</>;
};

function AppRoutes() {
  const { isLoading } = useAppContext();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/lobby"
        element={
          <GameIdSetter>
            <LobbyPage />
          </GameIdSetter>
        }
      />
      <Route
        path="/party"
        element={
          <GameIdSetter>
            <PartyPage />
          </GameIdSetter>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <SettingsProvider>
          <div className="bg-gray-900 text-white min-h-screen font-sans">
            <main className="container mx-auto p-4">
              <AppRoutes />
            </main>
          </div>
        </SettingsProvider>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;