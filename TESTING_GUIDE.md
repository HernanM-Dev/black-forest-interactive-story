# Guía de Testing - Sistema de Feedback Emocional

## 🚀 Inicio Rápido

Para probar las nuevas características, sigue estos pasos:

### 1. Iniciar el Servidor de Desarrollo

```bash
cd Black-Forest
npm start
# o
ionic serve
```

### 2. Navegar al Juego

1. Abrir navegador en `http://localhost:8100`
2. Hacer clic en "Nuevo Juego"
3. Hacer clic en "Continuar" en la página de intro
4. Comenzar a jugar desde la escena 100

---

## 🧪 Escenarios de Prueba

### Escenario 1: Toast Notification (Estrés Baja)

**Objetivo**: Verificar que aparece el toast cuando el estrés baja significativamente

**Pasos**:
1. Jugar hasta que el estrés esté en 50 o más
2. Usar una "Acción de Regulación" (si está disponible)
   - Ejemplo: "Respirar profundamente" (-10 estrés)
3. Si el estrés baja 15+ puntos, debería aparecer el toast

**Resultado Esperado**:
- ✅ Toast verde aparece en la parte superior central
- ✅ Mensaje: "Te sientes más tranquilo"
- ✅ Icono de checkmark circular
- ✅ Desaparece después de 2 segundos
- ✅ Animación de bounce suave

**Alternativa**: Modificar temporalmente el umbral en el código:
```typescript
// En scene.page.ts, línea ~350
if (totalStressChange <= -5) { // Cambiar de -15 a -5 para testing
  this.showPositiveToast(...);
}
```

---

### Escenario 2: Toast Notification (Seguridad Sube)

**Objetivo**: Verificar que aparece el toast cuando la seguridad aumenta

**Pasos**:
1. Buscar una decisión que aumente la seguridad significativamente
2. Tomar esa decisión

**Resultado Esperado**:
- ✅ Toast verde aparece
- ✅ Mensaje: "Recuperas seguridad"
- ✅ Desaparece después de 2 segundos

**Nota**: Puede ser difícil encontrar decisiones que aumenten seguridad +10. Considera modificar temporalmente el umbral a +5 para testing.

---

### Escenario 3: Modal de Advertencia Crítica (Estrés Alto)

**Objetivo**: Verificar que aparece el modal cuando el estrés es crítico

**Pasos**:
1. Tomar decisiones que aumenten el estrés
2. Continuar hasta que el estrés llegue a 80 o más

**Resultado Esperado**:
- ✅ Modal rojo aparece en el centro
- ✅ Overlay oscuro con blur
- ✅ Icono de rayo (⚡) pulsante
- ✅ Mensaje: "Tu nivel de estrés es crítico. Necesitas calmarte pronto."
- ✅ Animación de shake al aparecer
- ✅ Botón "Entendido" funciona
- ✅ Modal se cierra al hacer clic

**Alternativa para testing rápido**:
```typescript
// En scene.page.ts, línea ~380
if (stress >= 50) { // Cambiar de 80 a 50 para testing
  this.criticalWarningType = 'stress';
  ...
}
```

---

### Escenario 4: Modal de Advertencia Crítica (Seguridad Baja)

**Objetivo**: Verificar que aparece el modal cuando la seguridad es crítica

**Pasos**:
1. Tomar decisiones que disminuyan la seguridad
2. Continuar hasta que la seguridad llegue a 20 o menos

**Resultado Esperado**:
- ✅ Modal rojo aparece
- ✅ Icono de escudo (🛡️) pulsante
- ✅ Mensaje: "Tu seguridad está en peligro. Ten mucho cuidado."
- ✅ Animación de shake

**Alternativa para testing rápido**:
```typescript
// En scene.page.ts, línea ~385
else if (safety <= 40) { // Cambiar de 20 a 40 para testing
  this.criticalWarningType = 'safety';
  ...
}
```

---

### Escenario 5: Prevención de Spam

**Objetivo**: Verificar que el modal no aparece múltiples veces

**Pasos**:
1. Activar un modal crítico (estrés >= 80)
2. NO cerrarlo inmediatamente
3. Esperar unos segundos
4. Verificar que no aparecen múltiples modales

**Resultado Esperado**:
- ✅ Solo un modal aparece
- ✅ No hay múltiples overlays
- ✅ El modal permanece hasta que se cierra

---

### Escenario 6: Feedback Básico Sigue Funcionando

**Objetivo**: Verificar que los iconos +/- siguen apareciendo

**Pasos**:
1. Tomar cualquier decisión que afecte indicadores
2. Observar el lado derecho de la pantalla

**Resultado Esperado**:
- ✅ Iconos +/- aparecen en el lado derecho
- ✅ Colores correctos según el indicador
- ✅ Animación de entrada desde la derecha
- ✅ Desaparecen después de 3 segundos

---

### Escenario 7: Múltiples Toasts

**Objetivo**: Verificar que múltiples toasts no se superponen

**Pasos**:
1. Tomar una decisión que active múltiples toasts
   - Ejemplo: Estrés baja 20, Seguridad sube 15
2. Observar la parte superior central

**Resultado Esperado**:
- ✅ Solo un toast aparece a la vez
- ✅ Si hay múltiples, aparecen secuencialmente (no simultáneamente)

**Nota**: Actualmente el código solo muestra el primer toast. Si quieres mostrar múltiples, necesitarás modificar la lógica.

