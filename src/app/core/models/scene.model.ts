import { PlayerIndicators } from './player-state.model';
import { SceneRegulationConfig } from './regulation-action.model';

/**
 * Requisitos para que una opción esté disponible
 */
export interface ChoiceRequirements {
  info?: number;        // Mínimo de información
  infoMax?: number;     // Máximo de información
  stress?: number;      // Mínimo de estrés
  stressMax?: number;   // Máximo de estrés
  safety?: number;      // Mínimo de seguridad
  safetyMax?: number;   // Máximo de seguridad
  control?: number;     // Mínimo de control
  controlMax?: number;  // Máximo de control
  flags?: string[];     // Flags requeridos (ej: ["conoce_verdad"])
  notFlags?: string[];  // Flags que NO deben existir
}

/**
 * Efectos de una decisión sobre los indicadores
 */
export interface ChoiceEffects {
  info?: number;
  stress?: number;
  safety?: number;
  control?: number;
  flags?: Record<string, boolean>; // Flags a establecer
  addInfo?: string[]; // IDs de entradas de información a agregar
}

/**
 * Una opción/decisión disponible en una escena
 */
export interface Choice {
  id: string;
  text: string;
  requires?: ChoiceRequirements;
  effects?: ChoiceEffects;
  nextSceneId: number;
  blockedMessage?: string; // Mensaje si está bloqueada
  warningMessage?: string; // Advertencia narrativa
}

/**
 * Variante de texto según indicadores
 */
export interface TextVariant {
  condition: string | ((indicators: PlayerIndicators, flags: Record<string, boolean>) => boolean);
  text: string;
}

/**
 * Una escena del juego
 */
export interface Scene {
  id: number;
  title?: string; // Opcional, para debug
  image?: string; // Ruta de la imagen de la escena
  text: string | TextVariant[]; // Texto fijo o variantes
  choices: Choice[];
  audioAmbient?: string; // Ruta del audio ambiente
  onEnter?: (indicators: PlayerIndicators) => Partial<ChoiceEffects>; // Efectos al entrar
  regulation?: SceneRegulationConfig; // Configuración de acciones de regulación
  safeZone?: boolean; // Si es zona segura (permite acciones de calma)
}

/**
 * Estado de disponibilidad de una opción
 */
export enum ChoiceAvailability {
  AVAILABLE = 'available',
  BLOCKED = 'blocked',
  HIDDEN = 'hidden',
}

/**
 * Resultado de evaluar una opción
 */
export interface ChoiceEvaluation {
  choice: Choice;
  availability: ChoiceAvailability;
  reason?: string; // Por qué está bloqueada
}
