"use client";

import { useState, useContext } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { MapContext } from "@/components/dashboard/MapContext";
import { StationCreationForm } from "./StationCreationForm";

export function FloatingActions() {
  const router = useRouter();
  const map = useContext(MapContext);
  const [showStationForm, setShowStationForm] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Handle getting current location for station creation
  const handleCreateStation = () => {
    if (!map) return;

    // Get the center of the current map view
    const center = map.getCenter();
    setLatitude(center.lat.toFixed(6));
    setLongitude(center.lng.toFixed(6));
    setShowStationForm(true);
  };

  const handleMarkerDragEnd = (lat: number, lng: number) => {
    setLatitude(lat.toFixed(6));
    setLongitude(lng.toFixed(6));
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
      {showStationForm ? (
        <div className="bg-white p-4 rounded-lg shadow-lg w-64">
          <h3 className="text-lg font-medium mb-2">Add Recycling Station</h3>
          <StationCreationForm
            map={map}
            latitude={latitude}
            longitude={longitude}
            setLatitude={setLatitude}
            setLongitude={setLongitude}
            onCancel={() => setShowStationForm(false)}
            onMarkerDragEnd={handleMarkerDragEnd}
          />
        </div>
      ) : (
        <Button
          size="icon"
          className="h-12 w-12 rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
          onClick={handleCreateStation}
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}
