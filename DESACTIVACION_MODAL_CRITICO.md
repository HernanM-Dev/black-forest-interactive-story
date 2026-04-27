# Desactivación del Modal de Advertencia Crítica

## Decisión

Se ha desactivado el modal de advertencia crítica que aparecía cuando los indicadores alcanzaban niveles peligrosos (estrés ≥ 80 o seguridad ≤ 20).

---

## Problema

El modal de advertencia crítica resultó ser demasiado intrusivo para la experiencia de juego:

### Issues Identificados

1. **Aparece demasiado temprano**: Con los valores iniciales en 0, cualquier decisión que baje la seguridad puede activar el modal inmediatamente

2. **Interrumpe el flujo narrativo**: El modal bloquea la lectura y rompe la inmersión en momentos críticos de la historia

3. **Demasiado dramático para el Capítulo 1**: El Capítulo 1 es tutorial, no debería tener advertencias tan alarmantes

4. **Redundante**: El jugador ya ve los indicadores en la barra superior y recibe feedback visual con los iconos +/-

### Ejemplo del Problema
```
Jugador en escena 100:
- Seguridad: 0
- Toma decisión que baja seguridad -10
- Seguridad: -10 (se clampea a 0, pero ya está en 0)
- ❌ Modal aparece: "¡Tu seguridad está en peligro!"
- Jugador: "¿Pero si acabo de empezar?"
```

---

## Solución

Desactivar completamente el modal de advertencia crítica por ahora.

### Código Modificado

**Antes**:
```typescript
private checkCriticalLevels() {
  if (!this.playerState) return;

  const { stress, safety } = this.playerState.indicators;

  if (stress >= 80 && !this.showCriticalWarning) {
    this.criticalWarningType = 'stress';
    this.criticalWarningMessage = 'Tu nivel de estrés es crítico...';
    this.showCriticalWarning = true;
  }
  else if (safety <= 20 && !this.showCriticalWarning) {
    this.criticalWarningType = 'safety';
    this.criticalWarningMessage = 'Tu seguridad está en peligro...';
    this.showCriticalWarning = true;
  }
}
```

**Ahora**:
```typescript
private checkCriticalLevels() {
  // DESACTIVADO: Modal demasiado intrusivo
  // Se puede reactivar en capítulos posteriores si es necesario
  
  /* Código comentado para referencia futura */
}
```

---

## Alternativas Consideradas

### 1. Toast Notification Sutil (Recomendado para futuro)
```typescript
// En lugar de modal, mostrar toast discreto
if (stress >= 80) {
  this.showWarningToast('Tu estrés es alto');
}
```

**Ventajas**:
- No bloquea la interacción
- Menos intrusivo
- Desaparece automáticamente

**Cuándo usar**: Capítulos 2-3 en adelante

### 2. Indicador Visual en la Barra
```scss
.indicator.critical {
  animation: pulse-red 1s infinite;
  border: 2px solid red;
}
```

**Ventajas**:
- Siempre visible
- No interrumpe
- Claro pero no molesto

**Cuándo usar**: Todos los capítulos

### 3. Texto Narrativo Integrado
```json
{
  "text": "Tu corazón late rápido. El estrés te está afectando.",
  "textVariants": [
    {
      "condition": "stress >= 80",
      "text": "Tu corazón late descontroladamente. Necesitas calmarte YA."
    }
  ]
}
```

**Ventajas**:
- Integrado en la narrativa
- No rompe la inmersión
- Más orgánico

**Cuándo usar**: Escenas clave en todos los capítulos

---

## Sistema de Feedback Actual

Con el modal desactivado, el jugador sigue recibiendo feedback a través de:

### 1. Barra de Indicadores (Siempre visible)
```
┌─────────────────────────────────┐
│ ℹ️  Info:     ████░░░░░░ 40%   │
│ ⚡ Estrés:   ████████░░ 80%   │ ← Color rojo indica peligro
│ 🛡️ Seguridad: ██░░░░░░░░ 20%   │ ← Color rojo indica peligro
│ ✋ Control:   ████░░░░░░ 40%   │
└─────────────────────────────────┘
```

### 2. Feedback Visual (Iconos +/-)
```
Lado derecho de la pantalla:
[🛡️ -] ← Seguridad bajó
[⚡ +] ← Estrés subió
```

