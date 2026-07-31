import { Vector3 } from 'three';

export interface GPSData {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    speed: number | null;
    heading: number | null;
    timestamp: number | null;
}

export interface MarkerData {
    id: number;
    latitude: number;
    longitude: number;
    timestamp: Date;
    scenePosition: Vector3;
}

export interface OriginData {
    latitude: number;
    longitude: number;
}
