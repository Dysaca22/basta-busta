import { type Player, type RoundData, type VoteType } from "@types";


export const calculateRoundScores = (
    players: Player[],
    roundData: RoundData
): Record<string, number> => {
    const playerIds = players.map(p => p.id);
    const roundScores: Record<string, number> = {};
    playerIds.forEach(id => roundScores[id] = 0);

    const allAnswers = Object.values(roundData.answers);
    const categories = Object.keys(allAnswers[0]?.answers || {});

    categories.forEach(category => {
        const categoryAnswers: { playerId: string, answer: string }[] = [];

        // 1. Filtrar respuestas válidas para la categoría actual
        allAnswers.forEach(playerData => {
            const answerText = playerData.answers[category]?.trim().toLowerCase();
            if (!answerText) return;

            const voters = players.filter(p => p.id !== playerData.playerId);
            if (voters.length === 0) return; // No se puede calificar si no hay otros jugadores

            let totalVoteValue = 0;
            voters.forEach(voter => {
                const vote = playerData.votes[voter.id]?.[category] as VoteType;
                if (vote === 'good' || vote === 'great') {
                    totalVoteValue += 1;
                }
            });

            // Una respuesta es válida si más de la mitad de los votantes la aprueban
            if (totalVoteValue / voters.length > 0.5) {
                categoryAnswers.push({ playerId: playerData.playerId, answer: answerText });
            }
        });

        // 2. Calcular puntos para las respuestas válidas
        categoryAnswers.forEach(({ playerId, answer }) => {
            const occurrences = categoryAnswers.filter(a => a.answer === answer).length;
            const basePoints = occurrences === 1 ? 100 : 50;
            
            let finalPoints = 0;
            const voters = players.filter(p => p.id !== playerId);
            const voteValuePerPlayer = basePoints / voters.length;

            voters.forEach(voter => {
                const vote = roundData.answers[playerId].votes[voter.id]?.[category] as VoteType;
                if (vote === 'good') {
                    finalPoints += voteValuePerPlayer;
                } else if (vote === 'great') {
                    finalPoints += voteValuePerPlayer + 50; // Bonus de 50 por voto "Genial"
                }
            });
            
            roundScores[playerId] += Math.round(finalPoints);
        });
    });

    return roundScores;
};
