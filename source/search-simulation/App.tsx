import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Grid } from '@react-three/drei';
import HUD from './components/Overlay/HUD';
import Water from './components/World/Water';
import SceneMarkers from './components/World/SceneMarkers';
import SearchTrail from './components/World/SearchTrail';
import Plane from './components/Vehicles/Plane';
import Boat from './components/Vehicles/Boat';
import { BoatStatus, UserMarker, MarkerType } from './types';

const App: React.FC = () => {
  const boatRef = useRef<BoatStatus | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsPosition, setGpsPosition] = useState<BoatStatus | null>(null);
  const [userMarkers, setUserMarkers] = useState<UserMarker[]>([]);
  const [searchPath, setSearchPath] = useState<BoatStatus[]>([]);

  const toggleGps = () => setGpsActive(prev => !prev);

  const dropMarker = (type: MarkerType) => {
    if (boatRef.current) {
      const newMarker: UserMarker = {
        id: Date.now().toString(),
        lat: boatRef.current.lat,
        lon: boatRef.current.lon,
        type,
        timestamp: Date.now()
      };
      setUserMarkers(prev => [...prev, newMarker]);
    }
  };

  useEffect(() => {
    if (!gpsActive) {
      setGpsPosition(null);
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setGpsActive(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setGpsPosition({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          heading: position.coords.heading || 0
        });
      },
      (error) => {
        console.error('GPS Error:', error);
        alert(`GPS Error: ${error.message}`);
        setGpsActive(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [gpsActive]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (boatRef.current) {
        setSearchPath(prev => {
          const last = prev[prev.length - 1];
          if (!last || Math.abs(last.lat - boatRef.current!.lat) > 0.00005 || Math.abs(last.lon - boatRef.current!.lon) > 0.00005) {
            return [...prev, { ...boatRef.current! }];
          }
          return prev;
        });
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-950">
      <HUD
        boatRef={boatRef}
        gpsActive={gpsActive}
        onToggleGps={toggleGps}
        onDropMarker={dropMarker}
        markerCount={userMarkers.length}
      />

      <Canvas shadows camera={{ position: [-600, 450, 700], fov: 50, far: 20000 }} className="w-full h-full block">
        <color attach="background" args={['#020617']} />
        <ambientLight intensity={0.4} color="#a5f3fc" />
        <directionalLight position={[-300, 400, 150]} intensity={0.8} castShadow shadow-mapSize={[2048, 2048]} />
        <Stars radius={10000} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <Water />
        <Grid
          position={[0, 0.1, 0]}
          args={[4000, 4000]}
          cellColor="#115e59"
          sectionColor="#14b8a6"
          fadeDistance={3000}
          sectionSize={500}
          cellSize={100}
          infiniteGrid
        />
        <SceneMarkers userMarkers={userMarkers} />
        <SearchTrail path={searchPath} />
        <Plane />
        <Boat onUpdate={boatRef} gpsPosition={gpsPosition} />
        <OrbitControls enablePan enableZoom maxPolarAngle={Math.PI / 2 - 0.05} minDistance={50} maxDistance={4000} />
      </Canvas>
    </div>
  );
};

export default App;
