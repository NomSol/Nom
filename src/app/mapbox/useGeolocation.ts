export const useGeolocation = (onSuccess: (position: GeolocationPosition) => void) => {
    const getLocation = () => {
        if (navigator.geolocation) {
            const options = {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            };

            const watchId = navigator.geolocation.watchPosition(onSuccess, (error) => {
                console.error("Error getting location: ", error);
            }, options);

            return () => navigator.geolocation.clearWatch(watchId);
        }
        console.error("Geolocation not supported");
    };

    return { getLocation };
};