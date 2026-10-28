# Verificación integral — Iteración 2 (feature 8)

Modo: leader realizó pasada de verificación con navegador (MCP) en `pnpm dev` (http://localhost:3001).

## Automatizable — VERIFICADO por el leader

| Criterio | Estado | Evidencia |
|---|---|---|
| 1. Circuito se renderiza desde `circuit-01.json` | ✅ | El trazado en pantalla sigue la polilínea de waypoints (pads redondeados en esquinas); chapa roja sobre el primer tramo; meta semitransparente cruzando el trazado. |
| Manual: editar `trackWidth` a 6 ensancha la pista al recargar | ✅ | Cambio temporal 4→6 + recarga: pista visiblemente más ancha. Revertido a 4 (git limpio). |
| 7. `pnpm tsc --noEmit` y `pnpm build` limpios | ✅ | Verde en el cierre de features 2–7 y build final exit 0. |
| 8. Sin dependencias nuevas en package.json | ✅ | deps intactas (drei, fiber, rapier, next, react, three, zustand). |
| HUD presente | ✅ | Etiqueta de fase "Pulsa la chapa y arrastra hacia atrás" (idle) visible. |

## NO automatizable — PENDIENTE-DE-HUMANO

Motivo técnico: la mecánica de lanzamiento (tirachinas) opera sobre pointer-events dentro del canvas WebGL. El objeto chapa no expone un elemento DOM con `ref` para `browser_drag`, y los métodos CDP `Input.*` están denegados en este entorno. Por tanto no se puede reproducir un arrastre físico fiable por automatización.

Requieren comprobación manual en `pnpm dev`:
- Criterio 2: chapa lanzada fuera del trazado cae y reaparece en la posición del último lanzamiento, quieta, `phase = 'idle'`.
- Criterio 3: cruzar la meta abre el modal de victoria y no se puede lanzar con el modal abierto.
- Criterio 4: "Jugar de nuevo" deja la chapa en `capStart`, `status = 'playing'` y se puede lanzar.
- Criterio 5: el reset restaura a la posición desde donde se LANZÓ (`lastPosition`), no donde se detuvo.

## Checklist manual sugerido (humano)

1. Lanzar recto por el primer tramo -> la chapa desliza y para sobre la pista.
2. Lanzar fuerte hacia un borde -> cae -> reaparece en el punto del último lanzamiento, quieta.
3. Encadenar lanzamientos hasta cruzar la meta -> aparece el modal de victoria.
4. Con el modal abierto, intentar lanzar -> no responde (bloqueado por status).
5. "Jugar de nuevo" -> la chapa vuelve a `capStart`, se puede lanzar de nuevo.

## Conclusión

Feature 8 NO se marca `done`: los criterios 2–5 son verificación física manual que el leader no puede ejecutar. Pendiente de confirmación humana. El resto de criterios objetivos (render data-driven, tsc/build, sin deps) están verificados.
