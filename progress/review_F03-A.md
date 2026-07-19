# Review — F03-A

**Veredicto:** APPROVED

**Artefacto revisado:** `progress/research_f03_realtime_sync.md` (único entregable del spike)  
**Fecha review:** 2026-07-18

---

## Criterios de aceptación

- AC1 Documento `progress/research_f03_realtime_sync.md` con decisión transporte (Realtime vs WS) + justificación: [x]
  - Decisión: Supabase Realtime (Broadcast + Presence + `postgres_changes`). Justificación vs WS dedicado en §1; criterios de cuándo reabrir WS → `blocked`.
- AC2 Estrategia sync documentada (input + settle snapshot u alternativa con trade-offs): [x]
  - Modelo elegido §2: replicar `{direction, power}` + snapshot al `settle()`. Tabla de alternativas A–E con trade-offs.
- AC3 Contrato tentativo create / join / start / launch / settle / disconnect / end: [x]
  - §3: durables vía Postgres; ephemeral Broadcast (`launch`, `settle`, `disconnect_signal`); Presence lobby. Envelope tipado `RoomEvent`.
- AC4 Dep nueva → `blocked` + discusión; no añadir sin acuerdo: [x]
  - §6: **No blocked**. Cero deps nuevas; reutiliza `@supabase/supabase-js`. `package.json` sin diff en este spike.
- AC5 PoC opcional no deja código muerto en `src/` sin plan F03-B+: [x]
  - PoC **no realizado**. `git status` sin cambios bajo `src/`. Sin archivos huérfanos de este spike.
- AC6 `pnpm tsc --noEmit` y `pnpm build` limpios si se tocó código: [x] N/A
  - **No se tocó `src/` ni `package.json`.** tsc/build no obligatorios para APPROVED de este spike docs-only. Baseline previo en `progress/current.md`: tsc OK al arrancar F03.

---

## Verificaciones adicionales

| Check | Resultado |
|-------|-----------|
| Spec F03 `specs/feature_list.md` L63–78 alineada | [x] Notas técnicas recomiendan input + settle snapshot y Realtime vs WS; research **confirma** ese modelo (no lo contradice). |
| Sin deps nuevas en `package.json` | [x] Sin diff / sin commits de deps en este spike. |
| Sin PoC huérfano en `src/` | [x] |
| `feature_list.json` F03-A sigue `in_progress` | [x] Correcto; no marcado `done` prematuramente. |

---

## Hallazgos

- Documento completo: transporte, sync, contrato, schema orientativo F03-B, riesgos, mapa a F03-B..E.
- Alineación con stack F02 (`@supabase/supabase-js`, canales privados + RLS) coherente con `docs/architecture.md` (cero deps sin acuerdo).
- Scope creep: ninguno en entregable del spike. `feature_list.json` / `progress/current.md` modificados son orquestación del leader, no implementación en `src/`.
- Open questions (§5) correctamente diferidas a F03-B/D/E; no bloquean cierre del spike.

---

## Cambios requeridos

Ninguno.

---

## Siguiente acción recomendada

1. Marcar F03-A `done` en `feature_list.json` (tras este APPROVED).
2. Arrancar F03-B — Schema salas/partida + RLS + códigos, alineado a §4 del research (`rooms` / `room_members`, topics `room:{roomId}`).
