// export default RouteSelection;

import React from "react";
import { NavigationMode } from "./TreasureMarkers";

interface RouteOption {
  mode: NavigationMode;
  distance: number;
  duration: number;
  route: {
    geometry: {
      coordinates: [number, number][];
      type: string;
    };
    legs: Array<{
      steps: Array<{
        maneuver: {
          instruction: string;
          type: string;
        };
        distance: number;
        duration: number;
      }>;
    }>;
    distance: number;
    duration: number;
  };
}

interface RouteSelectionProps {
  treasure: any;
  onClose: () => void;
  onStartNavigation: (mode: NavigationMode) => void;
  onPreviewRoute: (mode: NavigationMode) => void;
  navigationMode: NavigationMode;
  routes: Record<NavigationMode, RouteOption | null>;
  loading: boolean;
  routeError?: string | null;
}

export const RouteSelection: React.FC<RouteSelectionProps> = ({
  onClose,
  onStartNavigation,
  onPreviewRoute,
  navigationMode,
  routes,
  loading,
  routeError,
}) => {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
  };

  return (
    <div className="absolute top-4 left-4 w-80 bg-white rounded-lg shadow-lg z-50">
      <div className="p-3">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Choose Your Route</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        ) : routeError ? (
          <div className="text-red-500 text-center py-4">{routeError}</div>
        ) : (
          <div className="space-y-1">
            {Object.entries(routes)
              .filter(([_, route]) => route !== null)
              .map(([mode, route]) => (
                <button
                  key={mode}
                  onClick={() => {
                    onPreviewRoute(mode as NavigationMode);
                  }}
                  className={`w-full p-2 flex items-center gap-3 rounded hover:bg-gray-50 transition-colors ${
                    mode === navigationMode ? "bg-blue-50" : ""
                  }`}
                >
                  <div
                    className={`${
                      mode === navigationMode
                        ? "text-blue-500"
                        : "text-gray-500"
                    }`}
                  >
                    {mode === "walking" ? (
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 5l7 7-7 7M5 5l7 7-7 7"
                        />
                      </svg>
                    ) : mode === "cycling" ? (
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <circle cx="12" cy="12" r="10" strokeWidth={2} />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v8M8 12h8"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <rect
                          x="3"
                          y="8"
                          width="18"
                          height="12"
                          rx="2"
                          strokeWidth={2}
                        />
                        <circle cx="7" cy="16" r="2" strokeWidth={2} />
                        <circle cx="17" cy="16" r="2" strokeWidth={2} />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">
                      {formatDuration(route!.duration)} •{" "}
                      {(route!.distance / 1000).toFixed(1)} km
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {mode.replace("-", " ")}
                    </div>
                  </div>
                  {mode === navigationMode && (
                    <div className="text-blue-500">
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
          </div>
        )}

        <button
          onClick={() => onStartNavigation(navigationMode)}
          disabled={loading || !!routeError}
          className="w-full mt-3 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          Start Navigation
        </button>
      </div>
    </div>
  );
};

export default RouteSelection;
