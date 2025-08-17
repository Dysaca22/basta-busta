export interface Player {
    id: string;
    name: string;
    isHost: boolean;
    score: number;
    isReady: boolean;
}

export interface Game {
    id: string;
    status: "lobby" | "playing" | "finished";
    hostId: string;
    players: Player[];
    currentLetter: string | null;
    timestamp: number;
}