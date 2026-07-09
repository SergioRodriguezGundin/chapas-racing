# Impl — Feature 7: victory_modal

## Archivos creados
- `src/ui/VictoryModal.tsx` — overlay DOM cliente (`"use client"`).

## Archivos modificados
- `src/app/globals.css` — clases nuevas del modal.
- `src/app/page.tsx` — import y montaje de `<VictoryModal />` junto a `<Hud />` dentro de `<main className="game-root">`.

## Componente `VictoryModal.tsx`
- Suscribe `status` con selector: `useGameStore((s) => s.status)` (re-render legítimo al ganar).
- Suscribe la acción con selector: `useGameStore((s) => s.restart)`, usada en `onClick`.
- `status !== "won"` -> `return null;`.
- `status === "won"` -> overlay con título "¡Meta!", subtítulo y botón "Jugar de nuevo".
- Sin `any`, sin `React.FC`, export nombrado, import alias `@/`, comillas dobles.
- No reimplementa teleport ni desbloqueo: `restart()` (features 3/6) repone `status='playing'`, `phase='idle'` e incrementa `resetRequestId` (Cap teleporta a `capStart`).

## Clases CSS añadidas (`globals.css`)
- `.victory-overlay` — `position: fixed; inset: 0`, centrado con `place-items: center`, fondo oscuro semitransparente (`rgb(13 20 24 / 72%)`), `backdrop-filter: blur`, `pointer-events: auto` (comentario: a diferencia del `.hud` que es `pointer-events:none`, el botón debe ser clicable).
- `.victory-card` — tarjeta `#1b262c`, borde acento `#2dd4a7`, sombra.
- `.victory-title` — acento `#2dd4a7`.
- `.victory-subtitle` — texto `#e8eef1` atenuado.
- `.victory-btn` — fondo `#2dd4a7`, texto `#1b262c`, borde redondeado, `:hover` (aclara + `translateY`).

## Decisiones
- Estética coherente con paleta del repo (`#1b262c` fondo, `#e8eef1` texto, `#2dd4a7` acento).
- Cero estilos inline: no hay valores dinámicos en este modal (a diferencia de la barra de potencia del Hud).
- Cero dependencias nuevas.

## Verificación
- `pnpm tsc --noEmit` -> Exit 0, limpio.
- `pnpm build` -> Exit 0, compilado correctamente (Next 15.5.20, ruta `/` estática).

## Checklist de acceptance (feature 7)
- [x] Existe `src/ui/VictoryModal.tsx`: overlay DOM que solo se muestra si `status === "won"`.
- [x] Muestra mensaje de victoria y botón "Jugar de nuevo" que llama a `store.restart()`.
- [x] Tras restart: chapa en `capStart` (vía `resetRequestId`, feature 6), `status = "playing"`, se puede lanzar. (lógico: `restart()` ya lo hace.)
- [x] Con el modal abierto no se puede lanzar (`startAiming` bloqueado por `status`, feature 3).
- [x] Montado junto al `Hud` en `src/app/page.tsx`.
- [x] `pnpm tsc --noEmit` limpio.

## Pendiente-de-humano (verificación visual/interacción, no ejecutable aquí)
- Aparece al ganar: al cruzar la meta `win()` pone `status='won'`; el selector re-renderiza y muestra el overlay.
- "Jugar de nuevo" resetea: `restart()` repone `status='playing'` -> el modal deja de renderizar; incrementa `resetRequestId` -> Cap teleporta a `capStart` (feature 6); `phase='idle'` permite volver a lanzar.
- No se puede lanzar con modal abierto: mientras `status='won'`, `startAiming` es no-op (feature 3), así que ningún drag inicia apuntado.
