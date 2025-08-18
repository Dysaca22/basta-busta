import { useState, useEffect } from 'react';

import { updateGameSettings } from '@features/game/api/host';
import { useDebounce } from '@hooks/useDebounce';
import { type GameSettings } from '@types';

interface GameSettingsFormProps {
    gameId: string;
    currentSettings: GameSettings;
}

const GameSettingsForm = ({ gameId, currentSettings }: GameSettingsFormProps) => {
    const [settings, setSettings] = useState<GameSettings>(currentSettings);
    const debouncedSettings = useDebounce(settings, 500); // Espera 500ms antes de actualizar

    useEffect(() => {
        // Solo actualiza si los settings han cambiado para evitar escrituras innecesarias
        if (JSON.stringify(debouncedSettings) !== JSON.stringify(currentSettings)) {
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
            setSettings({ ...settings, categories: [...settings.categories, ''] });
        }
    };

    const removeCategory = (index: number) => {
        const newCategories = settings.categories.filter((_, i) => i !== index);
        setSettings({ ...settings, categories: newCategories });
    };

    return (
        <div className="space-y-4">
            <div>
                <label>Rondas</label>
                <input
                    type="number"
                    value={settings.rounds}
                    onChange={(e) => setSettings({ ...settings, rounds: parseInt(e.target.value) || 1 })}
                    className="w-full bg-gray-700 p-2 rounded"
                />
            </div>
            <div>
                <label>Tiempo por Ronda (segundos)</label>
                <input
                    type="number"
                    value={settings.roundTime}
                    onChange={(e) => setSettings({ ...settings, roundTime: parseInt(e.target.value) || 30 })}
                    className="w-full bg-gray-700 p-2 rounded"
                />
            </div>
            <div>
                <label>Categorías</label>
                {settings.categories.map((category, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => handleCategoryChange(index, e.target.value)}
                            className="w-full bg-gray-700 p-2 rounded"
                        />
                        <button onClick={() => removeCategory(index)} className="bg-red-600 p-2 rounded">X</button>
                    </div>
                ))}
                {settings.categories.length < 10 && (
                    <button onClick={addCategory} className="w-full bg-blue-500 p-2 rounded mt-2">
                        Añadir Categoría
                    </button>
                )}
            </div>
        </div>
    );
};

export default GameSettingsForm;