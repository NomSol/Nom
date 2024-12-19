import { graphqlClient } from '@/lib/graphql-client';

export class LocationCleanupService {
    private static readonly RETENTION_HOURS = 2;
    private static readonly MIN_RECORDS_PER_HOUR = 1;
    private static readonly MAX_SPEED_KMH = 3000; // Maximum speed in km/h

    // Helper function to calculate distance between two points using Haversine formula
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
        return R * c; // Distance in km
    }

    private static toRad(degrees: number): number {
        return degrees * (Math.PI / 180);
    }

    // Validate location movement speed
    private static async validateLocationSpeed(userId: string, latitude: number, longitude: number, timestamp: string): Promise<boolean> {
        try {
            // Get user's last location
            const lastLocationQuery = `
                query GetLastLocation($userId: uuid!) {
                    geolocation_user_location(
                        where: { user_id: { _eq: $userId } }
                        order_by: { created_at: desc }
                        limit: 1
                    ) {
                        latitude
                        longitude
                        created_at
                    }
                }
            `;

            const lastLocationData = await graphqlClient.request<{
                geolocation_user_location: Array<{
                    latitude: number;
                    longitude: number;
                    created_at: string;
                }>;
            }>(lastLocationQuery, { userId });

            if (lastLocationData.geolocation_user_location.length === 0) {
                return true; // First location is always valid
            }

            const lastLocation = lastLocationData.geolocation_user_location[0];
            const timeDiffHours = (new Date(timestamp).getTime() - new Date(lastLocation.created_at).getTime()) / (1000 * 60 * 60);

            // Calculate distance in kilometers
            const distance = this.calculateDistance(
                lastLocation.latitude,
                lastLocation.longitude,
                latitude,
                longitude
            );

            // Calculate speed in km/h
            const speed = distance / timeDiffHours;

            if (speed > this.MAX_SPEED_KMH) {
                console.warn(
                    `Suspicious location detected for user ${userId}:`,
                    `\nSpeed: ${speed.toFixed(2)} km/h`,
                    `\nDistance: ${distance.toFixed(2)} km`,
                    `\nTime difference: ${(timeDiffHours * 60).toFixed(2)} minutes`
                );
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error validating location speed:', error);
            return true; // Allow location in case of validation error
        }
    }

    static async cleanupLocationHistory() {
        const twoHoursAgo = new Date();
        twoHoursAgo.setHours(twoHoursAgo.getHours() - this.RETENTION_HOURS);

        const oneHourAgo = new Date();
        oneHourAgo.setHours(oneHourAgo.getHours() - 1);

        try {
            // First identify records to keep (last record per hour per user)
            const keepRecordsQuery = `
            query GetRecordsToKeep($startTime: timestamptz!, $endTime: timestamptz!) {
            geolocation_user_location(
                where: {
                created_at: { _gte: $startTime, _lt: $endTime }
                },
                distinct_on: [user_id, hour],
                order_by: [
                { user_id: asc },
                { hour: asc }, 
                { created_at: desc }
                ]
            ) {
                id
                hour: created_at
            }
            }
        `;

            // Then delete old records except those we want to keep
            const deleteOldRecordsQuery = `
            mutation DeleteOldRecords($startTime: timestamptz!, $endTime: timestamptz!, $keepIds: [uuid!]!) {
            delete_geolocation_user_location(
                where: {
                created_at: { _gte: $startTime, _lt: $endTime },
                id: { _nin: $keepIds }
                }
            ) {
                affected_rows
            }
            }
        `;
            // Get records to keep
            const keepData = await graphqlClient.request<{
                geolocation_user_location: { id: string; hour: string }[];
            }>(keepRecordsQuery, {
                startTime: twoHoursAgo.toISOString(),
                endTime: oneHourAgo.toISOString()
            });

            const keepIds = keepData.geolocation_user_location.map(
                (record) => record.id
            );
            // Delete old records except those we want to keep
            const deleteData = await graphqlClient.request<{
                delete_geolocation_user_location: { affected_rows: number };
            }>(deleteOldRecordsQuery, {
                startTime: twoHoursAgo.toISOString(),
                endTime: oneHourAgo.toISOString(),
                keepIds
            });

            console.log(`Cleaned up ${deleteData.delete_geolocation_user_location.affected_rows} location records`);

            return {
                success: true,
                deletedCount: deleteData.delete_geolocation_user_location.affected_rows
            };
        } catch (error) {
            console.error('Error cleaning up location history:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    // Add method to validate and save location
    static async validateAndSaveLocation(userId: string, latitude: number, longitude: number): Promise<boolean> {
        const timestamp = new Date().toISOString();
        const isValid = await this.validateLocationSpeed(userId, latitude, longitude, timestamp);

        if (!isValid) {
            console.warn('Location validation failed - possible GPS spoofing detected');
            return false;
        }

        return true;
    }

    static startCleanupSchedule(intervalMinutes = 5) {
        setInterval(async () => {
            await this.cleanupLocationHistory();
        }, intervalMinutes * 60 * 1000);
    }
}