import { useState, useEffect } from 'react';
import { type GameSettings } from '@types';
import { updateGameSettings } from '@features/game/api/host';
import { useDebounce } from '@hooks/useDebounce';

interface GameSettingsFormProps {
    gameId: string;
    currentSettings: GameSettings;
}

const GameSettingsForm = ({ gameId, currentSettings }: GameSettingsFormProps) => {
    const [settings, setSettings] = useState<GameSettings>(currentSettings);
    const debouncedSettings = useDebounce(settings, 750); // Aumentamos el debounce para una mejor UX

    useEffect(() => {
        // Sincroniza el estado local si las props cambian desde Firestore
        setSettings(currentSettings);
    }, [currentSettings]);

    useEffect(() => {
        const hasChanged = JSON.stringify(debouncedSettings) !== JSON.stringify(currentSettings);
        const isValid = debouncedSettings.rounds > 0 &&
            debouncedSettings.roundTime > 10 &&
            debouncedSettings.categories.every(cat => cat.trim() !== '');

        if (hasChanged && isValid) {
            updateGameSettings(gameId, debouncedSettings);
        }
    }, [debouncedSettings, gameId, currentSettings]);

    const handleCategoryChange = (index: number, value: string) => {
        const newCategories = [...settings.categories];
        newCategories[index] = value;
        setSettings({ ...settings, categories: newCategories });
    };

    const addCategory = () => {
        if (settings.categories.length < 10) {
            setSettings({ ...settings, categories: [...settings.categories, 'Nueva Categoría'] });
        }
    };

    const removeCategory = (index: number) => {
        if (settings.categories.length > 1) { // No permitir eliminar la última categoría
            const newCategories = settings.categories.filter((_, i) => i !== index);
            setSettings({ ...settings, categories: newCategories });
        }
    };

    return (
        <div className="space-y-4 text-left">
            <div>
                <label htmlFor="rounds" className="block text-sm font-medium text-gray-400">Rondas</label>
                <input
                    id="rounds"
                    type="number"
                    min="1"
                    value={settings.rounds}
                    onChange={(e) => setSettings({ ...settings, rounds: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full bg-gray-700 p-2 rounded mt-1 border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
                />
            </div>
            <div>
                <label htmlFor="roundTime" className="block text-sm font-medium text-gray-400">Tiempo por Ronda (segundos)</label>
                <input
                    id="roundTime"
                    type="number"
                    min="10"
                    step="5"
                    value={settings.roundTime}
                    onChange={(e) => setSettings({ ...settings, roundTime: Math.max(10, parseInt(e.target.value) || 30) })}
                    className="w-full bg-gray-700 p-2 rounded mt-1 border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-400">Categorías</label>
                {settings.categories.map((category, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => handleCategoryChange(index, e.target.value)}
                            className="w-full bg-gray-700 p-2 rounded border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
                        />
                        <button
                            onClick={() => removeCategory(index)}
                            disabled={settings.categories.length <= 1}
                            className="bg-red-600 hover:bg-red-800 text-white font-bold p-2 rounded disabled:opacity-50"
                        >
                            X
                        </button>
                    </div>
                ))}
                {settings.categories.length < 10 && (
                    <button onClick={addCategory} className="w-full bg-blue-500 hover:bg-blue-700 p-2 rounded mt-2 font-semibold">
                        + Añadir Categoría
                    </button>
                )}
            </div>
        </div>
    );
};

export default GameSettingsForm;