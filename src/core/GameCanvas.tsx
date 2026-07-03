"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { OrbitControls } from "@react-three/drei";
import { Cap } from "@/features/cap/Cap";
import { Ground } from "@/features/track/Ground";
import { useGameStore } from "@/stores/gameStore";

/**
 * Escena raíz. Physics necesita Suspense (Rapier WASM lazy-init).
 * OrbitControls libre; se desactiva durante aiming -> el drag no mueve cámara.
 */
export function GameCanvas() {
  const phase = useGameStore((s) => s.phase);

  return (
    <Canvas
      shadows
      camera={{ position: [7, 8, 7], fov: 50 }}
      style={{ touchAction: "none" }} // táctil: el drag no scrollea la página
    >
      <color attach="background" args={["#1b262c"]} />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 15, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <Suspense fallback={null}>
        <Physics>
          <Ground />
          <Cap />
        </Physics>
      </Suspense>

      <OrbitControls
        makeDefault
        enabled={phase !== "aiming"}
        maxPolarAngle={Math.PI / 2.1} // no bajar de la línea del suelo
        minDistance={3}
        maxDistance={30}
      />
    </Canvas>
  );
}
