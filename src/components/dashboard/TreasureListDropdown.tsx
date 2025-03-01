"use client";
import React, { useState, useContext, useEffect } from "react";
import {
  Plus,
  ChevronRight,
  ChevronDown,
  MapPin,
  Search,
  Eye,
  Heart,
  Check,
} from "lucide-react";
import { MapContext } from "@/components/dashboard/MapContext";
import { useRouter } from "next/navigation"; // 导入 useRouter

import { TreasureCreationForm } from "./TreansureCreationForm";
import { useTreasures } from "@/hooks/use-treasure";
import { Treasure } from "@/types/treasure";
import { useSidebar } from "./sidebar";
import { useUserProfile } from "@/hooks/use-user";
import { useSession } from "next-auth/react";

// Add type for map object
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
  const router = useRouter(); // 初始化 router
  const map = useContext(MapContext) as MapType | null;
  const { open, openMobile, isMobile } = useSidebar();
  const isSidebarOpen = isMobile ? openMobile : open;
  const { data: session } = useSession();
  const { profile } = useUserProfile({ enabled: !!session?.user?.email });

  // Treasure hooks
  const {
    userPlacements,
    userFindings,
    isLoading: treasuresLoading,
    error: treasuresError,
  } = useTreasures();

  // Placements state
  const [isPlacementsCollapsed, setIsPlacementsCollapsed] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [selectedTreasure, setSelectedTreasure] = useState<string | null>(null);

  // Findings state
  const [isFindingsCollapsed, setIsFindingsCollapsed] = useState(true);

  // Auto-collapse when sidebar is closed
  useEffect(() => {
    if (!isSidebarOpen) {
      setIsPlacementsCollapsed(true);
      setIsFindingsCollapsed(true);
    }
  }, [isSidebarOpen]);

  const togglePlacementsCollapse = () => {
    setIsPlacementsCollapsed(!isPlacementsCollapsed);
    if (isFindingsCollapsed === false) {
      setIsFindingsCollapsed(true); // Close the other section when opening this one
    }
  };

  const toggleFindingsCollapse = () => {
    setIsFindingsCollapsed(!isFindingsCollapsed);
    if (isPlacementsCollapsed === false) {
      setIsPlacementsCollapsed(true); // Close the other section when opening this one
    }
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
        setIsFindingsCollapsed(true); // Close the other section
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

  const handleVerifyFinding = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 导航到宝藏页面
    router.push("/main/treasures");
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

  // Function to render a compact treasure card
  const renderCompactTreasureCard = (
    treasure: Treasure,
    type: "placement" | "finding"
  ) => {
    const categoryTag = treasure.status || "ACTIVE";
    const userName = session?.user?.name || "王子玉";
    const viewCount = Math.floor(Math.random() * 1000) + 100; // Mock data

    return (
      <div
        key={treasure.id}
        className={`bg-white rounded-xl shadow-sm mb-2 cursor-pointer overflow-hidden border 
          ${
            selectedTreasure === treasure.id
              ? "border-blue-400"
              : "border-gray-100"
          }`}
        onClick={() => handleTreasureClick(treasure)}
      >
        {/* Header */}
        <div className="p-2 text-center border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-medium">Placed by: {userName}</p>
          <p className="text-xs text-gray-500">
            on {new Date(treasure.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Image */}
        <div className="p-2 flex justify-center">
          {treasure.image_url ? (
            <img
              src={treasure.image_url}
              alt={treasure.name}
              className="h-24 w-full object-cover"
            />
          ) : (
            <div className="h-24 w-full bg-gray-100 flex items-center justify-center">
              <span className="text-xs text-gray-400">{treasure.name}</span>
            </div>
          )}
        </div>

        {/* ID and Tag */}
        <div className="px-2 pt-1 pb-2 text-center">
          <p className="text-xs font-medium text-gray-700">
            #{treasure.id.substring(0, 5)} | {categoryTag}
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between px-3 py-1 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            <Eye className="w-4 h-4 text-gray-500" />
            <span className="text-xs">{viewCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart className="w-4 h-4 text-gray-500" />
            <span className="text-xs">{treasure.likes_count}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-3 border-t border-gray-100 text-center text-xs font-medium">
          <button className="py-1.5 hover:bg-gray-100">Review</button>
          <button className="py-1.5 border-l border-r border-gray-100 hover:bg-gray-100">
            Logs
          </button>
          {type === "placement" && (
            <button className="py-1.5 text-gray-700 hover:bg-blue-50">
              BUY
            </button>
          )}
          {type === "finding" && (
            <button className="py-1.5 text-gray-700 hover:bg-green-50">
              View
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* My Placements Section */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm mb-2">
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
            className="p-1.5 bg-gray-100 border border-gray-200 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0 mr-1"
            onClick={handlePlusClick}
            title="Create a new treasure"
          >
            <Plus className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        {/* Collapsible content for Placements with improved positioning */}
        {!isPlacementsCollapsed && (
          <div className="border-t border-gray-100">
            {!isCreating ? (
              <div className="p-2">
                {treasuresLoading ? (
                  <div className="py-2 text-center text-xs text-gray-500">
                    Loading...
                  </div>
                ) : treasuresError ? (
                  <div className="py-2 text-center text-xs text-red-500">
                    Error loading treasures
                  </div>
                ) : userPlacements && userPlacements.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto custom-scrollbar pr-1">
                    {userPlacements
                      .slice(0, 3)
                      .map((treasure) =>
                        renderCompactTreasureCard(treasure, "placement")
                      )}
                    {userPlacements.length > 3 && (
                      <div className="text-center mt-2">
                        <a
                          href="/treasures/my-placements"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View all ({userPlacements.length})
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-2 text-center text-xs text-gray-500">
                    No treasures created yet
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 max-h-60 overflow-y-auto custom-scrollbar">
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
        <div className="flex items-center justify-between pr-2">
          <div
            className="flex-1 flex items-center justify-between py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
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
          <button
            className="p-1.5 bg-gray-100 border border-gray-200 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0 mr-1"
            onClick={handleVerifyFinding}
            title="Verify a new finding"
          >
            <Check className="w-4 h-4 text-green-600" />
          </button>
        </div>

        {/* Collapsible content for Findings */}
        {!isFindingsCollapsed && (
          <div className="border-t border-gray-100">
            <div className="p-2">
              {treasuresLoading ? (
                <div className="py-2 text-center text-xs text-gray-500">
                  Loading...
                </div>
              ) : treasuresError ? (
                <div className="py-2 text-center text-xs text-red-500">
                  Error loading findings
                </div>
              ) : userFindings && userFindings.length > 0 ? (
                <div className="max-h-60 overflow-y-auto custom-scrollbar pr-1">
                  {userFindings
                    .slice(0, 3)
                    .map((treasure) =>
                      renderCompactTreasureCard(treasure, "finding")
                    )}
                  {userFindings.length > 3 && (
                    <div className="text-center mt-2">
                      <a
                        href="/treasures/my-findings"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View all ({userFindings.length})
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-2 text-center text-xs text-gray-500">
                  No findings yet. Explore more!
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Custom scrollbar style with scoped class */}
      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #edf2f7;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #edf2f7;
          border-radius: 2px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e0;
          border-radius: 2px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #a0aec0;
        }
      `}</style>
    </div>
  );
}
