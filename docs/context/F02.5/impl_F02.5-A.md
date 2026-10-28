# Informe: F02.5-A — appStage state machine

**Estado:** implementación completa — pendiente review  
**Fecha:** 2026-07-17  
**Verificación:** `pnpm tsc --noEmit` ✅ · `pnpm build` ✅ · cero deps nuevas

---

## Archivos tocados

| Archivo | Cambio |
|---|---|
| `src/stores/gameStore.ts` | Tipo `AppStage`, estado `appStage`, acciones `enterSetup` / `logoutToAuth`; `startMatch` → match; `newMatch` → setup; `restart` permanece en match |
| `src/app/page.tsx` | Gating UI por `appStage` (SetupScreen / Hud / VictoryModal) |
| `src/ui/SetupScreen.tsx` | Eliminado early-return por `status`; montaje lo decide `page.tsx` |
| `progress/current.md` | Plan de sesión actualizado |
| `feature_list.json` | Ya estaba `in_progress` (sin marcar `done`) |

---

## Decisiones

1. **`appStage` vive en `gameStore`** (no store nuevo): misma capa de dominio partida/flujo; evita duplicar suscripciones.
2. **Estado inicial `appStage: 'auth'`** con `MatchStatus: 'setup'` y `players: []`. En auth no se monta SetupScreen (CA3). Login fullscreen = F02.5-B.
3. **`MATCH_CLEAN`**: helper interno para reset coherente de `phase`/`status`/`players`/… al entrar setup, newMatch o logout.
4. **`logoutToAuth`** pone `appStage: 'auth'` y aplica `MATCH_CLEAN` → no deja `playing`/`finished` huérfanos bajo UI de auth (CA2).
5. **`enterSetup`** aplica `MATCH_CLEAN` + `appStage: 'setup'` (path skip/login de F02.5-B).
6. **`startMatch`** → `appStage: 'match'` + `status: 'playing'` (semántica F01 intacta).
7. **`newMatch`** → `appStage: 'setup'` (no auth) + `MATCH_CLEAN` (CA4).
8. **`restart`** fuerza `appStage: 'match'` + `status: 'playing'` (sigue en partida).
9. **Gating en shell**: `setup` → SetupScreen; `match` → Hud + VictoryModal; `auth` → ninguno. VictoryModal sigue auto-gateando con `status === 'finished'`. Acciones turn/`phase` siguen gated por `status === 'playing'`.

---

## Criterios de aceptación

| ID | Criterio | ¿Cubierto? |
|---|---|---|
| CA1 | Tipo `AppStage` + inicial `'auth'` | ✅ |
| CA2 | Acciones setup / match vía `startMatch` / logout a auth sin romper MatchStatus | ✅ `enterSetup`, `startMatch`, `logoutToAuth` |
| CA3 | Shell monta/oculta según `appStage`; auth sin setup | ✅ `page.tsx` |
| CA4 | `newMatch()` → `appStage 'setup'` | ✅ |
| CA5 | `phase` / `MatchStatus` F01 intactos en match | ✅ guards `status !== "playing"` sin cambios de semántica |
| CA6 | `tsc` + `build` limpios | ✅ 2026-07-17 |
| CA7 | Cero deps nuevas | ✅ |

---

## Verificación manual pendiente (humano / F02.5-B)

1. Tras F02.5-B (Skip/login): al abrir app en auth no aparece SetupScreen.
2. `enterSetup` → SetupScreen; `startMatch` → Hud; meta → VictoryModal.
3. VictoryModal → «Nueva partida» → SetupScreen (no auth).
4. Turnos / aim / settle / finish siguen OK en `appStage === 'match'`.
5. `logoutToAuth` (cuando F02.5-C lo cablee) → auth, sin SetupScreen/Hud.

**Nota:** Sin F02.5-B no hay UI para salir de `auth` en runtime; es intencional en esta subtarea.

---

## Fuera de scope (no tocado)

- F02.5-B: login fullscreen, botón Saltar, sesión persistida
- F02.5-C: prefill perfil, logout desde setup UI
- Reescritura de `/login` / `LoginForm`
