"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { PiTreasureChestDuotone } from "react-icons/pi";
import { createRoot } from "react-dom/client";

interface DraggableTreasureMarkerProps {
  map: mapboxgl.Map | null;
  latString: string;
  lngString: string;
  onDragEnd: (lat: number, lng: number) => void;
}

export function DraggableTreasureMarker({
  map,
  latString,
  lngString,
  onDragEnd,
}: DraggableTreasureMarkerProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const lat = parseFloat(latString);
  const lng = parseFloat(lngString);

  useEffect(() => {
    if (!map) return;

    const el = document.createElement("div");
    el.style.cursor = "move";
    el.style.fontSize = "24px";
    el.style.color = "#d97706";
    el.className = "treasure-marker";

    const root = createRoot(el);
    root.render(<PiTreasureChestDuotone />);

    const initialPosition: [number, number] = [lng, lat];

    const marker = new mapboxgl.Marker({
      element: el,
      draggable: true,
    })
      .setLngLat(initialPosition)
      .addTo(map);

    marker.on("dragend", () => {
      const { lng, lat } = marker.getLngLat();
      onDragEnd(lat, lng); // 始终返回合法的经纬度
    });

    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLngLat([lng, lat]);
    }
  }, [latString, lngString]);

  return null;
}
