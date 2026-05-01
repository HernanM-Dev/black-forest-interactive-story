import { Injectable } from '@angular/core';
import { Scene, Choice, ChoiceRequirements, ChoiceAvailability, ChoiceEvaluation, TextVariant } from '../models/scene.model';
import { PlayerIndicators } from '../models/player-state.model';
import { GameStateService } from './game-state.service';
import { InfoDatabaseService } from './info-database.service';
import { SettingsService } from './settings.service';
import { ReplaySubject, firstValueFrom } from 'rxjs';

/**
 * Servicio para manejar la historia y las escenas
 */
@Injectable({
  providedIn: 'root',
})
export class StoryService {
  
  private scenes: Map<number, Scene> = new Map();

  private readonly scenesLoaded$ = new ReplaySubject<boolean>(1);
  private scenesLoaded = false;
  private readonly loadPromise: Promise<void>;

  constructor(
    private gameState: GameStateService,
    private infoDatabase: InfoDatabaseService,
    private settingsService: SettingsService
  ) {
    this.loadPromise = this.loadScenes();
  }

  /**
   * Verifica si las escenas están cargadas
   */
  areScenesLoaded(): boolean {
    return this.scenesLoaded;
  }

  /**
   * Espera a que las escenas estén cargadas (sin polling).
   */
  async ready(): Promise<void> {
    if (this.scenesLoaded) return;
    await this.loadPromise;
    await firstValueFrom(this.scenesLoaded$);
  }

  /**
   * Obtiene una escena por ID
   */
  getScene(sceneId: number): Scene | undefined {
    return this.scenes.get(sceneId);
  }

  /**
   * Obtiene el texto de una escena (resuelve variantes)
   */
  getSceneText(scene: Scene): string {
    if (typeof scene.text === 'string') {
      return scene.text;
    }

    // Resolver variantes de texto
    const indicators = this.gameState.getIndicators();
    const flags = this.gameState.getCurrentState().flags;

    for (const variant of scene.text) {
      // Si es una función, evaluarla directamente
      if (typeof variant.condition === 'function') {
        if (variant.condition(indicators, flags)) {
          return variant.text;
        }
      } 
      // Si es un string, evaluarlo como condición simple
      else if (typeof variant.condition === 'string') {
        if (this.evaluateConditionString(variant.condition as any, indicators, flags)) {
          return variant.text;
        }
      }
    }

    // Fallback al último texto si ninguna condición se cumple
    return scene.text[scene.text.length - 1].text;
  }

  /**
   * Evalúa una condición en formato string (para JSON)
   */
  private evaluateConditionString(
    condition: string,
    indicators: PlayerIndicators,
    flags: Record<string, boolean>
  ): boolean {
    // Condición "default" siempre es true
    if (condition === 'default') {
      return true;
    }

    // Evaluar condiciones simples como "stress >= 30"
    const match = condition.match(/^(\w+)\s*(>=|<=|>|<|==|!=)\s*(\d+)$/);
    if (match) {
      const [, indicator, operator, valueStr] = match;
      const value = parseInt(valueStr, 10);
      const indicatorValue = (indicators as any)[indicator];

      if (indicatorValue === undefined) {
        return false;
      }

      switch (operator) {
        case '>=': return indicatorValue >= value;
        case '<=': return indicatorValue <= value;
        case '>': return indicatorValue > value;
        case '<': return indicatorValue < value;
        case '==': return indicatorValue === value;
        case '!=': return indicatorValue !== value;
        default: return false;
      }
    }

    // Evaluar flags como "flag:conoce_verdad"
    if (condition.startsWith('flag:')) {
      const flagName = condition.substring(5);
      return flags[flagName] === true;
    }

    return false;
  }

  /**
   * Evalúa todas las opciones de una escena
   */
  evaluateChoices(scene: Scene): ChoiceEvaluation[] {
    const indicators = this.gameState.getIndicators();
    const flags = this.gameState.getCurrentState().flags;

    return scene.choices.map(choice => this.evaluateChoice(choice, indicators, flags));
  }

