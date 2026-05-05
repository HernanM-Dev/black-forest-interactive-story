import { RegulationUsage } from './regulation-action.model';

/**
 * Indicadores del jugador (0-100)
 */
export interface PlayerIndicators {
  info: number;      // Información/conocimiento (0-100)
  stress: number;    // Estrés/presión mental (0-100)
  safety: number;    // Seguridad física (0-100)
  control: number;   // Control/sangre fría (0-100)
}

/**
 * Entrada de información descubierta
 */
export interface InfoEntry {
  id: string;
  title: string;
  description: string;
  discoveredAt: number; // timestamp
  category?: 'evento' | 'persona' | 'lugar' | 'objeto' | 'concepto';
}

/**
 * Estado completo del jugador
 */
export interface PlayerState {
  indicators: PlayerIndicators;
  currentSceneId: number;
  visitedScenes: number[];
  decisions: DecisionRecord[];
  flags: Record<string, boolean>; // Flags narrativos (ej: "metio_la_pata", "confio_en_x")
  infoEntries: InfoEntry[]; // Información recopilada
  regulationUsage: RegulationUsage[]; // Historial de acciones de regulación
  lastRegulationScene?: number; // Última escena donde se usó una acción de regulación
}

/**
 * Registro de una decisión tomada
 */
export interface DecisionRecord {
  sceneId: number;
  choiceId: string;
  timestamp: number;
}

/**
 * Valores por defecto del jugador
 */
export const DEFAULT_PLAYER_STATE: PlayerState = {
  indicators: {
    info: 0,
    stress: 0,
    safety: 0,
    control: 0,
  },
  currentSceneId: 100,
  visitedScenes: [],
  decisions: [],
  flags: {},
  infoEntries: [],
  regulationUsage: [],
  lastRegulationScene: undefined,
};
