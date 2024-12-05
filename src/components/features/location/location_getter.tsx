'use client';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '../../ui/card';
import { useGeolocation } from '../../hooks/use-geolocation';
import { useEffect, useState } from 'react';

interface RegionInfo {
    id: string;
    name: string;
    visitCount: number;
    lastVisit: string;
}

export function LocationGetter() {
    const { latitude, longitude, accuracy, speed, heading, error, loading, getLocation } = useGeolocation();
    const [currentRegion, setCurrentRegion] = useState<RegionInfo | null>(null);

    useEffect(() => {
        const fetchRegionInfo = async () => {
            if (!latitude || !longitude) return;

            try {
                const response = await fetch(`/api/location/region?lat=${latitude}&lng=${longitude}`);
                if (response.ok) {
                    const data = await response.json();
                    setCurrentRegion(data);
                }
            } catch (error) {
                console.error('Error fetching region info:', error);
            }
        };

        fetchRegionInfo();
    }, [latitude, longitude]);

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Location Tracker</CardTitle>
                    <CardDescription>
                        Track your current location and region information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        onClick={getLocation}
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? 'Getting Location...' : 'Update Location'}
                    </Button>

                    {error && (
                        <div className="text-destructive text-sm p-2 bg-destructive/10 rounded">
                            Error: {error}
                        </div>
                    )}

                    {latitude && longitude && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-secondary rounded-md">
                                <p className="text-xs text-muted-foreground">Latitude</p>
                                <p className="font-mono">{latitude.toFixed(6)}</p>
                            </div>
                            <div className="p-3 bg-secondary rounded-md">
                                <p className="text-xs text-muted-foreground">Longitude</p>
                                <p className="font-mono">{longitude.toFixed(6)}</p>
                            </div>
                            {accuracy && (
                                <div className="p-3 bg-secondary rounded-md">
                                    <p className="text-xs text-muted-foreground">Accuracy</p>
                                    <p className="font-mono">{accuracy.toFixed(2)}m</p>
                                </div>
                            )}
                            {speed && (
                                <div className="p-3 bg-secondary rounded-md">
                                    <p className="text-xs text-muted-foreground">Speed</p>
                                    <p className="font-mono">{(speed * 3.6).toFixed(2)}km/h</p>
                                </div>
                            )}
                        </div>
                    )}

                    {currentRegion && (
                        <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                            <h3 className="font-semibold">Current Region: {currentRegion.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                Visits: {currentRegion.visitCount}
                                <br />
                                Last visit: {new Date(currentRegion.lastVisit).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
