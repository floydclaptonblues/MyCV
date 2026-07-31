import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { vector3ToLatLon, latLonToVector3, WORLD_ORIGIN } from '../../constants';
import { BoatStatus } from '../../types';

const useKeyboard = () => {
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const handleDown = (event: KeyboardEvent) =>
      setKeys((current) => ({ ...current, [event.key.toLowerCase()]: true }));
    const handleUp = (event: KeyboardEvent) =>
      setKeys((current) => ({ ...current, [event.key.toLowerCase()]: false }));

    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  return keys;
};

interface BoatProps {
  onUpdate: React.MutableRefObject<BoatStatus | null>;
  gpsPosition: BoatStatus | null;
}

const Boat: React.FC<BoatProps> = ({ onUpdate, gpsPosition }) => {
  const groupRef = useRef<Group>(null);
  const keys = useKeyboard();
  const speed = 45;
  const turnSpeed = 1.5;

  const initialPos = latLonToVector3(
    WORLD_ORIGIN.lat - 0.002,
    WORLD_ORIGIN.lon - 0.002,
    0
  );

  const pos = useRef(new Vector3(initialPos.x, 0, initialPos.z));
  const heading = useRef(Math.PI);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;

    if (gpsPosition) {
      const targetVec = latLonToVector3(gpsPosition.lat, gpsPosition.lon, 0);
      pos.current.lerp(targetVec, 0.1);

      if (!Number.isNaN(gpsPosition.heading)) {
        const radians = compassDegreesToSceneRadians(gpsPosition.heading);
        let difference = radians - heading.current;
        while (difference > Math.PI) difference -= Math.PI * 2;
        while (difference < -Math.PI) difference += Math.PI * 2;
        heading.current += difference * 0.1;
      }
    } else {
      let moveForward = 0;
      let strafe = 0;

      if (keys.w) moveForward += 1;
      if (keys.s) moveForward -= 1;
      if (keys.a) heading.current += turnSpeed * delta;
      if (keys.d) heading.current -= turnSpeed * delta;
      if (keys.q) strafe -= 1;
      if (keys.e) strafe += 1;

      const sin = Math.sin(heading.current);
      const cos = Math.cos(heading.current);
      const dirX = sin;
      const dirZ = cos;
      const rightX = cos;
      const rightZ = -sin;
      const distance = speed * delta;

      pos.current.x += (dirX * moveForward + rightX * strafe) * distance;
      pos.current.z += (dirZ * moveForward + rightZ * strafe) * distance;
    }

    groupRef.current.position.set(pos.current.x, 0, pos.current.z);
    groupRef.current.rotation.y = heading.current;

    const latLon = vector3ToLatLon(pos.current);
    onUpdate.current = {
      lat: latLon.lat,
      lon: latLon.lon,
      heading: heading.current
    };
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 2, 0]}>
        <boxGeometry args={[12, 4, 30]} />
        <meshStandardMaterial
          color={gpsPosition ? '#10b981' : '#0ea5e9'}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>
      <mesh position={[0, 6, -5]}>
        <boxGeometry args={[10, 6, 12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.1} />
      </mesh>
      <mesh position={[0, 4, 16]}>
        <boxGeometry args={[8, 6, 4]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      <pointLight
        position={[0, 10, -10]}
        distance={200}
        intensity={0.5}
        color="#e0f2fe"
      />
    </group>
  );
};

function compassDegreesToSceneRadians(compassDegrees: number): number {
  return (compassDegrees * Math.PI) / 180;
}

export default Boat;
