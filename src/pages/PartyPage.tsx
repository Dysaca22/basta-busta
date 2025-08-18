import { useState } from 'react';

import { declareBasta, submitAnswers } from '@features/game/api/player';
import { useAppContext } from '@contexts/AppContext';
import AnswerForm from '@components/game/AnswerForm';
import { type PlayerAnswers } from '@types';
import Timer from '@components/game/Timer';

const PartyPage = () => {
    const { game, user, gameId } = useAppContext();
    const [answers, setAnswers] = useState<PlayerAnswers>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const endRound = async (currentAnswers: PlayerAnswers) => {
        if (!gameId || !game || isSubmitting) return;

        setIsSubmitting(true);
        try {
            // Se envían las respuestas y luego se declara el basta
            await submitAnswers(gameId, game.currentRound, currentAnswers);
            await declareBasta(gameId);
        } catch (error) {
            console.error("Error al finalizar la ronda:", error);
            // Aquí se podría mostrar un mensaje de error al usuario
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTimeUp = () => {
        endRound(answers);
    };

    const handleDeclareBasta = () => {
        endRound(answers);
    };

    if (!game || !user || !gameId) {
        return <div>Cargando partida...</div>;
    }

    // Renderiza diferentes componentes según el estado del juego
    switch (game.status) {
        case 'playing':
            return (
                <div>
                    <h1 className="text-2xl font-bold text-center mb-4">
                        Ronda {game.currentRound} - Letra: {game.currentLetter}
                    </h1>
                    <Timer
                        duration={game.settings.roundTime}
                        onTimeUp={handleTimeUp}
                        isPaused={isSubmitting}
                    />
                    <AnswerForm
                        categories={game.settings.categories}
                        answers={answers}
                        onAnswerChange={setAnswers}
                        isRoundOver={isSubmitting}
                    />
                    <button
                        onClick={handleDeclareBasta}
                        disabled={isSubmitting}
                        className="w-full mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                        {isSubmitting ? 'Enviando...' : '¡Basta!'}
                    </button>
                </div>
            );

        case 'voting':
            // Placeholder para la siguiente fase
            return <div>Fase de votación...</div>;

        case 'finished':
            // Placeholder para el final del juego
            return <div>¡Partida finalizada!</div>;

        default:
            return <div>Esperando a que inicie la partida...</div>;
    }
};

export default PartyPage;
