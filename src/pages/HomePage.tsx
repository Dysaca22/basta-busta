import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { signInAnonymouslyIfNeeded } from "@features/auth/api";
import { createGame } from "@features/game/api/host";
import { joinGame } from "@features/game/api/player";


const HomePage = () => {
    const [playerName, setPlayerName] = useState("");
    const [gameIdToJoin, setGameIdToJoin] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleCreateGame = async () => {
        if (!playerName.trim()) {
            alert("Por favor, introduce un nombre.");
            return;
        }
        setIsLoading(true);
        try {
            await signInAnonymouslyIfNeeded(playerName);
            // Aquí iría la lógica para configurar las opciones del juego (rondas, categorías)
            const settings = { rounds: 3, categories: ["Nombre", "Ciudad", "Animal"], roundTime: 60 };
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
            await joinGame(gameIdToJoin, playerName); // joinGame necesita el nombre
            navigate(`/lobby?game=${gameIdToJoin}`);
        } catch (error) {
            console.error("Error al unirse a la partida:", error);
            alert("No se pudo unir a la partida. Verifica el ID.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-5xl font-bold mb-8">Basta! Busta!</h1>
            
            <div className="w-full max-w-sm">
                <input
                    type="text"
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Tu nombre de jugador"
                    className="w-full px-4 py-2 mb-4 text-black rounded"
                    disabled={isLoading}
                />

                <button onClick={handleCreateGame} disabled={isLoading} className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2">
                    {isLoading ? "Creando..." : "Crear Partida"}
                </button>

                <div className="flex items-center mt-4">
                    <input
                        type="text"
                        value={gameIdToJoin}
                        onChange={(e) => setGameIdToJoin(e.target.value)}
                        placeholder="ID de la partida"
                        className="w-full px-4 py-2 text-black rounded-l"
                        disabled={isLoading}
                    />
                    <button onClick={handleJoinGame} disabled={isLoading} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-r">
                        Unirse
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;