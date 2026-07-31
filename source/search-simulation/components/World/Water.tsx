import React from 'react';

const Water: React.FC = () => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[50000, 50000]} />
      <meshPhongMaterial
        color="#062030"
        specular="#114e63"
        shininess={60}
        transparent
        opacity={0.95}
      />
    </mesh>
  );
};

export default Water;
