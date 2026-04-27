# Guía Visual del Sistema de Feedback

## Tres Niveles de Feedback

El juego utiliza tres tipos de feedback visual según la importancia del evento:

---

## 1. Feedback Básico (Iconos +/-)

**Cuándo aparece**: En TODAS las decisiones que afectan indicadores

**Ubicación**: Lado derecho de la pantalla

**Duración**: 3 segundos

**Características**:
- Iconos con símbolos +/- 
- Colores según el indicador:
  - 🔵 Azul: Información
  - 🔴 Rojo: Estrés
  - 🟢 Verde: Seguridad (positivo) / 🔴 Rojo: Seguridad (negativo)
  - 🟣 Púrpura: Control (positivo) / 🔴 Rojo: Control (negativo)
- Animación de entrada desde la derecha
- Pulso continuo del icono

**Ejemplo**:
```
Decisión: "Leer las noticias"
Efectos: +1 Información, +1 Estrés

Feedback visual:
[🔵 +] ← Información aumentó
[🔴 +] ← Estrés aumentó
```

---

## 2. Toast Notification (Eventos Positivos)

**Cuándo aparece**: Cuando ocurren cambios positivos SIGNIFICATIVOS

**Ubicación**: Parte superior central de la pantalla

**Duración**: 2 segundos

**Características**:
- Gradiente verde cálido
- Icono de checkmark circular
- Animación de "bounce" alegre
- Mensaje contextual
- Desaparece automáticamente

**Triggers**:

| Condición | Mensaje |
|-----------|---------|
| Estrés baja ≥ 15 puntos | "Te sientes más tranquilo" |
| Seguridad sube ≥ 10 puntos | "Recuperas seguridad" |
| Control aumenta ≥ 10 puntos | "Recuperas el control" |

**Ejemplo**:
```
Decisión: "Respirar profundamente" (Acción de Regulación)
Efectos: -10 Estrés

Feedback visual:
[🔴 -] ← Feedback básico (estrés bajó)
[✅ Te sientes más tranquilo] ← Toast notification (cambio significativo)
```

**Diseño visual**:
```
┌─────────────────────────────────┐
│  ✅  Te sientes más tranquilo   │
└─────────────────────────────────┘
   Gradiente verde (#22c55e → #84cc16)
   Borde verde semi-transparente
   Sombra verde brillante
```

---

## 3. Modal de Advertencia Crítica

**Cuándo aparece**: Cuando los indicadores alcanzan niveles PELIGROSOS

**Ubicación**: Centro de la pantalla (modal completo)

**Duración**: Hasta que el jugador lo cierre

**Características**:
- Overlay oscuro con blur
- Fondo rojo intenso
- Animación de "shake" (temblor)
- Icono grande pulsante
- Requiere confirmación
- Bloquea la interacción hasta cerrarlo

**Triggers**:

| Condición | Icono | Mensaje |
|-----------|-------|---------|
| Estrés ≥ 80 | ⚡ | "Tu nivel de estrés es crítico. Necesitas calmarte pronto." |
| Seguridad ≤ 20 | 🛡️ | "Tu seguridad está en peligro. Ten mucho cuidado." |

**Ejemplo**:
```
Situación: Después de varias decisiones estresantes, el estrés llega a 82

Feedback visual:
[🔴 +] ← Feedback básico (estrés subió)
[MODAL CRÍTICO] ← Advertencia crítica (nivel peligroso)

┌───────────────────────────────────┐
│                                   │
│         ⚡ (pulsando)             │
│                                   │
│       ¡Advertencia!               │
│                                   │
│  Tu nivel de estrés es crítico.   │
│  Necesitas calmarte pronto.       │
│                                   │
│     [ Entendido ]                 │
│                                   │
└───────────────────────────────────┘
   Fondo rojo (#ef4444)
   Borde rojo intenso (#dc2626)
   Animación de temblor
```

**Prevención de spam**: El modal solo aparece una vez por nivel crítico. No volverá a aparecer hasta que el jugador lo cierre y el indicador cambie.

---

## Flujo Completo de Feedback

```
┌─────────────────────────────────────────────────────────┐
│                  JUGADOR TOMA DECISIÓN                  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│         FEEDBACK BÁSICO (Iconos +/- siempre)            │
│              [🔵 +] [🔴 +] [🟢 -]                       │
└─────────────────────────────────────────────────────────┘
                          ↓
              ¿Cambio positivo significativo?
                    /              \
                  SÍ                NO
                   ↓                 ↓
┌──────────────────────────┐    Continuar
│   TOAST NOTIFICATION     │
│ ✅ Te sientes tranquilo  │
│      (2 segundos)        │
└──────────────────────────┘
                   ↓
              ¿Nivel crítico alcanzado?
                    /              \
                  SÍ                NO
                   ↓                 ↓
┌──────────────────────────┐    Continuar
│   MODAL DE ADVERTENCIA   │
│    ⚡ ¡Advertencia!      │
│  (requiere confirmación) │
└──────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────┐
│              NAVEGAR A SIGUIENTE ESCENA                 │
└─────────────────────────────────────────────────────────┘
```