### 3. Toast Notifications (Eventos positivos)
```
Parte superior central:
[✅ Te sientes más tranquilo] ← Cuando estrés baja mucho
```

### 4. Colores de Indicadores
- **Verde**: Nivel alto (80-100%)
- **Amarillo**: Nivel medio (40-60%)
- **Rojo**: Nivel bajo/crítico (0-20%)

---

## Cuándo Reactivar el Modal

El modal puede ser útil en situaciones específicas:

### Capítulo 3+: Eventos Críticos Narrativos
```typescript
// Solo en escenas específicas con eventos críticos
if (sceneId === 305 && safety <= 10) {
  this.showCriticalWarning = true;
  this.criticalWarningMessage = 'Estás en peligro mortal. Esta decisión puede ser la última.';
}
```

### Game Over Inminente
```typescript
// Solo cuando el jugador está a punto de perder
if (stress >= 95 || safety <= 5) {
  this.showCriticalWarning = true;
  this.criticalWarningMessage = 'Situación crítica. Actúa con cuidado.';
}
```

### Decisiones Irreversibles
```typescript
// Solo antes de decisiones que no se pueden deshacer
if (choice.id === 'decision_final' && stress >= 80) {
  this.showCriticalWarning = true;
  this.criticalWarningMessage = 'Tu estado mental puede afectar esta decisión crucial.';
}
```

---

## Recomendaciones de Diseño

### Para Capítulo 1 (Tutorial)
- ✅ Solo feedback visual (iconos, colores)
- ✅ Toast notifications para eventos positivos
- ❌ No modales de advertencia
- ❌ No interrupciones

### Para Capítulo 2-3 (Desarrollo)
- ✅ Feedback visual
- ✅ Toast notifications (positivos y negativos)
- ✅ Texto narrativo integrado
- ⚠️ Modales solo en momentos MUY específicos

### Para Capítulo 4+ (Clímax)
- ✅ Todo lo anterior
- ✅ Modales para eventos críticos narrativos
- ✅ Advertencias antes de decisiones irreversibles
- ✅ Game over warnings

---

## Filosofía de Diseño

### "Menos es Más"

El juego debe confiar en que el jugador:
- Puede leer los indicadores
- Entiende el sistema de feedback
- Toma decisiones informadas

### "Show, Don't Tell"

En lugar de decir "Tu seguridad está en peligro":
- Mostrar indicador rojo
- Integrar en la narrativa: "Sientes que algo no está bien"
- Dejar que el jugador descubra las consecuencias

### "Respeta la Inmersión"

Los modales rompen la inmersión:
- Sacan al jugador de la historia
- Hacen que el juego se sienta como "un juego"
- Reducen la tensión narrativa

---

## Código Comentado (Para Referencia)

El código del modal sigue en el archivo pero comentado, para facilitar su reactivación si es necesario:

```typescript
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
```

---

## Archivos Modificados

### TypeScript
- `src/app/pages/scene/scene.page.ts`
  - Método `checkCriticalLevels()` - Código comentado

### Documentación
- `DESACTIVACION_MODAL_CRITICO.md` - Este archivo (nuevo)

---

## Testing

### Checklist
- [ ] Modal NO aparece cuando seguridad baja
- [ ] Modal NO aparece cuando estrés sube
- [ ] Feedback visual sigue funcionando (iconos +/-)
- [ ] Toast notifications siguen funcionando
- [ ] Colores de indicadores funcionan correctamente
- [ ] No hay errores en consola

### Escenarios
1. **Seguridad baja a 0**: ✅ No aparece modal
2. **Estrés sube a 80**: ✅ No aparece modal
3. **Múltiples decisiones peligrosas**: ✅ No aparece modal
4. **Feedback visual funciona**: ✅ Iconos aparecen correctamente

---

## Conclusión

El modal de advertencia crítica se ha desactivado porque:

1. ❌ Demasiado intrusivo para el Capítulo 1
2. ❌ Aparece en momentos inapropiados
3. ❌ Rompe la inmersión narrativa
4. ❌ Redundante con el feedback visual existente

El sistema de feedback actual (indicadores, iconos, colores, toast) es suficiente para informar al jugador sin interrumpir la experiencia.

El modal puede reactivarse en capítulos posteriores para momentos narrativos específicos y críticos.

**Estado**: ✅ Desactivado
**Impacto**: Mejora la fluidez y la inmersión
**Futuro**: Considerar reactivación selectiva en capítulos avanzados
