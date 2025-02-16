"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Treasure } from "@/types/treasure";
import { normalizeLongitude, normalizeLatitude } from "@/lib/geoUtils";
import { TreasureDetail } from "./TreasureDetail";
import { RouteSelection } from "./RouteSelection";
import { NavigationPanel } from "./NavigationPanel";
import { useSidebar } from "@/components/dashboard/sidebar";

export type NavigationMode =
  | "walking"
  | "cycling"
  | "driving"
  | "driving-traffic";

interface RouteOption {
  mode: NavigationMode;
  distance: number;
  duration: number;
  route: any;
}

interface TreasureMarkersProps {
  map: mapboxgl.Map;
  treasures: Treasure[] | undefined;
}

export const TreasureMarkers: React.FC<TreasureMarkersProps> = ({
  map,
  treasures,
}) => {
  console.log("Debug: TreasureMarkers component rendered", { map, treasures });

  const { setOpen, isMobile } = useSidebar();
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedTreasure, setSelectedTreasure] = useState<Treasure | null>(
    null
  );
  const [showRouteSelection, setShowRouteSelection] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationMode, setNavigationMode] =
    useState<NavigationMode>("walking");
  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<
    Record<NavigationMode, RouteOption | null>
  >({
    walking: null,
    cycling: null,
    driving: null,
    "driving-traffic": null,
  });
  const [routeError, setRouteError] = useState<string | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userLocationMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const watchPositionIdRef = useRef<number | null>(null);

  useEffect(() => {
    console.log("Debug: Map reference updated", map);
    mapRef.current = map;
    return () => {
      if (watchPositionIdRef.current) {
        navigator.geolocation.clearWatch(watchPositionIdRef.current);
      }
    };
  }, [map]);

  const clearRoute = () => {
    console.log("Debug: Attempting to clear route");
    try {
      const currentMap = mapRef.current;
      if (!currentMap) {
        console.log("Debug: No map reference found");
        return;
      }

      if (currentMap.getLayer("route")) {
        currentMap.removeLayer("route");
        console.log("Debug: Route layer removed");
      }
      if (currentMap.getSource("route")) {
        currentMap.removeSource("route");
        console.log("Debug: Route source removed");
      }
    } catch (error) {
      console.error("Debug: Error clearing route:", error);
    }
  };

  const drawRoute = (routeFeature: any, mode: NavigationMode) => {
    const currentMap = mapRef.current;
    if (!currentMap) return;

    const routeColors = {
      walking: "#3887be",
      cycling: "#50C878",
      driving: "#FF7F50",
      "driving-traffic": "#FF4500",
    };

    try {
      clearRoute();

      currentMap.addSource("route", {
        type: "geojson",
        data: routeFeature,
      });

      currentMap.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": routeColors[mode],
          "line-width": 5,
          "line-opacity": 0.75,
        },
      });

      // Fit bounds to show the entire route
      const coordinates = routeFeature.geometry.coordinates;
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach((coord: [number, number]) => bounds.extend(coord));

      currentMap.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
      });
    } catch (error) {
      console.error("Error drawing route:", error);
    }
  };

  const fetchRoute = async (
    userLat: number,
    userLng: number,
    treasureLat: number,
    treasureLng: number,
    mode: NavigationMode
  ) => {
    try {
      const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${userLng},${userLat};${treasureLng},${treasureLat}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Failed to fetch route");

      const data = await response.json();
      if (!data.routes?.[0]) throw new Error("No route found");

      return {
        mode,
        distance: data.routes[0].distance,
        duration: data.routes[0].duration,
        route: data.routes[0],
      };
    } catch (error) {
      console.error(`Error fetching ${mode} route:`, error);
      return null;
    }
  };

  const calculateAllRoutes = async (treasure: Treasure) => {
    if (!treasure.latitude || !treasure.longitude) return;

    setLoading(true);
    setOpen(false);

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          });
        }
      );

      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;
      const treasureLat = normalizeLatitude(treasure.latitude);
      const treasureLng = normalizeLongitude(treasure.longitude);

      const routePromises = Object.keys(routes).map((mode) =>
        fetchRoute(
          userLat,
          userLng,
          treasureLat,
          treasureLng,
          mode as NavigationMode
        )
      );

      const fetchedRoutes = await Promise.all(routePromises);
      const newRoutes = Object.fromEntries(
        Object.keys(routes).map((mode, index) => [mode, fetchedRoutes[index]])
      ) as Record<NavigationMode, RouteOption | null>;

      setRoutes(newRoutes);

      const availableRoutes = Object.values(newRoutes).filter(
        (route) => route !== null
      );
      if (availableRoutes.length === 0) {
        setRouteError(
          "No available route found. Please try a different location or mode."
        );
      } else {
        setRouteError(null);
        const firstRoute = availableRoutes[0]!;
        const routeFeature = {
          type: "Feature",
          properties: {},
          geometry: firstRoute.route.geometry,
        };
        drawRoute(routeFeature, firstRoute.mode);
        setNavigationMode(firstRoute.mode);
      }
    } catch (error) {
      console.error("Error calculating routes:", error);
      setRouteError("Error calculating routes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const startNavigation = (mode: NavigationMode) => {
    setIsNavigating(true);
    setShowRouteSelection(false);
    const selectedRoute = routes[mode];
    if (selectedRoute) {
      const routeFeature = {
        type: "Feature",
        properties: {},
        geometry: selectedRoute.route.geometry,
      };
      drawRoute(routeFeature, mode);
    }

    // Start tracking user location
    if ("geolocation" in navigator) {
      watchPositionIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Update user location marker
          if (!userLocationMarkerRef.current) {
            const el = document.createElement("div");
            el.className = "user-location-marker";
            el.style.width = "20px";
            el.style.height = "20px";
            el.style.borderRadius = "50%";
            el.style.backgroundColor = "#4285F4";
            el.style.border = "2px solid white";

            userLocationMarkerRef.current = new mapboxgl.Marker(el)
              .setLngLat([longitude, latitude])
              .addTo(map);
          } else {
            userLocationMarkerRef.current.setLngLat([longitude, latitude]);
          }
        },
        (error) => console.error("Error tracking location:", error),
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    }
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setShowRouteSelection(false);
    setSelectedTreasure(null);
    setRoutes({
      walking: null,
      cycling: null,
      driving: null,
      "driving-traffic": null,
    });
    setRouteError(null);
    if (isMobile) {
      setTimeout(() => {
        setOpen(true);
      }, 100);
    } else {
      setOpen(true);
    }
    if (watchPositionIdRef.current) {
      navigator.geolocation.clearWatch(watchPositionIdRef.current);
      watchPositionIdRef.current = null;
    }
    if (userLocationMarkerRef.current) {
      userLocationMarkerRef.current.remove();
      userLocationMarkerRef.current = null;
    }
    clearRoute();
  };

  const handleRoutePreview = (mode: NavigationMode) => {
    setNavigationMode(mode);
    const selectedRoute = routes[mode];
    if (selectedRoute) {
      const routeFeature = {
        type: "Feature",
        properties: {},
        geometry: selectedRoute.route.geometry,
      };
      drawRoute(routeFeature, mode);
    }
  };

  // initialize markers
  useEffect(() => {
    console.log("Debug: Initialize markers effect triggered", {
      hasMap: !!map,
      hasTreasures: !!treasures,
      treasuresCount: treasures?.length,
    });

    if (!map || !treasures || !Array.isArray(treasures)) {
      console.log("Debug: Dependencies not met", { map, treasures });
      return;
    }

    // remove existing markers
    console.log("Debug: Clearing existing markers:", markersRef.current.length);
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    try {
      // create marker 的 SVG
      const svgString = `<?xml version="1.0" encoding="UTF-8"?>
      <svg width="32" height="32" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg" id="treasure-marker">
        <path fill="#0000FF" d="M7.5 14C11.0899 14 14 11 14 7.50003C14 4.5 11.5 2 11.5 2L10.5 5.5L7.5 1L4.5 5.5L3.5 2C3.5 2 1 4.5 1 7.50003C1 11 3.91015 14 7.5 14ZM7.5 12.5C6.11929 12.5 5 11.3807 5 10C5 8.61929 7.5 5.5 7.5 5.5C7.5 5.5 10 8.61929 10 10C10 11.3807 8.88071 12.5 7.5 12.5Z"/>
      </svg>`;

      treasures.forEach((treasure, index) => {
        if (!treasure?.latitude || !treasure?.longitude) {
          console.warn("Debug: Invalid treasure coordinates:", treasure);
          return;
        }

        const normalizedLat = normalizeLatitude(treasure.latitude);
        const normalizedLng = normalizeLongitude(treasure.longitude);

        console.log(`Debug: Creating marker ${index}`, {
          treasure,
          normalizedCoords: { lat: normalizedLat, lng: normalizedLng },
        });

        // Create an outer marker element (used by Mapbox for positioning)
        const el = document.createElement("div");
        el.className = "cursor-pointer touch-manipulation";
        el.style.width = "32px";
        el.style.height = "32px";
        el.style.zIndex = "10";

        // Create an inner container for the SVG so that only its transform is affected later.
        const markerWrapper = document.createElement("div");
        markerWrapper.style.transition = "transform 0.2s";
        markerWrapper.innerHTML = svgString;
        el.appendChild(markerWrapper);

        const handleMarkerClick = (e: Event) => {
          console.log("Debug: Marker clicked", {
            treasureId: treasure.id,
            event: e.type,
            target: e.target,
            mouseCoords:
              e instanceof MouseEvent
                ? { x: e.clientX, y: e.clientY }
                : "touch event",
          });

          e.preventDefault();
          e.stopPropagation();

          setSelectedTreasure(treasure);
          console.log("Debug: Selected treasure set:", treasure);

          if (mapRef.current) {
            console.log("Debug: Flying to marker location");
            mapRef.current.flyTo({
              center: [normalizedLng, normalizedLat],
              zoom: 15,
              duration: 1000,
            });
          }
        };

        el.addEventListener("click", handleMarkerClick);
        el.addEventListener("touchend", handleMarkerClick);

        // Only modify the inner container's transform on mouse enter/leave
        el.addEventListener("mouseenter", () => {
          console.log("Debug: Mouse entered marker", {
            treasureId: treasure.id,
            index,
          });
          markerWrapper.style.transform = "scale(1.1)";
        });

        el.addEventListener("mouseleave", () => {
          console.log("Debug: Mouse left marker", {
            treasureId: treasure.id,
            index,
          });
          markerWrapper.style.transform = "scale(1)";
        });

        const marker = new mapboxgl.Marker({
          element: el,
          anchor: "bottom",
        })
          .setLngLat([normalizedLng, normalizedLat])
          .addTo(map);

        markersRef.current.push(marker);
      });

      console.log("Debug: Total markers created:", markersRef.current.length);

      return () => {
        console.log("Debug: Cleanup running");
        stopNavigation();
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];
      };
    } catch (error) {
      console.error("Debug: Error creating markers:", error);
    }
  }, [map, treasures]);

  // Monitor selectedTreasure changes
  useEffect(() => {
    console.log("Debug: selectedTreasure changed:", selectedTreasure);
  }, [selectedTreasure]);

  return (
    <>
      {selectedTreasure && !showRouteSelection && !isNavigating && (
        <TreasureDetail
          treasure={selectedTreasure}
          onClose={() => {
            console.log("Debug: Closing TreasureDetail");
            setSelectedTreasure(null);
            clearRoute();
          }}
          onNavigate={() => {
            console.log("Debug: Starting navigation");
            calculateAllRoutes(selectedTreasure);
            setShowRouteSelection(true);
          }}
        />
      )}

      {showRouteSelection && selectedTreasure && (
        <RouteSelection
          treasure={selectedTreasure}
          onClose={stopNavigation}
          onStartNavigation={(mode) => {
            console.log("Debug: Starting navigation with mode:", mode);
            setNavigationMode(mode);
            startNavigation(mode);
          }}
          onPreviewRoute={handleRoutePreview}
          navigationMode={navigationMode}
          routes={routes}
          loading={loading}
          routeError={routeError}
        />
      )}

      {isNavigating && routes[navigationMode] && (
        <NavigationPanel
          route={routes[navigationMode]?.route}
          navigationMode={navigationMode}
          onClose={stopNavigation}
          onNavigationModeChange={(mode) => {
            console.log("Debug: Changing navigation mode to:", mode);
            setNavigationMode(mode);
            handleRoutePreview(mode);
          }}
        />
      )}
    </>
  );
};
