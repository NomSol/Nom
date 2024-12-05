import { useAuth } from '@/hooks/use-auth';
import { useState } from 'react';

interface GeolocationState {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    speed: number | null;
    heading: number | null;
    error: string | null;
    loading: boolean;
}

interface LocationHistoryEntry {
    id: string;
    userId: string;
    coordinates: string;
    accuracy: number;
    speed: number;
    heading: number;
    timestamp: string;
    deviceInfo: {
        userAgent: string;
        platform: string;
        vendor: string;
    };
}

export const useGeolocation = () => {
    const { user } = useAuth();
    const [state, setState] = useState<GeolocationState>({
        latitude: null,
        longitude: null,
        accuracy: null,
        speed: null,
        heading: null,
        error: null,
        loading: true,
    });

    const saveLocationToHistory = async (position: GeolocationPosition) => {
        if (!user?.id) return;

        const locationEntry: Partial<LocationHistoryEntry> = {
            userId: user.id,
            coordinates: `POINT(${position.coords.longitude} ${position.coords.latitude})`,
            accuracy: position.coords.accuracy ?? undefined,
            speed: position.coords.speed ?? undefined,
            heading: position.coords.heading ?? undefined,
            deviceInfo: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                vendor: navigator.vendor,
            },
        };

        try {
            const response = await fetch('/api/location/history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(locationEntry),
            });

            if (!response.ok) {
                throw new Error('Failed to save location history');
            }
        } catch (error) {
            console.error('Error saving location:', error);
        }
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            setState(prev => ({
                ...prev,
                error: "Geolocation is not supported",
                loading: false,
            }));
            return;
        }

        setState(prev => ({ ...prev, loading: true }));

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    speed: position.coords.speed,
                    heading: position.coords.heading,
                    error: null,
                    loading: false,
                });

                // Save location to history
                await saveLocationToHistory(position);
            },
            (error) => {
                setState({
                    latitude: null,
                    longitude: null,
                    accuracy: null,
                    speed: null,
                    heading: null,
                    error: error.message,
                    loading: false,
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0,
            }
        );
    };

    return {
        ...state,
        getLocation,
    };
};