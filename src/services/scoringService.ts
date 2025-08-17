import { type Player } from "@types";


type PlayerAnswersData = { playerId: string; answers: Record<string, string> };
type VoteData = { isValid: boolean };

export const calculateRoundScores = (
    players: Player[],
    allAnswers: PlayerAnswersData[],
    allVotes: Record<string, VoteData[]>
): Record<string, number> => {
    const roundScores: Record<string, number> = {};
    players.forEach(p => roundScores[p.id] = 0);

    const validAnswersByCategory: Record<string, string[]> = {};

    // 1. Determinar qué respuestas son válidas según los votos
    allAnswers.forEach(playerAnswer => {
        const playerId = playerAnswer.playerId;
        for (const category in playerAnswer.answers) {
            const answerText = playerAnswer.answers[category];
            if (!answerText) continue;

            // Construir el identificador único para esta respuesta y categoría
            const voteKey = `${playerId}_${category}`;
            const votesForThisAnswer = allVotes[voteKey] || [];

            const positiveVotes = votesForThisAnswer.filter(v => v.isValid).length;
            const negativeVotes = votesForThisAnswer.length - positiveVotes;

            if (positiveVotes > negativeVotes) {
                if (!validAnswersByCategory[category]) {
                    validAnswersByCategory[category] = [];
                }
                validAnswersByCategory[category].push(answerText.trim().toLowerCase());
            }
        }
    });

    // 2. Asignar puntos basados en las respuestas válidas
    allAnswers.forEach(playerAnswer => {
        const playerId = playerAnswer.playerId;
        for (const category in playerAnswer.answers) {
            const answerText = playerAnswer.answers[category]?.trim().toLowerCase();
            if (!answerText) continue;

            const validAnswersInCat = validAnswersByCategory[category] || [];
            if (!validAnswersInCat.includes(answerText)) continue;

            const occurrences = validAnswersInCat.filter(a => a === answerText).length;
            if (occurrences === 1) {
                roundScores[playerId] += 100;
            } else {
                roundScores[playerId] += 50;
            }
        }
    });

    return roundScores;
};