import { doc, getDoc, setDoc } from "firebase/firestore";

import { db, auth } from "@services/firebaseService.ts";


export const joinGame = async (gameId: string, playerName: string) => {
    if (!db) throw new Error("Firestore instance is not initialized.");
    if (!auth) throw new Error("Auth instance is not initialized.");

    if (!auth.currentUser) throw new Error("User not authenticated.");

    const playerRef = doc(db, "games", gameId, "players", auth.currentUser.uid);
    const gameRef = doc(db, "games", gameId);

    // Verifica que el juego exista y no haya comenzado
    const gameDoc = await getDoc(gameRef);
    if (!gameDoc.exists()) throw new Error("Game not found.");
    if (gameDoc.data().status !== "lobby") throw new Error("Game has already started.");

    const playerData = {
        id: auth.currentUser.uid,
        name: playerName,
        isHost: false,
        score: 0,
        isReady: false,
    };

    await setDoc(playerRef, playerData);
};