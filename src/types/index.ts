import { type User } from 'firebase/auth';


export interface GameSettings {
    rounds: number;
    categories: string[];
    roundTime: number;
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

export type Language = 'es' | 'en';

export interface KeyBindings {
    openMaldades: any;
    hojaTembloza: any;
    borrarRespuesta: any;
    pantallaBorrosa: any;
    relojAcelerado: any;
    cambioPsicodelico: any;
    stopFalso: any;
    copiarRespuesta: any;
    roboDeHoja: any;
    escudoContraMaldades: any;
    romperMina: any;
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