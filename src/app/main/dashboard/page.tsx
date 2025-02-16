"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/dashboard/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { TreasureMarkers } from "@/components/dashboard/TreasureMarkers";
import { useTreasures } from "@/hooks/use-treasure";
import { MapContext } from "@/components/dashboard/MapContext";
import { cn } from "@/lib/utils";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

function MapContent() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const { treasures, isLoading, error } = useTreasures();
  const { state, isMobile } = useSidebar();

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
      // add terrain
      map.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });

      map.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });

      // add 3D buildings
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

      // set light
      map.setLight({
        anchor: "viewport",
        color: "#ffffff",
        intensity: 0.4,
        position: [1, 90, 45],
      });

      // set fog
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
    <MapContext.Provider value={mapInstance}>
      <div className="fixed inset-0">
        {/* 地图容器 */}
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* UI 层（非交互性元素） */}
        <div className="pointer-events-none">
          {/* Sidebar */}
          <div className="pointer-events-auto">
            <AppSidebar />
            {!isMobile && (
              <div
                className={cn(
                  "fixed top-2 transition-all duration-300 z-[60]",
                  state === "expanded" ? "left-[255.5px]" : "left-[0px]"
                )}
              >
                <SidebarTrigger className="bg-white rounded-md shadow-md" />
              </div>
            )}
          </div>

          {/* loading state */}
          {isLoading && (
            <div className="absolute top-0 left-0 p-4 bg-white z-[51] pointer-events-auto">
              Loading treasures...
            </div>
          )}

          {/* error state */}
          {error && (
            <div className="absolute top-0 left-0 p-4 bg-red-500 text-white z-[51] pointer-events-auto">
              Error loading treasures
            </div>
          )}
        </div>

        {/* Place TreasureMarkers (and the inner popup components) in an outer layer make sure they can receive mouse events*/}
        {mapInstance && treasures && treasures.length > 0 && (
          <TreasureMarkers map={mapInstance} treasures={treasures} />
        )}
      </div>
    </MapContext.Provider>
  );
}

// main page component
export default function MapPage() {
  return (
    <SidebarProvider>
      <MapContent />
    </SidebarProvider>
  );
}
