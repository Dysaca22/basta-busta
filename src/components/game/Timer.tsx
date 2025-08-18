import { useState, useEffect } from 'react';


interface TimerProps {
    duration: number;
    onTimeUp: () => void;
    // Agregamos una prop para pausar el temporizador si es necesario en el futuro
    isPaused?: boolean;
}

const Timer = ({ duration, onTimeUp, isPaused = false }: TimerProps) => {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        // Reiniciar el temporizador si la duración cambia (para nuevas rondas)
        setTimeLeft(duration);
    }, [duration]);

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }

        if (isPaused) {
            return;
        }

        // El intervalo se ejecuta cada segundo para actualizar el tiempo restante
        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        // Función de limpieza para detener el intervalo cuando el componente se desmonta
        return () => clearInterval(intervalId);
    }, [timeLeft, onTimeUp, isPaused]);

    return (
        <div className="text-center">
            <h2 className="text-lg font-semibold">Tiempo Restante</h2>
            <p className="text-4xl font-bold">{timeLeft}</p>
        </div>
    );
};

export default Timer;
