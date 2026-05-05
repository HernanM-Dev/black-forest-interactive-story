import { Injectable } from '@angular/core';
import {
  RegulationAction,
  RegulationActionType,
  RegulationUsage,
} from '../models/regulation-action.model';
import { GameStateService } from './game-state.service';
import { Scene } from '../models/scene.model';
import { PlayerIndicators } from '../models/player-state.model';

/**
 * Servicio para manejar las acciones de calma en zonas seguras.
 * Solo aparecen en escenas marcadas como safeZone: true.
 * Son narrativas, limitadas y tienen un pequeño costo.
 */
@Injectable({
  providedIn: 'root',
})
export class RegulationService {

  // Acciones narrativas de calma — texto en primera persona, inmersivo
  private actions: RegulationAction[] = [
    {
      id: 'breathe',
      type: RegulationActionType.BREATHING,
      text: 'Cerrar los ojos y respirar despacio.',
      description: 'Tres respiraciones. Cuatro tiempos dentro, cuatro fuera. El corazón se ralentiza un poco.',
      effects: { stress: -1, control: 1 },
    },
    {
      id: 'think_jane',
      type: RegulationActionType.ROUTINE,
      text: 'Pensar en Jane. En algo bueno.',
      description: 'Un recuerdo concreto. Su risa en la cocina. El olor de su café. Algo real que ancla.',
      effects: { stress: -1, safety: 1 },
    },
    {
      id: 'listen_surroundings',
      type: RegulationActionType.DISTRACTION,
      text: 'Escuchar el entorno. Solo escuchar.',
      description: 'Identificar cinco sonidos. El viento. Un pájaro. La madera. Estar aquí, no en el miedo.',
      effects: { stress: -1, info: 1 },
    },
    {
      id: 'routine_gesture',
      type: RegulationActionType.ROUTINE,
      text: 'Hacer algo con las manos. Algo cotidiano.',
      description: 'Doblar ropa, ordenar objetos, preparar agua. El cuerpo recuerda la normalidad aunque la mente no.',
      effects: { stress: -2, control: -1 },
      usesPerChapter: 2,
    },
  ];

  constructor(private gameState: GameStateService) {}

  /**
   * Devuelve las acciones disponibles para una escena.
   * Solo en zonas seguras (safeZone: true) y una vez por escena.
   */
  getAvailableActions(scene: Scene): RegulationAction[] {
    // Solo en zonas seguras
    if (!scene.safeZone) return [];

    const state = this.gameState.getCurrentState();

    // Solo si el estrés supera el 40%
    if (state.indicators.stress < 40) return [];

    // Solo si ya se usó una acción en esta escena, no mostrar más
    const usedInThisScene = state.regulationUsage.some(u => u.sceneId === scene.id);
    if (usedInThisScene) return [];

    const indicators = state.indicators;

    return this.actions.filter(action => {
      // Verificar requisitos de indicadores si los tiene
      if (action.requires) {
        if (!this.meetsRequirements(action, indicators, state.flags)) return false;
      }

      // Verificar límite por capítulo
      if (action.usesPerChapter !== undefined) {
        const chapter = this.getChapter(scene.id);
        const uses = state.regulationUsage.filter(
          u => u.actionId === action.id && u.chapter === chapter
        ).length;
        if (uses >= action.usesPerChapter) return false;
      }

      return true;
    });
  }

  /**
   * Ejecuta una acción de calma
   */
  executeAction(action: RegulationAction, sceneId: number): void {
    console.log('🌿 Acción de calma:', action.text);
    this.gameState.applyEffects(action.effects);

    const usage: RegulationUsage = {
      actionId: action.id,
      sceneId,
      timestamp: Date.now(),
      chapter: this.getChapter(sceneId),
    };
    this.gameState.recordRegulationUsage(usage, sceneId);
  }

  private meetsRequirements(
    action: RegulationAction,
    indicators: PlayerIndicators,
    flags: Record<string, boolean>
  ): boolean {
    const req = action.requires;
    if (!req) return true;
    if (req.stress !== undefined && indicators.stress < req.stress) return false;
    if (req.stressMax !== undefined && indicators.stress > req.stressMax) return false;
    if (req.control !== undefined && indicators.control < req.control) return false;
    if (req.flags) {
      for (const flag of req.flags) {
        if (!flags[flag]) return false;
      }
    }
    return true;
  }

  private getChapter(sceneId: number): number {
    if (sceneId < 200) return 1;
    if (sceneId < 300) return 2;
    if (sceneId < 400) return 3;
    return 4;
  }
}
