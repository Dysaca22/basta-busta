import { type User } from 'firebase/auth';


export interface GameSettings {
    rounds: number;
    categories: string[];
}

export interface Game {
    id: string;
    status: "lobby" | "playing" | "voting" | "finished";
    hostId: string;
    currentLetter: string | null;
    currentRound: number;
    settings: GameSettings;
    lastActivity: any;
}

export interface Player {
    id: string;
    name: string;
    isHost: boolean;
    score: number;
    isReady: boolean;
}

export type PlayerAnswers = Record<string, string>;

export interface AnswerVote {
    voterId: string;
    isValid: boolean;
}

export interface AppContextType {
    user: User | null;
    isLoading: boolean;
    gameId: string | null;
    setGameId: (id: string | null) => void;
    game: Game | null;
    players: Player[];
}