---

## 🔧 Modificaciones Temporales para Testing

### Reducir Umbrales

Para facilitar el testing, puedes reducir temporalmente los umbrales:

```typescript
// En scene.page.ts, método showEffectsFeedback()

// ORIGINAL
if (totalStressChange <= -15 || totalSafetyChange >= 10 || totalControlChange >= 10) {
  this.showPositiveToast(...);
}

// PARA TESTING (más fácil de activar)
if (totalStressChange <= -5 || totalSafetyChange >= 5 || totalControlChange >= 5) {
  this.showPositiveToast(...);
}
```

```typescript
// En scene.page.ts, método checkCriticalLevels()

// ORIGINAL
if (stress >= 80 && !this.showCriticalWarning) {
  ...
}
else if (safety <= 20 && !this.showCriticalWarning) {
  ...
}

// PARA TESTING (más fácil de activar)
if (stress >= 50 && !this.showCriticalWarning) {
  ...
}
else if (safety <= 40 && !this.showCriticalWarning) {
  ...
}
```

**IMPORTANTE**: Recuerda revertir estos cambios después del testing.

---

## 📊 Checklist de Testing

### Funcionalidad
- [ ] Toast aparece con estrés -15+
- [ ] Toast aparece con seguridad +10+
- [ ] Toast aparece con control +10+
- [ ] Modal aparece con estrés 80+
- [ ] Modal aparece con seguridad 20-
- [ ] Modal se cierra correctamente
- [ ] No hay spam de modales
- [ ] Feedback básico sigue funcionando

### Visual
- [ ] Toast tiene gradiente verde
- [ ] Toast tiene icono de checkmark
- [ ] Toast tiene animación bounce
- [ ] Modal tiene fondo rojo
- [ ] Modal tiene animación shake
- [ ] Modal tiene icono pulsante
- [ ] Overlay oscurece el fondo

### UX
- [ ] Toast no bloquea la interacción
- [ ] Toast desaparece automáticamente
- [ ] Modal bloquea la interacción
- [ ] Modal requiere confirmación
- [ ] Mensajes son claros y en español
- [ ] Animaciones son fluidas (60fps)

### Responsive
- [ ] Funciona en móvil (< 768px)
- [ ] Funciona en tablet (768-1024px)
- [ ] Funciona en desktop (> 1024px)
- [ ] Toast centrado en todas las pantallas
- [ ] Modal centrado en todas las pantallas

---

## 🐛 Problemas Conocidos y Soluciones

### Problema: Toast no aparece

**Posibles causas**:
1. Umbral no alcanzado (cambio < 15 para estrés, < 10 para otros)
2. Error en la lógica de cálculo
3. CSS no cargado correctamente

**Solución**:
1. Verificar console.log en `showPositiveToast()`
2. Reducir umbrales temporalmente
3. Verificar que el CSS está compilado

### Problema: Modal aparece múltiples veces

**Posibles causas**:
1. Flag `showCriticalWarning` no se está respetando
2. Múltiples llamadas a `checkCriticalLevels()`

**Solución**:
1. Verificar que el flag se establece correctamente
2. Añadir console.log para debuggear

### Problema: Animaciones no funcionan

**Posibles causas**:
1. CSS no compilado
2. Navegador no soporta las animaciones
3. Prefijos de navegador faltantes

**Solución**:
1. Recompilar SCSS
2. Probar en navegador moderno (Chrome, Firefox)
3. Añadir prefijos si es necesario

---

## 📱 Testing en Dispositivos Móviles

### Usando Ionic DevApp (Recomendado)

1. Instalar Ionic DevApp en tu móvil
2. Conectar a la misma red WiFi que tu PC
3. Abrir la app y seleccionar tu proyecto
4. Probar todas las características

### Usando Navegador Móvil

1. Obtener tu IP local: `ipconfig` (Windows) o `ifconfig` (Mac/Linux)
2. Abrir navegador en móvil
3. Navegar a `http://TU_IP:8100`
4. Probar todas las características

### Usando Capacitor (Producción)

```bash
# Android
ionic cap run android

# iOS
ionic cap run ios
```

---

## 📈 Métricas de Éxito

### Funcionalidad
- ✅ 100% de los escenarios pasan
- ✅ Sin errores en consola
- ✅ Sin warnings en consola

### Performance
- ✅ Animaciones a 60fps
- ✅ Sin lag al mostrar toast/modal
- ✅ Tiempo de respuesta < 100ms

### UX
- ✅ Feedback inmediato y claro
- ✅ No intrusivo (toast)
- ✅ Apropiadamente intrusivo (modal)
- ✅ Mensajes comprensibles

---

## 🎯 Próximos Pasos Después del Testing

1. **Ajustar umbrales** según feedback de testing
2. **Refinar mensajes** si es necesario
3. **Optimizar animaciones** si hay lag
4. **Añadir más mensajes** contextuales
5. **Implementar vibración** en móviles
6. **Añadir sonidos** sutiles

---

## 📞 Soporte

Si encuentras problemas durante el testing:

1. Verificar console.log en el navegador (F12)
2. Verificar que todos los archivos están guardados
3. Recompilar el proyecto (`npm start`)
4. Limpiar caché del navegador (Ctrl+Shift+R)

---

**Versión**: 1.3.0  
**Última actualización**: 2026-03-03  
**Estado**: Listo para testing manual
