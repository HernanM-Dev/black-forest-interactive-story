import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PlayerState, PlayerIndicators, DEFAULT_PLAYER_STATE, DecisionRecord, InfoEntry } from '../models/player-state.model';
import { ChoiceEffects } from '../models/scene.model';
import { RegulationUsage } from '../models/regulation-action.model';

/**
 * Servicio para manejar el estado del jugador
 */
@Injectable({
  providedIn: 'root',
})
export class GameStateService {
  
  private readonly STORAGE_KEY = 'blackForestGameState';
  private playerState$ = new BehaviorSubject<PlayerState>(DEFAULT_PLAYER_STATE);

  constructor() {
    this.loadState();
  }

  private cloneState(state: PlayerState): PlayerState {
    // structuredClone está disponible en navegadores modernos (incl. Android WebView reciente).
    // Si no está, caeremos a JSON (suficiente para este modelo de datos).
    try {
      return structuredClone(state);
    } catch {
      return JSON.parse(JSON.stringify(state)) as PlayerState;
    }
  }

  /**
   * Obtiene el estado del jugador como Observable
   */
  getState(): Observable<PlayerState> {
    return this.playerState$.asObservable();
  }

  /**
   * Obtiene el estado actual del jugador (snapshot)
   */
  getCurrentState(): PlayerState {
    return this.cloneState(this.playerState$.value);
  }

  /**
   * Obtiene los indicadores actuales
   */
  getIndicators(): PlayerIndicators {
    return this.cloneState(this.playerState$.value).indicators;
  }

  /**
   * Aplica efectos sobre los indicadores
   */
  applyEffects(effects: ChoiceEffects) {
    const currentState = this.getCurrentState();
    const newIndicators = { ...currentState.indicators };

    console.log('📊 Aplicando efectos:', effects);
    console.log('📊 Indicadores antes:', newIndicators);

    // Aplicar cambios a indicadores (con límites 0-100)
    // Cada punto en el JSON = +2% en el indicador (escala más gradual)
    if (effects.info !== undefined) {
      newIndicators.info = this.clamp(newIndicators.info + (effects.info * 2), 0, 100);
    }
    if (effects.stress !== undefined) {
      newIndicators.stress = this.clamp(newIndicators.stress + (effects.stress * 2), 0, 100);
    }
    if (effects.safety !== undefined) {
      newIndicators.safety = this.clamp(newIndicators.safety + (effects.safety * 2), 0, 100);
    }
    if (effects.control !== undefined) {
      newIndicators.control = this.clamp(newIndicators.control + (effects.control * 2), 0, 100);
    }

    console.log('📊 Indicadores después:', newIndicators);

    // Aplicar flags
    const newFlags = { ...currentState.flags };
    if (effects.flags) {
      Object.assign(newFlags, effects.flags);
    }

    // Actualizar estado
    const newState: PlayerState = {
      ...currentState,
      indicators: newIndicators,
      flags: newFlags,
    };

    this.updateState(newState);
  }

  /**
   * Registra una decisión tomada
   */
  recordDecision(sceneId: number, choiceId: string) {
    const currentState = this.getCurrentState();
    const decision: DecisionRecord = {
      sceneId,
      choiceId,
      timestamp: Date.now(),
    };

    const newState: PlayerState = {
      ...currentState,
      decisions: [...currentState.decisions, decision],
    };

    this.updateState(newState);
  }

  /**
   * Navega a una nueva escena
   */
  navigateToScene(sceneId: number) {
    const currentState = this.getCurrentState();
    const visitedScenes = currentState.visitedScenes.includes(sceneId)
      ? currentState.visitedScenes
      : [...currentState.visitedScenes, sceneId];

    const newState: PlayerState = {
      ...currentState,
      currentSceneId: sceneId,
      visitedScenes,
    };

    this.updateState(newState);
  }

  /**
   * Verifica si una escena ya fue visitada
   */
  hasVisitedScene(sceneId: number): boolean {
    return this.getCurrentState().visitedScenes.includes(sceneId);
  }

  /**
   * Obtiene un flag específico
   */
  getFlag(flagName: string): boolean {
    return this.getCurrentState().flags[flagName] || false;
  }