  /**
   * Evalúa una opción individual
   */
  private evaluateChoice(
    choice: Choice,
    indicators: PlayerIndicators,
    flags: Record<string, boolean>
  ): ChoiceEvaluation {
    if (!choice.requires) {
      return {
        choice,
        availability: ChoiceAvailability.AVAILABLE,
      };
    }

    const req = choice.requires;
    const failures: string[] = [];

    // Verificar requisitos de indicadores
    if (req.info !== undefined && indicators.info < req.info) {
      failures.push('info');
    }
    if (req.infoMax !== undefined && indicators.info > req.infoMax) {
      failures.push('infoMax');
    }
    if (req.stress !== undefined && indicators.stress < req.stress) {
      failures.push('stress');
    }
    if (req.stressMax !== undefined && indicators.stress > req.stressMax) {
      failures.push('stressMax');
    }
    if (req.safety !== undefined && indicators.safety < req.safety) {
      failures.push('safety');
    }
    if (req.safetyMax !== undefined && indicators.safety > req.safetyMax) {
      failures.push('safetyMax');
    }
    if (req.control !== undefined && indicators.control < req.control) {
      failures.push('control');
    }
    if (req.controlMax !== undefined && indicators.control > req.controlMax) {
      failures.push('controlMax');
    }

    // Verificar flags requeridos
    if (req.flags) {
      for (const flag of req.flags) {
        if (!flags[flag]) {
          failures.push(`flag:${flag}`);
        }
      }
    }

    // Verificar flags prohibidos
    if (req.notFlags) {
      for (const flag of req.notFlags) {
        if (flags[flag]) {
          failures.push(`notFlag:${flag}`);
        }
      }
    }

    // Determinar disponibilidad
    if (failures.length === 0) {
      return {
        choice,
        availability: ChoiceAvailability.AVAILABLE,
      };
    }

    // Si tiene mensaje de bloqueo, mostrar como bloqueada
    if (choice.blockedMessage) {
      return {
        choice,
        availability: ChoiceAvailability.BLOCKED,
        reason: choice.blockedMessage,
      };
    }

    // Si no tiene mensaje, ocultar
    return {
      choice,
      availability: ChoiceAvailability.HIDDEN,
      reason: failures.join(', '),
    };
  }

  /**
   * Ejecuta una decisión
   */
  executeChoice(sceneId: number, choice: Choice) {
    // Aplicar efectos
    if (choice.effects) {
      this.gameState.applyEffects(choice.effects);
      
      // Agregar entradas de información
      if (choice.effects.addInfo) {
        for (const infoId of choice.effects.addInfo) {
          const entry = this.infoDatabase.createInfoEntry(infoId);
          if (entry) {
            this.gameState.addInfoEntry(entry);
          }
        }
      }
    }

    // Registrar decisión
    this.gameState.recordDecision(sceneId, choice.id);

    // Navegar a siguiente escena
    this.gameState.navigateToScene(choice.nextSceneId);
  }

  /**
   * Ejecuta efectos al entrar a una escena
   */
  executeSceneEntry(scene: Scene) {
    if (scene.onEnter) {
      const indicators = this.gameState.getIndicators();
      const effects = scene.onEnter(indicators);
      if (effects) {
        this.gameState.applyEffects(effects);
      }
    }
  }

