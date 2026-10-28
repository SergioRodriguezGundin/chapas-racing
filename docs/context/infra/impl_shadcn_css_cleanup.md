# Implementación: shadcn CSS cleanup

**Tarea:** Completar migración shadcn — eliminar CSS custom del juego y usar componentes shadcn + Tailwind con tokens del preset.

## Archivos tocados

### `src/app/globals.css`
- Eliminado bloque completo `/* Estilos del juego */` (líneas 131-184): reset manual `*`, overrides `html/body`, `.game-root`, `.loading`, `.hud`, `.hud-phase`, `[data-slot="dialog-overlay"]`.
- Conservados: imports shadcn/tailwind, variables `:root`/`.dark`, `@theme inline`, `@layer base` del preset.

### `src/app/layout.tsx`
- Añadido `h-full overflow-hidden` en `<html>` y `<body>` para layout fullscreen sin CSS custom.
- Mantiene fuentes del preset (`font-sans`, variables Noto Sans / Outfit).

### `src/app/page.tsx`
- `className="game-root"` → `className="fixed inset-0"`.
- Loading dynamic: `className="loading"` → `grid h-full place-items-center text-lg tracking-wide text-muted-foreground`.

### `src/ui/Hud.tsx`
- Eliminadas clases `.hud` y `.hud-phase`.
- Contenedor HUD: Tailwind `absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 pointer-events-none select-none`.
- Etiqueta de fase: componente shadcn `Badge` variant `secondary`.
- Gradiente potencia: `color-mix(in srgb, var(--destructive) …%, var(--primary))` en lugar de hex `#ff4d3d`/`#2dd4a7`.
- Track Progress: `bg-muted` en lugar de `bg-white/15`.

### `src/ui/VictoryModal.tsx`
- Eliminados colores hex y overrides custom (`#1b262c`, `#2dd4a7`, `#e8eef1`, `rgb(45_212_167/40%)`).
- `DialogContent`: `border-border bg-popover`.
- `DialogTitle`: `text-primary`.
- `DialogDescription`: estilos default del preset (`text-muted-foreground` vía componente).
- `Button`: variant default sin overrides (`rounded-full px-6` eliminados).
- Sin CSS global para overlay; usa estilos default de `DialogOverlay`.

### `src/components/ui/badge.tsx` (nuevo)
- Añadido vía `pnpm dlx shadcn@latest add badge --yes`.
- Sin dependencias npm nuevas (usa `@base-ui/react`, `cva` ya instalados).

## Decisiones

- Gradiente de potencia mantiene `color-mix` dinámico vía CSS variable `--power-fill` porque el porcentaje depende del store; tokens `--destructive` y `--primary` sustituyen hex hardcodeados.
- `GameCanvas.tsx` y `AimIndicator.tsx` conservan colores hex en Three.js (fuera de alcance UI/DOM).
- Fondo oscuro del canvas (`#1b262c` en `<color>`) no tocado — es escena 3D, no CSS DOM.

## Criterios de aceptación

- [x] Bloque CSS custom eliminado de `globals.css` (solo preset shadcn/tailwind).
- [x] Layout fullscreen migrado a Tailwind en `layout.tsx` (`h-full overflow-hidden`).
- [x] `page.tsx` sin clases `.game-root` / `.loading`.
- [x] `Hud.tsx` sin clases `.hud` / `.hud-phase`; usa `Badge` + tokens preset.
- [x] Gradiente potencia sin hex; usa `--destructive` / `--primary`.
- [x] `VictoryModal.tsx` sin hex; usa tokens `bg-popover`, `text-primary`, `text-muted-foreground`, `border-border`.
- [x] Button variant default sin overrides custom.
- [x] Sin CSS global para dialog overlay.
- [x] Cero deps npm nuevas.
- [x] Sin cambios en lógica de juego/store/física.

## Verificación

| Comando | Resultado |
|---|---|
| `pnpm tsc --noEmit` | ✅ OK (exit 0) |
| `pnpm build` | ✅ OK — compiled successfully, static pages generated |

## Verificación manual pendiente (humano)

1. Abrir `http://localhost:3000` — layout fullscreen sin scrollbars.
2. HUD: badge de fase centrado abajo, no bloquea drag (`pointer-events-none`).
3. Fase `aiming`: barra de potencia con gradiente rojo→verde según tokens preset.
4. Ganar partida: modal con fondo `popover`, título `primary`, overlay default shadcn.
5. Loading "Cargando pista…" centrado con `text-muted-foreground` al recargar.
