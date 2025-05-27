"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { RecyclingStation } from "@/types/station";
import { normalizeLongitude, normalizeLatitude } from "@/lib/geoUtils";
import { StationDetail } from "./StationDetail";
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

interface StationMarkersProps {
    map: mapboxgl.Map;
    stations: RecyclingStation[] | undefined;
}

export const StationMarkers: React.FC<StationMarkersProps> = ({
    map,
    stations,
}) => {
    console.log("Debug: StationMarkers component rendered", { map, stations });

    const { setOpen, isMobile } = useSidebar();
    const markersRef = useRef<mapboxgl.Marker[]>([]);
    const [selectedStation, setSelectedStation] = useState<RecyclingStation | null>(
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
        stationLat: number,
        stationLng: number,
        mode: NavigationMode
    ) => {
        try {
            const apiUrl = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${userLng},${userLat};${stationLng},${stationLat}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;

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

    const calculateAllRoutes = async (station: RecyclingStation) => {
        if (!station.latitude || !station.longitude) return;

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
            const stationLat = normalizeLatitude(station.latitude);
            const stationLng = normalizeLongitude(station.longitude);

            const routePromises = Object.keys(routes).map((mode) =>
                fetchRoute(
                    userLat,
                    userLng,
                    stationLat,
                    stationLng,
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
        setSelectedStation(null);
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
            hasStations: !!stations,
            stationsCount: stations?.length,
        });

        if (!map || !stations || !Array.isArray(stations)) {
            console.log("Debug: Dependencies not met", { map, stations });
            return;
        }

        // remove existing markers
        console.log("Debug: Clearing existing markers:", markersRef.current.length);
        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        try {
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

            stations.forEach((station, index) => {
                if (!station?.latitude || !station?.longitude) {
                    console.warn("Debug: Invalid station coordinates:", station);
                    return;
                }

                const normalizedLat = normalizeLatitude(station.latitude);
                const normalizedLng = normalizeLongitude(station.longitude);

                console.log(`Debug: Creating marker ${index}`, {
                    station,
                    normalizedCoords: { lat: normalizedLat, lng: normalizedLng },
                });

                // Create an outer marker element (used by Mapbox for positioning)
                const el = document.createElement("div");
                el.className = "cursor-pointer touch-manipulation";
                el.style.width = "32px";
                el.style.height = "32px";
                el.style.zIndex = "10";

                // Create an inner container for the SVG
                const markerWrapper = document.createElement("div");
                markerWrapper.style.transition = "transform 0.2s";
                markerWrapper.innerHTML = svgString;
                el.appendChild(markerWrapper);

                // Add station level indicator
                const levelBadge = document.createElement("div");
                levelBadge.className = "absolute bottom-0 right-0 bg-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-green-500";
                levelBadge.style.position = "absolute";
                levelBadge.style.bottom = "0";
                levelBadge.style.right = "0";
                levelBadge.style.backgroundColor = "white";
                levelBadge.style.borderRadius = "50%";
                levelBadge.style.width = "16px";
                levelBadge.style.height = "16px";
                levelBadge.style.display = "flex";
                levelBadge.style.alignItems = "center";
                levelBadge.style.justifyContent = "center";
                levelBadge.style.fontSize = "10px";
                levelBadge.style.fontWeight = "bold";
                levelBadge.style.border = "2px solid #10B981";
                levelBadge.textContent = `${station.level}`;
                el.appendChild(levelBadge);

                const handleMarkerClick = (e: Event) => {
                    console.log("Debug: Marker clicked", {
                        stationId: station.id,
                        event: e.type,
                        target: e.target,
                        mouseCoords:
                            e instanceof MouseEvent
                                ? { x: e.clientX, y: e.clientY }
                                : "touch event",
                    });

                    e.preventDefault();
                    e.stopPropagation();

                    setSelectedStation(station);
                    console.log("Debug: Selected station set:", station);

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

                // Mouse hover effects
                el.addEventListener("mouseenter", () => {
                    console.log("Debug: Mouse entered marker", {
                        stationId: station.id,
                        index,
                    });
                    markerWrapper.style.transform = "scale(1.1)";
                });

                el.addEventListener("mouseleave", () => {
                    console.log("Debug: Mouse left marker", {
                        stationId: station.id,
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
    }, [map, stations]);

    return (
        <>
            {selectedStation && !showRouteSelection && !isNavigating && (
                <StationDetail
                    station={selectedStation}
                    onClose={() => {
                        console.log("Debug: Closing StationDetail");
                        setSelectedStation(null);
                        clearRoute();
                    }}
                    onNavigate={() => {
                        console.log("Debug: Starting navigation");
                        calculateAllRoutes(selectedStation);
                        setShowRouteSelection(true);
                    }}
                />
            )}

            {showRouteSelection && selectedStation && (
                <RouteSelection
                    station={selectedStation}
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