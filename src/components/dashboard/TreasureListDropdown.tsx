"use client";
import React, { useState, useContext, useEffect } from "react";
import { Plus, ChevronRight, ChevronDown } from "lucide-react";
import { MapContext } from "@/components/dashboard/MapContext";

import { TreasureCreationForm } from "./TreansureCreationForm";
import { useTreasures } from "@/hooks/use-treasure";
import { Treasure } from "@/types/treasure";

function normalizeLongitude(longitude: number): number {
  return ((longitude + 180) % 360) - 180;
}

function normalizeLatitude(latitude: number): number {
  while (latitude > 90 || latitude < -90) {
    if (latitude > 90) latitude = 180 - latitude;
    if (latitude < -90) latitude = -180 - latitude;
  }
  return latitude;
}

export function TreasureListDropdown() {
  const map = useContext(MapContext);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [selectedTreasure, setSelectedTreasure] = useState<string | null>(null);
  const { treasures, isLoading, error } = useTreasures();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handlePlusClick = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const normalizedLat = normalizeLatitude(lat);
        const normalizedLng = normalizeLongitude(lng);
        if (map) {
          map.flyTo({ center: [normalizedLng, normalizedLat], zoom: 15 });
        }
        setLatitude(normalizedLat.toString());
        setLongitude(normalizedLng.toString());
        setIsCreating(true);
      },
      (err) => {
        console.error("Error getting location:", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const handleCancel = () => {
    setIsCreating(false);
  };

  const handleMarkerDragEnd = (lat: number, lng: number) => {
    const normalizedLat = normalizeLatitude(lat);
    const normalizedLng = normalizeLongitude(lng);
    setLatitude(normalizedLat.toString());
    setLongitude(normalizedLng.toString());
  };

  const handleTreasureClick = (treasure: Treasure) => {
    if (!map) return;

    const normalizedLat = normalizeLatitude(treasure.latitude);
    const normalizedLng = normalizeLongitude(treasure.longitude);

    // Fly to the treasure location
    map.flyTo({
      center: [normalizedLng, normalizedLat],
      zoom: 15,
      duration: 1500, // Smooth transition time, in milliseconds
    });

    // Set selected treasure to trigger highlight effect
    setSelectedTreasure(treasure.id);

    // Cancel highlighting after 3 seconds
    setTimeout(() => {
      setSelectedTreasure(null);
    }, 3000);
  };

  useEffect(() => {
    if (!map || !isCreating) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    const normalizedLat = normalizeLatitude(lat);
    const normalizedLng = normalizeLongitude(lng);

    const point = [normalizedLng, normalizedLat] as [number, number];
    const bounds = map?.getBounds();
    if (bounds && !bounds.contains(point)) {
      map.flyTo({ center: point, zoom: 15 });
    }
  }, [latitude, longitude, isCreating, map]);

  return (
    <div className="mt-2">
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
        onClick={toggleCollapse}
      >
        <h2 className="text-sm font-medium">Created</h2>
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </div>

      {!isCollapsed && (
        <div className="px-4">
          {!isCreating && (
            <div>
              <div className="flex justify-between items-center mb-2">
                {isLoading ? (
                  <span className="text-xs text-muted-foreground">
                    Loading...
                  </span>
                ) : error ? (
                  <span className="text-xs text-red-500">
                    Error loading treasures
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Below are all the treasures:
                  </span>
                )}

                <button
                  className="p-1 border rounded hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlusClick();
                  }}
                  title="Create a new treasure"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add a custom scroll bar style container*/}
              <div className="max-h-64 overflow-y-auto border rounded scrollbar-container">
                <ul className="text-sm space-y-2 p-2">
                  {treasures &&
                    treasures.map((t) => (
                      <li
                        key={t.id}
                        className={`flex flex-col border rounded p-2 cursor-pointer transition-all duration-300 ${
                          selectedTreasure === t.id
                            ? "bg-blue-100 border-blue-500"
                            : "hover:bg-gray-50"
                        }`}
                        onClick={() => handleTreasureClick(t)}
                      >
                        <span className="font-medium">{t.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Lat: {t.latitude}, Lng: {t.longitude}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}

          {isCreating && (
            <TreasureCreationForm
              map={map}
              latitude={latitude}
              longitude={longitude}
              setLatitude={setLatitude}
              setLongitude={setLongitude}
              onCancel={handleCancel}
              onMarkerDragEnd={handleMarkerDragEnd}
            />
          )}
        </div>
      )}

      {/* add global style */}
      <style jsx global>{`
        .scrollbar-container {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #edf2f7;
        }

        .scrollbar-container::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-container::-webkit-scrollbar-track {
          background: #edf2f7;
          border-radius: 3px;
        }

        .scrollbar-container::-webkit-scrollbar-thumb {
          background-color: #cbd5e0;
          border-radius: 3px;
        }

        .scrollbar-container::-webkit-scrollbar-thumb:hover {
          background-color: #a0aec0;
        }
      `}</style>
    </div>
  );
}