---

## Ejemplos de Escenarios

### Escenario 1: Decisión Neutral
```
Decisión: "Mirar por la ventana"
Efectos: +1 Información

Feedback:
✓ Icono azul [🔵 +] (3s)
✗ No toast (cambio pequeño)
✗ No modal (no crítico)
```

### Escenario 2: Acción de Regulación Exitosa
```
Decisión: "Respirar profundamente"
Efectos: -10 Estrés, -5 Control
Estado anterior: Estrés 65 → 55

Feedback:
✓ Icono rojo [🔴 -] (3s)
✗ No toast (cambio < 15)
✗ No modal (no crítico)
```

### Escenario 3: Evento Muy Positivo
```
Decisión: "Encontrar refugio seguro"
Efectos: +15 Seguridad, -20 Estrés
Estado anterior: Estrés 70 → 50, Seguridad 40 → 55

Feedback:
✓ Iconos [🟢 +] [🔴 -] (3s)
✓ Toast "Te sientes más tranquilo" (2s)
✓ Toast "Recuperas seguridad" (2s)
✗ No modal (no crítico)
```

### Escenario 4: Situación Crítica
```
Decisión: "Correr sin mirar"
Efectos: +15 Estrés, -10 Seguridad
Estado anterior: Estrés 70 → 85, Seguridad 30 → 20

Feedback:
✓ Iconos [🔴 +] [🟢 -] (3s)
✗ No toast (cambio negativo)
✓ Modal "Tu nivel de estrés es crítico" (requiere confirmación)
✓ Modal "Tu seguridad está en peligro" (después de cerrar el primero)
```

---

## Principios de Diseño

### 1. Jerarquía Visual
- **Básico**: Siempre presente, no intrusivo
- **Toast**: Llamativo pero no bloquea
- **Modal**: Interrumpe intencionalmente

### 2. Colores Emocionales
- **Verde**: Positivo, calmante, seguro
- **Rojo**: Negativo, alerta, peligro
- **Azul**: Neutral, información
- **Púrpura**: Control, poder

### 3. Animaciones Apropiadas
- **Bounce**: Alegre, positivo (toast)
- **Shake**: Urgente, peligroso (modal)
- **Pulse**: Continuo, presente (iconos)
- **Slide**: Suave, no intrusivo (feedback básico)

### 4. Timing
- **3 segundos**: Feedback básico (tiempo para leer y procesar)
- **2 segundos**: Toast (mensaje corto, desaparece rápido)
- **Indefinido**: Modal (requiere acción del jugador)

---

## Accesibilidad

### Consideraciones
- ✅ Iconos + texto (no solo color)
- ✅ Contraste alto (WCAG AA)
- ✅ Animaciones pueden desactivarse (futuro)
- ✅ Tamaños táctiles mínimos (44px)
- ⚠️ Vibración opcional (futuro)
- ⚠️ Sonidos opcionales (futuro)

### Mejoras Futuras
- [ ] Modo de alto contraste
- [ ] Opción para desactivar animaciones
- [ ] Lectores de pantalla (ARIA labels)
- [ ] Tamaños de texto ajustables

---

## Testing

### Checklist de Pruebas

**Feedback Básico**:
- [ ] Aparece para todos los cambios de indicadores
- [ ] Colores correctos según el tipo
- [ ] Animación suave desde la derecha
- [ ] Desaparece después de 3 segundos
- [ ] Múltiples iconos se apilan correctamente

**Toast Notification**:
- [ ] Aparece cuando estrés baja ≥ 15
- [ ] Aparece cuando seguridad sube ≥ 10
- [ ] Aparece cuando control sube ≥ 10
- [ ] Mensaje correcto según el cambio
- [ ] Animación de bounce suave
- [ ] Desaparece después de 2 segundos
- [ ] No bloquea la interacción

**Modal Crítico**:
- [ ] Aparece cuando estrés ≥ 80
- [ ] Aparece cuando seguridad ≤ 20
- [ ] Animación de shake al aparecer
- [ ] Bloquea interacción hasta cerrarlo
- [ ] Mensaje correcto según el tipo
- [ ] No aparece múltiples veces (spam prevention)
- [ ] Se cierra al hacer clic en "Entendido"

---

## Conclusión

El sistema de feedback de tres niveles proporciona:
- **Claridad**: El jugador siempre sabe qué está pasando
- **Inmersión**: Feedback contextual y narrativo
- **Tensión**: Advertencias críticas aumentan el drama
- **Motivación**: Refuerzo positivo para buenas decisiones

Cada nivel tiene un propósito específico y trabaja en conjunto para crear una experiencia de juego profesional y emocionalmente resonante.
