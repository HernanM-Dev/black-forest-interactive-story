# Fix: Indicador de Decisiones No Aparecía

## Problema

El indicador "Las decisiones te esperan..." no aparecía en algunas escenas, dejando al jugador sin forma de avanzar.

### Causa

El indicador solo aparecía cuando el usuario scrolleaba hasta el final del texto. Si el texto era corto y no requería scroll, el indicador nunca se mostraba.

**Escenario problemático**:
```
Texto corto (no requiere scroll)
    ↓
Usuario espera...
    ↓
Indicador nunca aparece ❌
    ↓
Jugador atascado
```

---

## Solución

Implementar dos mecanismos para mostrar el indicador:

### 1. Timer Automático (Nuevo)

El indicador aparece automáticamente después de 2 segundos, independientemente del scroll:

```typescript
setTimeout(() => {
  if (!this.isDecisionModalOpen) {
    this.showDecisionPrompt = true;
    
    // Abrir modal automáticamente después de 1s adicional
    this.decisionPromptTimeout = setTimeout(() => {
      if (this.showDecisionPrompt && !this.isDecisionModalOpen) {
        this.openDecisionModal();
      }
    }, 1000);
  }
}, 2000); // Aparece después de 2 segundos
```

**Flujo**:
```
Escena carga
    ↓
Espera 2 segundos (tiempo de lectura)
    ↓
Indicador aparece ✅
    ↓
Espera 1 segundo adicional
    ↓
Modal se abre automáticamente
```

### 2. Detección de Scroll Mejorada

Detecta tanto el final del scroll como cuando no se necesita scroll:

```typescript
onNarrativeScroll(event: any) {
  const element = event.target;
  const scrollTop = element.scrollTop;
  const scrollHeight = element.scrollHeight;
  const clientHeight = element.clientHeight;
  
  // Detectar final del scroll
  const isAtEnd = scrollTop + clientHeight >= scrollHeight - 50;
  
  // Detectar si no se necesita scroll (texto corto)
  const noScrollNeeded = scrollHeight <= clientHeight + 10;
  
  if ((isAtEnd || noScrollNeeded) && !this.showDecisionPrompt) {
    this.showDecisionPrompt = true;
    // ... abrir modal después de 1s
  }
}
```

---

## Comparación

### Antes (Problemático)

**Texto largo**:
```
Usuario lee → Scrollea → Llega al final → Indicador aparece ✅
```

**Texto corto**:
```
Usuario lee → No scrollea → Indicador nunca aparece ❌
```

### Ahora (Solucionado)

**Texto largo**:
```
Opción A: Usuario scrollea → Llega al final → Indicador aparece ✅
Opción B: Espera 2s → Indicador aparece automáticamente ✅
```

**Texto corto**:
```
Opción A: Espera 2s → Indicador aparece automáticamente ✅
Opción B: Scrollea (detecta no scroll needed) → Indicador aparece ✅
```

---

## Timing del Flujo

```
t=0s:    Escena carga
t=0.3s:  Fade in completo
t=2.3s:  Indicador aparece (si no ha aparecido por scroll)
t=3.3s:  Modal se abre automáticamente
```

**Total**: 3.3 segundos desde la carga hasta el modal (si el usuario no interactúa)

**Justificación**:
- 2 segundos: Tiempo razonable para leer texto corto
- 1 segundo adicional: Tiempo para ver el indicador antes del modal
- Usuario puede tocar el indicador en cualquier momento para abrir antes

---

## Casos de Uso

### Caso 1: Texto Muy Corto
```
Texto: "Te mira como si ya conociera la respuesta."

Flujo:
- t=0s: Texto aparece
- t=2s: Indicador aparece (timer automático)
- t=3s: Modal se abre
```

### Caso 2: Texto Medio (Sin Scroll)
```
Texto: 3-4 líneas

Flujo:
- t=0s: Texto aparece
- Usuario lee tranquilamente
- t=2s: Indicador aparece (timer automático)
- Usuario toca indicador → Modal se abre inmediatamente
```

### Caso 3: Texto Largo (Con Scroll)
```
Texto: 10+ líneas

Flujo:
- t=0s: Texto aparece
- Usuario scrollea mientras lee
- t=1.5s: Usuario llega al final → Indicador aparece (scroll detection)
- t=2.5s: Modal se abre automáticamente
```

