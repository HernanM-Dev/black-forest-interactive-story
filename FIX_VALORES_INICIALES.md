# Fix: Valores Iniciales de Indicadores

## Problema

Al iniciar un nuevo juego, los indicadores de Seguridad y Control aparecían con valores (60 y 40 respectivamente), cuando deberían estar en 0 como Información y Estrés.

### Estado Anterior
```typescript
indicators: {
  info: 0,      // ✅ Correcto
  stress: 0,    // ✅ Correcto
  safety: 60,   // ❌ Incorrecto - debería ser 0
  control: 40,  // ❌ Incorrecto - debería ser 0
}
```

### Visualización del Problema
```
Inicio del juego:
┌─────────────────────────────────┐
│ ℹ️  Info:     ░░░░░░░░░░  0%   │ ✅
│ ⚡ Estrés:   ░░░░░░░░░░  0%   │ ✅
│ 🛡️ Seguridad: ██████░░░░ 60%   │ ❌ No debería tener valor
│ ✋ Control:   ████░░░░░░ 40%   │ ❌ No debería tener valor
└─────────────────────────────────┘
```

---

## Causa

Los valores por defecto estaban configurados incorrectamente en el modelo `DEFAULT_PLAYER_STATE`.

**Archivo**: `src/app/core/models/player-state.model.ts`

**Razón original**: Probablemente se configuraron así para testing o para dar al jugador una "ventaja inicial", pero no tiene sentido narrativo que el jugador comience con seguridad y control sin haber hecho nada.

---

## Solución

Cambiar todos los indicadores a 0 al inicio del juego.

### Código Modificado

**Antes**:
```typescript
export const DEFAULT_PLAYER_STATE: PlayerState = {
  indicators: {
    info: 0,
    stress: 0,
    safety: 60,    // ❌
    control: 40,   // ❌
  },
  currentSceneId: 100,
  visitedScenes: [],
  decisions: [],
  flags: {},
  infoEntries: [],
  regulationUsage: [],
  lastRegulationScene: undefined,
};
```

**Después**:
```typescript
export const DEFAULT_PLAYER_STATE: PlayerState = {
  indicators: {
    info: 0,       // ✅
    stress: 0,     // ✅
    safety: 0,     // ✅ Corregido
    control: 0,    // ✅ Corregido
  },
  currentSceneId: 100,
  visitedScenes: [],
  decisions: [],
  flags: {},
  infoEntries: [],
  regulationUsage: [],
  lastRegulationScene: undefined,
};
```

---

## Resultado

### Visualización Correcta
```
Inicio del juego:
┌─────────────────────────────────┐
│ ℹ️  Info:     ░░░░░░░░░░  0%   │ ✅
│ ⚡ Estrés:   ░░░░░░░░░░  0%   │ ✅
│ 🛡️ Seguridad: ░░░░░░░░░░  0%   │ ✅ Corregido
│ ✋ Control:   ░░░░░░░░░░  0%   │ ✅ Corregido
└─────────────────────────────────┘
```

Ahora todos los indicadores comienzan en 0, y el jugador debe ganarlos a través de sus decisiones.

---

## Impacto en el Juego

### Narrativo
- ✅ Más coherente: El jugador comienza sin conocimiento, sin estrés, sin seguridad y sin control
- ✅ Progresión clara: Los indicadores suben/bajan según las decisiones
- ✅ Mayor tensión: El jugador debe construir su seguridad y control desde cero

### Mecánicas
- ✅ Decisiones más importantes: Cada punto ganado cuenta
- ✅ Acciones de regulación más valiosas: Reducir estrés es crítico cuando no hay control
- ✅ Opciones bloqueadas: Algunas decisiones pueden requerir seguridad/control mínimo

### Balance
**Antes**:
- Jugador comenzaba con 60% seguridad y 40% control
- Menos presión inicial
- Menos necesidad de tomar decisiones cuidadosas

**Ahora**:
- Jugador comienza con 0% en todo
- Mayor presión desde el inicio
- Cada decisión es más significativa

---

## Consideraciones de Diseño

### ¿Por qué todos en 0?

**Información (0)**: ✅ Correcto
- El jugador no sabe nada al inicio
- Debe descubrir información a través de la historia

**Estrés (0)**: ✅ Correcto
- El jugador comienza tranquilo
- El estrés aumenta con eventos tensos

**Seguridad (0)**: ✅ Correcto ahora
- El jugador no está en un lugar seguro al inicio
- Debe encontrar seguridad a través de decisiones

