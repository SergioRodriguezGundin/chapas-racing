import { CAP_START_SPACING } from "@/config/physics";
import type { TrackDefinition } from "@/features/track/track.types";

/**
 * Calcula posiciones de salida para N chapas, repartidas perpendicularmente
 * al primer tramo (waypoints[0]→[1]) y centradas en capStart.
 */
export function computeStartPositions(
  track: TrackDefinition,
  count: number,
): [number, number, number][] {
  const [capX, capY, capZ] = track.capStart;
  const [x0, z0] = track.waypoints[0];
  const [x1, z1] = track.waypoints[1];

  const dx = x1 - x0;
  const dz = z1 - z0;
  const len = Math.hypot(dx, dz) || 1;

  const perpX = -dz / len;
  const perpZ = dx / len;

  return Array.from({ length: count }, (_, i) => {
    const offset = (i - (count - 1) / 2) * CAP_START_SPACING;
    return [capX + perpX * offset, capY, capZ + perpZ * offset];
  });
}
