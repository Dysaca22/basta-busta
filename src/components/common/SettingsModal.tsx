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
            let key = event.key;

            // Para teclas especiales, usamos su nombre. Para el resto, su valor.
            if (key.length > 1 && key !== 'Tab') {
                key = key.toUpperCase();
            }

            setKeyBinding(bindingKey, key);
            setBindingKey(null); // Finaliza el modo de escucha
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
            <div key={action} className="flex items-center justify-between">
                <label className="text-sm text-gray-400">{label}</label>
                <button
                    onClick={() => setBindingKey(action)}
                    className="w-32 bg-gray-700 p-2 text-center rounded border border-gray-600 hover:bg-gray-600 font-mono"
                >
                    {isBinding ? 'Presiona una tecla...' : settings.keyBindings[action]}
                </button>
            </div>
        );
    };


    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configuración">
            <div className="space-y-6">
                <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-400 mb-2">
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
                    <h3 className="text-lg font-semibold mb-3">Teclas de Juego</h3>
                    <div className="space-y-2">
                        {renderKeybindingButton('openMaldades', 'Abrir Maldades')}

                        <h4 className="text-md font-semibold pt-2">Maldades</h4>
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