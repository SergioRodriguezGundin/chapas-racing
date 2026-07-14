"use client";

import { CuboidCollider, RigidBody, type IntersectionEnterPayload } from "@react-three/rapier";

import { TRACK } from "@/config/physics";
import { getCurrentTrack } from "@/features/track/track.types";
import { useTrackGeometry } from "@/features/track/useTrackGeometry";
import { useGameStore } from "@/stores/gameStore";

const FINISH_COLOR = "#ffd166";

/** Línea de meta: sensor perpendicular al último tramo; primera chapa en cruzar gana. */
export function FinishLine() {
  const track = getCurrentTrack();
  const { finish } = track;
  const { finishTransform } = useTrackGeometry(track);

  const { finishHeight, finishDepth, finishOpacity } = TRACK;

  const handleIntersectionEnter = (payload: IntersectionEnterPayload) => {
    if (useGameStore.getState().status !== "playing") return;
    const userData = payload.other.rigidBodyObject?.userData;
    if (userData?.type !== "cap") return;
    const playerIndex = userData.playerIndex;
    if (typeof playerIndex !== "number") return;
    useGameStore.getState().playerFinished(playerIndex);
  };

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={finishTransform.position}
      rotation={[0, finishTransform.rotationY, 0]}
    >
      {/* args = half-extents; ancho finish.width en eje X (mismo criterio que el largo
          de los segmentos) para que rotationY = anguloTramo + π/2 lo cruce sobre la pista. */}
      <CuboidCollider
        args={[finish.width / 2, finishHeight / 2, finishDepth / 2]}
        sensor
        onIntersectionEnter={handleIntersectionEnter}
      />
      <mesh>
        <boxGeometry args={[finish.width, finishHeight, finishDepth]} />
        <meshStandardMaterial color={FINISH_COLOR} transparent opacity={finishOpacity} />
      </mesh>
    </RigidBody>
  );
}
