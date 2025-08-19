import { type User } from 'firebase/auth';

// --- TIPOS DE JUEGO ---

export interface GameSettings {
    rounds: number;
    categories: string[];
    roundTime: number;
    ratingTime: number;
}

export interface Game {
    id: string;
    status: "lobby" | "playing" | "voting" | "finished";
    hostId: string;
    currentLetter: string | null;
    currentRound: number;
    settings: GameSettings;
    lastActivity: any;
    finishedBy?: string;
    votingOnPlayerIndex: number | null;
}

export interface Player {
    id: string;
    name: string;
    isHost: boolean;
    score: number;
    isReady: boolean;
}

export type PlayerAnswers = Record<string, string>;

// --- TIPOS DE VOTACIÓN Y PUNTUACIÓN (ACTUALIZADOS) ---

export type VoteType = 'good' | 'bad' | 'great';

// Define los votos de un solo votante para múltiples categorías
export type VotesByCategory = Record<string, VoteType>;

// Define todos los votos para las respuestas de un jugador, organizados por ID del votante
export type AllVotesForPlayer = Record<string, VotesByCategory>;

export interface PlayerRoundData {
    playerId: string;
    answers: PlayerAnswers;
    votes: AllVotesForPlayer;
}

export interface RoundData {
    answers: {
        [playerId: string]: PlayerRoundData;
    };
}


// --- TIPOS DE CONTEXTO Y CONFIGURACIÓN ---

export interface AppContextType {
    user: User | null;
    isLoading: boolean;
    gameId: string | null;
    setGameId: (id: string | null) => void;
    game: Game | null;
    players: Player[];
}

export type Language = 'es' | 'en';

export interface KeyBindings {
    openMaldades: string;
    hojaTembloza: string | number;
    borrarRespuesta: string | number;
    pantallaBorrosa: string | number;
    relojAcelerado: string | number;
    cambioPsicodelico: string | number;
    stopFalso: string | number;
    copiarRespuesta: string | number;
    roboDeHoja: string | number;
    escudoContraMaldades: string | number;
    romperMina: string | number;
}


export interface Settings {
    language: Language;
    keyBindings: KeyBindings;
}

export interface SettingsContextType {
    settings: Settings;
    setLanguage: (language: Language) => void;
    setKeyBinding: (action: keyof KeyBindings, key: string) => void;
}


export interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}