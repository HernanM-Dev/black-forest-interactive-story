import { Injectable } from '@angular/core';
import { InfoEntry } from '../models/player-state.model';

/**
 * Base de datos de entradas de información disponibles
 * Filosofía: piezas de rompecabezas, no respuestas directas
 */
@Injectable({
  providedIn: 'root',
})
export class InfoDatabaseService {
  
  private infoDatabase: Record<string, Omit<InfoEntry, 'discoveredAt'>> = {

    // ─── PERSONAS ───────────────────────────────────────────────────────────────

    'jane_preocupada': {
      id: 'jane_preocupada',
      title: 'Jane — Distracción',
      description: 'Olvidaste la lista de la compra. Jane lo tomó con calma, pero algo en su mirada no encajaba. Como si esperara que fallaras.',
      category: 'persona',
    },
    'jane_suenos_bosque': {
      id: 'jane_suenos_bosque',
      title: 'Jane — Sonámbula',
      description: 'Jane estaba de pie en el límite del jardín, mirando el bosque. Dice que caminó dormida. Nunca antes lo había hecho.',
      category: 'persona',
    },
    'jane_marcada': {
      id: 'jane_marcada',
      title: 'Jane — Algo bajo la piel',
      description: 'Don Manuel dijo que Jane es "más sensible". Que ya la han "marcado". No explicó qué significa eso. No quiso.',
      category: 'persona',
    },
    'don_manuel_advertencia': {
      id: 'don_manuel_advertencia',
      title: 'Don Manuel — Primera señal',
      description: 'Te advirtió que evitaras la carretera vieja. Dijo que había obras. No hay obras. La carretera está vacía.',
      category: 'persona',
    },
    'don_manuel_advertencia_bosque': {
      id: 'don_manuel_advertencia_bosque',
      title: 'Don Manuel — No entres',
      description: 'Vino a tu casa con urgencia. Su único mensaje: "No entres al bosque. Pase lo que pase." Olía a tierra húmeda y a algo más.',
      category: 'persona',
    },
    'don_manuel_mapa': {
      id: 'don_manuel_mapa',
      title: 'Don Manuel — El mapa',
      description: 'En la pared de su casa viste un mapa del bosque cubierto de marcas. Cuando lo notaste, él se interpuso para bloquearte la vista.',
      category: 'persona',
    },
    'sarah_local': {
      id: 'sarah_local',
      title: 'Sarah — Nacida aquí',
      description: 'Sarah lleva toda la vida en Oakhurst. Sus padres también. Y sus abuelos. Lo dijo como si fuera una advertencia, no un dato.',
      category: 'persona',
    },
    'sarah_insomnio': {
      id: 'sarah_insomnio',
      title: 'Sarah — Manos ocupadas',
      description: 'Barría a las siete de la mañana para "no pensar". Cuando le preguntaste en qué, no respondió. Solo dijo: "Depende de lo que uno esté tratando de no pensar."',
      category: 'persona',
    },
    'senora_higgins': {
      id: 'senora_higgins',
      title: 'Señora Higgins — La mermelada',
      description: 'Vive al final del pueblo, cerca de la carretera vieja. Hace mermeladas desde antes de que Sarah naciera. Siempre usa la misma foto del bosque en las etiquetas.',
      category: 'persona',
    },
    'secreto_don_manuel': {
      id: 'secreto_don_manuel',
      title: 'Don Manuel — Lo que no dijo',
      description: 'Decidiste no contarle a Jane lo que dijo Don Manuel. Pero sus palabras siguen ahí: "A quién llevar." "Mi mujer volvió. Pero no era ella."',
      category: 'persona',
    },

    // ─── EVENTOS ────────────────────────────────────────────────────────────────

    'tarros_fecha_extraña': {
      id: 'tarros_fecha_extraña',
      title: 'Tarros — Fecha futura',
      description: 'Las etiquetas de la mermelada de la señora Higgins tenían una fecha de elaboración dentro de tres meses. Todos los tarros. La misma fecha.',
      category: 'evento',
    },
    'ruidos_nocturnos': {
      id: 'ruidos_nocturnos',
      title: 'Bosque — Ruidos nocturnos',
      description: 'Sarah dijo: "Ruidos. Como si algo se moviera. Pero no hay nada." Luego añadió: "Hay cosas que es mejor no saber." Y cerró la conversación.',
      category: 'evento',
    },
    'puerta_abierta_misterio': {
      id: 'puerta_abierta_misterio',
      title: 'Puerta trasera — Abierta',
      description: 'La puerta que da al bosque estaba entreabierta por la mañana. Ni tú ni Jane la abriste. Ninguno de los dos recuerda haberlo hecho.',
      category: 'evento',
    },
    'voz_radio_noche': {
      id: 'voz_radio_noche',
      title: 'Radio — Voz en la estática',
      description: 'Al encender la radio de noche, entre la estática escuchaste algo. No era música. No era interferencia. Era un patrón. Repetido. Como si alguien intentara comunicarse.',
      category: 'evento',
    },
    'devueltos_no_son_mismos': {
      id: 'devueltos_no_son_mismos',
      title: 'Los que vuelven',
      description: 'Don Manuel dijo que algunos regresan del bosque. Pero no son los mismos. "Algo les falta. O algo les sobra." Su mujer fue una de ellos.',
      category: 'evento',
    },
    'negacion_colectiva': {
      id: 'negacion_colectiva',
      title: 'El pueblo — Aprenden a no ver',
      description: 'Don Manuel explicó por qué habló contigo: "Porque usted preguntó. Aquí la gente aprende a no ver." Nadie más hace preguntas.',
      category: 'evento',
    },
    'mensaje_jane_visto': {
      id: 'mensaje_jane_visto',
      title: 'Mensaje de Jane — Leído',
      description: 'El mensaje decía: "Mami, últimamente siento que no soy yo. Como si hubiera alguien más dentro de mi cabeza. Alguien que me llama. Desde el bosque. No se lo digas a Daniel, no quiere—" Se cortó ahí.',
      category: 'evento',
    },
    'confrontacion_mensaje': {
      id: 'confrontacion_mensaje',
      title: 'Jane — La confesión',
      description: 'Cuando la confrontaste, Jane admitió que siente "algo dentro" que la llama desde el bosque. Dijo que no sabe si quiere ir o quedarse. Que tiene miedo de no saber quién es.',
      category: 'evento',
    },
    'mensaje_jane_copiado': {
      id: 'mensaje_jane_copiado',
      title: 'Mensaje de Jane — Copiado',
      description: 'Copiaste el mensaje antes de dejarlo. Ahora tienes prueba de que Jane siente algo que no te ha contado. Y ella no sabe que lo sabes.',
      category: 'evento',
    },

    // ─── LUGARES ────────────────────────────────────────────────────────────────

    'posada_opcion': {
      id: 'posada_opcion',
      title: 'La Posada — Gente del pueblo',
      description: 'La posada podría ser un lugar para hablar con locales. El dueño lleva años aquí. Podría saber cosas que Sarah y Don Manuel no cuentan.',
      category: 'lugar',
    },

    // ─── OBJETOS ────────────────────────────────────────────────────────────────

    'grabacion_estatica': {
      id: 'grabacion_estatica',
      title: 'Grabación — Estática con ritmo',
      description: 'Jane grabó la estática de la radio con el móvil. Tiene ritmo. Intervalos regulares. Como un código. Nadie sabe qué dice, pero no es aleatoria.',
      category: 'objeto',
    },
    'diario_don_manuel': {
      id: 'diario_don_manuel',
      title: 'Diario — Lo que dijo Don Manuel',
      description: 'Escribiste todo lo que te contó Don Manuel. Las luces. Los sueños. Los que vuelven. La mujer que ya no era ella. Tienes que encontrar el patrón.',
      category: 'objeto',
    },

    // ─── CONCEPTOS ──────────────────────────────────────────────────────────────

    'advertencia_bosque_noche': {
      id: 'advertencia_bosque_noche',
      title: 'Regla — No al bosque de noche',
      description: 'Sarah fue clara: "No se le ocurra ir al bosque de noche." No como consejo de pueblo pequeño. Como advertencia real. Con miedo detrás.',
      category: 'concepto',
    },
    'advertencia_luces': {
      id: 'advertencia_luces',
      title: 'Regla — No mires las luces',
      description: 'Sarah añadió: "Si ve luces en la montaña, no las mire fijamente." No explicó por qué. Cerró el libro y dio la conversación por terminada.',
      category: 'concepto',
    },
    'luz_montana_compartida': {
      id: 'luz_montana_compartida',
      title: 'Luz en la montaña — Testigos',
      description: 'Llamaste a Jane para que viera la luz. Parpadeaba en intervalos regulares. Como un código. Como la estática de la radio. Se apagó cuando os vio mirarla.',
      category: 'concepto',
    },
    'luz_montana_personal': {
      id: 'luz_montana_personal',
      title: 'Luz en la montaña — Patrón',
      description: 'Contaste los parpadeos: dieciocho, pausa, doce, pausa. Se repite. No es una linterna. Es demasiado organizado para ser accidental.',
      category: 'concepto',
    },
  };

  /**
   * Obtiene la definición de una entrada de información
   */
  getInfoDefinition(id: string): Omit<InfoEntry, 'discoveredAt'> | null {
    return this.infoDatabase[id] || null;
  }

  /**
   * Crea una entrada de información completa
   */
  createInfoEntry(id: string): InfoEntry | null {
    const definition = this.getInfoDefinition(id);
    if (!definition) {
      console.warn('⚠️ Definición de información no encontrada:', id);
      return null;
    }

    return {
      ...definition,
      discoveredAt: Date.now(),
    };
  }
}