  /**
   * Establece un flag
   */
  setFlag(flagName: string, value: boolean) {
    const currentState = this.getCurrentState();
    const newState: PlayerState = {
      ...currentState,
      flags: {
        ...currentState.flags,
        [flagName]: value,
      },
    };

    this.updateState(newState);
  }

  /**
   * Verifica si hay una partida guardada
   */
  hasSavedGame(): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return false;
    
    try {
      const state = JSON.parse(stored);
      // Verificar que tenga al menos una decisión o haya visitado alguna escena
      return state.decisions?.length > 0 || state.visitedScenes?.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene información de la partida guardada
   */
  getSavedGameInfo(): { sceneId: number; decisions: number } | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;
    
    try {
      const state = JSON.parse(stored);
      return {
        sceneId: state.currentSceneId || 100,
        decisions: state.decisions?.length || 0,
      };
    } catch {
      return null;
    }
  }

  /**
   * Guarda el estado en localStorage
   */
  private saveState() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.playerState$.value));
  }

  /**
   * Carga el estado desde localStorage
   */
  private loadState() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const state = JSON.parse(stored) as PlayerState;
        this.playerState$.next(this.cloneState(state));
      } catch (error) {
        console.error('Error al cargar estado del juego:', error);
      }
    }
  }

  /**
   * Actualiza el estado y lo guarda
   */
  private updateState(newState: PlayerState) {
    this.playerState$.next(this.cloneState(newState));
    this.saveState();
  }

  /**
   * Resetea el juego a valores por defecto
   */
  resetGame() {
    console.log('🔄 Reseteando juego a valores por defecto');
    this.playerState$.next(this.cloneState(DEFAULT_PLAYER_STATE));
    this.saveState();
  }

  /**
   * Inicializa el estado del jugador a partir de un objeto `initialState` de capítulo.
   * Se espera que los valores recibidos estén en la escala antigua (0-5) y se
   * convierten a la escala 0-100 multiplicando por 10.
   */
  initializeFromChapter(initial: Partial<PlayerIndicators>, startSceneId?: number) {
    const currentState = this.getCurrentState();
    const newIndicators = { ...currentState.indicators };

    if (initial.info !== undefined) {
      newIndicators.info = this.clamp(initial.info * 10, 0, 100);
    }
    if (initial.stress !== undefined) {
      newIndicators.stress = this.clamp(initial.stress * 10, 0, 100);
    }
    if (initial.safety !== undefined) {
      newIndicators.safety = this.clamp(initial.safety * 10, 0, 100);
    }
    if (initial.control !== undefined) {
      newIndicators.control = this.clamp(initial.control * 10, 0, 100);
    }

    const newState: PlayerState = {
      ...currentState,
      indicators: newIndicators,
      currentSceneId: startSceneId ?? currentState.currentSceneId,
    };

    this.updateState(newState);
  }

  /**
   * Agrega una entrada de información
   */
  addInfoEntry(entry: InfoEntry) {
    const currentState = this.getCurrentState();
    
    // Verificar si ya existe
    if (currentState.infoEntries.some(e => e.id === entry.id)) {
      console.log('ℹ️ Entrada de información ya existe:', entry.id);
      return;
    }

    const newState: PlayerState = {
      ...currentState,
      infoEntries: [...currentState.infoEntries, entry],
    };

    console.log('📝 Nueva entrada de información agregada:', entry.title);
    this.updateState(newState);
  }

  /**
   * Obtiene todas las entradas de información
   */
  getInfoEntries(): InfoEntry[] {
    return [...this.getCurrentState().infoEntries];
  }

  /**
   * Registra el uso de una acción de regulación
   */
  recordRegulationUsage(usage: RegulationUsage, sceneId: number) {
    const currentState = this.getCurrentState();
    const newState: PlayerState = {
      ...currentState,
      regulationUsage: [...currentState.regulationUsage, usage],
      lastRegulationScene: sceneId,
    };

    console.log('📝 Acción de regulación registrada:', usage);
    this.updateState(newState);
  }

  /**
   * Limita un valor entre min y max
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
