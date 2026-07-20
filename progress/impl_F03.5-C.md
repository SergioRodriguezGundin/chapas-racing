# impl F03.5-C — Rama online: lobby en hub

**Estado:** implemented (pendiente review)  
**Fecha:** 2026-07-20  
**Verificación:** `pnpm tsc --noEmit` OK · `pnpm build` OK  
**Deps nuevas:** ninguna

## Resumen

«Jugar online» con sesión abre el lobby F03 en el hub (`appStage: "online"`). Invitados ven CTA deshabilitado + mensaje. `/online` redirige al hub. Salir lobby / fin de partida vuelven a **mode**.

## Archivos tocados

| Archivo | Cambio |
|---|---|
| `src/stores/gameStore.ts` | `AppStage` += `"online"`; `chooseOnline()` → `online` + `MATCH_CLEAN` |
| `src/ui/ModeSelectScreen.tsx` | Gate sesión (CTA disabled + «Inicia sesión…» + ir a auth); sin stub «próximamente» |
| `src/app/page.tsx` | Monta `<OnlineLobby embedded />` si `online` o (`match` && `online`); Hud/Victory solo match local |
| `src/ui/OnlineLobby.tsx` | Prop `embedded` (overlay hub); leave/Volver → `enterMode`; unmount `leave_room` si stage `mode`/`auth`; match embedded sin 2º canvas |
| `src/app/(protected)/online/page.tsx` | Bridge client: `chooseOnline()` + `router.replace("/")` |
| `src/ui/VictoryModal.tsx` | Copy online: «Volver al menú» (va a mode, no lobby entry) |

## Decisiones

### `/online`
Redirect al hub: página protegida (auth) ejecuta `chooseOnline()` y `replace("/")`. Flujo create/join solo en hub. Documentado en el propio page.

### Leave → mode
- «Salir del lobby»: `leave_room` + teardown + `enterMode()`.
- «Volver al menú» (entry/lobby): `enterMode()`; si había sala, unmount hace `leave_room` porque stage ya es `mode`.

### Fix efecto newMatch (setup → mode)
El efecto que escuchaba `appStage === "setup"` se eliminó (roto tras F03.5-A). Cleanup de victoria: al `newMatch` → `mode`, el hub desmonta OnlineLobby; unmount hace `leave_room` + `clearOnlineSession` + quitar channel **solo si** `appStage` es `mode` o `auth`. Unmount con sesión online activa (p.ej. refresh mid-match) sigue sin `leave_room` (reconnect).

### Embedded match
Hub ya tiene `GameCanvas`; en match online embedded solo Hud + VictoryModal + badge de sala (evita doble canvas/física).

## Checklist acceptance

- [x] CTA «Jugar online» con sesión → create/join (OnlineLobby F03)
- [x] Crear sala → código visible/compartible; join válido → lobby (reutilizado)
- [x] Lobby + start + partida online = stack F03 (sin reimplementar RPCs/sync)
- [x] Sin sesión: CTA disabled + mensaje + enlace a auth
- [x] Flujo principal en `/`; `/online` bridge → hub
- [x] Salir lobby / fin partida → **mode** (no setup)
- [x] `pnpm tsc --noEmit` + `pnpm build` limpios
- [x] Cero deps nuevas

## Verificación manual (humano)

1. **Guest:** ModeSelect → Online disabled + mensaje; «Ir a iniciar sesión» → auth.
2. **Sesión:** Online → create/join overlay en `/`; código copiable; 2º cliente join → lobby; host start → partida sync.
3. **Salir lobby** → ModeSelect (mode), no setup local.
4. **Victoria online** → «Volver al menú» → ModeSelect; sala abandonada.
5. **`/online` autenticado** → redirect `/` con lobby online.
6. Hot-seat local intacto (Local → setup → match).

## No marcado done

Reviewer decide checkboxes / `feature_list.json`.
