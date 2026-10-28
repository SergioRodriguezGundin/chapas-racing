# Review — shadcn CSS cleanup

**Veredicto:** APPROVED

## Criterios de aceptación
- CA1: [x] `globals.css` contiene solo imports shadcn/tailwind, variables `:root`/`.dark`, `@theme inline` y `@layer base` del preset. Bloque `/* Estilos del juego */` eliminado (54 líneas).
- CA2: [x] Sin clases `.game-root`, `.loading`, `.hud`, `.hud-phase`, `.victory-*` ni override `[data-slot="dialog-overlay"]` en CSS. Verificado con grep en `src/app/globals.css` y en todo `src/`.
- CA3: [x] Componentes UI usan tokens preset: `Hud.tsx` → `Badge variant="secondary"`, `bg-muted`, `var(--destructive)`/`var(--primary)`; `VictoryModal.tsx` → `bg-popover`, `text-primary`, `border-border`. Cero hex en `src/ui/`. Hex restantes solo en escena 3D (`GameCanvas.tsx`, `AimIndicator.tsx`), fuera de alcance DOM/CSS.
- CA4: [x] `Hud.tsx` importa y usa `Progress` + `Badge` shadcn. `VictoryModal.tsx` usa `Dialog` + `Button` con estilos preset (sin overrides hex ni `rounded-full px-6` custom).
- CA5: [x] Fullscreen vía Tailwind: `layout.tsx` → `h-full overflow-hidden` en `<html>`/`<body>`; `page.tsx` → `fixed inset-0` en `<main>`; loading → clases utilitarias Tailwind.
- CA6: [x] Verificación independiente: `pnpm tsc --noEmit && pnpm build` → exit 0, compiled successfully.
- CA7: [x] Diff limitado a cambios visuales/DOM en 5 archivos `src/` + nuevo `badge.tsx`. Sin cambios en stores, física, `GameCanvas` lógica ni handlers de juego.

## Archivos revisados
| Archivo | Estado |
|---|---|
| `src/app/globals.css` | OK — solo preset |
| `src/app/layout.tsx` | OK — fullscreen Tailwind |
| `src/app/page.tsx` | OK — sin clases legacy |
| `src/ui/Hud.tsx` | OK — Badge + Progress + tokens |
| `src/ui/VictoryModal.tsx` | OK — Dialog + Button preset |
| `src/components/ui/badge.tsx` | OK — componente shadcn estándar, sin deps nuevas |

## Verificación ejecutada
```
pnpm tsc --noEmit  → exit 0
pnpm build         → exit 0 (Next.js 15.5.20, compiled successfully)
```

## Notas (no bloqueantes)
- `badge.tsx` está untracked en git; incluir en commit junto con el resto de la migración.
- Verificación manual pendiente (layout fullscreen, gradiente potencia, modal overlay) documentada en informe del implementer — aceptable para componentes R3F/DOM según `docs/verification.md`.
