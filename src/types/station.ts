// types/station.ts
export interface RecyclingStation {
    id: string;
    name: string;
    description: string;
    capacity: number;
    level: number;
    latitude: number;
    longitude: number;
    status: string; // "ACTIVE", "INACTIVE", "UNDER_MAINTENANCE"
    image_url?: string;
    created_at: string;
    updated_at?: string;
    owner_id?: string | null;
    current_usage: number;
    earnings: number;
    is_official: boolean;
    special_features?: string[];
}

export interface CreateStationInput {
    name: string;
    description: string;
    capacity: number;
    level: number;
    latitude: number;
    longitude: number;
    status?: string;
    image_url?: string;
    is_official?: boolean;
    special_features?: string[];
}

export interface RecycleCoinsInput {
    station_id: string;
    coin_name: string;
    coin_symbol: string;
    coin_contract: string;
    amount: number;
    usdt_value: number;
}

export interface UpgradeStationInput {
    id: string;
    level: number;
} 