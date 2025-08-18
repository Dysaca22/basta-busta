import { type KeyBindings } from "@types";


export const maldadLabels: Record<keyof Omit<KeyBindings, 'openMaldades'>, string> = {
    hojaTembloza: 'Hoja Tembloza',
    borrarRespuesta: 'Borrar Respuesta',
    pantallaBorrosa: 'Pantalla Borrosa',
    relojAcelerado: 'Reloj Acelerado',
    cambioPsicodelico: 'Cambio Psicodélico',
    stopFalso: 'Stop Falso',
    copiarRespuesta: 'Copiar Respuesta',
    roboDeHoja: 'Robo de Hoja',
    escudoContraMaldades: 'Escudo',
    romperMina: 'Romper Mina',
};