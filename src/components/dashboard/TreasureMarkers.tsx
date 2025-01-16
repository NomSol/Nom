import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { Treasure } from "@/types/treasure";
import { normalizeLongitude, normalizeLatitude } from "@/lib/geoUtils";

interface TreasureMarkersProps {
  map: mapboxgl.Map;
  treasures: Treasure[] | undefined;
}

export const TreasureMarkers: React.FC<TreasureMarkersProps> = ({
  map,
  treasures,
}) => {
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    // Early return if map or treasures are not available
    if (!map || !treasures || !Array.isArray(treasures)) {
      console.warn("Map or treasures data not available");
      return;
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    try {
      // Create SVG element for the marker
      const svgString = `<?xml version="1.0" encoding="UTF-8"?>
        <svg width="16" height="16" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg" id="fire-station">
          <path fill="#0000FF" d="M7.5 14C11.0899 14 14 11 14 7.50003C14 4.5 11.5 2 11.5 2L10.5 5.5L7.5 1L4.5 5.5L3.5 2C3.5 2 1 4.5 1 7.50003C1 11 3.91015 14 7.5 14ZM7.5 12.5C6.11929 12.5 5 11.3807 5 10C5 8.61929 7.5 5.5 7.5 5.5C7.5 5.5 10 8.61929 10 10C10 11.3807 8.88071 12.5 7.5 12.5Z"/>
        </svg>`;

      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, "image/svg+xml");
      const svgElement = svgDoc.documentElement;

      // Add markers for each treasure
      treasures.forEach((treasure) => {
        // Validate and normalize coordinates
        if (
          typeof treasure?.latitude !== "number" ||
          typeof treasure?.longitude !== "number"
        ) {
          console.warn("Invalid treasure coordinates:", treasure);
          return;
        }

        // Normalize coordinates
        const normalizedLat = normalizeLatitude(treasure.latitude);
        const normalizedLng = normalizeLongitude(treasure.longitude);

        // Create a container for the marker
        const el = document.createElement("div");
        el.className = "cursor-pointer";
        el.innerHTML = svgElement.outerHTML;

        // Create the marker
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: "bottom",
        })
          .setLngLat([normalizedLng, normalizedLat])
          .addTo(map);

        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 });

        // Add click event listener
        el.addEventListener("click", (e) => {
          e.stopPropagation();

          const { lng: actualLng, lat: actualLat } = marker.getLngLat();
          const normalizedLng = normalizeLongitude(actualLng);
          const normalizedLat = normalizeLatitude(actualLat);

          popup
            .setLngLat([normalizedLng, normalizedLat])
            .setHTML(
              `
              <div class="text-sm">
                <h3 class="m-0 mb-1 font-bold">${
                  treasure.name || "Unnamed Treasure"
                }</h3>
                <p class="m-0">${
                  treasure.description || "No description available"
                }</p>
                <p class="m-0 text-gray-600 text-xs">
                  <strong>Latitude:</strong> ${normalizedLat.toFixed(6)}<br />
                  <strong>Longitude:</strong> ${normalizedLng.toFixed(6)}
                </p>
              </div>
            `
            )
            .addTo(map);
        });

        // Store marker reference for cleanup
        markersRef.current.push(marker);
      });
    } catch (error) {
      console.error("Error creating markers:", error);
    }

    // Cleanup function
    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [map, treasures]); // Re-run effect when map or treasures change

  // This component doesn't render anything directly
  return null;
};
