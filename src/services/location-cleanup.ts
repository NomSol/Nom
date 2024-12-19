import { graphqlClient } from '@/lib/graphql-client';

export class LocationCleanupService {
    private static readonly RETENTION_HOURS = 24; // Increased to 24 hours
    private static readonly MAX_SPEED_KMH = 1000; // Maximum speed in km/h
    private static readonly MIN_TIME_DIFF_MINUTES = 0.1; // 6 seconds minimum

    private static calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) *
            Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private static toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    private static formatTimestamp(date: Date): string {
        return date.toISOString();
    }

    static async cleanupLocationHistory() {
        console.info("Starting location history cleanup and validation.");
        const cutoffTime = this.formatTimestamp(new Date(Date.now() - this.RETENTION_HOURS * 60 * 60 * 1000));

        try {
            // Get all locations within retention period
            const getLocationsQuery = `
            query GetLocations($cutoffTime: timestamp!) {
                geolocation_user_location(
                    where: {
                        created_at: { _gte: $cutoffTime }
                    },
                    order_by: [
                        { user_id: asc },
                        { created_at: asc }
                    ]
                ) {
                    id
                    user_id
                    latitude
                    longitude
                    created_at
                }
            }`;

            const locationsData = await graphqlClient.request<{
                geolocation_user_location: Array<{
                    id: string;
                    user_id: string;
                    latitude: number;
                    longitude: number;
                    created_at: string;
                }>;
            }>(getLocationsQuery, {
                cutoffTime
            });

            const locations = locationsData.geolocation_user_location;
            const suspiciousLocationIds = new Set<string>();

            // Group locations by user_id
            const locationsByUser = locations.reduce((acc, loc) => {
                if (!acc[loc.user_id]) {
                    acc[loc.user_id] = [];
                }
                acc[loc.user_id].push(loc);
                return acc;
            }, {} as Record<string, typeof locations>);

            // Validate each user's location sequence
            for (const [userId, userLocations] of Object.entries(locationsByUser)) {
                for (let i = 1; i < userLocations.length; i++) {
                    const prevLoc = userLocations[i - 1];
                    const currentLoc = userLocations[i];

                    const distance = this.calculateDistance(
                        prevLoc.latitude,
                        prevLoc.longitude,
                        currentLoc.latitude,
                        currentLoc.longitude
                    );

                    const timeDiffMinutes =
                        (new Date(currentLoc.created_at).getTime() - new Date(prevLoc.created_at).getTime())
                        / (1000 * 60);

                    if (timeDiffMinutes >= this.MIN_TIME_DIFF_MINUTES) {
                        const speed = (distance / timeDiffMinutes) * 60;

                        if (speed > this.MAX_SPEED_KMH) {
                            console.warn('SUSPICIOUS LOCATION DETECTED:', {
                                userId,
                                distance: `${distance.toFixed(2)} km`,
                                timeDiff: `${timeDiffMinutes.toFixed(2)} minutes`,
                                speed: `${speed.toFixed(2)} km/h`,
                                from: `${prevLoc.latitude}, ${prevLoc.longitude}`,
                                to: `${currentLoc.latitude}, ${currentLoc.longitude}`,
                                fromTime: prevLoc.created_at,
                                toTime: currentLoc.created_at
                            });
                            suspiciousLocationIds.add(prevLoc.id);
                            suspiciousLocationIds.add(currentLoc.id);
                        }
                    }
                }
            }

            // Keep one record per hour per user and all suspicious locations
            const keepRecordsQuery = `
            query GetRecordsToKeep($cutoffTime: timestamp!) {
                geolocation_user_location(
                    where: {
                        created_at: { _gte: $cutoffTime }
                    },
                    distinct_on: [user_id, created_at],
                    order_by: [
                        { user_id: asc },
                        { created_at: desc }
                    ]
                ) {
                    id
                    created_at
                }
            }`;

            const keepData = await graphqlClient.request<{
                geolocation_user_location: { id: string; created_at: string }[];
            }>(keepRecordsQuery, {
                cutoffTime
            });

            const keepIds = [
                ...keepData.geolocation_user_location.map(record => record.id),
                ...Array.from(suspiciousLocationIds)
            ];

            // Delete old records except those we want to keep
            const deleteOldRecordsQuery = `
            mutation DeleteOldRecords($cutoffTime: timestamp!, $keepIds: [uuid!]!) {
                delete_geolocation_user_location(
                    where: {
                        created_at: { _gte: $cutoffTime },
                        id: { _nin: $keepIds }
                    }
                ) {
                    affected_rows
                }
            }`;

            const deleteData = await graphqlClient.request<{
                delete_geolocation_user_location: { affected_rows: number };
            }>(deleteOldRecordsQuery, {
                cutoffTime,
                keepIds
            });

            return {
                success: true,
                deletedCount: deleteData.delete_geolocation_user_location.affected_rows,
                suspiciousLocationsFound: suspiciousLocationIds.size
            };
        } catch (error) {
            console.error('Error cleaning up location history:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    static startCleanupSchedule(intervalMS = 60000) {
        setInterval(async () => {
            await this.cleanupLocationHistory();
        }, intervalMS);
    }
}