  /**
   * Carga las escenas del juego
   */
  private async loadScenes() {
    try {
      const chapterFiles = await this.loadChapterManifest();
      const language = this.settingsService.getLanguage();

      const fetchPromises = chapterFiles.map(async (chapterFile) => {
        try {
          // Intentar cargar versión localizada primero
          let fileToLoad = chapterFile;
          if (language !== 'es') {
            const localizedFile = chapterFile.replace('.json', `.${language}.json`);
            try {
              const testResponse = await fetch(`/assets/story/${localizedFile}`);
              if (testResponse.ok) {
                fileToLoad = localizedFile;
              }
            } catch {
              // Si no existe, usar el original
            }
          }

          const response = await fetch(`/assets/story/${fileToLoad}`);
          if (!response.ok) {
            throw new Error(`No se pudo cargar ${fileToLoad} (HTTP ${response.status})`);
          }
          const data = (await response.json()) as any;
          return { status: 'fulfilled', value: data } as const;
        } catch (err) {
          return { status: 'rejected', reason: err } as const;
        }
      });

      const results = await Promise.all(fetchPromises);

      // Aplicar initialState solo una vez (el primer capítulo que lo defina) y
      // continuar cargando escenas aunque alguna lectura falle.
      let appliedInitial = false;

      for (const res of results) {
        if (res.status === 'rejected') {
          console.warn('⚠️ Falló carga de capítulo:', res.reason);
          continue;
        }

        const chapterData = res.value as any;

        if (!chapterData || !Array.isArray(chapterData.scenes)) {
          console.warn('⚠️ Capítulo con formato inesperado, omitiendo');
          continue;
        }

        const chapterNumber = Number(chapterData.chapter);
        const isChapterOne = !Number.isNaN(chapterNumber) ? chapterNumber === 1 : false;

        if (!appliedInitial && chapterData.initialState && !this.gameState.hasSavedGame() && isChapterOne) {
          try {
            const startSceneId = chapterData.scenes.length > 0 ? chapterData.scenes[0].id : undefined;
            this.gameState.initializeFromChapter(chapterData.initialState, startSceneId);
            appliedInitial = true;
          } catch (e) {
            console.warn('⚠️ No se pudo inicializar estado desde capítulo:', e);
          }
        } else if (!appliedInitial && chapterData.initialState && !this.gameState.hasSavedGame() && !isChapterOne) {
          console.warn(`ℹ️ Se omite initialState de capítulo ${chapterData.chapter} para no reescribir el estado existente.`);
        }

        chapterData.scenes.forEach((scene: Scene) => {
          this.scenes.set(scene.id, scene);
        });
      }

      this.scenesLoaded = true;
      this.scenesLoaded$.next(true);
      console.log(`✅ Cargadas ${this.scenes.size} escenas (${chapterFiles.length} capítulos)`);
    } catch (error) {
      console.error('❌ Error al cargar escenas:', error);
      // Fallback a escenas de ejemplo si falla la carga
      this.loadFallbackScenes();
      this.scenesLoaded = true;
      this.scenesLoaded$.next(true);
    }
  }

  private async loadChapterManifest(): Promise<readonly string[]> {
    // Manifest principal (escalable). Si falla, usar fallback.
    try {
      const response = await fetch('/assets/story/chapters.json');
      if (!response.ok) {
        throw new Error(`No se pudo cargar chapters.json (HTTP ${response.status})`);
      }
      const data = (await response.json()) as { chapters?: unknown };
      const chapters = Array.isArray(data.chapters) ? data.chapters : null;
      const chapterFiles = chapters?.filter((c): c is string => typeof c === "string") ?? [];

      if (chapterFiles.length === 0) {
        throw new Error('chapters.json no contiene capítulos válidos');
      }

      return chapterFiles;
    } catch {
      return ['chapter-1.json', 'chapter-2.json', 'chapter-3.json', 'chapter-4.json', 'chapter-5.json'] as const;
    }
  }

  /**
   * Escenas de fallback en caso de error
   */
  private loadFallbackScenes() {
    this.scenes.set(100, {
      id: 100,
      title: 'Error',
      text: 'No se pudieron cargar las escenas. Por favor, recarga la página.',
      choices: [
        {
          id: 'reload',
          text: 'Volver al inicio',
          nextSceneId: 100,
        },
      ],
    });
  }
}
