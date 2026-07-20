# Informe impl — F03.5-A

**Feature:** F03.5-A — `mode_select_stage`  
**Estado:** listo para review (NO marcado `done` en `feature_list.json`)  
**Fecha:** 2026-07-20

## Resumen

Se insertó el stage `mode` entre `auth` y setup/online. Tras login, sesión persistida o «Saltar», la app entra en `ModeSelectScreen` con CTAs «Jugar en local» / «Jugar online». Local navega a setup; online es stub documentado (F03.5-C).

## Archivos tocados

| Archivo | Cambio |
|---|---|
| `src/stores/gameStore.ts` | `AppStage` += `"mode"`; `enterMode`, `chooseLocal`, `chooseOnline` (stub); `newMatch` → `"mode"`; comentarios de flujo |
| `src/ui/AuthEntryScreen.tsx` | `enterSetup` → `enterMode` (getUser, onAuthStateChange, onAuthSuccess, onSkip); JSDoc |
| `src/ui/ModeSelectScreen.tsx` | **Nuevo** — overlay fullscreen, CTAs, logout → `logoutToAuth`, hint stub online |
| `src/app/page.tsx` | Monta `ModeSelectScreen` si `appStage === "mode"`; AuthNav sigue visible (`!== "auth"`) |

## Decisiones

### `newMatch` → `'mode'` (no setup)

Preferencia del líder aplicada: tras victoria, «Nueva partida» vuelve a la pantalla de elección para no saltarse Local/Online. `MATCH_CLEAN` se aplica igual.

**Nota colateral:** `OnlineLobby` en `/online` escucha `appStage === "setup"` tras «Salir al lobby». Con `newMatch` → `mode`, ese efecto ya no dispara en home (correcto: home no monta OnlineLobby). En `/online` el flujo «Salir al lobby» puede quedar desalineado hasta F03.5-C; no se tocó OnlineLobby en esta tarea.

### `chooseOnline` stub

No existe stage `online` aún. `chooseOnline` es no-op en el store; `ModeSelectScreen` muestra mensaje: *«Modo online próximamente…»*. F03.5-C cableará lobby / stage online. **No** se montó OnlineLobby en `/`.

### `chooseLocal`

Llama internamente a set `appStage: "setup"` + `MATCH_CLEAN` (equivalente a `enterSetup`). Prepara F03.5-B.

### Logout desde mode

Botón «Cerrar sesión» (si hay sesión) → `signOut` + `logoutToAuth` → `'auth'`. AuthNav también visible en mode (perfil / login link).

### `enterSetup` conservado

Sigue exportado para uso interno / SetupScreen paths futuros; AuthEntry ya no lo usa.

## Checklist acceptance

- [x] `AppStage` incluye `'mode'` entre `'auth'` y setup/match
- [x] Login / sesión / Saltar → `appStage` `'mode'` (no setup directo)
- [x] Pantalla mode: CTAs «Jugar en local» y «Jugar online»
- [x] `page.tsx` monta `ModeSelectScreen` en mode; no Setup ni lobby online
- [x] `logoutToAuth` desde mode → `'auth'`; `newMatch` → `'mode'` (documentado)
- [x] `pnpm tsc --noEmit` y `pnpm build` limpios
- [x] Cero dependencias nuevas
- [x] Feature **no** marcada `done` (reviewer)

## Verificación automática

```
pnpm tsc --noEmit  → OK
pnpm build         → OK (Next 15.5.20)
```

## Verificación manual pendiente (humano)

1. Abrir `/` sin sesión → AuthEntry → «Saltar» → ModeSelectScreen (no Setup).
2. Login / sesión persistida → ModeSelectScreen.
3. «Jugar en local» → SetupScreen.
4. «Jugar online» → hint stub; no lobby ni Setup.
5. Con sesión en mode → «Cerrar sesión» → AuthEntry.
6. Partida local → victoria → «Nueva partida» → ModeSelectScreen (no Setup).
7. AuthNav visible en mode (`Mi perfil` / `Iniciar sesión`).

## Fuera de alcance (correcto)

- F03.5-B: atrás setup→mode, refinamiento rama local
- F03.5-C: cablear OnlineLobby / sesión obligatoria online
- Marcar `done` en `feature_list.json`
