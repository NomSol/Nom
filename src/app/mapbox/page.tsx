"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css"; // Import Mapbox styles

// Load Access Token from environment variables
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Mapbox map
    const map = new mapboxgl.Map({
      container: mapContainerRef.current, // Container ID
      style: "mapbox://styles/mapbox/streets-v11", // Map style
      center: [149.13, -35.28], // Map center (longitude, latitude)
      zoom: 10, // Zoom level
    });

    // Add zoom and rotation controls
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Clean up map instance to prevent memory leaks
    return () => map.remove();
  }, []);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
