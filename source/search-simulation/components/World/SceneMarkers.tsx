import React, { useMemo } from 'react';
import { Html, Line } from '@react-three/drei';
import { POI_LKP, POI_OUR_MODEL, POI_CAJUN_NAVY, latLonToVector3, WORLD_ORIGIN } from '../../constants';
import { GeoPoint, UserMarker, MarkerType } from '../../types';

interface SceneMarkersProps {
  userMarkers?: UserMarker[];
}

const Marker: React.FC<{ point: GeoPoint; color: string; isUser?: boolean; type?: MarkerType }> = ({ point, color, isUser, type }) => {
  const position = useMemo(() => {
    const y = point.altitude ? point.altitude / 10 : (isUser ? 2 : 4);
    return latLonToVector3(point.lat, point.lon, y);
  }, [point, isUser]);

  return (
    <group position={position}>
      <mesh>
        {isUser ? (
          type === 'crash' ? <coneGeometry args={[4, 10, 4]} /> :
          type === 'debris' ? <boxGeometry args={[6, 6, 6]} /> :
          <sphereGeometry args={[4, 8, 8]} />
        ) : <sphereGeometry args={[point.altitude ? 8 : 4, 16, 16]} />}
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>

      {(point.altitude || isUser) && (
        <Line points={[[0, 0, 0], [0, -position.y, 0]]} color={color} lineWidth={1} dashed dashScale={5} />
      )}

      <Html position={[0, isUser ? 15 : 20, 0]} center distanceFactor={800} zIndexRange={[100, 0]}>
        <div className={`border px-2 py-1 rounded text-white text-xs whitespace-nowrap font-mono shadow-xl backdrop-blur-sm ${isUser ? 'bg-black/60 scale-75' : 'bg-slate-900/80 hover:scale-110'}`} style={{ borderColor: color }}>
          <div className="font-bold" style={{ color }}>{point.label}</div>
          {!isUser && <div className="text-[9px] opacity-70">{point.lat.toFixed(4)}, {point.lon.toFixed(4)}</div>}
        </div>
      </Html>
    </group>
  );
};

const SearchEllipse: React.FC = () => {
  const points = useMemo(() => {
    const aLat = 0.0075;
    const bLon = 0.0050;
    const pts = [];
    const steps = 128;

    for (let i = 0; i <= steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      const lat = WORLD_ORIGIN.lat + aLat * Math.sin(theta);
      const lon = WORLD_ORIGIN.lon + bLon * Math.cos(theta);
      pts.push(latLonToVector3(lat, lon, 2));
    }
    return pts;
  }, []);

  return <Line points={points} color="#2dd4bf" lineWidth={2} dashed dashScale={50} gapSize={20} />;
};

const SceneMarkers: React.FC<SceneMarkersProps> = ({ userMarkers = [] }) => {
  const getMarkerColor = (type: MarkerType) => type === 'clear' ? '#22c55e' : type === 'debris' ? '#facc15' : '#ef4444';
  const getMarkerLabel = (type: MarkerType, id: string) => type === 'clear' ? `Checked ${id.slice(-3)}` : type === 'debris' ? `Debris ${id.slice(-3)}` : 'CRASH SITE';

  return (
    <group>
      <Marker point={POI_LKP} color="#ef4444" />
      <Marker point={POI_OUR_MODEL} color="#eab308" />
      <Marker point={POI_CAJUN_NAVY} color="#d946ef" />
      {userMarkers.map(m => (
        <Marker key={m.id} point={{ lat: m.lat, lon: m.lon, label: getMarkerLabel(m.type, m.id) }} color={getMarkerColor(m.type)} isUser type={m.type} />
      ))}
      <SearchEllipse />
    </group>
  );
};

export default SceneMarkers;
