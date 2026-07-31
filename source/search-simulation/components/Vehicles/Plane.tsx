import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { POI_LKP, latLonToVector3, WORLD_ORIGIN } from '../../constants';

const Plane: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);

  // Start: LKP at altitude. Scene vertical scale is 10 ft per unit.
  const startPos = latLonToVector3(POI_LKP.lat, POI_LKP.lon, 90.8);

  // End: scene origin used by the visualization.
  const endPos = latLonToVector3(WORLD_ORIGIN.lat, WORLD_ORIGIN.lon, 0);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;

    const duration = 12;
    const t = clock.getElapsedTime() % (duration + 4);

    if (t <= duration) {
      const alpha = t / duration;
      groupRef.current.position.lerpVectors(startPos, endPos, alpha);
      groupRef.current.lookAt(endPos);
      groupRef.current.rotation.z = Math.sin(t * 2) * 0.2;
      groupRef.current.visible = true;
    } else {
      groupRef.current.visible = false;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[10, 8, 40]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 2, 5]}>
        <boxGeometry args={[60, 1, 8]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0, 5, -16]}>
        <boxGeometry args={[20, 4, 6]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <mesh position={[0, 8, -16]}>
        <boxGeometry args={[2, 10, 8]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <Html distanceFactor={500} position={[0, 15, 0]}>
        <div className="bg-red-600/80 text-white text-[10px] px-1 rounded font-bold">
          N80FP (Simulated)
        </div>
      </Html>
    </group>
  );
};

export default Plane;
