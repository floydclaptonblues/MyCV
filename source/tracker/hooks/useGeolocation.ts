import { useState, useEffect, useRef } from 'react';
import { GPSData } from '../types';

export const useGeolocation = () => {
    const [gpsData, setGpsData] = useState<GPSData>({
        latitude: null,
        longitude: null,
        accuracy: null,
        speed: null,
        heading: null,
        timestamp: null,
    });
    const [error, setError] = useState<string | null>(null);
    const prevPosRef = useRef<GPSData | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        const success = (position: GeolocationPosition) => {
            const { latitude, longitude, accuracy, speed, heading } = position.coords;
            const newData: GPSData = {
                latitude,
                longitude,
                accuracy,
                speed,
                heading,
                timestamp: position.timestamp,
            };
            prevPosRef.current = newData;
            setGpsData(newData);
            setError(null);
        };

        const handleError = (geolocationError: GeolocationPositionError) => {
            setError(geolocationError.message);
        };

        const id = navigator.geolocation.watchPosition(success, handleError, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 1000,
        });

        return () => navigator.geolocation.clearWatch(id);
    }, []);

    return { gpsData, error };
};
