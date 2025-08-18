import { collection, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { type RoundData } from "@types";
import { db } from "@config/firebase";


export const useRoundDataListener = (gameId: string, currentRound: number) => {
    const [roundData, setRoundData] = useState<RoundData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!gameId || !currentRound) {
            setLoading(false);
            return;
        };

        const answersRef = collection(db!, "games", gameId, "rounds", String(currentRound), "answers");

        const unsubscribe = onSnapshot(answersRef, async (answersSnapshot) => {
            const answersData: RoundData['answers'] = {};

            const answerPromises = answersSnapshot.docs.map(async (answerDoc) => {
                const answerData = answerDoc.data();
                const playerId = answerDoc.id;

                answersData[playerId] = {
                    playerId: playerId,
                    answers: answerData.answers,
                    votes: {}
                };

                const votesRef = collection(answerDoc.ref, "votes");
                const votesSnapshot = await new Promise<any>((resolve) => {
                    const unsubVotes = onSnapshot(votesRef, (snapshot) => {
                        resolve(snapshot);
                        // No necesitamos desuscribirnos aquí porque el listener principal lo hará
                    });
                });

                votesSnapshot.forEach((voteDoc: any) => {
                    const voterId = voteDoc.id;
                    answersData[playerId].votes[voterId] = voteDoc.data();
                });
            });

            await Promise.all(answerPromises);
            setRoundData({ answers: answersData });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [gameId, currentRound]);

    return { roundData, loading };
};
