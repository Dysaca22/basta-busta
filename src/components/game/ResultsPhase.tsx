import { useNavigate } from "react-router-dom";

import { useAppContext } from "@contexts/AppContext";


const ResultsPhase = () => {
    const { players } = useAppContext();
    const navigate = useNavigate();

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
        <div className="max-w-2xl mx-auto p-4 text-center">
            <h1 className="text-5xl font-bold mb-8 text-yellow-400">
                ¡Partida Finalizada!
            </h1>
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-2xl font-semibold mb-4">Tabla de Posiciones</h2>
                <ul className="space-y-3">
                    {sortedPlayers.map((player, index) => (
                        <li
                            key={player.id}
                            className="flex items-center justify-between p-3 bg-gray-700 rounded-md text-lg"
                        >
                            <span className="font-medium">
                                {index + 1}. {player.name}
                            </span>
                            <span className="font-bold text-yellow-400">{player.score}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <button
                onClick={() => navigate("/")}
                className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
            >
                Volver al Inicio
            </button>
        </div>
    );
};

export default ResultsPhase;