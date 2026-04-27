import { GameStateService } from './game-state.service';
import { DEFAULT_PLAYER_STATE } from '../models/player-state.model';

describe('GameStateService (unit)', () => {
  let service: GameStateService;

  beforeEach(() => {
    // Crear instancia real (no depende de inyección)
    service = new GameStateService();
    // Asegurarnos de partir desde estado por defecto
    service.resetGame();
    // Borrar cualquier estado guardado en localStorage para evitar efectos colaterales
    try {
      localStorage.removeItem('blackForestGameState');
    } catch {}
  });

  it('should initialize indicators from chapter initialState (0-5 -> 0-100)', () => {
    service.resetGame();
    service.initializeFromChapter({ info: 3, stress: 4, safety: 2, control: 1 }, 200);
    const state = service.getCurrentState();

    expect(state.indicators.info).toBe(30);
    expect(state.indicators.stress).toBe(40);
    expect(state.indicators.safety).toBe(20);
    expect(state.indicators.control).toBe(10);
    expect(state.currentSceneId).toBe(200);
  });

  it('should apply effects multiplying by 10 and clamp between 0-100', () => {
    service.resetGame();

    // Apply positive effects
    service.applyEffects({ info: 2, stress: 1 });
    let state = service.getCurrentState();
    expect(state.indicators.info).toBe(20);
    expect(state.indicators.stress).toBe(10);

    // Apply negative effect beyond lower bound
    service.applyEffects({ stress: -5 }); // -50 -> should clamp to 0
    state = service.getCurrentState();
    expect(state.indicators.stress).toBe(0);
  });
});
