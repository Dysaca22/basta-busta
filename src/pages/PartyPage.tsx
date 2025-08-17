import { useAppContext } from '@contexts/AppContext';


const PartyPage = () => {
    const { game, players, user } = useAppContext();

    if (!game) {
        return <div>Cargando partida...</div>;
    }

    const isHost = user?.uid === game.hostId;

    return (
        <div>
            <h1>Partida: {game.id}</h1>
            <h2>Letra: {game.currentLetter}</h2>
            <h3>Jugadores:</h3>
            <ul>
                {players.map(player => (
                    <li key={player.id}>
                        {player.name} - Puntos: {player.score} {player.isReady ? '✅' : '❌'}
                    </li>
                ))}
            </ul>
            {isHost && <button>Iniciar Partida</button>}
        </div>
    );
};

export default PartyPage;