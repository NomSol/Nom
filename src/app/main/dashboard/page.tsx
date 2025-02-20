"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { MapContext } from "@/components/dashboard/MapContext";
import { TreasureMarkers } from "@/components/dashboard/TreasureMarkers";
import { useTreasures } from "@/hooks/use-treasure";
import { SidebarProvider } from "@/components/dashboard/sidebar";

import { AppTopbar } from "@/components/dashboard/app-topbar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { FloatingActions } from "@/components/dashboard/FloatingActions"; // <-- new import

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export default function MapPage() {
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const { treasures, isLoading, error } = useTreasures();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [149.13, -35.28],
      zoom: 15,
      pitch: 60,
      bearing: -30,
      antialias: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("style.load", () => {
      // Add terrain, 3D buildings, lighting, fog, and more
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });

      map.addLayer({
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": [
            "interpolate",
            ["linear"],
            ["get", "height"],
            0,
            "#e6e6e6",
            50,
            "#d4d4d4",
            100,
            "#c2c2c2",
          ],
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": ["get", "min_height"],
          "fill-extrusion-opacity": 0.9,
        },
      });

      map.setLight({
        anchor: "viewport",
        color: "#ffffff",
        intensity: 0.4,
        position: [1, 90, 45],
      });

      map.setFog({
        range: [0.8, 8],
        color: "#ffffff",
        "horizon-blend": 0.1,
      });
    });

    setMapInstance(map);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <SidebarProvider>
      <MapContext.Provider value={mapInstance}>
        {/* Topbar: Displayed when Sidebar is collapsed */}
        <AppTopbar />

        {/* Sidebar: Expand when clicking on the kitten of Topbar */}
        <AppSidebar />

        {/* Place the map container at the bottom and let Topbar/Sidebar cover it. */}
        <div className="fixed inset-0">
          <div ref={mapContainerRef} className="h-full w-full" />
          {isLoading && (
            <div className="absolute top-0 left-0 z-[51] bg-white p-4">
              Loading treasures...
            </div>
          )}
          {error && (
            <div className="absolute top-0 left-0 z-[51] bg-red-500 p-4 text-white">
              Error loading treasures
            </div>
          )}
        </div>

        {/* treasure mark */}
        {mapInstance && treasures && treasures.length > 0 && (
          <TreasureMarkers map={mapInstance} treasures={treasures} />
        )}

        {/* Floating button area in the lower right corner */}
        <FloatingActions />
      </MapContext.Provider>
    </SidebarProvider>
  );
}
