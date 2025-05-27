"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { DraggableStationMarkerSvg } from "./DraggableStationMarker";

interface StationCreationFormProps {
    map: any;
    latitude: string;
    longitude: string;
    setLatitude: (val: string) => void;
    setLongitude: (val: string) => void;
    onCancel: () => void;
    onMarkerDragEnd: (lat: number, lng: number) => void;
}

export function StationCreationForm({
    map,
    latitude,
    longitude,
    setLatitude,
    setLongitude,
    onCancel,
    onMarkerDragEnd,
}: StationCreationFormProps) {
    const router = useRouter();

    const handleCreate = () => {
        // Navigate to the creation page with coordinates
        router.push(
            `/main/stations/create?lat=${encodeURIComponent(
                latitude
            )}&lng=${encodeURIComponent(longitude)}`
        );
    };

    return (
        <div className="flex flex-col gap-2 mt-2">
            {map && (
                <DraggableStationMarkerSvg
                    map={map}
                    latString={latitude}
                    lngString={longitude}
                    onDragEnd={onMarkerDragEnd}
                />
            )}

            <label className="text-sm font-medium">Latitude:</label>
            <input
                type="text"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />

            <label className="text-sm font-medium">Longitude:</label>
            <input
                type="text"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
            />

            <div className="flex justify-end gap-2 mt-4">
                <button
                    onClick={onCancel}
                    className="px-3 py-1 bg-gray-300 text-black rounded hover:bg-gray-400 text-sm"
                >
                    Cancel
                </button>
                <button
                    onClick={handleCreate}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
                >
                    Create Station
                </button>
            </div>
        </div>
    );
} 