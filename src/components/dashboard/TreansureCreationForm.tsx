"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { DraggableTreasureMarker } from "./DraggableTreasureMarker";

interface TreasureCreationFormProps {
  map: any;
  latitude: string;
  longitude: string;
  setLatitude: (val: string) => void;
  setLongitude: (val: string) => void;
  onCancel: () => void;
  onMarkerDragEnd: (lat: number, lng: number) => void;
}

export function TreasureCreationForm({
  map,
  latitude,
  longitude,
  setLatitude,
  setLongitude,
  onCancel,
  onMarkerDragEnd,
}: TreasureCreationFormProps) {
  const router = useRouter();

  const handleCreate = () => {
    // 跳转到 create 页面并附带坐标参数
    router.push(
      `/main/treasures/create?lat=${encodeURIComponent(
        latitude
      )}&lng=${encodeURIComponent(longitude)}`
    );
  };

  return (
    <div className="flex flex-col gap-2 mt-2">
      {map && (
        <DraggableTreasureMarker
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
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Create
        </button>
      </div>
    </div>
  );
}
