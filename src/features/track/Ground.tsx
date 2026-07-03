"use client";

import { CuboidCollider, RigidBody } from "@react-three/rapier";
import { Grid } from "@react-three/drei";

const SIZE = 40;

/**
 * Iter 1: plano de juego simple.
 * Iter futura: aquí vivirá el circuito (geometría, límites, meta, sensores fuera-pista).
 */
export function Ground() {
  return (
    <>
      <RigidBody type="fixed" colliders={false}>
        <CuboidCollider args={[SIZE / 2, 0.1, SIZE / 2]} position={[0, -0.1, 0]} />
        <mesh receiveShadow position={[0, -0.05, 0]}>
          <boxGeometry args={[SIZE, 0.1, SIZE]} />
          <meshStandardMaterial color="#3a4750" />
        </mesh>
      </RigidBody>
      <Grid
        args={[SIZE, SIZE]}
        position={[0, 0.01, 0]}
        cellSize={1}
        cellColor="#5c6b73"
        sectionSize={5}
        sectionColor="#9db4c0"
        fadeDistance={45}
        infiniteGrid={false}
      />
    </>
  );
}
