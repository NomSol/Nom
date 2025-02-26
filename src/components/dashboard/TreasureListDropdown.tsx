"use client";
import React, { useState, useContext, useEffect } from "react";
import { Plus, ChevronRight, ChevronDown, MapPin, Search } from "lucide-react";
import { MapContext } from "@/components/dashboard/MapContext";

import { TreasureCreationForm } from "./TreansureCreationForm";
import { useTreasures } from "@/hooks/use-treasure";
import { Treasure } from "@/types/treasure";
import { useSidebar } from "./sidebar";

// Add type for map object - this may need to be adjusted to match your actual Map type
type MapType = {
  flyTo: (options: {
    center: [number, number];
    zoom?: number;
    duration?: number;
  }) => void;
  getBounds: () => {
    contains: (point: [number, number]) => boolean;
  };
};

// Mock data for findings - replace with actual data fetching
const mockFindings = [
  { id: "1", name: "Historic Landmark", foundDate: "2024-02-10", points: 150 },
  { id: "2", name: "Hidden Statue", foundDate: "2024-02-15", points: 200 },
  { id: "3", name: "Secret Garden", foundDate: "2024-02-18", points: 180 },
];

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
  const map = useContext(MapContext) as MapType | null;
  const { open, openMobile, isMobile } = useSidebar();
  const isSidebarOpen = isMobile ? openMobile : open;

  // Placements state
  const [isPlacementsCollapsed, setIsPlacementsCollapsed] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [selectedTreasure, setSelectedTreasure] = useState<string | null>(null);
  const { treasures, isLoading, error } = useTreasures();

  // Findings state
  const [isFindingsCollapsed, setIsFindingsCollapsed] = useState(true);
  const [findings, setFindings] = useState(mockFindings);

  // Auto-collapse when sidebar is closed
  useEffect(() => {
    if (!isSidebarOpen) {
      setIsPlacementsCollapsed(true);
      setIsFindingsCollapsed(true);
    }
  }, [isSidebarOpen]);

  const togglePlacementsCollapse = () => {
    setIsPlacementsCollapsed(!isPlacementsCollapsed);
  };

  const toggleFindingsCollapse = () => {
    setIsFindingsCollapsed(!isFindingsCollapsed);
  };

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();

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
        setIsPlacementsCollapsed(false); // Make sure dropdown is open when creating
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

    const point: [number, number] = [normalizedLng, normalizedLat];
    const bounds = map?.getBounds();
    if (bounds && !bounds.contains(point)) {
      map.flyTo({ center: point, zoom: 15 });
    }
  }, [latitude, longitude, isCreating, map]);

  return (
    <div className="space-y-2">
      {/* My Placements Section */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div className="flex items-center justify-between pr-2">
          <div
            className="flex-1 flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={togglePlacementsCollapse}
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-600" />
              <h2 className="text-sm font-medium text-gray-700">
                My Placements
              </h2>
            </div>
            {isPlacementsCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
          <button
            className="p-1.5 bg-gray-100 border border-gray-200 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
            onClick={handlePlusClick}
            title="Create a new treasure"
          >
            <Plus className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Collapsible content for Placements */}
        {!isPlacementsCollapsed && (
          <div className="border-t border-gray-100">
            {!isCreating ? (
              <div className="bg-white p-3">
                <div className="mb-3">
                  {isLoading ? (
                    <span className="text-xs text-gray-500">Loading...</span>
                  ) : error ? (
                    <span className="text-xs text-red-500">
                      Error loading treasures
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">
                      Your placed treasures:
                    </span>
                  )}
                </div>

                {/* Treasure list with custom scrollbar */}
                <div className="max-h-64 overflow-y-auto border rounded-lg scrollbar-container">
                  <ul className="text-sm space-y-2 p-2">
                    {treasures && treasures.length > 0 ? (
                      treasures.map((t) => (
                        <li
                          key={t.id}
                          className={`flex flex-col border rounded-lg p-3 cursor-pointer transition-all duration-300 ${
                            selectedTreasure === t.id
                              ? "bg-blue-50 border-blue-300"
                              : "hover:bg-gray-50 border-gray-200"
                          }`}
                          onClick={() => handleTreasureClick(t)}
                        >
                          <span className="font-medium text-gray-800">
                            {t.name}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            Lat: {t.latitude}, Lng: {t.longitude}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-center py-3 text-gray-500">
                        No treasures found
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="bg-white p-3">
                <TreasureCreationForm
                  map={map}
                  latitude={latitude}
                  longitude={longitude}
                  setLatitude={setLatitude}
                  setLongitude={setLongitude}
                  onCancel={handleCancel}
                  onMarkerDragEnd={handleMarkerDragEnd}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* My Findings Section */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <div
          className="flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={toggleFindingsCollapse}
        >
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-600" />
            <h2 className="text-sm font-medium text-gray-700">My Findings</h2>
          </div>
          {isFindingsCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>

        {/* Collapsible content for Findings */}
        {!isFindingsCollapsed && (
          <div className="border-t border-gray-100">
            <div className="bg-white p-3">
              <div className="mb-3">
                <span className="text-xs text-gray-500">
                  Treasures you've discovered:
                </span>
              </div>

              {/* Findings list with custom scrollbar */}
              <div className="max-h-64 overflow-y-auto border rounded-lg scrollbar-container">
                <ul className="text-sm space-y-2 p-2">
                  {findings && findings.length > 0 ? (
                    findings.map((f) => (
                      <li
                        key={f.id}
                        className="flex flex-col border rounded-lg p-3 hover:bg-gray-50 border-gray-200 cursor-pointer transition-all duration-300"
                      >
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-800">
                            {f.name}
                          </span>
                          <span className="text-green-600 font-medium">
                            +{f.points} pts
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">
                          Found on: {new Date(f.foundDate).toLocaleDateString()}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="text-center py-3 text-gray-500">
                      No findings yet. Explore more!
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom scrollbar styles */}
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
