# Sesión actual

Tarea en curso: feature 5 `finish_line` (iteración 2)

Plan:
- Añadir constantes de meta a `TRACK` en `config/physics.ts` (alto sensor, profundidad, opacidad).
- Crear `src/features/track/FinishLine.tsx`: RigidBody fixed + CuboidCollider sensor en `finishTransform`, ancho `finish.width` en eje X, guard de status + userData, visual semitransparente.
- Añadir `userData={{ type: "cap" }}` al RigidBody de la chapa (`Cap.tsx`) como red de seguridad del guard.
- Montar `<FinishLine />` en `GameCanvas.tsx` dentro de `<Physics>`.
- Verificar `pnpm tsc --noEmit` y `pnpm build`.
