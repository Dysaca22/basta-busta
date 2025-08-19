import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { signInAnonymouslyIfNeeded } from "@features/auth/api";
import SettingsModal from "@components/common/SettingsModal";
import { useLocalStorage } from "@hooks/useLocalStorage";
import { createGame } from "@features/game/api/host";
import { joinGame } from "@features/game/api/player";

import settingsIcon from '@assets/icons/settings.png';
import logo from '@assets/images/logo.png';


const HomePage = () => {
    const [playerName, setPlayerName] = useLocalStorage("playerName", "");
    const [gameIdToJoin, setGameIdToJoin] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const navigate = useNavigate();

    const handleCreateGame = async () => {
        if (!playerName.trim()) {
            alert("Por favor, introduce un nombre.");
            return;
        }
        setIsLoading(true);
        try {
            await signInAnonymouslyIfNeeded(playerName);
            const settings = { rounds: 3, categories: ["Nombre", "Ciudad", "Animal"], roundTime: 60, ratingTime: 30 };
            const newGameId = await createGame(settings, playerName);
            navigate(`/lobby?game=${newGameId}`);
        } catch (error) {
            console.error("Error al crear la partida:", error);
            alert("No se pudo crear la partida.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleJoinGame = async () => {
        if (!playerName.trim() || !gameIdToJoin.trim()) {
            alert("Por favor, introduce tu nombre y el ID de la partida.");
            return;
        }
        setIsLoading(true);
        try {
            await signInAnonymouslyIfNeeded(playerName);
            await joinGame(gameIdToJoin, playerName);
            navigate(`/lobby?game=${gameIdToJoin}`);
        } catch (error) {
            console.error("Error al unirse a la partida:", error);
            alert("No se pudo unir a la partida. Verifica el ID.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="absolute top-6 right-6">
                <button onClick={() => setIsSettingsOpen(true)} className="p-2 rounded-full hover:bg-bg-200 transition-colors">
                    <img src={settingsIcon} alt="Configuración" className="w-8 h-8" />
                </button>
            </div>

            <div className="flex flex-col items-center justify-center min-h-screen text-center">
                <img src={logo} alt="Basta! Busta! Logo" className="w-48 h-48 mb-4" />
                <h1 className="font-marker text-7xl text-primary-200 mb-12 transform -rotate-2" style={{ textShadow: '2px 2px #917800' }}>
                    Basta! Busta!
                </h1>

                <div className="w-full max-w-sm space-y-6">
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        placeholder="Tu nombre de jugador"
                        className="w-full px-4 py-2 text-2xl bg-transparent border-b-4 border-text-200 text-center focus:outline-none focus:border-primary-100 font-handwriting tracking-wider"
                        disabled={isLoading}
                    />

                    <button
                        onClick={handleCreateGame}
                        disabled={isLoading || !playerName.trim()}
                        className="w-full font-marker text-3xl bg-primary-100 text-bg-100 py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 disabled:opacity-50 disabled:scale-100"
                    >
                        {isLoading ? "Creando..." : "Crear Partida"}
                    </button>

                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={gameIdToJoin}
                            onChange={(e) => setGameIdToJoin(e.target.value.toUpperCase())}
                            placeholder="ID de la partida"
                            className="w-full px-4 py-2 text-2xl bg-transparent border-b-4 border-text-200 text-center focus:outline-none focus:border-accent-100 font-handwriting tracking-wider"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleJoinGame}
                            disabled={isLoading || !playerName.trim() || !gameIdToJoin.trim()}
                            className="font-marker text-2xl bg-accent-100 text-bg-100 py-2 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-150 disabled:opacity-50 disabled:scale-100"
                        >
                            Unirse
                        </button>
                    </div>
                </div>
            </div>
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </>
    );
};

export default HomePage;
