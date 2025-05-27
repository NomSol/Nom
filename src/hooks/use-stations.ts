import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RecyclingStation, CreateStationInput, UpgradeStationInput } from '@/types/station';
import { useWallet } from '@/context/WalletContext';
import { useUserProfile } from './use-user';
import { collection, getDocs, getDoc, doc, setDoc, updateDoc, query, where } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/firebase';

export function useStations() {
    const { walletAddress } = useWallet();
    const { profile } = useUserProfile({ enabled: !!walletAddress });
    const queryClient = useQueryClient();

    // Query to get all stations
    const { data: allStations, isLoading: isLoadingAllStations } = useQuery({
        queryKey: ['stations'],
        queryFn: async () => {
            try {
                const stationsRef = collection(db, 'recycling_stations');
                const snapshot = await getDocs(stationsRef);

                const stations: RecyclingStation[] = [];
                snapshot.forEach((doc) => {
                    stations.push({ id: doc.id, ...doc.data() } as RecyclingStation);
                });

                return stations;
            } catch (error) {
                console.error('Error fetching stations:', error);
                throw error;
            }
        },
        staleTime: 60000 // 1 minute
    });

    // Query to get user's stations
    const { data: userStations, isLoading: isLoadingUserStations } = useQuery({
        queryKey: ['userStations', profile?.id],
        queryFn: async () => {
            if (!profile?.id) {
                return [];
            }

            try {
                const stationsRef = collection(db, 'recycling_stations');
                const q = query(stationsRef, where('owner_id', '==', profile.id));
                const snapshot = await getDocs(q);

                const stations: RecyclingStation[] = [];
                snapshot.forEach((doc) => {
                    stations.push({ id: doc.id, ...doc.data() } as RecyclingStation);
                });

                return stations;
            } catch (error) {
                console.error('Error fetching user stations:', error);
                throw error;
            }
        },
        enabled: !!profile?.id,
        staleTime: 60000 // 1 minute
    });

    // Create station mutation
    const createStation = useMutation({
        mutationFn: async (input: CreateStationInput) => {
            if (!profile?.id) {
                throw new Error('User not authenticated');
            }

            const stationId = uuidv4();
            const timestamp = new Date().toISOString();

            const newStation: Omit<RecyclingStation, 'id'> = {
                ...input,
                owner_id: profile.id,
                created_at: timestamp,
                updated_at: timestamp,
                current_usage: 0,
                earnings: 0,
                is_official: input.is_official || false,
                status: input.status || 'ACTIVE',
                special_features: input.special_features || []
            };

            const stationRef = doc(db, 'recycling_stations', stationId);
            await setDoc(stationRef, newStation);

            // Update user stats
            const userRef = doc(db, 'users', profile.id);
            const userDoc = await getDoc(userRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const currentStationsOwned = userData.stats?.stations_owned || 0;

                await updateDoc(userRef, {
                    'stats.stations_owned': currentStationsOwned + 1,
                    'stats.favorite_station_id': userData.stats?.favorite_station_id || stationId
                });
            }

            return { id: stationId, ...newStation } as RecyclingStation;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stations'] });
            queryClient.invalidateQueries({ queryKey: ['userStations'] });
        }
    });

    // Update station mutation
    const updateStation = useMutation({
        mutationFn: async ({ id, ...updates }: Partial<RecyclingStation> & { id: string }) => {
            const stationRef = doc(db, 'recycling_stations', id);
            const stationDoc = await getDoc(stationRef);

            if (!stationDoc.exists()) {
                throw new Error('Station not found');
            }

            const stationData = stationDoc.data() as Omit<RecyclingStation, 'id'>;

            // Check ownership
            if (stationData.owner_id !== profile?.id && !stationData.is_official) {
                throw new Error('Not authorized to update this station');
            }

            const updatedStation = {
                ...updates,
                updated_at: new Date().toISOString()
            };

            await updateDoc(stationRef, updatedStation);
            return { id, ...stationData, ...updatedStation } as RecyclingStation;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stations'] });
            queryClient.invalidateQueries({ queryKey: ['userStations'] });
        }
    });

    // Upgrade station mutation
    const upgradeStation = useMutation({
        mutationFn: async ({ id, level }: UpgradeStationInput) => {
            const stationRef = doc(db, 'recycling_stations', id);
            const stationDoc = await getDoc(stationRef);

            if (!stationDoc.exists()) {
                throw new Error('Station not found');
            }

            const stationData = stationDoc.data() as Omit<RecyclingStation, 'id'>;

            // Check ownership
            if (stationData.owner_id !== profile?.id) {
                throw new Error('Not authorized to upgrade this station');
            }

            // Calculate new capacity based on level
            const baseCapacity = 20;
            const newCapacity = baseCapacity + (level * 15);

            const upgradedStation = {
                level,
                capacity: newCapacity,
                updated_at: new Date().toISOString()
            };

            await updateDoc(stationRef, upgradedStation);
            return {
                id,
                ...stationData,
                ...upgradedStation
            } as RecyclingStation;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['stations'] });
            queryClient.invalidateQueries({ queryKey: ['userStations'] });
        }
    });

    return {
        stations: allStations || [],
        userStations: userStations || [],
        isLoading: isLoadingAllStations || isLoadingUserStations,
        createStation,
        updateStation,
        upgradeStation
    };
} 