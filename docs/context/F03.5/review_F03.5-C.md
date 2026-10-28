# Review — F03.5-C

**Veredicto:** APPROVED

## Criterios de aceptación
- CA1: [x] `chooseOnline` → `appStage: "online"`; hub monta `OnlineLobby embedded` con create/join F03 (`ModeSelectScreen.tsx` L67, `page.tsx` L31–42, `gameStore.ts` L308–312)
- CA2: [x] Lobby reutilizado: código visible + Copiar (`OnlineLobby.tsx` L805–820); join por código intacto (RPC `join_room`)
- CA3: [x] Sin reimplementar sync: mismo `OnlineLobby` + `start_room` / Realtime / `bindOnlineSession` / `beginOnlineMatch`; hub evita 2º canvas en embedded match (`OnlineLobby.tsx` L776–778)
- CA4: [x] Sin sesión: CTA disabled + «Inicia sesión…» + `logoutToAuth` (`ModeSelectScreen.tsx` L61–86); `/online` sigue protegida
- CA5: [x] Flujo principal en `/`; `(protected)/online/page.tsx` bridge `chooseOnline()` + `router.replace("/")`
- CA6: [x] «Salir del lobby» / «Volver al menú» → `enterMode()`; victoria online `newMatch` → mode; unmount hace `leave_room` si stage `mode`|`auth` (efecto `appStage === "setup"` eliminado)
- CA7: [x] `pnpm tsc --noEmit` exit 0; `pnpm build` exit 0
- CA8: [x] Sin cambios en `package.json` / lockfile

## Checks explícitos
- [x] `chooseOnline` ya no stub; `AppStage` incluye `"online"`
- [x] Guest gate en ModeSelect
- [x] OnlineLobby montado en hub; cleanup post-`newMatch` por unmount (no depende de setup)
- [x] Leave / Volver → `enterMode`
- [x] `/online` bridge documentado en el page
- [x] No se reimplementó sync F03
- [x] `feature_list.json` F03.5-C sigue `status: "pending"` (no marcado done)

## Cambios requeridos
Ninguno.
