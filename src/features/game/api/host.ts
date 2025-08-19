import {
    doc,
    runTransaction,
    serverTimestamp,
    collection,
    getDocs,
    writeBatch,
    increment,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";

import { calculateRoundScores } from "@services/scoringService";
import { getRandomLetter, generateGameId } from "@utils";
import { db, auth } from "@config/firebase";
import {
    type GameSettings,
    type Player,
    type RoundData,
    type PlayerRoundData,
} from "@types";


export const createGame = async (
    settings: GameSettings,
    playerName: string
): Promise<string> => {
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
                    settings: { ...settings, ratingTime: settings.ratingTime || 30 },
                    lastActivity: serverTimestamp(),
                    votingOnPlayerIndex: null,
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
    if (!db || !auth || !auth.currentUser)
        throw new Error("Authentication or Firestore service is not available.");
    const gameRef = doc(db!, "games", gameId);
    await updateDoc(gameRef, {
        status: "playing",
        currentRound: 1,
        currentLetter: getRandomLetter(),
    });
};

export const commitRoundScores = async (
    gameId: string,
    currentRound: number,
    players: Player[]
) => {
    if (!db || !auth || !auth.currentUser)
        throw new Error("Services not available.");

    const answersRef = collection(
        db,
        "games",
        gameId,
        "rounds",
        String(currentRound),
        "answers"
    );
    const answersSnapshot = await getDocs(answersRef);

    const roundData: RoundData = { answers: {} };

    for (const answerDoc of answersSnapshot.docs) {
        const answerData = answerDoc.data();
        const playerId = answerDoc.id;

        const playerRoundData: PlayerRoundData = {
            playerId,
            answers: answerData.answers,
            votes: {},
        };

        const votesSnapshot = await getDocs(collection(answerDoc.ref, "votes"));
        votesSnapshot.forEach((voteDoc) => {
            const voterId = voteDoc.id;
            playerRoundData.votes[voterId] = voteDoc.data();
        });

        roundData.answers[playerId] = playerRoundData;
    }

    if (Object.keys(roundData.answers).length === 0) {
        console.warn("No answers found for this round. Skipping score calculation.");
        return;
    }

    const roundScores = calculateRoundScores(players, roundData);
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

export const updateGameSettings = async (
    gameId: string,
    newSettings: GameSettings
) => {
    if (!db || !auth || !auth.currentUser)
        throw new Error("Services not available.");
    const gameRef = doc(db, "games", gameId);
    await updateDoc(gameRef, { settings: newSettings });
};

export const kickPlayer = async (gameId: string, playerIdToKick: string) => {
    if (!db || !auth || !auth.currentUser)
        throw new Error("Services not available.");
    const playerRef = doc(db, "games", gameId, "players", playerIdToKick);
    await deleteDoc(playerRef);
};

export const advanceToNextRound = async (
    gameId: string,
    currentRound: number,
    totalRounds: number
) => {
    if (!db) throw new Error("Firestore is not available.");
    const gameRef = doc(db, "games", gameId);

    if (currentRound >= totalRounds) {
        await updateDoc(gameRef, {
            status: "finished",
        });
    } else {
        await updateDoc(gameRef, {
            status: "playing",
            currentRound: increment(1),
            currentLetter: getRandomLetter(),
        });
    }
};

export const deleteGame = async (gameId: string) => {
    if (!db) throw new Error("Firestore is not available.");
    console.log(`Starting deletion for game: ${gameId}`);
    const gameRef = doc(db, "games", gameId);

    // Recursively delete subcollections
    const roundsRef = collection(db, gameRef.path, 'rounds');
    const roundsSnapshot = await getDocs(roundsRef);
    for (const roundDoc of roundsSnapshot.docs) {
        const answersRef = collection(db, roundDoc.ref.path, 'answers');
        const answersSnapshot = await getDocs(answersRef);
        for (const answerDoc of answersSnapshot.docs) {
            const votesRef = collection(db, answerDoc.ref.path, 'votes');
            const votesSnapshot = await getDocs(votesRef);
            const batch = writeBatch(db);
            votesSnapshot.forEach(voteDoc => batch.delete(voteDoc.ref));
            await batch.commit();
        }
        const answersBatch = writeBatch(db);
        answersSnapshot.forEach(answerDoc => answersBatch.delete(answerDoc.ref));
        await answersBatch.commit();
    }
    const roundsBatch = writeBatch(db);
    roundsSnapshot.forEach(roundDoc => roundsBatch.delete(roundDoc.ref));
    await roundsBatch.commit();


    // Delete players subcollection
    const playersRef = collection(db, gameRef.path, 'players');
    const playersSnapshot = await getDocs(playersRef);
    const playersBatch = writeBatch(db);
    playersSnapshot.forEach(playerDoc => playersBatch.delete(playerDoc.ref));
    await playersBatch.commit();

    // Finally, delete the game document itself
    await deleteDoc(gameRef);
    console.log(`Game ${gameId} and all its subcollections have been deleted.`);
};