**Control (0)**: ✅ Correcto ahora
- El jugador no tiene control de la situación al inicio
- Debe ganar control a través de decisiones inteligentes

### Progresión Esperada

```
Escena 100 (Inicio):
Info: 0, Estrés: 0, Seguridad: 0, Control: 0

Escena 102 (Después de leer noticias):
Info: 10, Estrés: 10, Seguridad: 0, Control: 0

Escena 105 (Después de decisiones):
Info: 20, Estrés: 20, Seguridad: 10, Control: 5

Escena 108 (Final Capítulo 1):
Info: 30, Estrés: 30, Seguridad: 20, Control: 15
```

---

## Testing

### Checklist
- [ ] Nuevo juego muestra todos los indicadores en 0
- [ ] Barras de progreso están vacías al inicio
- [ ] Colores de indicadores son correctos (low = rojo)
- [ ] Decisiones aumentan/disminuyen indicadores correctamente
- [ ] No hay errores en consola
- [ ] localStorage se resetea correctamente

### Escenarios de Prueba

#### 1. Nuevo Juego
```
Pasos:
1. Hacer clic en "Nuevo Juego"
2. Hacer clic en "Continuar" en intro
3. Observar indicadores en escena 100

Resultado esperado:
- Todos los indicadores en 0%
- Barras vacías
- Colores rojos (nivel bajo)
```

#### 2. Progresión Normal
```
Pasos:
1. Iniciar nuevo juego
2. Tomar decisión que aumente seguridad
3. Observar cambio en indicador

Resultado esperado:
- Seguridad aumenta desde 0
- Barra se llena gradualmente
- Color cambia según el nivel
```

#### 3. Reset de Juego
```
Pasos:
1. Jugar hasta tener indicadores con valores
2. Volver al menú
3. Hacer clic en "Nuevo Juego"
4. Observar indicadores

Resultado esperado:
- Todos los indicadores vuelven a 0
- Estado se resetea completamente
```

---

## Archivos Modificados

### Modelos
- `src/app/core/models/player-state.model.ts`
  - `DEFAULT_PLAYER_STATE.indicators.safety`: 60 → 0
  - `DEFAULT_PLAYER_STATE.indicators.control`: 40 → 0

### Documentación
- `FIX_VALORES_INICIALES.md` - Este archivo (nuevo)

---

## Notas Importantes

### Para Partidas Guardadas

**Importante**: Este cambio solo afecta a nuevos juegos. Las partidas guardadas mantendrán sus valores actuales.

Si quieres resetear una partida existente:
1. Ir al menú principal
2. Hacer clic en "Nuevo Juego"
3. Esto reseteará todos los valores a 0

### Para Desarrollo

Si estás testeando y quieres valores iniciales diferentes, puedes modificar temporalmente `DEFAULT_PLAYER_STATE`:

```typescript
// Para testing rápido (NO COMMITEAR)
export const DEFAULT_PLAYER_STATE: PlayerState = {
  indicators: {
    info: 50,      // Para testing de decisiones bloqueadas
    stress: 50,    // Para testing de regulación
    safety: 50,    // Para testing de eventos críticos
    control: 50,   // Para testing de variantes narrativas
  },
  // ...
};
```

---

## Impacto en Otras Características

### Acciones de Regulación
- ✅ Más importantes: Con control en 0, el estrés es más peligroso
- ✅ Condiciones: Algunas acciones requieren control mínimo
- ✅ Estrategia: El jugador debe decidir cuándo usarlas

### Variantes Narrativas
- ✅ Más diversidad: Con valores en 0, las variantes basadas en indicadores son más variadas
- ✅ Progresión: El texto cambia más notablemente a medida que los indicadores suben

### Decisiones Bloqueadas
- ✅ Más frecuentes: Con valores en 0, más decisiones pueden estar bloqueadas al inicio
- ✅ Progresión: El jugador desbloquea opciones a medida que gana indicadores

---

## Conclusión

El cambio corrige un error de configuración que hacía que el jugador comenzara con valores arbitrarios en Seguridad y Control. Ahora todos los indicadores comienzan en 0, lo cual es:

- ✅ Más coherente narrativamente
- ✅ Más justo mecánicamente
- ✅ Más interesante estratégicamente
- ✅ Más claro para el jugador

**Estado**: ✅ Implementado y listo para testing
**Impacto**: Mejora la coherencia y el balance del juego
**Compatibilidad**: 100% compatible, solo afecta nuevos juegos
