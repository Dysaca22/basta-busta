import { collection, doc, setDoc, updateDoc, serverTimestamp, getDocs, writeBatch, increment } from "firebase/firestore";

import { type GameSettings, type Player } from "@common/types";
import { db, auth } from "@services/firebaseService.ts";
import { calculateRoundScores } from "./scoringGame";
import { getRandomLetter } from "@common/utils.ts";


export const createGame = async (settings: GameSettings) => {
    if (!db) throw new Error("Firestore instance is not initialized.");
    if (!auth) throw new Error("Auth instance is not initialized.");

    if (!auth.currentUser) throw new Error("User not authenticated.");

    // Validación de la configuración
    if (settings.categories.length === 0 || settings.categories.length > 10) {
        throw new Error("Must have between 1 and 10 categories.");
    }
    if (settings.rounds < 1) {
        throw new Error("Must have at least 1 round.");
    }

    const hostId = auth.currentUser.uid;
    const gameRef = doc(collection(db, "games"));

    const initialGameData = {
        status: "lobby",
        hostId: hostId,
        currentLetter: null,
        currentRound: 0,
        settings: settings,
        lastActivity: serverTimestamp(),
    };

    await setDoc(gameRef, initialGameData);

    return gameRef.id;
};


export const startGame = async (gameId: string) => {
    if (!db) throw new Error("Firestore instance is not initialized.");
    const gameRef = doc(db, "games", gameId);
    await updateDoc(gameRef, {
        status: "playing",
        currentRound: 1,
        currentLetter: getRandomLetter(),
        timestamp: serverTimestamp(),
    });
};

export const commitRoundScores = async (gameId: string, currentRound: number, players: Player[]) => {
    if (!db || !auth || !auth.currentUser) throw new Error("Services not available.");

    // 1. Obtener todas las respuestas y votos de la ronda
    const answersSnapshot = await getDocs(collection(db, "games", gameId, "rounds", String(currentRound), "answers"));
    
    const allAnswers = [];
    const allVotes: Record<string, any[]> = {};

    for (const answerDoc of answersSnapshot.docs) {
        const playerData = answerDoc.data();
 allAnswers.push({ playerId: answerDoc.id, answers: playerData as Record<string, string> });
        
        // Por cada respuesta, obtenemos sus votos
        const votesSnapshot = await getDocs(collection(answerDoc.ref, "votes"));
        votesSnapshot.forEach(voteDoc => {
            const voteData = voteDoc.data();
            const voteKey = `${answerDoc.id}_${voteData.category}`;
            if (!allVotes[voteKey]) allVotes[voteKey] = [];
            allVotes[voteKey].push(voteData);
        });
    }

    // 2. Calcular las puntuaciones
    const roundScores = calculateRoundScores(players, allAnswers, allVotes);

    // 3. Usar una escritura por lotes para actualizar todas las puntuaciones atómicamente
    const batch = writeBatch(db);
    for (const playerId in roundScores) {
        const score = roundScores[playerId];
        if (score > 0) {
            const playerRef = doc(db, "games", gameId, "players", playerId);
            // Usamos 'increment' para sumar de forma segura la nueva puntuación a la existente
            batch.update(playerRef, { score: increment(score) });
        }
    }

    // 4. Confirmar el lote
    await batch.commit();

    // 5. (Opcional) Pasar a la siguiente ronda o finalizar el juego
    // Aquí podrías añadir lógica para actualizar el estado del juego
};