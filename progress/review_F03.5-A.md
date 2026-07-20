# Review — F03.5-A

**Veredicto:** APPROVED

## Criterios de aceptación
- CA1: [x] `AppStage` = `"auth" | "mode" | "setup" | "match"` en `gameStore.ts` L19; flujo documentado L16–17.
- CA2: [x] `AuthEntryScreen` usa `enterMode` en getUser (L21–22), `onAuthStateChange` (L30–31), `onAuthSuccess` / `onSkip` (L57–59). Ya no llama `enterSetup`.
- CA3: [x] `ModeSelectScreen.tsx` CTAs «Jugar en local» (L65–67) y «Jugar online» (L68–76).
- CA4: [x] `page.tsx` L34 monta `ModeSelectScreen` solo si `appStage === "mode"`; Setup en L35 solo en `"setup"`; sin `OnlineLobby` en `/`.
- CA5: [x] Logout en mode: `ModeSelectScreen` L45–51 → `signOut` + `logoutToAuth` → `"auth"` (`gameStore.ts` L319–322). `newMatch` → `"mode"` (L266–269) documentado en `impl_F03.5-A.md` (preferencia líder).
- CA6: [x] `pnpm tsc --noEmit` OK; `pnpm build` OK (Next 15.5.20, exit 0).
- CA7: [x] Sin cambios en `package.json` / `pnpm-lock.yaml`.

## Scope / notas
- `chooseOnline` stub permitido (F03.5-C): no-op en store L311–313 + hint UI L39–42.
- `chooseLocal` → `"setup"` OK (L306–309).
- Feature `F03.5-A` status sigue `"pending"` en `feature_list.json` (correcto; implementer marca tras APPROVED).
- Colateral `/online` + `newMatch` documentado; fuera de alcance F03.5-A.

## Archivos revisados
- `src/stores/gameStore.ts`
- `src/ui/AuthEntryScreen.tsx`
- `src/ui/ModeSelectScreen.tsx` (nuevo)
- `src/app/page.tsx`

## Cambios requeridos
Ninguno.
