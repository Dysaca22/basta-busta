import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@services/firebaseService";
import { type Game } from "@common/types";


export const useGameListener = (gameId: string) => {
    const [game, setGame] = useState<Game | null>(null);

    useEffect(() => {
        if (!gameId) return;

        const gameRef = doc(db!, "games", gameId);

        const unsubscribe = onSnapshot(gameRef, (doc) => {
            if (doc.exists()) {
                setGame({ id: doc.id, ...doc.data() } as Game);
            } else {
                setGame(null); // Juego no encontrado
            }
        });

        return () => unsubscribe(); // Limpia el listener cuando el componente se desmonta
    }, [gameId]);

    return game;
};