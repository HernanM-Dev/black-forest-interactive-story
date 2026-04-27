# Sistema de Acciones de Regulación

## Descripción

Las Acciones de Regulación son conductas que el jugador puede realizar para manejar el estrés sin avanzar la historia. Inspirado en Project Zomboid, pero adaptado a una experiencia narrativa psicológica.

## Características Principales

- **No avanzan la historia**: Permaneces en la misma escena
- **Reducen estrés**: Principalmente, pero siempre con un costo
- **Son contextuales**: Solo aparecen en escenas apropiadas
- **Tienen límites**: Cooldown y usos por capítulo

## Condiciones de Aparición

### Requisitos Globales

```typescript
Estrés >= 50
Seguridad > 20
No se usó regulación en la escena anterior
La escena permite regulación (regulation.allowsRegulation = true)
```

### Cuándo NO aparecen

- Escenas de huida o confrontación
- Seguridad <= 20
- Cliffhangers o transiciones importantes
- Eventos críticos

## Acciones Disponibles

### 1. Respirar profundamente
- **ID**: `breathe_deeply`
- **Efectos**: Estrés -10, Control -5
- **Requisitos**: Control >= 30
- **Límite**: Ilimitado (con cooldown)

### 2. Aferrarse a la rutina
- **ID**: `routine_gesture`
- **Efectos**: Estrés -5, Información -5
- **Requisitos**: Ninguno
- **Límite**: Ilimitado (con cooldown)

### 3. Buscar un escape momentáneo
- **ID**: `evasive_behavior`
- **Efectos**: Estrés -15, Seguridad -5
- **Requisitos**: Ninguno
- **Límite**: 2 usos por capítulo

### 4. Distraer la mente
- **ID**: `distraction`
- **Efectos**: Estrés -8, Control -3
- **Requisitos**: Estrés >= 40
- **Límite**: Ilimitado (con cooldown)

## Configuración en Escenas (JSON)

### Habilitar regulación en una escena

```json
{
  "id": 201,
  "title": "Departamento vacío",
  "regulation": {
    "allowsRegulation": true,
    "availableActions": ["breathe_deeply", "routine_gesture", "distraction"]
  },
  "text": "...",
  "choices": [...]
}
```

### Deshabilitar regulación (por defecto)

```json
{
  "id": 200,
  "title": "Escena de acción",
  "text": "...",
  "choices": [...]
}
```

O explícitamente:

```json
{
  "id": 200,
  "regulation": {
    "allowsRegulation": false
  }
}
```

## Agregar Nuevas Acciones

### 1. Definir en RegulationService

```typescript
{
  id: 'nueva_accion',
  type: RegulationActionType.BREATHING, // o ROUTINE, EVASIVE, DISTRACTION
  text: 'Texto que ve el jugador',
  description: 'Descripción breve del efecto',
  effects: {
    stress: -1, // -10 en escala real
    control: -0.5, // -5 en escala real
  },
  requires: {
    control: 30, // Requisitos opcionales
  },
  usesPerChapter: 3, // Opcional: límite de usos
}
```

### 2. Agregar a escenas en JSON

```json
{
  "regulation": {
    "allowsRegulation": true,
    "availableActions": ["breathe_deeply", "nueva_accion"]
  }
}
```

## UI/UX

### Diferenciación Visual

- **Color**: Púrpura (#8b5cf6) vs Rojo (#dc2626) de decisiones
- **Icono**: Corazón (heart-outline)
- **Aviso**: "Estas acciones no avanzan la historia"
- **Posición**: Debajo de las decisiones narrativas

### Feedback

- Muestra efectos con iconos +/- en el lado derecho
- Animación al aplicar efectos
- La sección desaparece después de usar una acción

## Objetivos del Sistema

1. **Evitar soft-lock**: El jugador no queda atrapado por estrés alto
2. **Mantener tensión**: Las acciones tienen costos, no son "gratis"
3. **Reforzar narrativa**: Las conductas reflejan el estado psicológico
4. **Decisiones significativas**: El jugador debe elegir cuándo regular

## Extensibilidad

El sistema está diseñado para:
- Agregar nuevas acciones fácilmente
- Configurar por escena qué acciones están disponibles
- Ajustar condiciones globales (MIN_STRESS, MIN_SAFETY, etc.)
- Implementar nuevos tipos de regulación en el futuro

## Ejemplo de Flujo

1. Jugador llega a escena 201 con Estrés = 60, Seguridad = 40
2. Sistema verifica condiciones: ✅ Estrés >= 50, ✅ Seguridad > 20
3. Escena permite regulación: ✅ `allowsRegulation: true`
4. Se muestran 3 acciones disponibles
5. Jugador elige "Respirar profundamente"
6. Estrés baja a 50, Control baja a 35
7. Feedback visual muestra los cambios
8. Sección de regulación desaparece
9. Jugador continúa con las decisiones narrativas
10. En la siguiente escena, no puede usar regulación (cooldown)

## Notas Técnicas

- Los efectos en el código usan escala 0-100
- Los efectos en JSON se multiplican por 10 automáticamente
- El capítulo se determina por el rango de IDs de escena:
  - Capítulo 1: 100-199
  - Capítulo 2: 200-299
  - Capítulo 3: 300-399
  - etc.
