// export default NavigationPanel;

import React from "react";
import { NavigationMode } from "./TreasureMarkers";

interface NavigationPanelProps {
  route: any;
  navigationMode: NavigationMode;
  onClose: () => void;
  onNavigationModeChange: (mode: NavigationMode) => void;
}

export const NavigationPanel: React.FC<NavigationPanelProps> = ({
  route,
  navigationMode,
  onClose,
  onNavigationModeChange,
}) => {
  if (!route || !route.legs || !route.legs[0]) return null;

  const steps = route.legs[0].steps;

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(meters)} m`;
  };

  return (
    <div className="absolute top-4 left-4 w-80 bg-white rounded-lg shadow-lg z-50">
      <div className="p-3">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <div className="text-lg font-medium">
              {Math.round(route.duration / 60)} min •{" "}
              {(route.distance / 1000).toFixed(1)} km
            </div>
            <div className="text-sm text-gray-500">
              {formatTime(Date.now())} • {navigationMode.replace("-", " ")}
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={navigationMode}
              onChange={(e) =>
                onNavigationModeChange(e.target.value as NavigationMode)
              }
              className="text-sm border border-gray-200 rounded px-2 py-1"
            >
              <option value="walking">Walking</option>
              <option value="cycling">Cycling</option>
              <option value="driving">Driving</option>
              <option value="driving-traffic">Traffic</option>
            </select>
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
        </div>

        {/* Steps */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-100">
          {steps.map((step: any, index: number) => (
            <div key={index} className="py-2 flex items-start gap-3">
              <div className="w-6 h-6 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">
                  {step.maneuver.instruction}
                </div>
                {step.distance > 0 && (
                  <div className="text-xs text-gray-500">
                    {formatDistance(step.distance)} •{" "}
                    {Math.round(step.duration / 60)} min
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t flex justify-between items-center text-sm">
          <div className="flex gap-3">
            <button
              className="p-1.5 hover:bg-gray-100 rounded-full"
              title="Center on location"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <circle cx="12" cy="12" r="3" strokeWidth={2} />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 2v3m0 14v3M2 12h3m14 0h3"
                />
              </svg>
            </button>
            <button
              className="p-1.5 hover:bg-gray-100 rounded-full"
              title="Toggle sound"
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
                  d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 6L7 9H4v6h3l5 3V6z"
                />
              </svg>
            </button>
          </div>
          <div className="text-gray-500">
            Arrival:{" "}
            <span className="font-medium">
              {formatTime(Date.now() + route.duration * 1000)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationPanel;
