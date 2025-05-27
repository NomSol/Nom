import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useClient } from '@/lib/client';
import { gql } from 'graphql-request';

// GraphQL query to get station interactions
const GET_STATION_ACTIVITY = gql`
  query GetStationActivity($station_id: uuid!) {
    user_station_interactions(
      where: { station_id: { _eq: $station_id } }
      order_by: { created_at: desc }
      limit: 20
    ) {
      id
      user_id
      station_id
      interaction_type
      coins_recycled
      points_earned
      tokens_earned
      created_at
      user {
        nickname
      }
    }
  }
`;

// Mock data for development
const mockActivities = [
    {
        id: '1',
        user_id: 'user1',
        station_id: 'station1',
        interaction_type: 'RECYCLE',
        coins_recycled: 3,
        points_earned: 50,
        tokens_earned: 10,
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        user: { nickname: 'CryptoWhale' }
    },
    {
        id: '2',
        user_id: 'user2',
        station_id: 'station1',
        interaction_type: 'VISIT',
        coins_recycled: 0,
        points_earned: 5,
        tokens_earned: 0,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        user: { nickname: 'TokenHunter' }
    },
    {
        id: '3',
        user_id: 'user3',
        station_id: 'station1',
        interaction_type: 'UPGRADE',
        coins_recycled: 0,
        points_earned: 0,
        tokens_earned: 0,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        user: { nickname: 'StationOwner' }
    },
    {
        id: '4',
        user_id: 'user4',
        station_id: 'station1',
        interaction_type: 'RECYCLE',
        coins_recycled: 5,
        points_earned: 80,
        tokens_earned: 16,
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
        user: { nickname: 'MemeCollector' }
    }
];

export function useStationActivity(stationId: string) {
    const client = useClient();

    // In a real app, this would use the GraphQL query
    // For now, let's use mock data
    const { data, isLoading, error } = useQuery({
        queryKey: ['stationActivity', stationId],
        queryFn: async () => {
            try {
                if (process.env.NODE_ENV === 'development') {
                    // Simulate API delay
                    await new Promise(resolve => setTimeout(resolve, 500));
                    // Filter mock data for the specified station
                    return {
                        user_station_interactions: mockActivities.filter(
                            activity => activity.station_id === stationId
                        )
                    };
                } else {
                    // Real API call for production
                    return client.request(GET_STATION_ACTIVITY, { station_id: stationId });
                }
            } catch (error) {
                console.error('Error fetching station activity:', error);
                throw error;
            }
        },
        staleTime: 60000 // 1 minute
    });

    // Transform the data to a more convenient format
    const activity = data?.user_station_interactions.map(item => ({
        id: item.id,
        userId: item.user_id,
        stationId: item.station_id,
        type: item.interaction_type,
        coinsRecycled: item.coins_recycled,
        pointsEarned: item.points_earned,
        tokensEarned: item.tokens_earned,
        createdAt: item.created_at,
        userNickname: item.user?.nickname || 'Unknown User'
    })) || [];

    return {
        activity,
        loading: isLoading,
        error
    };
} 