import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonProgressBar,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import {
  informationCircleOutline,
  flashOutline,
  shieldOutline,
  handLeftOutline,
  bookOutline,
  closeOutline,
  personOutline,
  locationOutline,
  cubeOutline,
  bulbOutline,
  homeOutline,
  informationCircle,
  flash,
  shield,
  handLeft,
  heartOutline,
  chevronForwardOutline,
  helpCircleOutline,
  statsChartOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { GameStateService } from '../../core/services/game-state.service';
import { StoryService } from '../../core/services/story.service';
import { AudioService } from '../../core/services/audio.service';
import { SettingsService } from '../../core/services/settings.service';
import { RegulationService } from '../../core/services/regulation.service';
import { Scene, ChoiceEvaluation, ChoiceAvailability, ChoiceEffects } from '../../core/models/scene.model';
import { PlayerState, InfoEntry } from '../../core/models/player-state.model';
import { RegulationAction } from '../../core/models/regulation-action.model';

/**
 * Mensaje de feedback visual
 */
interface FeedbackMessage {
  id: number;
  icon: string;
  text: string;
  color: string;
}

/**
 * Toast notification para eventos positivos
 */
interface ToastNotification {
  id: number;
  message: string;
  type: 'positive' | 'critical';
}

@Component({
  selector: 'app-scene',
  templateUrl: './scene.page.html',
  styleUrls: ['./scene.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    IonProgressBar,
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonList,
    IonItem,
    IonLabel,
    IonBadge,
    CommonModule,
    TranslateModule,
  ],
})
export class ScenePage implements OnInit, OnDestroy {
  
  @ViewChild('narrativeText') narrativeTextElement!: ElementRef;
  
  readonly sceneImageFallbackSrc = '/assets/images/black-forest.jpg';
  private hasAppliedSceneImageFallback = false;
  
  scene: Scene | null = null;
  sceneText = '';
  evaluatedChoices: ChoiceEvaluation[] = [];
  playerState: PlayerState | null = null;
  
  // Para animaciones
  showContent = false;
  
  // Sistema de feedback
  feedbackMessages: FeedbackMessage[] = [];
  
  // Toast notifications
  toastNotifications: ToastNotification[] = [];
  
  // Critical warning modal
  showCriticalWarning = false;
  criticalWarningMessage = '';
  criticalWarningType: 'stress' | 'safety' | '' = '';
  
  // Modal de diario
  isJournalOpen = false;
  infoEntries: InfoEntry[] = [];
  
  // Tooltip de indicadores
  showIndicatorTooltip = false;
  tooltipIndicator: {
    name: string;
    icon: string;
    value: number;
    color: string;
  } | null = null;
  
  // Acciones de regulación
  regulationActions: RegulationAction[] = [];
  showRegulationSection = false;
  regulationUsed = false; // Flag para controlar si ya se usó una acción
  
  // Sistema de decisiones con modal
  isDecisionModalOpen = false;
  showDecisionButton = false;
  hasChoices = false;
  
  // Tutorial (solo Capítulo 1)
  showTutorialButton = false;
  isTutorialOpen = false;
  
  // Enum para template
  ChoiceAvailability = ChoiceAvailability;
  
  private stateSubscription?: Subscription;
  private routeSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private gameState: GameStateService,
    private story: StoryService,
    private audioService: AudioService,
    private settingsService: SettingsService,
    private regulationService: RegulationService,
    private translate: TranslateService
  ) {
    // Registrar iconos
    addIcons({
      informationCircleOutline,
      flashOutline,
      shieldOutline,
      handLeftOutline,
      bookOutline,
      closeOutline,
      personOutline,
      locationOutline,
      cubeOutline,
      bulbOutline,
      homeOutline,
      informationCircle,
      flash,
      shield,
      handLeft,
      heartOutline,
      chevronForwardOutline,
      helpCircleOutline,
      statsChartOutline,
      alertCircleOutline,
      checkmarkCircleOutline,
    });
  }

  ngOnInit() {
    // Suscribirse al estado del jugador
    this.stateSubscription = this.gameState.getState().subscribe(state => {
      this.playerState = state;
    });

    // Obtener ID de escena desde la ruta
    this.routeSubscription = this.route.params.subscribe(params => {
      const sceneId = parseInt(params['id'], 10);
      void this.loadScene(sceneId);
    });
  }

  ngOnDestroy() {
    this.stateSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();
  }

  /**
   * Carga una escena
   */
  private async loadScene(sceneId: number) {
    this.showContent = false;
    this.regulationUsed = false;
    this.showDecisionButton = false;
    this.isDecisionModalOpen = false;
    this.hasAppliedSceneImageFallback = false;

    // Esperar a que las escenas estén cargadas (sin polling)
    try {
      await this.story.ready();
    } catch (error) {
      console.error('❌ Error esperando carga de escenas:', error);
      this.router.navigate(['/home']);
      return;
    }

    // Obtener escena
    const scene = this.story.getScene(sceneId);
    if (!scene) {
      console.error('❌ Escena no encontrada:', sceneId);
      // Intentar cargar escena 100 (inicio del capítulo 1)
      const fallbackScene = this.story.getScene(100);
      if (fallbackScene) {
        this.router.navigate(['/scene', 100]);
      } else {
        this.router.navigate(['/home']);
      }
      return;
    }

    console.log('✅ Escena cargada:', scene.title || scene.id);

    this.scene = scene;
    
    // Actualizar estado del juego
    this.gameState.navigateToScene(sceneId);
    
    // Ejecutar efectos de entrada
    this.story.executeSceneEntry(scene);
    
    // Obtener texto de la escena
    this.sceneText = this.story.getSceneText(scene);
    
    // Evaluar opciones
    this.evaluatedChoices = this.story.evaluateChoices(scene);
    
    // Evaluar acciones de regulación disponibles
    this.regulationActions = this.regulationService.getAvailableActions(scene);
    this.showRegulationSection = this.regulationActions.length > 0;
    
    // Determinar si hay opciones de decisión REALES (más de una opción o opciones bloqueadas)
    const availableChoices = this.evaluatedChoices.filter(
      e => e.availability === ChoiceAvailability.AVAILABLE
    );
    const blockedChoices = this.evaluatedChoices.filter(
      e => e.availability === ChoiceAvailability.BLOCKED
    );
    
    // Solo es "decisión" si hay más de una opción disponible O hay opciones bloqueadas visibles
    this.hasChoices = availableChoices.length > 1 || blockedChoices.length > 0;
    
    // Reproducir audio ambiente
    this.playSceneAudio(scene);
    
    // Fade in
    setTimeout(() => {
      this.showContent = true;
      
      // Mostrar botón de tutorial solo en Capítulo 1 (escenas 100-199)
      this.showTutorialButton = sceneId >= 100 && sceneId < 200;
      
      // Mostrar botón de decisión después de un delay (simula lectura)
      setTimeout(() => {
        this.showDecisionButton = true;
      }, 2000);
    }, 300);
  }

  /**
   * Reproduce el audio de la escena
   */
  private playSceneAudio(scene: Scene) {
    const settings = this.settingsService.getSettings();
    
    // Reproducir latidos
    this.audioService.playHeartbeat(true, settings.volume);
    
    // Reproducir ambiente específico o default
    const ambientPath = scene.audioAmbient || '/assets/audio/tunetank-dark-space-ambient-348870.mp3';
    this.audioService.playAmbient(ambientPath, true, settings.volume, true); // isGameplay = true
  }

  /**
   * Maneja el scroll del texto narrativo
   */
  onNarrativeScroll(event: Event) {
    const element = event.target as HTMLElement | null;
    if (!element) return;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;
    
    // Si llegó al final (con un margen de 50px)
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      this.showDecisionButton = true;
    }
  }

  /**
   * Abre el modal de decisiones o navega directamente si solo es continuar
   */
  openDecisionModal() {
    // Si no hay decisiones reales (solo continuar), navegar directamente
    if (!this.hasChoices && this.evaluatedChoices.length === 1) {
      const singleChoice = this.evaluatedChoices[0];
      if (singleChoice.availability === ChoiceAvailability.AVAILABLE) {
        this.onChoiceSelected(singleChoice);
        return;
      }
    }
    
    // Si hay decisiones, abrir modal
    this.isDecisionModalOpen = true;
  }

  /**
   * Cierra el modal de decisiones
   */
  closeDecisionModal() {
    this.isDecisionModalOpen = false;
  }

  /**
   * Maneja la selección de una opción
   */
  onChoiceSelected(evaluation: ChoiceEvaluation) {
    if (evaluation.availability !== ChoiceAvailability.AVAILABLE) {
      return;
    }

    if (!this.scene) return;

    console.log('🎯 Opción seleccionada:', evaluation.choice.text);
    console.log('🎯 Efectos:', evaluation.choice.effects);

    // Cerrar modal
    this.closeDecisionModal();

    // Mostrar feedback de efectos
    if (evaluation.choice.effects) {
      this.showEffectsFeedback(evaluation.choice.effects);
    }

    // Ejecutar la decisión
    this.story.executeChoice(this.scene.id, evaluation.choice);
    
    // Navegar a la siguiente escena después de mostrar feedback (más tiempo para ver los iconos)
    setTimeout(() => {
      this.router.navigate(['/scene', evaluation.choice.nextSceneId]);
    }, 1500);
  }

  /**
   * Muestra feedback visual de los efectos (solo iconos, sin números)
   */
  private showEffectsFeedback(effects: ChoiceEffects) {
    const messages: FeedbackMessage[] = [];
    let id = Date.now();

    // Calcular cambios totales para determinar si mostrar toast
    let totalStressChange = effects.stress || 0;
    let totalSafetyChange = effects.safety || 0;
    let totalControlChange = effects.control || 0;

    // Info - Solo icono pulsante
    if (effects.info && effects.info !== 0) {
      messages.push({
        id: id++,
        icon: 'information-circle',
        text: '', // Sin texto numérico
        color: '#3b82f6',
      });
    }

    // Stress - Solo icono pulsante
    if (effects.stress && effects.stress !== 0) {
      messages.push({
        id: id++,
        icon: 'flash',
        text: '', // Sin texto numérico
        color: '#ef4444',
      });
    }

    // Safety - Solo icono pulsante
    if (effects.safety && effects.safety !== 0) {
      messages.push({
        id: id++,
        icon: 'shield',
        text: '', // Sin texto numérico
        color: effects.safety > 0 ? '#22c55e' : '#ef4444',
      });
    }

    // Control - Solo icono pulsante
    if (effects.control && effects.control !== 0) {
      messages.push({
        id: id++,
        icon: 'hand-left',
        text: '', // Sin texto numérico
        color: effects.control > 0 ? '#8b5cf6' : '#ef4444',
      });
    }

    // Agregar mensajes con delay entre ellos
    messages.forEach((msg, index) => {
      setTimeout(() => {
        this.feedbackMessages.push(msg);
        
        // Remover después de 2 segundos (más sutil)
        setTimeout(() => {
          this.feedbackMessages = this.feedbackMessages.filter(m => m.id !== msg.id);
        }, 2000);
      }, index * 150);
    });

    // Mostrar toast para eventos positivos (estrés baja mucho o seguridad/control suben)
    if (totalStressChange <= -15 || totalSafetyChange >= 10 || totalControlChange >= 10) {
      this.showPositiveToast(totalStressChange, totalSafetyChange, totalControlChange);
    }
  }

  /**
   * Muestra toast notification para eventos positivos
   */
  private showPositiveToast(stressChange: number, safetyChange: number, controlChange: number) {
    let message = '';
    
    if (stressChange <= -15) {
      message = 'SCENE.TOAST_CALM';
    } else if (safetyChange >= 10) {
      message = 'SCENE.TOAST_SAFE';
    } else if (controlChange >= 10) {
      message = 'SCENE.TOAST_CONTROL';
    }

    if (message) {
      const toast: ToastNotification = {
        id: Date.now(),
        message: this.translate.instant(message),
        type: 'positive',
      };

      this.toastNotifications.push(toast);

      // Remover después de 2 segundos
      setTimeout(() => {
        this.toastNotifications = this.toastNotifications.filter(t => t.id !== toast.id);
      }, 2000);
    }
  }

  /**
   * Verifica niveles críticos y muestra advertencia si es necesario
   */
  private checkCriticalLevels() {
    // DESACTIVADO: Modal demasiado intrusivo
    // Se puede reactivar en capítulos posteriores si es necesario
    
    /* 
    if (!this.playerState) return;

    const { stress, safety } = this.playerState.indicators;

    // Estrés crítico (>= 80)
    if (stress >= 80 && !this.showCriticalWarning) {
      this.criticalWarningType = 'stress';
      this.criticalWarningMessage = 'Tu nivel de estrés es crítico. Necesitas calmarte pronto.';
      this.showCriticalWarning = true;
    }
    // Seguridad crítica (<= 20)
    else if (safety <= 20 && !this.showCriticalWarning) {
      this.criticalWarningType = 'safety';
      this.criticalWarningMessage = 'Tu seguridad está en peligro. Ten mucho cuidado.';
      this.showCriticalWarning = true;
    }
    */
  }

  /**
   * Cierra el modal de advertencia crítica
   */
  closeCriticalWarning() {
    this.showCriticalWarning = false;
  }

  /**
   * Obtiene el nivel de un indicador (0-100) como porcentaje
   */
  getIndicatorLevel(value: number): number {
    return value / 100;
  }

  /**
   * Obtiene la clase CSS según el nivel del indicador
   */
  getIndicatorClass(value: number): string {
    if (value <= 20) return 'low';
    if (value <= 40) return 'medium-low';
    if (value <= 60) return 'medium';
    if (value <= 80) return 'medium-high';
    return 'high';
  }

  /**
   * Vuelve al menú principal
   */
  goHome() {
    this.audioService.stopAll();
    this.router.navigate(['/home']);
  }

  /**
   * Abre el diario de información
   */
  openJournal() {
    this.infoEntries = this.gameState.getInfoEntries().sort((a, b) => b.discoveredAt - a.discoveredAt);
    this.isJournalOpen = true;
  }

  /**
   * Cierra el diario
   */
  closeJournal() {
    this.isJournalOpen = false;
  }

  /**
   * Obtiene el icono según la categoría
   */
  getCategoryIcon(category?: string): string {
    switch (category) {
      case 'evento': return 'flash-outline';
      case 'persona': return 'person-outline';
      case 'lugar': return 'location-outline';
      case 'objeto': return 'cube-outline';
      case 'concepto': return 'bulb-outline';
      default: return 'information-circle-outline';
    }
  }

  /**
   * Muestra tooltip de un indicador
   */
  showIndicatorInfo(type: 'info' | 'stress' | 'safety' | 'control') {
    if (!this.playerState) return;

    const indicators = this.playerState.indicators;
    const configs = {
      info: {
        name: this.translate.instant('SCENE.INDICATOR_INFO'),
        icon: 'information-circle-outline',
        value: indicators.info,
        color: '#3b82f6',
      },
      stress: {
        name: this.translate.instant('SCENE.INDICATOR_STRESS'),
        icon: 'flash-outline',
        value: indicators.stress,
        color: '#ef4444',
      },
      safety: {
        name: this.translate.instant('SCENE.INDICATOR_SAFETY'),
        icon: 'shield-outline',
        value: indicators.safety,
        color: '#22c55e',
      },
      control: {
        name: this.translate.instant('SCENE.INDICATOR_CONTROL'),
        icon: 'hand-left-outline',
        value: indicators.control,
        color: '#8b5cf6',
      },
    };

    this.tooltipIndicator = configs[type];
    this.showIndicatorTooltip = true;

    // Ocultar después de 2 segundos
    setTimeout(() => {
      this.showIndicatorTooltip = false;
    }, 2000);
  }

  /**
   * Ejecuta una acción de regulación
   */
  onRegulationAction(action: RegulationAction) {
    if (!this.scene || this.regulationUsed) return;

    console.log('🧘 Acción de regulación seleccionada:', action.text);

    // Marcar como usada
    this.regulationUsed = true;

    // Mostrar feedback de efectos
    if (action.effects) {
      this.showEffectsFeedback(action.effects);
    }

    // Ejecutar la acción
    this.regulationService.executeAction(action, this.scene.id);

    // Re-evaluar opciones en la escena inmediatamente (para reflejar cambios en indicadores)
    try {
      this.evaluatedChoices = this.story.evaluateChoices(this.scene);
    } catch (e) {
      console.warn('No se pudieron re-evaluar opciones tras regulación:', e);
    }

    // Ocultar la sección de regulación después de usar una acción
    setTimeout(() => {
      this.showRegulationSection = false;
      this.regulationActions = [];
    }, 500);
  }

  /**
   * Abre el tutorial
   */
  openTutorial() {
    this.isTutorialOpen = true;
  }

  /**
   * Cierra el tutorial
   */
  closeTutorial() {
    this.isTutorialOpen = false;
  }

  onSceneImageError(event: Event) {
    if (this.hasAppliedSceneImageFallback) return;
    const imageElement = event.target as HTMLImageElement | null;
    if (!imageElement) return;
    if (imageElement.src.endsWith(this.sceneImageFallbackSrc)) return;
    this.hasAppliedSceneImageFallback = true;
    imageElement.src = this.sceneImageFallbackSrc;
  }
}
