import { useState, useEffect } from 'react';

import { type SettingsModalProps, type KeyBindings } from "@types";
import { useSettings } from '@contexts/SettingsContext';
import { maldadLabels } from '@config/maldades';
import Modal from '@components/common/Modal';


const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
    const { settings, setLanguage, setKeyBinding } = useSettings();
    const [bindingKey, setBindingKey] = useState<keyof KeyBindings | null>(null);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!bindingKey) return;

            event.preventDefault();
            const key = event.key === ' ' ? 'Space' : event.key;
            setKeyBinding(bindingKey, key);
            setBindingKey(null);
        };

        if (bindingKey) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [bindingKey, setKeyBinding]);

    const renderKeybindingButton = (action: keyof KeyBindings, label: string) => {
        const isBinding = bindingKey === action;
        return (
            <div key={action} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-700">
                <label className="text-sm text-gray-300">{label}</label>
                <button
                    onClick={() => setBindingKey(action)}
                    className="w-36 bg-gray-600 p-2 text-center rounded border border-gray-500 hover:bg-gray-500 font-mono text-white transition-colors"
                >
                    {isBinding ? 'Esperando tecla...' : String(settings.keyBindings[action])}
                </button>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configuración">
            <div className="space-y-6">
                <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
                        Idioma
                    </label>
                    <select
                        id="language"
                        value={settings.language}
                        onChange={(e) => setLanguage(e.target.value as 'es' | 'en')}
                        className="w-full bg-gray-700 p-2 rounded border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
                    >
                        <option value="es">Español</option>
                        <option value="en">Inglés</option>
                    </select>
                </div>
                <div>
                    <h3 className="text-lg font-semibold mb-3 border-b border-gray-600 pb-2">Teclas de Juego</h3>
                    <div className="space-y-2">
                        {renderKeybindingButton('openMaldades', 'Abrir Maldades')}
                        <h4 className="text-md font-semibold pt-3">Maldades</h4>
                        {Object.entries(maldadLabels).map(([key, label]) =>
                            renderKeybindingButton(key as keyof KeyBindings, label)
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;