import { useSettings } from '@contexts/SettingsContext';
import Modal from '@components/common/Modal';

import { type SettingsModalProps } from "@types";


const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
    const { settings, setLanguage } = useSettings();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configuración">
            <div className="space-y-4">
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
                    <h3 className="text-lg font-semibold mb-2">Teclas de Juego</h3>
                    <p className="text-sm text-gray-400">
                        Próximamente podrás configurar las teclas para las "maldades".
                    </p>
                    {/* Aquí se agregará el mapeo de teclas en el futuro */}
                </div>
            </div>
        </Modal>
    );
};

export default SettingsModal;