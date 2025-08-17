import { collection, doc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";

import { db, auth } from "@services/firebaseService.ts";
import { getRandomLetter } from "@common/utils.ts";


export const createGame = async (playerName: string) => {
    if (!db) throw new Error("Firestore instance is not initialized.");
    if (!auth) throw new Error("Auth instance is not initialized.");

    if (!auth.currentUser) throw new Error("User not authenticated.");

    const hostId = auth.currentUser.uid;
    const gameRef = doc(collection(db, "games"));

    const initialGameData = {
        status: "lobby",
        hostId: hostId,
        players: [],
        currentLetter: null,
        // Aquí se añade el timestamp del servidor
        lastActivity: serverTimestamp(),
    };

    await setDoc(gameRef, initialGameData);

    // Añade al host como el primer jugador en una subcolección
    const playerRef = doc(gameRef, "players", hostId);
    const hostData = {
        id: hostId,
        name: playerName,
        isHost: true,
        score: 0,
        isReady: false,
    };

    await setDoc(playerRef, hostData);

    return gameRef.id;
};


export const startGame = async (gameId: string) => {
    if (!db) throw new Error("Firestore instance is not initialized.");
    const gameRef = doc(db, "games", gameId);
    await updateDoc(gameRef, {
        status: "playing",
        currentLetter: getRandomLetter(),
        timestamp: Date.now(),
    });
};