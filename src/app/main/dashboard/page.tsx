"use client";

import { useEffect, useState, useRef } from "react";
import { SidebarProvider } from "@/components/dashboard/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapContext } from "@/components/dashboard/MapContext";
import { Treasure } from "@/types/treasure";
import { TreasureMarkers } from "@/components/dashboard/TreasureMarkers";
import { useTreasures } from "@/hooks/use-treasure";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);

  // Fetch treasure data
  const { treasures, isLoading, error } = useTreasures();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [149.13, -35.28],
      zoom: 10,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    setMapInstance(map);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <MapContext.Provider value={mapInstance}>
      <div className="relative h-screen w-screen">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Loading and error handling */}
        {isLoading && (
          <div className="absolute top-0 left-0 p-4 bg-white z-10">
            Loading treasures...
          </div>
        )}
        {error && (
          <div className="absolute top-0 left-0 p-4 bg-red-500 text-white z-10">
            Error loading treasures
          </div>
        )}

        {mapInstance && treasures && treasures.length > 0 && (
          <TreasureMarkers map={mapInstance} treasures={treasures} />
        )}

        {/* Sidebar placeholder */}
        <div className="absolute top-0 left-0 h-full w-[300px] bg-transparent z-10">
          {/* Sidebar components go here */}

          <div className="absolute top-0 left-0 h-full w-[300px] bg-transparent z-10">
            <SidebarProvider>
              <AppSidebar />
            </SidebarProvider>
          </div>
        </div>
      </div>
    </MapContext.Provider>
  );
}
