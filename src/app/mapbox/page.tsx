"use client";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/dashboard/sidebar";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";
import { useDeviceOrientation } from "./useDeviceOrientation";
import { useGeolocation } from "./useGeolocation";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const cleanupRef = useRef<(() => void) | undefined>();
  const { orientation, startWatching } = useDeviceOrientation();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [149.13, -35.28],
      zoom: 10,
    });

    mapRef.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    return () => mapRef.current?.remove();
  }, []);

  useEffect(() => {
    if (markerRef.current && orientation !== null) {
      markerRef.current.setRotation(orientation);
    }
  }, [orientation]);

  const saveUserLocation = async (latitude: number, longitude: number) => {
    const userId = 'c410de2d-4d2c-4c9e-b2e3-f0ca3c2d540c'; // 
    const query = `
      mutation insertUserLocation($user_id: uuid!, $latitude: float8!, $longitude: float8!) {
        insert_geolocation_user_location(objects: {
          user_id: $user_id,
          latitude: $latitude,
          longitude: $longitude,
          region: null,
          altitude: 0.0
        }) {
          returning {
            id
          }
        }
      }
    `;

    const response = await fetch(process.env.NEXT_PUBLIC_HASURA_ENDPOINT || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET || '',
      },
      body: JSON.stringify({
        query,
        variables: {
          user_id: userId,
          latitude,
          longitude,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('save user location error:', errorData);
    }
  };

  const { getLocation } = useGeolocation((position) => {
    const { latitude, longitude } = position.coords;

    if (mapRef.current) {
      mapRef.current.flyTo({ center: [longitude, latitude], zoom: 15 });

      const markerElement = document.createElement('div');
      markerElement.innerHTML = `
                <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="15,0 30,15 15,30 12,30 12,15 0,15 0,12 12,12 12,0" fill="blue" />
                </svg>
            `;

      if (markerRef.current) {
        markerRef.current.remove();
      }

      markerRef.current = new mapboxgl.Marker(markerElement)
        .setLngLat([longitude, latitude])
        .addTo(mapRef.current);
    }

    saveUserLocation(latitude, longitude);
  });

  const handleLocationClick = async () => {
    cleanupRef.current?.();
    await startWatching();
    cleanupRef.current = getLocation();
  };

  return (
    <div className="relative h-screen w-screen">
      <div ref={mapContainerRef} className="h-full w-full" />
      <div className="absolute top-0 left-0 h-full w-[300px] bg-transparent z-10">
        <SidebarProvider>
          <AppSidebar />
          <div>
            <SidebarTrigger />
          </div>
        </SidebarProvider>
      </div>
      <button
        onClick={handleLocationClick}
        className="absolute bottom-4 right-4 p-2 rounded shadow"
      >
        <svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg">
          <circle cx="15" cy="15" r="10" fill="none" stroke="black" strokeWidth="2" />
          <line x1="15" y1="5" x2="15" y2="0" stroke="black" strokeWidth="2" />
          <line x1="15" y1="25" x2="15" y2="30" stroke="black" strokeWidth="2" />
          <line x1="5" y1="15" x2="0" y2="15" stroke="black" strokeWidth="2" />
          <line x1="25" y1="15" x2="30" y2="15" stroke="black" strokeWidth="2" />
          <circle cx="15" cy="15" r="3" fill="black" />
        </svg>
      </button>
    </div>
  );
}
