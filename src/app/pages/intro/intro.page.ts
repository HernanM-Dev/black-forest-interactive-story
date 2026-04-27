import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { headsetOutline } from 'ionicons/icons';
import { AudioService } from '../../core/services/audio.service';
import { SettingsService } from '../../core/services/settings.service';
import { GameStateService } from '../../core/services/game-state.service';

@Component({
  selector: 'app-intro',
  standalone: true,
  templateUrl: './intro.page.html',
  styleUrls: ['./intro.page.scss'],
  imports: [IonContent, IonButton, IonIcon],
})
export class IntroPage implements OnInit, OnDestroy {
  
  showContent = false;

  constructor(
    private router: Router,
    private audioService: AudioService,
    private settingsService: SettingsService,
    private gameState: GameStateService
  ) {
    // Registrar iconos
    addIcons({ headsetOutline });
  }

  ngOnInit() {
    // Fade in suave del contenido
    setTimeout(() => {
      this.showContent = true;
    }, 300);

    // Reproducir latidos y ambiente en la pantalla de intro
    const settings = this.settingsService.getSettings();
    setTimeout(() => {
      this.audioService.playHeartbeat(true, settings.volume);
      this.audioService.playAmbient('/assets/audio/tunetank-dark-space-ambient-348870.mp3', true, settings.volume);
    }, 500);
  }

  ngOnDestroy() {
    // Detener todos los audios al salir de la pantalla
    this.audioService.stopAll();
  }

  /**
   * Continúa hacia la primera escena
   */
  continue() {
    // Resetear el juego al iniciar
    this.gameState.resetGame();
    console.log('🔄 Juego reseteado');
    
    this.audioService.stopAll();
    this.router.navigate(['/scene', 100]);
  }

  /**
   * Vuelve a la pantalla de inicio
   */
  goBack() {
    this.audioService.stopAll();
    this.router.navigate(['/home']);
  }
}
