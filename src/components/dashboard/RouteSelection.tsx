// export default RouteSelection;

import React from "react";
import { Button } from "@/components/ui/button";
import { Treasure } from "@/types/treasure";
import { RecyclingStation } from "@/types/station";
import { Bike, Car, Clock, MapPin, Navigation, X } from "lucide-react";
import { NavigationMode } from "./StationMarkers"; // Using the same NavigationMode type

interface RouteOption {
  mode: NavigationMode;
  distance: number;
  duration: number;
  route: any;
}

interface RouteSelectionProps {
  treasure?: Treasure;
  station?: RecyclingStation;
  onClose: () => void;
  onStartNavigation: (mode: NavigationMode) => void;
  onPreviewRoute: (mode: NavigationMode) => void;
  navigationMode: NavigationMode;
  routes: Record<NavigationMode, RouteOption | null>;
  loading: boolean;
  routeError: string | null;
}

export const RouteSelection: React.FC<RouteSelectionProps> = ({
  treasure,
  station,
  onClose,
  onStartNavigation,
  onPreviewRoute,
  navigationMode,
  routes,
  loading,
  routeError,
}) => {
  // Determine what we're navigating to
  const destination = treasure || station;
  const destinationType = treasure ? "treasure" : "station";

  if (!destination) {
    return null;
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes} min`;
    }
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    } else {
      return `${Math.round(meters)} m`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl animate-fade-in-up relative max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <div className="p-6">
          <h2 className="text-xl font-bold text-center mb-6 flex items-center justify-center">
            <Navigation className="mr-2 h-5 w-5 text-blue-500" />
            Navigate to {destinationType === "treasure" ? "Treasure" : "Recycling Station"}
          </h2>

          <div className="mb-4 flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">
              {destination.name || `${destinationType === "treasure" ? "Treasure" : "Recycling Station"} ${destination.id.substring(0, 6)}`}
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Calculating routes...</p>
            </div>
          ) : routeError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600">{routeError}</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {/* Walking option */}
              {routes.walking && (
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${navigationMode === "walking"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                    }`}
                  onClick={() => onPreviewRoute("walking")}
                >
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-full mr-3 ${navigationMode === "walking"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M13 4v16"></path>
                        <path d="M17 4v16"></path>
                        <path d="M21 4v16"></path>
                        <path d="M9 4v16"></path>
                        <path d="M5 4v16"></path>
                        <path d="M1 4v16"></path>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Walking</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span className="mr-3">
                          {formatDuration(routes.walking.duration)}
                        </span>
                        <span>{formatDistance(routes.walking.distance)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cycling option */}
              {routes.cycling && (
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${navigationMode === "cycling"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                    }`}
                  onClick={() => onPreviewRoute("cycling")}
                >
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-full mr-3 ${navigationMode === "cycling"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      <Bike className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Cycling</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span className="mr-3">
                          {formatDuration(routes.cycling.duration)}
                        </span>
                        <span>{formatDistance(routes.cycling.distance)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Driving option */}
              {routes.driving && (
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${navigationMode === "driving"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                    }`}
                  onClick={() => onPreviewRoute("driving")}
                >
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-full mr-3 ${navigationMode === "driving"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                        }`}
                    >
                      <Car className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">Driving</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        <span className="mr-3">
                          {formatDuration(routes.driving.duration)}
                        </span>
                        <span>{formatDistance(routes.driving.distance)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="outline"
              className="mr-2"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              disabled={loading || !!routeError}
              onClick={() => onStartNavigation(navigationMode)}
            >
              Start Navigation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteSelection;
