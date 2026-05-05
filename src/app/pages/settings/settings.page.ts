import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonList,
  IonItem,
  IonLabel,
  IonRange,
  IonSelect,
  IonSelectOption,
  IonIcon,
  AlertController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { volumeHighOutline, languageOutline, informationCircleOutline } from 'ionicons/icons';
import { SettingsService } from '../../core/services/settings.service';
import { AudioService } from '../../core/services/audio.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonList,
    IonItem,
    IonLabel,
    IonRange,
    IonSelect,
    IonSelectOption,
    IonIcon,
    CommonModule,
    FormsModule,
    TranslateModule,
  ],
})
export class SettingsPage implements OnInit, OnDestroy {
  
  volume = 50; // 0-100 para el slider
  language: 'es' | 'en' = 'es';
  private previousLanguage: 'es' | 'en' = 'es';

  constructor(
    private router: Router,
    private settingsService: SettingsService,
    private audioService: AudioService,
    private translate: TranslateService,
    private alertController: AlertController
  ) {
    // Registrar iconos
    addIcons({ volumeHighOutline, languageOutline, informationCircleOutline });
  }

  /**
   * Formatea el valor del pin del slider
   */
  pinFormatter = (value: number) => {
    return `${value}%`;
  };

  ngOnInit() {
    // Cargar configuraciones actuales
    const settings = this.settingsService.getSettings();
    this.volume = settings.volume * 100; // Convertir 0-1 a 0-100
    this.language = settings.language;
    this.previousLanguage = settings.language;

    // Reproducir latidos y ambiente de fondo
    this.audioService.playHeartbeat(true, settings.volume);
    this.audioService.playAmbient('/assets/audio/tunetank-dark-space-ambient-348870.mp3', true, settings.volume);
  }

  ngOnDestroy() {
    // Detener todos los audios al salir
    this.audioService.stopAll();
  }

  /**
   * Maneja el cambio de volumen
   */
  onVolumeChange(event: any) {
    const value = event.detail.value / 100; // Convertir 0-100 a 0-1
    this.settingsService.setVolume(value);
    
    // Actualizar volumen de todos los audios en tiempo real
    this.audioService.setMasterVolume(value);
  }

  /**
   * Maneja el cambio de idioma
   */
  async onLanguageChange(event: any) {
    const lang = event.detail.value as 'es' | 'en';
    await this.confirmLanguageChange(lang);
  }

  private async confirmLanguageChange(lang: 'es' | 'en') {
    const alert = await this.alertController.create({
      header: this.translate.instant('SETTINGS.CONFIRM_RELOAD_HEADER'),
      message: this.translate.instant('SETTINGS.CONFIRM_RELOAD_MESSAGE'),
      buttons: [
        {
          text: this.translate.instant('SETTINGS.CANCEL'),
          role: 'cancel',
          handler: () => {
            this.language = this.previousLanguage;
          },
        },
        {
          text: this.translate.instant('SETTINGS.ACCEPT'),
          handler: () => {
            this.settingsService.setLanguage(lang);
            this.previousLanguage = lang;
            this.translate.use(lang);
            window.location.reload();
          },
        },
      ],
    });

    await alert.present();
  }

  /**
   * Navega a la pantalla de créditos (próximamente)
   */
  openCredits() {
    // TODO: Implementar página de créditos
    console.log('Créditos - Próximamente');
  }

  /**
   * Vuelve a la pantalla anterior
   */
  goBack() {
    this.router.navigate(['/home']);
  }
}
