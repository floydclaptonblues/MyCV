import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { latLonToVector3 } from '../../constants';
import { BoatStatus } from '../../types';

interface SearchTrailProps {
  path: BoatStatus[];
}

const SearchTrail: React.FC<SearchTrailProps> = ({ path }) => {
  const points = useMemo(
    () => path.map((point) => latLonToVector3(point.lat, point.lon, 1)),
    [path]
  );

  if (points.length < 2) return null;

  return (
    <Line
      points={points}
      color="#0ea5e9"
      lineWidth={4}
      opacity={0.6}
      transparent
      vertexColors={false}
    />
  );
};

export default SearchTrail;
