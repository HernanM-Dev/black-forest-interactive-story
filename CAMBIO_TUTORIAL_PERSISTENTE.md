# Cambio: Tutorial Siempre Visible en Capítulo 1

## Resumen

Se modificó el comportamiento del botón de tutorial para que esté siempre visible durante todo el Capítulo 1, en lugar de desaparecer después de verlo una vez.

---

## Antes (Tutorial de Una Sola Vez)

### Comportamiento
1. Botón aparece en Capítulo 1
2. Usuario abre el tutorial
3. Usuario cierra el tutorial
4. Botón desaparece permanentemente
5. Se guarda en localStorage: `blackForestTutorialSeen = true`

### Código
```typescript
// ngOnInit
const tutorialSeenStorage = localStorage.getItem('blackForestTutorialSeen');
this.tutorialSeen = tutorialSeenStorage === 'true';

// loadScene
this.showTutorialButton = sceneId >= 100 && sceneId < 200 && !this.tutorialSeen;

// closeTutorial
closeTutorial() {
  this.isTutorialOpen = false;
  this.tutorialSeen = true;
  this.showTutorialButton = false;
  localStorage.setItem('blackForestTutorialSeen', 'true');
}
```

### Problema
- ❌ Usuario no puede volver a consultar el tutorial
- ❌ Si olvida algo, no tiene forma de recordarlo
- ❌ Mala experiencia para jugadores que necesitan ayuda múltiples veces
- ❌ localStorage innecesario para esta funcionalidad

---

## Después (Tutorial Siempre Disponible)

### Comportamiento
1. Botón aparece en TODAS las escenas del Capítulo 1
2. Usuario puede abrir el tutorial cuantas veces quiera
3. Usuario cierra el tutorial
4. Botón sigue visible
5. Botón desaparece automáticamente al llegar al Capítulo 2

### Código
```typescript
// ngOnInit - Sin localStorage
ngOnInit() {
  this.stateSubscription = this.gameState.getState().subscribe(state => {
    this.playerState = state;
  });

  this.route.params.subscribe(params => {
    const sceneId = parseInt(params['id'], 10);
    this.loadScene(sceneId);
  });
}

// loadScene - Solo verifica el capítulo
this.showTutorialButton = sceneId >= 100 && sceneId < 200;

// closeTutorial - Solo cierra el modal
closeTutorial() {
  this.isTutorialOpen = false;
}
```

### Beneficios
- ✅ Usuario puede consultar el tutorial cuando lo necesite
- ✅ Mejor experiencia para jugadores nuevos
- ✅ No hay frustración por perder acceso a la ayuda
- ✅ Código más simple (sin localStorage)
- ✅ Comportamiento más intuitivo

---

## Comparación Visual

### Antes
```
Capítulo 1, Escena 100
┌─────────────────────────┐
│  [?] Tutorial           │  ← Botón visible
└─────────────────────────┘

Usuario abre tutorial → Usuario cierra tutorial

Capítulo 1, Escena 101
┌─────────────────────────┐
│  (sin botón)            │  ← Botón desaparecido
└─────────────────────────┘

Usuario: "¿Cómo veo el tutorial otra vez?" ❌
```

### Ahora
```
Capítulo 1, Escena 100
┌─────────────────────────┐
│  [?] Tutorial           │  ← Botón visible
└─────────────────────────┘

Usuario abre tutorial → Usuario cierra tutorial

Capítulo 1, Escena 101
┌─────────────────────────┐
│  [?] Tutorial           │  ← Botón sigue visible ✅
└─────────────────────────┘

Capítulo 1, Escena 108
┌─────────────────────────┐
│  [?] Tutorial           │  ← Botón sigue visible ✅
└─────────────────────────┘

Capítulo 2, Escena 200
┌─────────────────────────┐
│  (sin botón)            │  ← Desaparece automáticamente
└─────────────────────────┘
```

---

## Lógica de Visibilidad

### Condición Simple
```typescript
this.showTutorialButton = sceneId >= 100 && sceneId < 200;
```

### Tabla de Visibilidad

| Escena | Capítulo | Botón Visible |
|--------|----------|---------------|
| 100    | 1        | ✅ Sí         |
| 101    | 1        | ✅ Sí         |
| 108    | 1        | ✅ Sí         |
| 199    | 1        | ✅ Sí         |
| 200    | 2        | ❌ No         |
| 201    | 2        | ❌ No         |

---

## Cambios en el Código

### Eliminado
```typescript
// Variable eliminada
tutorialSeen = false;

// Código eliminado de ngOnInit
const tutorialSeenStorage = localStorage.getItem('blackForestTutorialSeen');
this.tutorialSeen = tutorialSeenStorage === 'true';

// Código eliminado de loadScene
&& !this.tutorialSeen

// Código eliminado de closeTutorial
this.tutorialSeen = true;
this.showTutorialButton = false;
localStorage.setItem('blackForestTutorialSeen', 'true');
```

