# Diseño UX/UI - Sistema Narrativo Inmersivo

## Filosofía de Diseño

El nuevo diseño está inspirado en juegos narrativos modernos como:
- **Disco Elysium**: Ventana narrativa fija con scroll interno
- **80 Days**: Decisiones como momentos importantes
- **Oxenfree**: UI minimalista que no distrae de la narrativa

## Características Principales

### 1. Viewport Fijo (Sin Scroll Externo)

**Problema resuelto**: El scroll externo rompe la inmersión y hace que la app se sienta como una página web.

**Solución**:
- Toda la interfaz está contenida en el viewport (100vh)
- No hay scroll en la página principal
- El contenido se adapta al tamaño de la pantalla

**Implementación**:
```scss
.scene-content {
  overflow: hidden; // Evita scroll externo
}

.narrative-viewport {
  position: fixed;
  top: 5.5rem;
  bottom: 0;
  // Ocupa todo el espacio disponible
}
```

### 2. Ventana Narrativa con Scroll Interno

**Concepto**: El texto está dentro de una "ventana" que simula leer un libro o documento.

**Características**:
- Fondo semi-transparente con blur
- Bordes sutiles en rojo (tema del juego)
- Scroll interno personalizado
- Máximo 600px de ancho (legibilidad óptima)
- Altura adaptativa (max-height: calc(100vh - 7.5rem))

**Ventajas**:
- Sensación de estar leyendo en un contenedor dedicado
- No se pierde el contexto visual (indicadores siempre visibles)
- Mejor legibilidad en textos largos
- Responsive en móviles

### 3. Sistema de Decisiones con Modal

**Flujo de Usuario**:

1. **Lectura**: Usuario lee el texto con scroll interno
2. **Detección**: Al llegar al final del texto (o después de 2 segundos), aparece botón
3. **Trigger**: Botón "Tomar decisión" o "Continuar" según contexto
4. **Modal**: Se abre modal con overlay oscuro
5. **Decisión**: Usuario elige opción
6. **Feedback**: Muestra efectos visuales
7. **Transición**: Navega a siguiente escena

**Ventajas UX**:
- Las decisiones se sienten como momentos importantes
- El overlay oscuro enfoca la atención
- Animaciones suaves crean fluidez
- Separación clara entre narrativa y decisión

### 4. Detección Inteligente de Scroll

**Lógica**:
```typescript
onNarrativeScroll(event: any) {
  const element = event.target;
  const scrollTop = element.scrollTop;
  const scrollHeight = element.scrollHeight;
  const clientHeight = element.clientHeight;
  
  // Si llegó al final (con margen de 50px)
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    this.showDecisionButton = true;
  }
}
```

**Alternativa**: Si el texto es corto, el botón aparece automáticamente después de 2 segundos.

### 5. Acciones de Regulación en el Modal

**Decisión de diseño**: Las acciones de regulación están dentro del modal de decisiones.

**Razones**:
- No saturan la ventana narrativa
- Se presentan como opciones adicionales
- Mantienen la jerarquía visual (decisiones > regulación)
- Separador visual claro (línea púrpura)

## Responsive Design

### Móviles (< 768px)
- Ventana narrativa ocupa 90% del ancho
- Padding reducido (1rem)
- Botones con tamaño táctil mínimo (44px)
- Scroll suave optimizado para touch

### Tablets (768px - 1024px)
- Ventana narrativa max-width: 600px
- Padding estándar (1.5rem)
- Hover effects habilitados

### Desktop (> 1024px)
- Mismas dimensiones que tablet
- Hover effects completos
- Scroll con rueda del mouse

## Paleta de Colores

### Narrativa
- Fondo ventana: `rgba(10, 10, 10, 0.95)`
- Texto: `rgba(255, 255, 255, 0.9)`
- Bordes: `rgba(220, 38, 38, 0.3)` (rojo tema)

### Decisiones
- Botones disponibles: `rgba(220, 38, 38, 0.1)` fondo
- Bordes: `#dc2626` (rojo)
- Hover: `rgba(220, 38, 38, 0.2)`

### Regulación
- Color base: `#8b5cf6` (púrpura)
- Fondo: `rgba(139, 92, 246, 0.08)`
- Bordes: `rgba(139, 92, 246, 0.3)`

### Feedback
- Info: `#3b82f6` (azul)
- Estrés: `#ef4444` (rojo)
- Seguridad: `#22c55e` (verde) / `#ef4444` (rojo negativo)
- Control: `#8b5cf6` (púrpura)

## Animaciones

### Entrada de Escena
```scss
.narrative-viewport {
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.6s ease-out;

  &.show {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Botón de Decisión
```scss
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Modal
```scss
@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

## Mejores Prácticas Implementadas

### 1. Jerarquía Visual Clara
- Indicadores (top, fijo)
- Ventana narrativa (centro, protagonista)
- Botón de decisión (bottom, call-to-action)
- Modal (overlay, foco total)

### 2. Feedback Inmediato
- Hover states en todos los botones
- Active states (scale 0.98)
- Animaciones de entrada/salida
- Iconos con pulse animation

### 3. Accesibilidad
- Tamaños táctiles mínimos (44px)
- Contraste adecuado (WCAG AA)
- Scroll personalizado visible
- Textos legibles (1rem, line-height 1.8)

### 4. Performance
- Uso de `transform` en lugar de `top/left`
- `will-change` implícito en animaciones
- Backdrop-filter con fallback
- Imágenes con lazy loading

## Comparación: Antes vs Después

### Antes
- ❌ Scroll externo en toda la página
- ❌ Decisiones mezcladas con texto
- ❌ No hay separación visual clara
- ❌ Regulación compite con decisiones
- ❌ Se siente como página web

### Después
- ✅ Viewport fijo, sin scroll externo
- ✅ Decisiones en modal dedicado
- ✅ Ventana narrativa clara y enfocada
- ✅ Regulación integrada pero separada
- ✅ Se siente como juego narrativo

## Extensibilidad

El sistema está diseñado para:
- Agregar nuevos tipos de decisiones
- Implementar minijuegos en el modal
- Añadir efectos visuales en la ventana
- Integrar sistema de guardado visual
- Mostrar estadísticas en el modal

## Notas de Implementación

### Detección de Scroll
- Margen de 50px para activar botón antes del final exacto
- Fallback de 2 segundos si el texto es corto
- Reset al cambiar de escena

### Modal
- Cierra automáticamente al elegir opción
- Overlay con backdrop-filter para blur
- Scroll interno si hay muchas opciones
- Animación de salida suave

### Ventana Narrativa
- Max-width: 600px (óptimo para lectura)
- Padding interno: 1.5rem
- Border-radius: 16px (suave, moderno)
- Box-shadow profundo para profundidad
