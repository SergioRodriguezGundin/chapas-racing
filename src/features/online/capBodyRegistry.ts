import type { RapierRigidBody } from "@react-three/rapier";

import type { Vec3 } from "@/stores/gameStore";

/** Refs de RigidBody por slot — lectura de snapshot al settle (sin re-renders). */
const bodies = new Map<number, RapierRigidBody>();

export function registerCapBody(
  playerIndex: number,
  body: RapierRigidBody | null,
): void {
  if (body) {
    bodies.set(playerIndex, body);
  } else {
    bodies.delete(playerIndex);
  }
}

export function readCapPositions(playerCount: number): Vec3[] {
  const positions: Vec3[] = [];
  for (let i = 0; i < playerCount; i++) {
    const body = bodies.get(i);
    if (!body) {
      positions.push([0, 0, 0]);
      continue;
    }
    const t = body.translation();
    positions.push([t.x, t.y, t.z]);
  }
  return positions;
}
