export interface GeoPoint {
  lat: number;
  lon: number;
  label?: string;
  altitude?: number;
}

export interface BoatStatus {
  lat: number;
  lon: number;
  heading: number;
}

export type MarkerType = 'clear' | 'debris' | 'crash';

export interface UserMarker {
  id: string;
  lat: number;
  lon: number;
  type: MarkerType;
  timestamp: number;
}
