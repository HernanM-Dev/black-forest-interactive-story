import { ChoiceEffects, ChoiceRequirements } from './scene.model';

/**
 * Tipo de acción de regulación
 */
export enum RegulationActionType {
  BREATHING = 'breathing',
  ROUTINE = 'routine',
  EVASIVE = 'evasive',
  DISTRACTION = 'distraction',
}

/**
 * Acción de regulación emocional
 * No avanza la historia, solo mitiga el estrés con un costo
 */
export interface RegulationAction {
  id: string;
  type: RegulationActionType;
  text: string;
  description?: string; // Descripción breve del efecto
  effects: ChoiceEffects;
  requires?: ChoiceRequirements;
  usesPerChapter?: number; // Límite de usos por capítulo (undefined = ilimitado)
  cooldown?: number; // Número de escenas antes de poder usar de nuevo
}

/**
 * Registro de uso de acciones de regulación
 */
export interface RegulationUsage {
  actionId: string;
  sceneId: number;
  timestamp: number;
  chapter: number;
}

/**
 * Configuración de acciones de regulación para una escena
 */
export interface SceneRegulationConfig {
  allowsRegulation: boolean; // Si la escena permite acciones de regulación
  availableActions?: string[]; // IDs de acciones disponibles (si no se especifica, usa las globales)
}

/**
 * Condiciones globales para mostrar acciones de regulación
 */
export const REGULATION_CONDITIONS = {
  MIN_STRESS: 50, // Estrés mínimo para mostrar acciones
  MIN_SAFETY: 20, // Seguridad mínima requerida
  COOLDOWN_SCENES: 1, // Número de escenas entre usos
  EMERGENCY_STRESS: 80, // Umbral para acciones de emergencia
};
