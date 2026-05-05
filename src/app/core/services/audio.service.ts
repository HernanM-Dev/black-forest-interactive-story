import { Injectable } from '@angular/core';

/**
 * Servicio para manejar audio del juego
 */
@Injectable({
  providedIn: 'root',
})
export class AudioService {
  
  private heartbeatAudio: HTMLAudioElement | null = null;
  private ambientAudio: HTMLAudioElement | null = null;
  private audioUnlocked = false; // Flag para saber si el audio está desbloqueado
  
  // Volumen base para cada tipo de audio (relativo al volumen general)
  private readonly HEARTBEAT_VOLUME_RATIO = 0.20; // 20% del volumen general (más bajo para menús)
  private readonly AMBIENT_VOLUME_RATIO = 0.12; // 12% del volumen general (muy bajo para menús)
  private readonly AMBIENT_GAMEPLAY_RATIO = 0.25; // 25% para gameplay (más alto en escenas)

  private readonly fadeHandles: Record<
    'heartbeat' | 'ambient',
    { rafId: number | null }
  > = {
    heartbeat: { rafId: null },
    ambient: { rafId: null },
  };

  constructor() {}

  /**
   * Reproduce el sonido de latidos del corazón
   */
  playHeartbeat(loop: boolean = true, volume: number = 0.3) {
    try {
      if (!this.heartbeatAudio) {
        this.heartbeatAudio = new Audio('/assets/audio/dragon-studio-heartbeat-sound-372448.mp3');
        this.heartbeatAudio.volume = 0;
        
        // Preload para evitar delays
        this.heartbeatAudio.preload = 'auto';
        
        // Loop manual para evitar el glitch al final
        if (loop) {
          this.heartbeatAudio.addEventListener('timeupdate', () => {
            if (this.heartbeatAudio && this.heartbeatAudio.currentTime >= this.heartbeatAudio.duration - 0.3) {
              // Reiniciar antes del final para evitar el glitch
              this.heartbeatAudio.currentTime = 0;
            }
          });
        }
      }
      
      // Intentar reproducir
      const playPromise = this.heartbeatAudio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Audio desbloqueado exitosamente
            this.audioUnlocked = true;
            // Fade in suave al iniciar
            this.fadeIn('heartbeat', this.heartbeatAudio!, volume * this.HEARTBEAT_VOLUME_RATIO, 500);
          })
          .catch(error => {
            console.warn('Audio bloqueado por el navegador. Se reproducirá después de la primera interacción.', error.name);
          });
      }
    } catch (error) {
      console.error('Error al inicializar audio de latidos:', error);
    }
  }

  /**
   * Detiene el sonido de latidos con fade out suave
   */
  stopHeartbeat(fadeOutDuration: number = 800) {
    if (this.heartbeatAudio) {
      this.fadeOut('heartbeat', this.heartbeatAudio, fadeOutDuration, () => {
        if (this.heartbeatAudio) {
          this.heartbeatAudio.pause();
          this.heartbeatAudio.currentTime = 0;
          this.heartbeatAudio = null;
        }
      });
    }
  }

  /**
   * Fade in suave
   */
  private fadeIn(
    channel: 'heartbeat' | 'ambient',
    audio: HTMLAudioElement,
    targetVolume: number,
    duration: number
  ) {
    this.fadeTo(channel, audio, targetVolume, duration);
  }

  /**
   * Fade out suave
   */
  private fadeOut(
    channel: 'heartbeat' | 'ambient',
    audio: HTMLAudioElement,
    duration: number,
    callback?: () => void
  ) {
    this.fadeTo(channel, audio, 0, duration, callback);
  }

  private cancelFade(channel: 'heartbeat' | 'ambient') {
    const handle = this.fadeHandles[channel];
    if (handle.rafId !== null) {
      cancelAnimationFrame(handle.rafId);
      handle.rafId = null;
    }
  }

  private fadeTo(
    channel: 'heartbeat' | 'ambient',
    audio: HTMLAudioElement,
    targetVolume: number,
    duration: number,
    callback?: () => void
  ) {
    this.cancelFade(channel);

    const clampedTargetVolume = Math.max(0, Math.min(1, targetVolume));
    if (duration <= 0) {
      audio.volume = clampedTargetVolume;
      callback?.();
      return;
    }

    const startVolume = audio.volume;
    const delta = clampedTargetVolume - startVolume;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      audio.volume = Math.max(0, Math.min(1, startVolume + (delta * t)));

      if (t >= 1) {
        this.fadeHandles[channel].rafId = null;
        callback?.();
        return;
      }

      this.fadeHandles[channel].rafId = requestAnimationFrame(step);
    };

    this.fadeHandles[channel].rafId = requestAnimationFrame(step);
  }

  /**
   * Reproduce sonido ambiente (estática, viento, etc)
   * @param audioPath Ruta del archivo de audio
   * @param loop Si debe reproducirse en loop
   * @param volume Volumen base (0-1)
   * @param isGameplay Si es para gameplay (volumen más alto) o menú (volumen bajo)
   */
  playAmbient(audioPath: string, loop: boolean = true, volume: number = 0.2, isGameplay: boolean = false) {
    try {
      // Si ya estamos reproduciendo la misma pista, no reiniciarla (mantener posición)
      if (this.ambientAudio && this.ambientAudio.src && this.ambientAudio.src.indexOf(audioPath) !== -1) {
        // Ajustar loop/volumen si es necesario y salir
        this.ambientAudio.loop = loop;
        const volumeRatio = isGameplay ? this.AMBIENT_GAMEPLAY_RATIO : this.AMBIENT_VOLUME_RATIO;
        this.fadeIn('ambient', this.ambientAudio, volume * volumeRatio, 600);
        return;
      }

      if (this.ambientAudio) {
        this.stopAmbient(0); // Detener inmediatamente sin fade
      }

      this.ambientAudio = new Audio(audioPath);
      this.ambientAudio.loop = loop;
      this.ambientAudio.volume = 0;
      this.ambientAudio.preload = 'auto';
      
      // Usar ratio diferente según contexto
      const volumeRatio = isGameplay ? this.AMBIENT_GAMEPLAY_RATIO : this.AMBIENT_VOLUME_RATIO;
      
      // Intentar reproducir
      const playPromise = this.ambientAudio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Audio desbloqueado exitosamente
            this.audioUnlocked = true;
            // Fade in suave con volumen ajustado
            this.fadeIn('ambient', this.ambientAudio!, volume * volumeRatio, 2000);
          })
          .catch(error => {
            console.warn('Audio ambiente bloqueado por el navegador. Se reproducirá después de la primera interacción.', error.name);
          });
      }
    } catch (error) {
      console.error('Error al inicializar audio ambiente:', error);
    }
  }

  /**
   * Detiene el sonido ambiente con fade out
   */
  stopAmbient(fadeOutDuration: number = 1000) {
    if (this.ambientAudio) {
      this.fadeOut('ambient', this.ambientAudio, fadeOutDuration, () => {
        if (this.ambientAudio) {
          this.ambientAudio.pause();
          this.ambientAudio.currentTime = 0;
          this.ambientAudio = null;
        }
      });
    }
  }

  /**
   * Detiene todos los sonidos con fade out
   */
  stopAll(fadeOutDuration: number = 800) {
    this.stopHeartbeat(fadeOutDuration);
    this.stopAmbient(fadeOutDuration);
  }

  /**
   * Ajusta el volumen del audio de latidos
   */
  setHeartbeatVolume(volume: number) {
    if (this.heartbeatAudio) {
      this.heartbeatAudio.volume = Math.max(0, Math.min(1, volume * this.HEARTBEAT_VOLUME_RATIO));
    }
  }

  /**
   * Ajusta el volumen del audio ambiente
   * @param volume Volumen (0-1)
   * @param isGameplay Si es para gameplay o menú
   */
  setAmbientVolume(volume: number, isGameplay: boolean = false) {
    if (this.ambientAudio) {
      const volumeRatio = isGameplay ? this.AMBIENT_GAMEPLAY_RATIO : this.AMBIENT_VOLUME_RATIO;
      this.ambientAudio.volume = Math.max(0, Math.min(1, volume * volumeRatio));
    }
  }

  /**
   * Ajusta el volumen de todos los audios activos
   */
  setMasterVolume(volume: number) {
    this.setHeartbeatVolume(volume);
    this.setAmbientVolume(volume);
  }
}
