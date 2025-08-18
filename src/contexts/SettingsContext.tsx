import { createContext, useContext, useMemo, type ReactNode, useCallback } from 'react';

import { type Language, type KeyBindings, type Settings, type SettingsContextType } from "@types";
import { useLocalStorage } from '@hooks/useLocalStorage';
import { defaultSettings } from '@config/keys';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);


export const SettingsProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useLocalStorage<Settings>('bastaBustaSettings', defaultSettings);

    const setLanguage = useCallback((language: Language) => {
        setSettings(prev => ({ ...prev, language }));
    }, [setSettings]);

    const setKeyBinding = useCallback((action: keyof KeyBindings, key: string) => {
        const currentBindings = Object.values(settings.keyBindings);
        if (currentBindings.includes(key)) {
            alert(`La tecla "${key}" ya está asignada a otra acción.`);
            return;
        }

        const isMaldadKey = action !== 'openMaldades';
        const isLetter = /^[a-zA-Z]$/.test(key);

        if (isMaldadKey && isLetter) {
            alert("No se pueden asignar letras a las maldades, solo números o símbolos.");
            return;
        }

        setSettings(prev => ({
            ...prev,
            keyBindings: { ...prev.keyBindings, [action]: key },
        }));
    }, [setSettings, settings.keyBindings]);

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