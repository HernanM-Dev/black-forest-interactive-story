import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { AudioService } from '../../core/services/audio.service';
import { SettingsService } from '../../core/services/settings.service';
import { GameStateService } from '../../core/services/game-state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [IonContent, IonButton, CommonModule],
})
export class HomePage implements OnInit {
  
  // Textos que cambian según las visitas
  subtitle = 'Todos están ocultos. El silencio es la única forma de seguir existiendo.';
  showButton = false;
  visitCount = 0;
  hasSavedGame = false;

  constructor(
    private router: Router,
    private audioService: AudioService,
    private settingsService: SettingsService,
    private gameStateService: GameStateService
  ) {}

  ngOnInit() {
    this.loadVisitCount();
    this.updateContent();
    this.checkSavedGame();
    
    // Delay para mostrar el botón (aumenta con cada visita)
    const delay = this.visitCount >= 2 ? 1000 : 0;
    setTimeout(() => {
      this.showButton = true;
    }, delay);
  }

  /**
   * Verifica si hay una partida guardada
   */
  private checkSavedGame() {
    this.hasSavedGame = this.gameStateService.hasSavedGame();
  }

  /**
   * Inicia el audio cuando el usuario interactúa por primera vez
   */
  private startAudio() {
    const settings = this.settingsService.getSettings();
    this.audioService.playHeartbeat(true, settings.volume);
    this.audioService.playAmbient('/assets/audio/tunetank-dark-space-ambient-348870.mp3', true, settings.volume);
  }

  /**
   * Carga el contador de visitas desde localStorage
   */
  private loadVisitCount() {
    const stored = localStorage.getItem('blackForestVisits');
    this.visitCount = stored ? parseInt(stored, 10) : 0;
  }

  /**
   * Actualiza el contenido según el número de visitas
   */
  private updateContent() {
    if (this.visitCount === 1) {
      this.subtitle = 'El silencio es supervivencia.';
    } else if (this.visitCount >= 2) {
      this.subtitle = 'No hagas ruido.';
    }
  }

  /**
   * Inicia un nuevo juego (resetea todo y va a intro)
   */
  newGame() {
    // Iniciar audio con la interacción del usuario
    this.startAudio();
    
    // Incrementar contador de visitas
    this.visitCount++;
    localStorage.setItem('blackForestVisits', this.visitCount.toString());
    
    // Pequeño delay para que el audio se inicie antes de navegar
    setTimeout(() => {
      this.audioService.stopAll();
      // Navegar a intro (el reset se hace en intro antes de empezar)
      this.router.navigate(['/intro']);
    }, 100);
  }

  /**
   * Continúa la partida guardada
   */
  continueGame() {
    // Iniciar audio con la interacción del usuario
    this.startAudio();
    
    const savedInfo = this.gameStateService.getSavedGameInfo();
    if (savedInfo) {
      setTimeout(() => {
        this.audioService.stopAll();
        // Navegar directamente a la escena guardada
        this.router.navigate(['/scene', savedInfo.sceneId]);
      }, 100);
    }
  }

  /**
   * Abre la página de configuración
   */
  openSettings() {
    // Iniciar audio con la interacción del usuario
    this.startAudio();
    
    setTimeout(() => {
      this.audioService.stopAll();
      this.router.navigate(['/settings']);
    }, 100);
  }
}
