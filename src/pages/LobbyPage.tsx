import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { setPlayerReady, leaveGame } from '@features/game/api/player';
import { startGame, kickPlayer } from '@features/game/api/host';
import GameSettingsForm from '@components/ui/GameSettingsForm';
import { useAppContext } from '@contexts/AppContext';
import Modal from '@components/common/Modal';


const LobbyPage = () => {
    const { game, players, user, gameId } = useAppContext();
    const navigate = useNavigate();
    const [showKickedModal, setShowKickedModal] = useState(false);

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
        return <div className="flex items-center justify-center h-screen">Cargando lobby...</div>;
    }

    const isHost = user.uid === game.hostId;
    const currentPlayer = players.find(p => p.id === user.uid);
    const nonHostPlayers = players.filter(p => !p.isHost);
    const allPlayersReady = nonHostPlayers.length > 0 && nonHostPlayers.every(p => p.isReady);

    const handleReadyClick = () => {
        if (currentPlayer) {
            setPlayerReady(gameId, !currentPlayer.isReady);
        }
    };

    const handleStartGame = () => {
        if (isHost && allPlayersReady) {
            startGame(gameId).then(() => {
                navigate(`/party?game=${gameId}`);
            });
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            <Modal
                isOpen={showKickedModal}
                title="Has sido expulsado"
                onClose={handleModalClose}
            >
                <p>El anfitrión te ha expulsado de la partida.</p>
            </Modal>

            <div className="text-center mb-6">
                <h1 className="text-4xl font-bold">Lobby de la Partida</h1>
                <p className="mt-2">Comparte este ID para que se unan:
                    <span className="font-bold text-2xl text-yellow-400 ml-2 tracking-widest">{game.id}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-4">Jugadores ({players.length})</h2>
                    <ul className="space-y-3">
                        {players.map(player => (
                            <li key={player.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                                <span className="font-medium">{player.name} {player.isHost && '👑'}</span>
                                <div className="flex items-center space-x-3">
                                    {!player.isHost && (
                                        <span className={`text-sm px-2 py-1 rounded-full ${player.isReady ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'}`}>
                                            {player.isReady ? 'Listo' : 'Esperando'}
                                        </span>
                                    )}
                                    {isHost && !player.isHost && (
                                        <button onClick={() => kickPlayer(gameId, player.id)} className="bg-red-600 hover:bg-red-800 text-white px-3 py-1 rounded-md text-xs font-bold">X</button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h2 className="text-2xl font-semibold mb-4">Opciones</h2>
                    {isHost ? (
                        <div className="space-y-6">
                            <GameSettingsForm gameId={gameId} currentSettings={game.settings} />
                            <button
                                onClick={handleStartGame}
                                disabled={!allPlayersReady}
                                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
                            >
                                {allPlayersReady ? '¡Iniciar Partida!' : `Esperando ${nonHostPlayers.filter(p => !p.isReady).length} jug...`}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Rondas: <span className="font-normal">{game.settings.rounds}</span></h3>
                                <h3 className="font-semibold">Tiempo: <span className="font-normal">{game.settings.roundTime}s</span></h3>
                            </div>
                            <button
                                onClick={handleReadyClick}
                                className={`w-full font-bold py-3 px-4 rounded-lg transition-colors ${currentPlayer?.isReady ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                            >
                                {currentPlayer?.isReady ? 'Cancelar Listo' : '¡Estoy Listo!'}
                            </button>
                            <button onClick={handleLeaveGame} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg mt-4">
                                Salir
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LobbyPage;