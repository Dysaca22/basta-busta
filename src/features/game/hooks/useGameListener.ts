import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@config/firebase";
import { type Game } from "@types";


export const useGameListener = (gameId: string) => {
    const [game, setGame] = useState<Game | null>(null);

    useEffect(() => {
        if (!gameId || !db) return;

        const gameRef = doc(db, "games", gameId);

        const unsubscribe = onSnapshot(gameRef, (doc) => {
            if (doc.exists()) {
                setGame({ id: doc.id, ...doc.data() } as Game);
            } else {
                setGame(null);
            }
        });

        return () => unsubscribe();
    }, [gameId]);

    return game;
};