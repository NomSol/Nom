import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { normalizeLongitude, normalizeLatitude } from "@/lib/geoUtils";

interface DraggableStationMarkerSvgProps {
    map: mapboxgl.Map;
    latString: string;
    lngString: string;
    onDragEnd: (lat: number, lng: number) => void;
}

export function DraggableStationMarkerSvg({
    map,
    latString,
    lngString,
    onDragEnd,
}: DraggableStationMarkerSvgProps) {
    const markerRef = useRef<mapboxgl.Marker | null>(null);

    useEffect(() => {
        if (!map) return;

        // Parse coordinates from string
        const lat = parseFloat(latString);
        const lng = parseFloat(lngString);

        if (isNaN(lat) || isNaN(lng)) return;

        const normalizedLat = normalizeLatitude(lat);
        const normalizedLng = normalizeLongitude(lng);

        // Create SVG marker for recycling stations
        const svgString = `<?xml version="1.0" encoding="UTF-8"?>
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
          <feOffset dx="0" dy="1"/>
          <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.4 0"/>
        </filter>
      </defs>
      <circle cx="16" cy="16" r="15" fill="#34D399" opacity="0.2"/>
      <circle cx="16" cy="16" r="13" fill="#34D399" filter="url(#shadow)"/>
      <circle cx="16" cy="16" r="11" fill="#10B981"/>
      <path d="M10 12v8h12v-8h-12zm10.5 7h-9v-6h9v6z" fill="#ffffff"/>
      <path d="M16 12l-2 2h4l-2-2z" fill="#ffffff"/>
      <path d="M17 15h2v2h-2z" fill="#ffffff"/>
      <path d="M13 15h2v2h-2z" fill="#ffffff"/>
      <path d="M16 7c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9zm0 2c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z" fill="white" opacity="0.4"/>
    </svg>`;

        // Create marker element
        const el = document.createElement("div");
        el.style.width = "32px";
        el.style.height = "32px";
        el.innerHTML = svgString;

        // Add "new" badge
        const newBadge = document.createElement("div");
        newBadge.className = "absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full px-1 py-0.5";
        newBadge.style.position = "absolute";
        newBadge.style.top = "-5px";
        newBadge.style.right = "-5px";
        newBadge.style.backgroundColor = "#3B82F6";
        newBadge.style.color = "white";
        newBadge.style.fontSize = "8px";
        newBadge.style.fontWeight = "bold";
        newBadge.style.borderRadius = "9999px";
        newBadge.style.padding = "2px 4px";
        newBadge.textContent = "NEW";
        el.appendChild(newBadge);

        // Check if marker already exists, remove it if it does
        if (markerRef.current) {
            markerRef.current.remove();
        }

        // Create new marker
        markerRef.current = new mapboxgl.Marker({
            element: el,
            draggable: true,
            anchor: "bottom",
        })
            .setLngLat([normalizedLng, normalizedLat])
            .addTo(map);

        // Handle drag end event
        markerRef.current.on("dragend", () => {
            const { lng, lat } = markerRef.current!.getLngLat();
            onDragEnd(lat, lng);
        });

        // Return cleanup function
        return () => {
            if (markerRef.current) {
                markerRef.current.remove();
                markerRef.current = null;
            }
        };
    }, [map, latString, lngString, onDragEnd]);

    return null; // Component doesn't render anything directly
} 