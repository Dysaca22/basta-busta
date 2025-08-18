import { useState } from "react";

import { advanceToNextRound, commitRoundScores } from "@features/game/api/host";
import { useRoundDataListener } from "@hooks/useRoundDataListener";
import { useAppContext } from "@contexts/AppContext";
import PlayerSheetView from "./PlayerSheetView";


const VotingPhase = () => {
    const { game, gameId, user, players } = useAppContext();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { roundData, loading } = useRoundDataListener(
        gameId!,
        game!.currentRound
    );

    if (loading || !game || !user || !gameId || !roundData) {
        return <div>Cargando votaciones...</div>;
    }

    const handleFinishVoting = async () => {
        setIsSubmitting(true);
        try {
            await commitRoundScores(gameId, game.currentRound, players);
            await advanceToNextRound(gameId, game.currentRound, game.settings.rounds);
        } catch (error) {
            console.error("Error al finalizar la votación:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isHost = user.uid === game.hostId;
    const playersWithAnswers = Object.values(roundData.answers);

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-4xl font-bold text-center mb-6">
                Fase de Votación - Ronda {game.currentRound}
            </h1>
            <div className="space-y-6">
                {playersWithAnswers.map((playerData) => (
                    <PlayerSheetView
                        key={playerData.playerId}
                        gameId={gameId}
                        currentRound={game.currentRound}
                        playerData={playerData}
                        categories={game.settings.categories}
                        voterId={user.uid}
                        players={players}
                    />
                ))}
            </div>
            {isHost && (
                <div className="text-center mt-8">
                    <button
                        onClick={handleFinishVoting}
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg"
                    >
                        {isSubmitting
                            ? "Calculando..."
                            : game.currentRound === game.settings.rounds
                                ? "Finalizar Partida"
                                : "Siguiente Ronda"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default VotingPhase;