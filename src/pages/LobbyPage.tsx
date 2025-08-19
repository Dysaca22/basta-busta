import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { startGame, kickPlayer, deleteGame } from '@features/game/api/host';
import { setPlayerReady, leaveGame } from '@features/game/api/player';
import GameSettingsForm from '@components/ui/GameSettingsForm';
import { useAppContext } from '@contexts/AppContext';
import Modal from '@components/common/Modal';

import shareIcon from '@assets/icons/share.png';
import copyIcon from '@assets/icons/copy.png';
import kickIcon from '@assets/icons/kick.png';


const LobbyPage = () => {
    const { game, players, user, gameId } = useAppContext();
    const navigate = useNavigate();
    const [showKickedModal, setShowKickedModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const isHost = user?.uid === game?.hostId;

    useEffect(() => {
        if (game?.status === 'playing' && gameId) {
            navigate(`/party?game=${gameId}`);
        }
    }, [game?.status, gameId, navigate]);


    useEffect(() => {
        if (game && user && players.length > 0 && !players.some(p => p.id === user.uid)) {
            setShowKickedModal(true);
        }
    }, [players, game, user]);

    useEffect(() => {
        setShowKickedModal(false);
    }, [gameId]);

    // Effect to handle host leaving
    useEffect(() => {
        return () => {
            // This cleanup function runs when the component unmounts
            if (isHost && gameId) {
                console.log("Host is leaving. Deleting game...");
                deleteGame(gameId);
            }
        };
    }, [isHost, gameId]);


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

    const handleCopyToClipboard = () => {
        if (game?.id) {
            navigator.clipboard.writeText(game.id).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    if (!game || !user || !gameId) {
        return <div className="flex items-center justify-center h-screen font-marker text-4xl">Cargando lobby...</div>;
    }

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
            startGame(gameId);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4 bg-bg-200 rounded-lg shadow-xl border-4 border-text-100" style={{ backgroundImage: "url('path/to/paper-texture.png')" }}>
            <Modal
                isOpen={showKickedModal}
                title="Has sido expulsado"
                onClose={handleModalClose}
            >
                <p className="font-sans">El anfitrión te ha expulsado de la partida.</p>
            </Modal>

            <div className="flex justify-between items-center mb-6 border-b-4 border-dashed border-bg-300 pb-4">
                <div>
                    <h1 className="font-marker text-5xl text-primary-300">Sala de Espera</h1>
                    <div className="flex items-center mt-2 cursor-pointer" onClick={handleCopyToClipboard}>
                        <span className="font-marker text-3xl text-accent-100 tracking-widest">{game.id}</span>
                        <img src={copyIcon} alt="Copiar" className="w-6 h-6 ml-2" />
                        {copied && <span className="ml-2 text-sm text-primary-200">¡Copiado!</span>}
                    </div>
                </div>
                <button className="p-2 rounded-full hover:bg-bg-300 transition-colors">
                    <img src={shareIcon} alt="Compartir" className="w-8 h-8" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 bg-bg-100 p-6 rounded-lg shadow-inner">
                    <h2 className="font-marker text-4xl text-text-100 mb-4">Jugadores ({players.length})</h2>
                    <ul className="space-y-3">
                        {players.map(player => (
                            <li key={player.id} className="flex items-center justify-between p-3 bg-bg-200 rounded-md shadow-md transform -rotate-1">
                                <span className="font-handwriting text-2xl text-text-100">{player.name} {player.isHost && '👑'}</span>
                                <div className="flex items-center space-x-3">
                                    {!player.isHost && (
                                        <span className={`font-sans text-sm px-3 py-1 rounded-full text-white ${player.isReady ? 'bg-green-500' : 'bg-gray-500'}`}>
                                            {player.isReady ? 'Listo' : 'Esperando'}
                                        </span>
                                    )}
                                    {isHost && !player.isHost && (
                                        <button onClick={() => kickPlayer(gameId, player.id)} className="hover:scale-110 transition-transform">
                                            <img src={kickIcon} alt="Expulsar" className="w-6 h-6" />
                                        </button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-bg-100 p-6 rounded-lg shadow-inner">
                    <h2 className="font-marker text-4xl text-text-100 mb-4">Opciones</h2>
                    {isHost ? (
                        <div className="space-y-6">
                            <GameSettingsForm gameId={gameId} currentSettings={game.settings} />
                            <button
                                onClick={handleStartGame}
                                disabled={!allPlayersReady}
                                className="w-full font-marker text-3xl bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform"
                            >
                                {allPlayersReady ? '¡Comenzar!' : `Esperando...`}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-bg-200 p-4 rounded-md font-sans text-text-200">
                                <h3 className="font-bold">Rondas: <span className="font-normal">{game.settings.rounds}</span></h3>
                                <h3 className="font-bold">Tiempo: <span className="font-normal">{game.settings.roundTime}s</span></h3>
                            </div>
                            <button
                                onClick={handleReadyClick}
                                className={`w-full font-marker text-3xl py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-transform ${currentPlayer?.isReady ? 'bg-accent-100 text-white' : 'bg-primary-100 text-bg-100'}`}
                            >
                                {currentPlayer?.isReady ? '¡No estoy listo!' : '¡Estoy Listo!'}
                            </button>
                            <button onClick={handleLeaveGame} className="w-full font-marker text-2xl bg-text-200 hover:bg-text-100 text-white py-2 px-4 rounded-lg mt-4 shadow-lg">
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