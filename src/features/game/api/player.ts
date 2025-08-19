import { doc, runTransaction, updateDoc, serverTimestamp, setDoc, deleteDoc, collection, query, where, getDocs, limit } from "firebase/firestore";

import { type PlayerAnswers, type VoteType } from "@types";
import { db, auth } from "@config/firebase";


export const joinGame = async (gameId: string, playerName: string) => {
    if (!db || !auth || !auth.currentUser) {
        throw new Error("Authentication or Firestore service is not available.");
    }

    const gameRef = doc(db, "games", gameId);
    const playerRef = doc(db, "games", gameId, "players", auth.currentUser.uid);

    try {
        await runTransaction(db, async (transaction) => {
            if (!db || !auth || !auth.currentUser) {
                throw new Error("Authentication or Firestore service is not available.");
            }

            const gameDoc = await transaction.get(gameRef);

            if (!gameDoc.exists()) {
                throw new Error("Game not found.");
            }

            if (gameDoc.data().status !== "lobby") {
                throw new Error("Game has already started or finished.");
            }

            const playerData = {
                id: auth.currentUser.uid,
                name: playerName,
                isHost: false,
                score: 0,
                isReady: false,
            };

            transaction.set(playerRef, playerData);
        });
        console.log("Player joined the game successfully!");
    } catch (error) {
        console.error("Failed to join game: ", error);
        throw error;
    }
};

export const joinRandomGame = async (playerName: string): Promise<string | null> => {
    if (!db || !auth || !auth.currentUser) {
        throw new Error("Authentication or Firestore service is not available.");
    }

    const gamesRef = collection(db, "games");
    const q = query(gamesRef, where("status", "==", "lobby"), limit(10)); // Limit to 10 lobbies to avoid querying all games

    try {
        const querySnapshot = await getDocs(q);
        const availableGames = querySnapshot.docs;

        if (availableGames.length === 0) {
            return null; // No available games
        }

        // Pick a random game from the available ones
        const randomGame = availableGames[Math.floor(Math.random() * availableGames.length)];
        const gameId = randomGame.id;

        await joinGame(gameId, playerName);
        return gameId;
    } catch (error) {
        console.error("Error joining random game: ", error);
        throw error;
    }
};

export const setPlayerReady = async (gameId: string, isReady: boolean) => {
    if (!db || !auth || !auth.currentUser) {
        throw new Error("Authentication or Firestore service is not available.");
    }
    const playerRef = doc(db, "games", gameId, "players", auth.currentUser.uid);
    await updateDoc(playerRef, { isReady });
};

export const declareBasta = async (gameId: string) => {
    if (!db || !auth || !auth.currentUser) {
        throw new Error("Authentication or Firestore service is not available.");
    }
    const gameRef = doc(db, "games", gameId);

    await updateDoc(gameRef, {
        status: "voting",
        finishedBy: auth.currentUser.uid,
        votingOnPlayerIndex: 0,
        finishedAt: serverTimestamp()
    });
};

export const submitAnswers = async (gameId: string, currentRound: number, answers: PlayerAnswers) => {
    if (!db || !auth || !auth.currentUser) {
        throw new Error("Authentication or Firestore service is not available.");
    }

    const answerRef = doc(
        db,
        "games", gameId,
        "rounds", String(currentRound),
        "answers", auth.currentUser.uid
    );

    await setDoc(answerRef, {
        playerId: auth.currentUser.uid,
        answers
    });
};

export const submitVote = async (
    gameId: string,
    currentRound: number,
    targetPlayerId: string,
    category: string,
    vote: VoteType // Actualizado de boolean a VoteType
) => {
    if (!db || !auth || !auth.currentUser) {
        throw new Error("Authentication or Firestore service is not available.");
    }

    if (auth.currentUser.uid === targetPlayerId) {
        throw new Error("You cannot vote for your own answers.");
    }

    const voteRef = doc(
        db,
        "games", gameId,
        "rounds", String(currentRound),
        "answers", targetPlayerId,
        "votes", auth.currentUser.uid
    );

    // Guardamos el voto para una categoría específica
    const fieldPath = `votes.${category}`;
    await setDoc(voteRef, {
        [fieldPath]: vote
    }, { merge: true });
};

export const leaveGame = async (gameId: string) => {
    if (!db || !auth || !auth.currentUser) {
        throw new Error("Services not available.");
    }
    const playerRef = doc(db, "games", gameId, "players", auth.currentUser.uid);
    await deleteDoc(playerRef);
};