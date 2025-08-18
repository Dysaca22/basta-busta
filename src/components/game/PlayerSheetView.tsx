import { type Player, type PlayerRoundData, type VoteType } from "@types";
import { submitVote } from "@features/game/api/player";


interface PlayerSheetViewProps {
    gameId: string;
    currentRound: number;
    playerData: PlayerRoundData;
    categories: string[];
    voterId: string;
    players: Player[];
}

const PlayerSheetView = ({
    gameId,
    currentRound,
    playerData,
    categories,
    voterId,
    players,
}: PlayerSheetViewProps) => {
    const handleVote = (category: string, vote: VoteType) => {
        submitVote(gameId, currentRound, playerData.playerId, category, vote);
    };

    const getPlayerName = (playerId: string) => {
        return players.find((p) => p.id === playerId)?.name || "Desconocido";
    };

    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-yellow-400">
                Respuestas de {getPlayerName(playerData.playerId)}
            </h3>
            <div className="space-y-3">
                {categories.map((category) => (
                    <div
                        key={category}
                        className="grid grid-cols-3 items-center gap-4 p-2 bg-gray-700 rounded-md"
                    >
                        <div className="col-span-1">
                            <p className="font-semibold text-gray-300">{category}</p>
                            <p className="text-lg text-white">
                                {playerData.answers[category] || "-"}
                            </p>
                        </div>
                        <div className="col-span-2">
                            {playerData.playerId === voterId ? (
                                <div className="text-sm text-gray-400 italic">
                                    No puedes votar por tus propias respuestas.
                                </div>
                            ) : (
                                <div className="flex items-center justify-end space-x-2">
                                    <button
                                        onClick={() => handleVote(category, "good")}
                                        className="bg-green-600 hover:bg-green-700 text-white font-bold p-2 rounded"
                                    >
                                        ✓
                                    </button>
                                    <button
                                        onClick={() => handleVote(category, "bad")}
                                        className="bg-red-600 hover:bg-red-800 text-white font-bold p-2 rounded"
                                    >
                                        X
                                    </button>
                                    <button
                                        onClick={() => handleVote(category, "great")}
                                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold p-2 rounded"
                                    >
                                        :D
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlayerSheetView;