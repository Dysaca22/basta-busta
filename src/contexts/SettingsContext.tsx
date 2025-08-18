import { createContext, useContext, useMemo, type ReactNode, useCallback } from 'react';
import { useLocalStorage } from '@hooks/useLocalStorage';

import { type Language, type KeyBindings, type Settings, type SettingsContextType } from "@types";


const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const defaultSettings: Settings = {
    language: 'es',
    keyBindings: {
        openMaldades: 'Tab',
        buyMaldad: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
    },
};

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useLocalStorage<Settings>('/Users/runner/work/basta-busta/basta-busta/bastaBustaSettings', defaultSettings);

    const setLanguage = useCallback((language: Language) => {
        setSettings(prev => ({ ...prev, language }));
    }, []);

    const setKeyBinding = useCallback((action: keyof KeyBindings, key: string | string[]) => {
        setSettings(prev => ({
            ...prev,
            keyBindings: { ...prev.keyBindings, [action]: key },
        }));
    }, [setSettings]);

    const value = useMemo(() => ({
        settings,
        setLanguage,
        setKeyBinding,
    }), [settings, setLanguage, setKeyBinding]);

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};