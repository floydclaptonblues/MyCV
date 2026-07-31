import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { SceneView, SceneViewHandle } from './components/SceneView';
import { useGeolocation } from './hooks/useGeolocation';
import { MarkerData, OriginData } from './types';
import * as THREE from 'three';

export default function App() {
    const { gpsData, error: gpsError } = useGeolocation();
    const [origin, setOrigin] = useState<OriginData | null>(null);
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const sceneRef = useRef<SceneViewHandle>(null);

    useEffect(() => {
        if (!origin && gpsData.latitude !== null && gpsData.longitude !== null) {
            setOrigin({ latitude: gpsData.latitude, longitude: gpsData.longitude });
        }
    }, [gpsData, origin]);

    const handleDropMarker = () => {
        if (gpsData.latitude === null || gpsData.longitude === null || !origin) {
            alert('Waiting for GPS lock before markers can be dropped.');
            return;
        }

        const R = 6371000;
        const SCALE = 0.05;
        const latRad = THREE.MathUtils.degToRad(gpsData.latitude);
        const lonRad = THREE.MathUtils.degToRad(gpsData.longitude);
        const originLatRad = THREE.MathUtils.degToRad(origin.latitude);
        const originLonRad = THREE.MathUtils.degToRad(origin.longitude);
        const dLat = latRad - originLatRad;
        const dLon = lonRad - originLonRad;
        const meanLat = (latRad + originLatRad) / 2;
        const x = R * dLon * Math.cos(meanLat) * SCALE;
        const z = -R * dLat * SCALE;

        const newMarker: MarkerData = {
            id: markers.length + 1,
            latitude: gpsData.latitude,
            longitude: gpsData.longitude,
            timestamp: new Date(),
            scenePosition: new THREE.Vector3(x, 0, z)
        };
        setMarkers(prev => [...prev, newMarker]);
    };

    const handleCenterCamera = () => sceneRef.current?.centerCamera();
    const handleClearMarkers = () => {
        if (markers.length && window.confirm('Are you sure you want to clear all markers?')) setMarkers([]);
    };

    const handleExportCsv = () => {
        if (!markers.length) {
            alert('No markers to export.');
            return;
        }
        const headers = 'id,timestamp,latitude,longitude,scene_x,scene_z\n';
        const rows = markers.map(m => `${m.id},${m.timestamp.toISOString()},${m.latitude},${m.longitude},${m.scenePosition.x.toFixed(2)},${m.scenePosition.z.toFixed(2)}`).join('\n');
        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `n80fp_markers_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-900">
            <div className="w-full md:w-80 h-[35vh] md:h-full flex-shrink-0 z-20 relative shadow-2xl">
                <Sidebar gpsData={gpsData} markers={markers} gpsError={gpsError} onDropMarker={handleDropMarker} onCenterCamera={handleCenterCamera} onClearMarkers={handleClearMarkers} onExportCsv={handleExportCsv} />
            </div>
            <div className="flex-1 h-[65vh] md:h-full relative z-10">
                <SceneView ref={sceneRef} gpsData={gpsData} markers={markers} origin={origin} />
            </div>
        </div>
    );
}
