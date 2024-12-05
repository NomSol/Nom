import { useState } from 'react';

export const useDeviceOrientation = () => {
    const [orientation, setOrientation] = useState<number | null>(null);

    const requestPermission = async () => {
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            // @ts-ignore: Property 'requestPermission' may not exist
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                // @ts-ignore
                const permissionState = await DeviceOrientationEvent.requestPermission();
                return permissionState === 'granted';
            } catch (err) {
                console.error('Error requesting device orientation permission:', err);
                return false;
            }
        }
        return true; // Permission not required
    };

    const startWatching = async () => {
        const hasPermission = await requestPermission();
        if (!hasPermission) return;

        const handleOrientation = (event: DeviceOrientationEvent) => {
            if (event.alpha !== null) {
                setOrientation(event.alpha);
            }
        };

        window.addEventListener('deviceorientation', handleOrientation);
        return () => window.removeEventListener('deviceorientation', handleOrientation);
    };

    return { orientation, startWatching };
};