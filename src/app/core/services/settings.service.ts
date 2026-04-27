import { Injectable } from '@angular/core';

export interface GameSettings {
  volume: number;
  language: 'es' | 'en';
}

/**
 * Servicio para manejar configuraciones del juego
 */
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  
  private readonly STORAGE_KEY = 'blackForestSettings';
  private settings: GameSettings = {
    volume: 0.5,
    language: 'es',
  };

  constructor() {
    this.loadSettings();
  }

  /**
   * Carga las configuraciones desde localStorage
   */
  private loadSettings() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        this.settings = JSON.parse(stored);
      } catch (error) {
        console.error('Error al cargar configuraciones:', error);
      }
    }
  }

  /**
   * Guarda las configuraciones en localStorage
   */
  private saveSettings() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
  }

  /**
   * Obtiene todas las configuraciones
   */
  getSettings(): GameSettings {
    return { ...this.settings };
  }

  /**
   * Obtiene el volumen actual (0-1)
   */
  getVolume(): number {
    return this.settings.volume;
  }

  /**
   * Establece el volumen (0-1)
   */
  setVolume(volume: number) {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  /**
   * Obtiene el idioma actual
   */
  getLanguage(): 'es' | 'en' {
    return this.settings.language;
  }

  /**
   * Establece el idioma
   */
  setLanguage(language: 'es' | 'en') {
    this.settings.language = language;
    this.saveSettings();
  }

  /**
   * Resetea las configuraciones a valores por defecto
   */
  resetSettings() {
    this.settings = {
      volume: 0.5,
      language: 'es',
    };
    this.saveSettings();
  }
}
