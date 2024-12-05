// "use client";

// import { useEffect, useRef } from "react";
// import mapboxgl from "mapbox-gl";
// import "mapbox-gl/dist/mapbox-gl.css"; // Import Mapbox styles
// import {
//   SidebarProvider,
//   SidebarTrigger,
// } from "@/components/dashboard/sidebar";
// import { AppSidebar } from "@/components/dashboard/app-sidebar";

// // Load Access Token from environment variables
// mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

// export default function MapPage() {
//   const mapContainerRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (!mapContainerRef.current) return;

//     // Initialize Mapbox map
//     const map = new mapboxgl.Map({
//       container: mapContainerRef.current, // Container ID
//       style: "mapbox://styles/mapbox/streets-v11", // Map style
//       center: [149.13, -35.28], // Map center (longitude, latitude)
//       zoom: 10, // Zoom level
//     });

//     // Add zoom and rotation controls
//     map.addControl(new mapboxgl.NavigationControl(), "top-right");

//     // Clean up map instance to prevent memory leaks
//     return () => map.remove();
//   }, []);

//   return (
//     <div className="relative h-screen w-screen">
//       {/* Map container */}
//       <div ref={mapContainerRef} className="h-full w-full" />

//       {/* Sidebar overlay */}
//       <div className="absolute top-0 left-0 h-full w-[300px] bg-transparent z-10">
//         <SidebarProvider>
//           <AppSidebar />
//           <div>
//             <SidebarTrigger />
//           </div>
//         </SidebarProvider>
//       </div>
//     </div>
//   );
// }

// MapPage.tsx
"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css"; // Import Mapbox styles
import {
  SidebarProvider,
  SidebarTrigger,
} from "@/components/dashboard/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

// Load Access Token from environment variables
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

export default function MapPage() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

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

    // Save map instance to ref
    mapRef.current = map;

    // Clean up map instance to prevent memory leaks
    return () => map.remove();
  }, []);

  // Function to fly to a given location
  const flyToLocation = (lng: number, lat: number) => {
    mapRef.current?.flyTo({
      center: [lng, lat],
      zoom: 12,
      essential: true, // This animation is considered essential with respect to prefers-reduced-motion
    });
  };

  return (
    <div className="relative h-screen w-screen">
      {/* Map container */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Sidebar overlay */}
      <div className="absolute top-0 left-0 h-full w-[300px] bg-transparent z-10">
        <SidebarProvider>
          <AppSidebar flyToLocation={flyToLocation} />
          <div>
            <SidebarTrigger />
          </div>
        </SidebarProvider>
      </div>
    </div>
  );
}
