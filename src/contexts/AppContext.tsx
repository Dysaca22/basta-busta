import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@config/firebase';

import { usePlayersListener } from '@features/game/hooks/usePlayersListener';
import { useGameListener } from '@features/game/hooks/useGameListener';
import { type AppContextType } from '@types'


// 2. Crear el Contexto con un valor por defecto
const AppContext = createContext<AppContextType | undefined>(undefined);

// 3. Crear el Proveedor (Provider) que envolverá la aplicación
export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [gameId, setGameId] = useState<string | null>(null);

    // Hooks para obtener datos en tiempo real de Firestore
    const game = useGameListener(gameId || '');
    const players = usePlayersListener(gameId || '');

    // Efecto para escuchar cambios en la autenticación
    useEffect(() => {
        if (!auth) {
            throw new Error("Authentication or Firestore service is not available.");
        }
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsLoading(false);
        });
        return () => unsubscribe(); // Limpieza al desmontar
    }, []);

    const value = {
        user,
        isLoading,
        gameId,
        setGameId,
        game,
        players,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// 4. Crear un Hook personalizado para consumir el contexto fácilmente
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};