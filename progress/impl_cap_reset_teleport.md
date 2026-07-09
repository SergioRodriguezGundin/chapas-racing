# Impl — Feature 6: cap_reset_teleport

## Archivos tocados

- `src/config/physics.ts`
- `src/features/cap/Cap.tsx`

## Constante añadida

`src/config/physics.ts`:

```ts
/** Altura Y bajo la cual la chapa se considera fuera de pista -> reset. */
export const OUT_OF_TRACK_Y = -3;
```

Constante suelta (no dentro de un objeto), tal como pide el acceptance. JSDoc de una línea.

## Diff conceptual de `Cap.tsx`

### Helper de teleport compartido (module-level, puro, recibe body)

```ts
function teleport(body: RapierRigidBody, [x, y, z]: [number, number, number]) {
  body.setTranslation({ x, y: y + 0.2, z }, true);
  body.setLinvel({ x: 0, y: 0, z: 0 }, true);
  body.setAngvel({ x: 0, y: 0, z: 0 }, true);
  body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
}
```

- Usado por ambos caminos (fuera de pista y restart). Sin duplicar lógica.
- El `+0.2` en Y vive en el helper con comentario "porqué" (evitar clipping con el suelo). Decisión: no se extrae a config porque el acceptance menciona explícitamente `y + 0.2` y es un offset de spawn local al teleport, no un parámetro de tuning de gameplay.

### Reordenación del `useFrame`

Antes: `if (phase !== "moving") return;` como primera línea -> toda la lógica quedaba tras el guard.

Ahora, el orden dentro de `useFrame` es:

1. `const body = bodyRef.current; if (!body) return;` (siempre).
2. **Camino restart**: leer `resetRequestId` del store; si difiere de `lastResetId.current` -> `lastResetId.current = rid; stillFrames.current = 0; teleport(body, getCurrentTrack().capStart)`.
3. **Camino fuera de pista** (FUERA del guard de phase): si `body.translation().y < OUT_OF_TRACK_Y` -> `teleport(body, lastPosition)`, `settle()`, `return`. Va fuera del guard porque la chapa puede caer estando `idle` (p.ej. tras un teleport al borde), no solo en `moving`.
4. **Guard de phase**: `if (phase !== "moving") return;` — solo aquí.
5. **Detección de parada** (gated a `moving`, intacta): velocidad < umbral N frames -> `settle()`.

### Manejo de `resetRequestId` sin re-render por frame

```ts
const lastResetId = useRef(useGameStore.getState().resetRequestId);
```

- Inicializado con el valor actual del store (no dispara teleport espurio en el primer frame).
- Dentro de `useFrame` se compara `useGameStore.getState().resetRequestId` con el ref; el teleport de restart se ejecuta en el frame siguiente al incremento, coherente con el patrón imperativo del repo.
- Sin `useGameStore(selector)` por-frame, sin efectos, sin refs cruzadas DOM<->Canvas.

## Decisiones

- Helper `teleport` a nivel de módulo (función pura que recibe body): reutilizable por ambos caminos, testeable por inspección, sin capturar closures del componente.
- Orden restart -> caída -> parada: el restart teleporta a `capStart` (sobre pista, por encima de `OUT_OF_TRACK_Y`), así el chequeo de caída del mismo frame no lo revierte.
- `stillFrames.current = 0` también en el camino restart para no arrastrar conteo de parada previo.
- `+0.2` en el helper (no en config): ver arriba.

## Gotcha del research (sensor meta)

`capStart` y `lastPosition` están sobre la pista y NO solapan el volumen del sensor de meta, por lo que el teleport no re-dispara la meta. No se añade lógica extra ni se toca `FinishLine`. (Confirmado con research_rapier_sensors.md §5.)

## Verificación

- `pnpm tsc --noEmit` -> **limpio** (exit 0).
- `pnpm build` -> **limpio** (exit 0, "Compiled successfully").
- Sin dependencias nuevas.
- Sin `any`; body tipado como `RapierRigidBody`; imports alias `@/`, comillas dobles, exports nombrados.

## Checklist de acceptance (feature 6)

- [x] `OUT_OF_TRACK_Y = -3` definida en `config/physics.ts`.
- [x] En `Cap.tsx`, dentro de `useFrame`: si `body.translation().y < OUT_OF_TRACK_Y` -> `setTranslation` a `lastPosition` con `y + 0.2`, `setLinvel`/`setAngvel` a cero, `setRotation` identidad, `settle()`.
- [x] Cap observa cambios de `resetRequestId` y ejecuta el mismo teleport hacia `track.capStart` (sin refs cruzadas DOM<->Canvas).
- [x] Ambos caminos comparten un helper de teleport (posición como parámetro).
- [x] Patrón iter 1 respetado: lógica imperativa con `getState()` en `useFrame`, sin suscripciones que causen re-render por frame.
- [x] `pnpm tsc --noEmit` limpio.
- [ ] Verificación manual (pendiente-de-humano, ver abajo).

## Pendiente-de-humano (no ejecutable por el agente)

Verificación física real: lanzar la chapa fuera del borde -> cae por gravedad -> al bajar de `y = -3` reaparece en `lastPosition` (punto del último lanzamiento) con `y + 0.2`, quieta (velocidades y rotación a cero) y `phase = 'idle'` (por `settle()`).

Razonamiento del flujo esperado:
1. Lanzamiento -> `launch(from)` guarda `lastPosition = from`, `phase = 'moving'`.
2. La chapa sale del trazado (no hay suelo fuera) -> cae.
3. En algún frame `translation().y < -3` -> `teleport(body, lastPosition)` (reposiciona en el punto de lanzamiento + 0.2, velocidades/rotación a cero) + `settle()` -> `phase = 'idle'`.
4. Al estar en `capStart`/`lastPosition` sobre pista y por encima del umbral, no re-dispara caída ni la meta.

Restart (relacionado con feature 7): pulsar "Jugar de nuevo" -> `restart()` incrementa `resetRequestId` -> siguiente frame `Cap` teleporta a `capStart`, `status = 'playing'`, lanzable de nuevo.
