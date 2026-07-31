import { GeoPoint } from './types';
import * as THREE from 'three';

export const WORLD_SCALE = 75000;

export const POI_LKP: GeoPoint = {
  lat: 30.1100,
  lon: -90.0300,
  label: 'LKP (~908 ft)',
  altitude: 908
};

export const POI_OUR_MODEL: GeoPoint = {
  lat: 30.1038,
  lon: -90.0309,
  label: 'Modeled POI (Impact Est.)'
};

export const POI_CAJUN_NAVY: GeoPoint = {
  lat: 30.1103,
  lon: -90.0254,
  label: 'Slick / Debris (Cajun Navy)'
};

export const WORLD_ORIGIN = {
  lat: (POI_OUR_MODEL.lat + POI_CAJUN_NAVY.lat) / 2,
  lon: (POI_OUR_MODEL.lon + POI_CAJUN_NAVY.lon) / 2,
};

export const latLonToVector3 = (lat: number, lon: number, altitudeY: number = 0): THREE.Vector3 => {
  const dLat = lat - WORLD_ORIGIN.lat;
  const dLon = lon - WORLD_ORIGIN.lon;
  const x = dLon * WORLD_SCALE;
  const z = dLat * WORLD_SCALE;
  return new THREE.Vector3(x, altitudeY, z);
};

export const vector3ToLatLon = (vec: THREE.Vector3): GeoPoint => {
  const dLon = vec.x / WORLD_SCALE;
  const dLat = vec.z / WORLD_SCALE;
  return {
    lat: WORLD_ORIGIN.lat + dLat,
    lon: WORLD_ORIGIN.lon + dLon
  };
};
