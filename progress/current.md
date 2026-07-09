# Estado actual

Tarea en curso: (ninguna)

Última cerrada: feature 7 — victory_modal (done). Ver `progress/history.md`.

Progreso iteración 2: features 1–7 done (7/8). Queda la 8 (verificación integral).

Pendiente-de-humano acumulado (BLOQUEA la feature 8, que es verificación manual integral):
- Render del circuito visible y chapa lanzable (feature 4).
- Cruzar meta -> status 'won'; no re-dispara (feature 5).
- Lanzar fuera del borde -> cae y reaparece quieta en lastPosition, phase 'idle' (feature 6).
- Modal de victoria aparece al ganar; "Jugar de nuevo" resetea; no se puede lanzar con modal abierto (feature 7).
- Editar trackWidth/waypoints en circuit-01.json cambia el trazado (feature 8, criterio data-driven).

Siguiente: feature 8 — iteration_2_verification. Es un recorrido de verificación MANUAL (requiere `pnpm dev` y ojos humanos); el leader/agentes no pueden validarla sola. Recomendado: sesión de verificación manual con el usuario.

Plan:
-
