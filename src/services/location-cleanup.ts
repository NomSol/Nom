import { graphqlClient } from '@/lib/graphql-client';

export class LocationCleanupService {
    private static readonly RETENTION_HOURS = 2;
    private static readonly MIN_RECORDS_PER_HOUR = 1;

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

    // Utility method to create a cron schedule
    static startCleanupSchedule(intervalMinutes = 5) {
        setInterval(async () => {
            await this.cleanupLocationHistory();
        }, intervalMinutes * 60 * 1000);
    }
}