import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

import { AppProvider, useAppContext } from '@contexts/AppContext';
import HomePage from '@pages/HomePage';
import PartyPage from '@pages/PartyPage';


const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const { setGameId } = useAppContext();
  const [searchParams] = useSearchParams();
  const gameIdFromUrl = searchParams.get('game');

  useEffect(() => {
    if (gameIdFromUrl) {
      setGameId(gameIdFromUrl);
    }
    // Limpiar el gameId si el usuario sale de la URL del juego
    return () => {
      setGameId(null);
    };
  }, [gameIdFromUrl, setGameId]);

  return <>{children}</>;
};


function AppRoutes() {
  const { isLoading, user } = useAppContext();

  if (isLoading) {
    // Puedes reemplazar esto con un componente de Spinner o pantalla de carga
    return <div>Cargando...</div>;
  }
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route 
        path="/lobby" 
        element={
          <GameProvider>
            {/* Reemplaza esto con tu LobbyPage cuando esté lista */}
            <PartyPage /> 
          </GameProvider>
        } 
      />
      <Route 
        path="/party" 
        element={
          <GameProvider>
            <PartyPage />
          </GameProvider>
        } 
      />
      {/* Puedes añadir una ruta para la página de victoria aquí */}
      {/* <Route path="/victory" element={<VictoryPage />} /> */}
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="bg-gray-900 text-white min-h-screen">
          <main className="container mx-auto p-4">
            <AppRoutes />
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
