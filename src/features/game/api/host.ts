import { doc, runTransaction, serverTimestamp, collection, getDocs, writeBatch, increment, updateDoc, deleteDoc } from "firebase/firestore";

import { calculateRoundScores } from "@services/scoringService";
import { getRandomLetter, generateGameId } from "@utils";
import { type GameSettings, type Player } from "@types";
import { db, auth } from "@config/firebase";


export const createGame = async (settings: GameSettings, playerName: string): Promise<string> => {
    if (!db || !auth || !auth.currentUser) {
        throw new Error("Authentication or Firestore service is not available.");
    }
    if (!playerName || playerName.length < 2 || playerName.length > 15) {
        throw new Error("Player name must be between 2 and 15 characters.");
    }

    const hostId = auth.currentUser.uid;
    const maxAttempts = 10; // Prevent infinite loops

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const newGameId = generateGameId();
        const gameRef = doc(db!, "games", newGameId);

        try {
            await runTransaction(db, async (transaction) => {
                const gameDoc = await transaction.get(gameRef);
                if (gameDoc.exists()) {
                    throw new Error("Game ID already exists, trying another one.");
                }

                const initialGameData = {
                    status: "lobby",
                    hostId: hostId,
                    currentLetter: null,
                    currentRound: 0,
                    settings: settings,
                    lastActivity: serverTimestamp(),
                };
                transaction.set(gameRef, initialGameData);

                const playerRef = doc(db!, "games", newGameId, "players", hostId);
                const hostData = {
                    id: hostId,
                    name: playerName,
                    isHost: true,
                    score: 0,
                    isReady: false,
                };
                transaction.set(playerRef, hostData);
            });
            return newGameId; // Success
        } catch (error: any) {
            if (error.message.includes("Game ID already exists")) {
                console.warn(`Collision on game ID ${newGameId}. Retrying...`);
                continue; // Loop to try a new ID
            }
            throw error; // Re-throw other transaction errors
        }
    }

    throw new Error("Failed to create a unique game ID after several attempts.");
};

export const startGame = async (gameId: string) => {

 if (!db || !auth || !auth.currentUser) throw new Error("Authentication or Firestore service is not available.");
    const gameRef = doc(db!, "games", gameId);
    await updateDoc(gameRef, {
        status: "playing",
        currentRound: 1,
        currentLetter: getRandomLetter(),
    });
};

export const commitRoundScores = async (gameId: string, currentRound: number, players: Player[]) => {
    if (!db || !auth || !auth.currentUser) throw new Error("Services not available.");

    const answersRef = collection(db, "games", gameId, "rounds", String(currentRound), "answers");
    const answersSnapshot = await getDocs(answersRef);

    const allAnswers: { playerId: string; answers: Record<string, string> }[] = [];
    const allVotes: Record<string, any[]> = {};

    for (const answerDoc of answersSnapshot.docs) {
        const playerData = answerDoc.data();
        allAnswers.push({ playerId: answerDoc.id, answers: playerData.answers });

        const votesSnapshot = await getDocs(collection(answerDoc.ref, "votes")); // This seems correct, answerDoc.ref is a DocumentReference
        votesSnapshot.forEach(voteDoc => {
            const voteData = voteDoc.data();
            const voteKey = `${answerDoc.id}_${voteData.category}`;
            if (!allVotes[voteKey]) allVotes[voteKey] = [];
            allVotes[voteKey].push(voteData);
        });
    }

    const roundScores = calculateRoundScores(players, allAnswers, allVotes);
    const batch = writeBatch(db!);

    for (const playerId in roundScores) {
        const score = roundScores[playerId];
        if (score > 0) {
            const playerRef = doc(db!, "games", gameId, "players", playerId);
            batch.update(playerRef, { score: increment(score) });
        }
    }

    await batch.commit();
};

export const updateGameSettings = async (gameId: string, newSettings: GameSettings) => {
    if (!db || !auth || !auth.currentUser) throw new Error("Services not available.");

    // Aquí puedes añadir validaciones más robustas para los settings
    const gameRef = doc(db, "games", gameId);
    await updateDoc(gameRef, { settings: newSettings });
};

export const kickPlayer = async (gameId: string, playerIdToKick: string) => {
    if (!db || !auth || !auth.currentUser) throw new Error("Services not available.");

    const playerRef = doc(db, "games", gameId, "players", playerIdToKick);
    await deleteDoc(playerRef); // Simplemente eliminamos el documento del jugador
};