### Caso 4: Usuario Rápido
```
Texto: Cualquier longitud

Flujo:
- t=0s: Texto aparece
- t=0.5s: Usuario scrollea rápido al final
- t=0.5s: Indicador aparece (scroll detection)
- t=1.5s: Modal se abre automáticamente
```

---

## Prevención de Duplicados

**Problema potencial**: Timer y scroll detection podrían activar el indicador dos veces.

**Solución**: Verificar que el indicador no esté ya visible:

```typescript
if (!this.showDecisionPrompt && !this.isDecisionModalOpen) {
  this.showDecisionPrompt = true;
  // ...
}
```

**Limpiar timeout anterior**:
```typescript
if (this.decisionPromptTimeout) {
  clearTimeout(this.decisionPromptTimeout);
}
```

---

## Testing

### Checklist
- [ ] Texto corto: Indicador aparece después de 2s
- [ ] Texto largo: Indicador aparece al scrollear al final
- [ ] Texto medio: Indicador aparece por timer o scroll (lo que ocurra primero)
- [ ] Usuario rápido: Indicador aparece inmediatamente al llegar al final
- [ ] No hay duplicados: Solo un indicador aparece
- [ ] Modal se abre automáticamente después de 1s del indicador
- [ ] Tocar indicador abre modal inmediatamente

### Escenarios de Prueba

#### 1. Texto Corto (1-2 líneas)
```
Pasos:
1. Cargar escena con texto corto
2. Esperar sin hacer nada

Resultado esperado:
- t=2s: Indicador aparece
- t=3s: Modal se abre
```

#### 2. Texto Largo (10+ líneas)
```
Pasos:
1. Cargar escena con texto largo
2. Scrollear inmediatamente al final

Resultado esperado:
- Indicador aparece al llegar al final
- Modal se abre 1s después
```

#### 3. Usuario Indeciso
```
Pasos:
1. Cargar escena
2. Leer lentamente
3. No scrollear

Resultado esperado:
- t=2s: Indicador aparece
- t=3s: Modal se abre automáticamente
```

#### 4. Usuario Impaciente
```
Pasos:
1. Cargar escena
2. Scrollear rápido al final
3. Tocar indicador inmediatamente

Resultado esperado:
- Indicador aparece al llegar al final
- Modal se abre inmediatamente al tocar
```

---

## Archivos Modificados

### TypeScript
- `src/app/pages/scene/scene.page.ts`
  - Añadido timer automático en `loadScene()` (2s delay)
  - Mejorado `onNarrativeScroll()` para detectar texto sin scroll
  - Añadida limpieza de timeout para prevenir duplicados

---

## Beneficios

### Para el Jugador
- ✅ Nunca se queda atascado
- ✅ Siempre hay una forma de avanzar
- ✅ Experiencia fluida sin importar la longitud del texto
- ✅ Control total (puede esperar o tocar para avanzar)

### Para el Diseño
- ✅ Funciona con textos de cualquier longitud
- ✅ Timing razonable (2s + 1s)
- ✅ Dos mecanismos de activación (redundancia)
- ✅ Prevención de duplicados

### Para el Desarrollo
- ✅ Código robusto
- ✅ Fácil de ajustar timings
- ✅ Bien documentado
- ✅ Fácil de debuggear

---

## Ajustes Futuros

Si el timing no se siente correcto, se pueden ajustar fácilmente:

### Timing Más Rápido
```typescript
setTimeout(() => {
  this.showDecisionPrompt = true;
}, 1500); // 1.5s en lugar de 2s
```

### Timing Más Lento
```typescript
setTimeout(() => {
  this.showDecisionPrompt = true;
}, 3000); // 3s en lugar de 2s
```

### Modal Más Rápido
```typescript
this.decisionPromptTimeout = setTimeout(() => {
  this.openDecisionModal();
}, 500); // 0.5s en lugar de 1s
```

---

## Conclusión

El problema se solucionó implementando un timer automático que asegura que el indicador siempre aparezca, independientemente de si el texto requiere scroll o no.

**Flujo garantizado**:
- Indicador aparece en máximo 2 segundos
- Modal se abre en máximo 3 segundos
- Usuario nunca se queda atascado

**Estado**: ✅ Solucionado
**Impacto**: Crítico - Permite avanzar en el juego
**Compatibilidad**: 100% compatible con textos de cualquier longitud