### Simplificado
```typescript
// loadScene - Antes
this.showTutorialButton = sceneId >= 100 && sceneId < 200 && !this.tutorialSeen;

// loadScene - Ahora
this.showTutorialButton = sceneId >= 100 && sceneId < 200;

// closeTutorial - Antes
closeTutorial() {
  this.isTutorialOpen = false;
  this.tutorialSeen = true;
  this.showTutorialButton = false;
  localStorage.setItem('blackForestTutorialSeen', 'true');
}

// closeTutorial - Ahora
closeTutorial() {
  this.isTutorialOpen = false;
}
```

---

## Justificación UX

### Accesibilidad
- Los jugadores nuevos pueden necesitar consultar el tutorial múltiples veces
- Diferentes mecánicas se explican en el tutorial (indicadores, decisiones, regulación)
- Es mejor tener la ayuda disponible que ocultarla

### Simplicidad
- No hay necesidad de localStorage para esta funcionalidad
- El comportamiento es más predecible
- Menos código = menos bugs potenciales

### Experiencia del Usuario
- **Frustración reducida**: No hay "perdí el tutorial y no sé cómo recuperarlo"
- **Confianza aumentada**: El jugador sabe que puede consultar ayuda cuando quiera
- **Aprendizaje mejorado**: Puede revisar conceptos que olvidó

### Diseño de Juego
- El Capítulo 1 es el tutorial del juego
- Tiene sentido que la ayuda esté disponible durante todo el tutorial
- Al llegar al Capítulo 2, el jugador ya debería conocer las mecánicas

---

## Casos de Uso

### Caso 1: Jugador Nuevo
```
Escena 100: "¿Qué es esto?" → Abre tutorial → "Ah, entiendo"
Escena 102: "¿Qué era el estrés?" → Abre tutorial → "Ah sí, aquí está"
Escena 105: "¿Cómo funcionan las regulaciones?" → Abre tutorial → "Perfecto"
```

### Caso 2: Jugador Experimentado
```
Escena 100-108: No abre el tutorial (ya sabe cómo jugar)
Botón visible pero no molesta (animación sutil)
```

### Caso 3: Jugador que Regresa
```
Escena 100: "Hace tiempo que no juego..." → Abre tutorial → "Ah sí, ya recuerdo"
```

---

## Testing

### Checklist
- [ ] Botón aparece en escena 100 (inicio Capítulo 1)
- [ ] Botón sigue visible después de abrir y cerrar tutorial
- [ ] Botón visible en todas las escenas 100-199
- [ ] Botón NO visible en escena 200 (Capítulo 2)
- [ ] No hay errores en consola relacionados con localStorage
- [ ] Modal se abre y cierra correctamente
- [ ] Animación de pulso funciona en todas las escenas

### Escenarios
1. **Abrir tutorial múltiples veces en misma escena**
   - Resultado esperado: ✅ Funciona correctamente

2. **Abrir tutorial en diferentes escenas del Capítulo 1**
   - Resultado esperado: ✅ Botón siempre visible

3. **Llegar al Capítulo 2**
   - Resultado esperado: ✅ Botón desaparece automáticamente

4. **Recargar página en Capítulo 1**
   - Resultado esperado: ✅ Botón sigue visible (no depende de localStorage)

---

## Archivos Modificados

### TypeScript
- `src/app/pages/scene/scene.page.ts`
  - Eliminada variable `tutorialSeen`
  - Eliminado código de localStorage en `ngOnInit()`
  - Simplificada condición en `loadScene()`
  - Simplificado método `closeTutorial()`

### Documentación
- `MEJORAS_UX_IMPLEMENTADAS.md` - Actualizado
- `CAMBIO_TUTORIAL_PERSISTENTE.md` - Este archivo (nuevo)

---

## Beneficios del Cambio

### Para el Jugador
- ✅ Puede consultar ayuda cuando la necesite
- ✅ No hay frustración por perder acceso
- ✅ Mejor experiencia de aprendizaje
- ✅ Más confianza al jugar

### Para el Código
- ✅ Más simple (menos líneas)
- ✅ Sin dependencia de localStorage
- ✅ Más fácil de mantener
- ✅ Comportamiento más predecible

### Para el Diseño
- ✅ Coherente con el concepto de "Capítulo 1 = Tutorial"
- ✅ Transición natural al Capítulo 2
- ✅ No hay "trucos" ocultos para recuperar el tutorial

---

## Conclusión

El cambio mejora significativamente la experiencia del usuario al mantener el tutorial accesible durante todo el Capítulo 1. Es una solución más simple, más intuitiva y más útil que el comportamiento anterior.

**Filosofía**: "La ayuda debe estar disponible cuando el jugador la necesite, no ocultarse después de un solo uso."

**Estado**: ✅ Implementado y listo para testing
**Impacto**: Mejora la UX y simplifica el código
**Compatibilidad**: 100% compatible, sin breaking changes
