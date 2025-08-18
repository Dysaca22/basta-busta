import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';


import { startGame, kickPlayer, updateGameSettings } from '@features/game/api/host';
import GameSettingsForm from '@components/ui/GameSettingsForm';
import { setPlayerReady, leaveGame  } from '@features/game/api/player';
import { useAppContext } from '@contexts/AppContext';
import Modal from '@components/common/Modal';

const LobbyPage = () => {
    const { game, players, user, gameId } = useAppContext();
    const navigate = useNavigate();

    const [showKickedModal, setShowKickedModal] = useState(false);

    // Efecto para detectar si el jugador actual ha sido expulsado
    useEffect(() => {
        if (game && user && players.length > 0 && !players.some(p => p.id === user.uid)) {
            setShowKickedModal(true);
        }
    }, [players, game, user]);

    useEffect(() => {
        setShowKickedModal(false);
    }, [gameId]);

    const handleModalClose = () => {
        setShowKickedModal(false);
        navigate('/');
    };

    const handleLeaveGame = async () => {
        if (gameId) {
            await leaveGame(gameId);
            navigate('/');
        }
    };

    if (!game || !user || !gameId) {
        return <div>Cargando lobby...</div>;
    }

    if (!game || !user || !gameId) {
        return <div>Cargando lobby...</div>;
    }

    const isHost = user.uid === game.hostId;
    const currentPlayer = players.find(p => p.id === user.uid);

    // LÓGICA CORREGIDA: Filtramos al host antes de verificar si todos están listos.
    const nonHostPlayers = players.filter(p => !p.isHost);
    const allPlayersReady = nonHostPlayers.length > 0 && nonHostPlayers.every(p => p.isReady);

    const handleReadyClick = async () => {
        if (currentPlayer) {
            await setPlayerReady(gameId, !currentPlayer.isReady);
        }
    };

    const handleStartGame = async () => {
        if (isHost && allPlayersReady) {
            await startGame(gameId);
            navigate(`/party?game=${gameId}`);
        }
    };

    const handleKickPlayer = async (playerId: string) => {
        if (isHost) {
            await kickPlayer(gameId, playerId);
        }
    }

    // Aquí iría la lógica para que el host actualice los settings
    const handleSettingsChange = async (newSettings: any) => {
        if (isHost) {
            // Se necesitaría un formulario para construir el objeto newSettings
            // await updateGameSettings(gameId, newSettings);
        }
    }

    return (
        <div className="p-4">
            <Modal
                isOpen={showKickedModal}
                title="Has sido expulsado"
                onClose={handleModalClose}
            >
                <p>El anfitrión te ha expulsado de la partida.</p>
            </Modal>

            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Lobby</h1>
                {/* Botón para salir, visible para todos menos el host */}
                {!isHost && (
                    <button onClick={handleLeaveGame} className="bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded">
                        Salir de la Sala
                    </button>
                )}
            </div>

            <h1 className="text-3xl font-bold text-center mb-4">Lobby de la Partida</h1>
            <p className="text-center mb-6">Comparte este ID: <span className="font-bold text-xl text-yellow-400">{game.id}</span></p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Columna de Jugadores */}
                <div className="md:col-span-2 bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Jugadores ({players.length})</h2>
                    <ul>
                        {players.map(player => (
                            <li key={player.id} className="flex items-center justify-between mb-2 p-2 bg-gray-700 rounded">
                                <span>{player.name} {player.isHost ? '👑' : ''}</span>
                                <div className="flex items-center">
                                    {!player.isHost && <span className="mr-4">{player.isReady ? '✅ Listo' : '⏳ Esperando'}</span>}
                                    {isHost && player.id !== user.uid && (
                                        <button onClick={() => handleKickPlayer(player.id)} className="bg-red-600 hover:bg-red-800 text-white px-2 py-1 rounded text-xs">Expulsar</button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Columna de Controles y Configuración */}
                <div className="bg-gray-800 p-4 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">Opciones</h2>
                    {isHost ? (
                        <div className="space-y-4">
                            <GameSettingsForm gameId={gameId} currentSettings={game.settings} />
                            <button
                                onClick={handleStartGame}
                                disabled={!allPlayersReady}
                                className="w-full bg-green-600 hover:bg-green-800 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded"
                            >
                                {allPlayersReady ? '¡Iniciar Partida!' : 'Esperando jugadores...'}
                            </button>
                        </div>
                    ) : (
                        <div>
                            <button
                                onClick={handleReadyClick}
                                className={`w-full font-bold py-2 px-4 rounded ${currentPlayer?.isReady ? 'bg-yellow-500 hover:bg-yellow-700' : 'bg-blue-500 hover:bg-blue-700'}`}
                            >
                                {currentPlayer?.isReady ? 'No estoy listo' : '¡Estoy Listo!'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LobbyPage;
