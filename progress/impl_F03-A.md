# Informe: F03-A — Spike transporte Realtime + sync

**Estado:** cierre post-review — APPROVED  
**Fecha:** 2026-07-18  
**Tipo:** spike docs-only (sin implementación de feature)  
**Verificación:** N/A `tsc`/`build` — cero cambios en `src/` ni deps

---

## Entregable

| Artefacto | Rol |
|---|---|
| `progress/research_f03_realtime_sync.md` | Único entregable del spike |
| `progress/review_F03-A.md` | Reviewer → **APPROVED** |
| Este informe | Cierre de subtarea (docs/progreso) |

---

## Resumen del spike

1. **Transporte:** Supabase Realtime (Broadcast + Presence + `postgres_changes`). Reutiliza `@supabase/supabase-js` de F02. WS dedicado descartado para MVP.
2. **Sync:** Input `{direction, power}` + snapshot de posiciones al `settle()` como corrección (confirma notas de `specs/feature_list.md` § F03).
3. **Contrato tentativo:** create / join / start / launch / settle / disconnect / end (durables Postgres + ephemeral Broadcast / Presence).
4. **Deps:** **No blocked.** Cero dependencias nuevas.
5. **PoC:** No realizado. Sin código huérfano en `src/`.

---

## Archivos tocados (cierre)

| Archivo | Cambio |
|---|---|
| `progress/impl_F03-A.md` | Este informe |
| `feature_list.json` | F03-A → `done`; `completed.f03_online`; description actualizada |
| `progress/history.md` | Append F03-A |
| `progress/current.md` | Plantilla / siguiente elegible F03-B |

**No tocado:** `src/`, `package.json`, checkboxes F03 en `specs/feature_list.md` (feature completa aún pending).

---

## Criterios de aceptación

| ID | Criterio | ¿Cubierto? |
|---|---|---|
| AC1 | Research con decisión Realtime vs WS | ✅ research §1 |
| AC2 | Sync input + settle snapshot documentada | ✅ research §2 |
| AC3 | Contrato tentativo de eventos | ✅ research §3 |
| AC4 | Dep nueva → blocked; no añadir sin acuerdo | ✅ no blocked |
| AC5 | PoC sin código muerto en `src/` | ✅ PoC no hecho; sin `src/` |
| AC6 | tsc/build si se tocó código | ✅ N/A |

---

## Verificación manual pendiente

Ninguna para F03-A (spike docs). Siguiente subtarea elegible: **F03-B** — schema salas/partida + RLS (alineado a research §4).
