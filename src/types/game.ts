export interface GameSettings {
    rounds: number;
    categories: string[];
}

export interface Player {
    id: string;
    name: string;
    isHost: boolean;
    score: number;
    isReady: boolean;
}

export interface Game {
    id:string;
    status: "lobby" | "playing" | "voting" | "finished";
    hostId: string;
    currentLetter: string | null;
    currentRound: number;
    settings: GameSettings;
    lastActivity: any;
}

export type PlayerAnswers = Record<string, string>;

export interface AnswerVote {
    voterId: string;
    isValid: boolean;
}