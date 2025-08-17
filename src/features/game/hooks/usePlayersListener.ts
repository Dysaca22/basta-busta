// src/hooks/usePlayersListener.ts
import { collection, onSnapshot, QuerySnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { db } from "@config/firebase";
import { type Player } from "@types";


export const usePlayersListener = (gameId: string) => {
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        if (!gameId) return;

        const playersRef = collection(db!, "games", gameId, "players");

        const unsubscribe = onSnapshot(playersRef, (snapshot: QuerySnapshot) => {
            const playersData = snapshot.docs.map(doc => doc.data() as Player);
            setPlayers(playersData);
        });

        return () => unsubscribe(); // Limpia el listener al desmontar
    }, [gameId]);

    return players;
};