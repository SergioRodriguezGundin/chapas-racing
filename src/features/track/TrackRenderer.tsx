"use client";

import { CuboidCollider, CylinderCollider, RigidBody } from "@react-three/rapier";

import { TRACK } from "@/config/physics";
import { getCurrentTrack } from "@/features/track/track.types";
import { useTrackGeometry } from "@/features/track/useTrackGeometry";

const FLOOR_COLOR = "#3a4750";

/**
 * Suelo del circuito: único RigidBody fixed con colliders explícitos.
 * El suelo existe solo bajo el trazado (fuera de pista = caer al vacío).
 */
export function TrackRenderer() {
  const track = getCurrentTrack();
  const { trackWidth } = track;
  const { segments, pads } = useTrackGeometry(track);

  const thickness = TRACK.floorThickness;

  return (
    <RigidBody type="fixed" colliders={false}>
      {segments.map((segment, index) => (
        // useTrackGeometry alinea el LARGO con +X local -> boxGeometry X=length, Z=trackWidth.
        <group
          key={`seg-${index}`}
          position={segment.position}
          rotation={[0, segment.rotationY, 0]}
        >
          <CuboidCollider args={[segment.length / 2, thickness / 2, trackWidth / 2]} />
          <mesh receiveShadow>
            <boxGeometry args={[segment.length, thickness, trackWidth]} />
            <meshStandardMaterial color={FLOOR_COLOR} />
          </mesh>
        </group>
      ))}

      {pads.map((position, index) => (
        <group key={`pad-${index}`} position={position}>
          <CylinderCollider args={[thickness / 2, trackWidth / 2]} />
          <mesh receiveShadow>
            <cylinderGeometry args={[trackWidth / 2, trackWidth / 2, thickness, 32]} />
            <meshStandardMaterial color={FLOOR_COLOR} />
          </mesh>
        </group>
      ))}
    </RigidBody>
  );
}
