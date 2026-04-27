# Guía de Variantes Narrativas

## Cuándo usar variantes

**✅ USA variantes en:**
- Escenas de alta tensión
- Decisiones críticas con consecuencias importantes
- Momentos donde el estado emocional del personaje es relevante
- Finales de capítulo o escenas climáticas

**❌ NO uses variantes en:**
- Escenas de transición
- Diálogos simples
- Escenas informativas
- Momentos de calma

## Regla de oro

**Menos es más.** Solo 2-3 variantes por capítulo como máximo.

## Sintaxis en JSON

### Condiciones disponibles

```json
{
  "text": [
    {
      "condition": "stress >= 30",
      "text": "Versión con estrés alto..."
    },
    {
      "condition": "control >= 50",
      "text": "Versión con control alto..."
    },
    {
      "condition": "info >= 40",
      "text": "Versión con mucha información..."
    },
    {
      "condition": "safety <= 30",
      "text": "Versión con poca seguridad..."
    },
    {
      "condition": "flag:conoce_verdad",
      "text": "Versión si conoce la verdad..."
    },
    {
      "condition": "default",
      "text": "Versión por defecto (siempre al final)"
    }
  ]
}
```

### Operadores soportados

- `>=` mayor o igual
- `<=` menor o igual
- `>` mayor que
- `<` menor que
- `==` igual a
- `!=` diferente de

### Indicadores disponibles

- `info` (0-100): Información/conocimiento
- `stress` (0-100): Estrés/presión mental
- `safety` (0-100): Seguridad física
- `control` (0-100): Control/sangre fría

### Flags

Para usar flags: `"condition": "flag:nombre_del_flag"`

## Ejemplo completo

```json
{
  "id": 250,
  "title": "Momento crítico",
  "image": "/assets/images/black-forest.jpg",
  "text": [
    {
      "condition": "stress >= 50",
      "text": "Tu corazón late tan fuerte que apenas puedes pensar. Las manos te tiemblan..."
    },
    {
      "condition": "control >= 60",
      "text": "Respiras profundo. Mantén la calma. Puedes manejar esto..."
    },
    {
      "condition": "default",
      "text": "La situación es tensa, pero mantienes la compostura..."
    }
  ],
  "choices": [...]
}
```

## Orden de evaluación

1. El sistema evalúa las condiciones **en orden**
2. La primera condición que sea `true` se usa
3. Si ninguna es `true`, usa la condición `"default"`
4. **Siempre pon `"default"` al final**

## Consejos de escritura

1. **Diferencias sutiles**: No cambies toda la escena, solo el tono o algunos detalles
2. **Coherencia**: Mantén los hechos iguales, cambia solo la percepción
3. **Impacto emocional**: Usa variantes para reflejar el estado mental del personaje
4. **No exageres**: 2-3 líneas diferentes son suficientes

## Ejemplo de uso moderado

**Capítulo 1**: Sin variantes (introducción)
**Capítulo 2**: 1 variante en escena crítica (escena 201)
**Capítulo 3**: 2 variantes en momentos clave
**Capítulo 4**: 1 variante en clímax

Total: 4 variantes en todo el juego = perfecto balance
