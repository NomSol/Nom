'use client';

import { useEffect, useState } from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import { Treasure } from '@/types/treasure';

interface TreasureMapProps {
  treasures: Treasure[];
  onTreasureSelect?: (treasure: Treasure) => void;
  onLocationSelect?: (lat: number, lng: number) => void;
  interactive?: boolean;
  center?: { latitude: number; longitude: number };
}

export function TreasureMap({ 
  treasures, 
  onTreasureSelect, 
  onLocationSelect,
  interactive = true,
  center 
}: TreasureMapProps) {
  const [viewState, setViewState] = useState({
    latitude: center?.latitude || 0,
    longitude: center?.longitude || 0,
    zoom: 13
  });

  useEffect(() => {
    if (center) {
      setViewState(prev => ({
        ...prev,
        latitude: center.latitude,
        longitude: center.longitude
      }));
    } else if (treasures.length > 0) {
      // Center map on first treasure if no center provided
      setViewState(prev => ({
        ...prev,
        latitude: treasures[0].latitude,
        longitude: treasures[0].longitude
      }));
    }
  }, [center, treasures]);

  const handleClick = (event: any) => {
    if (interactive && onLocationSelect) {
      const { lat, lng } = event.lngLat;
      onLocationSelect(lat, lng);
    }
  };

  return (
    <Map
      {...viewState}
      style={{ width: '100%', height: '100%', minHeight: '400px' }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      onMove={evt => setViewState(evt.viewState)}
      onClick={handleClick}
      interactive={interactive}
    >
      <NavigationControl />
      
      {treasures.map(treasure => (
        <Marker
          key={treasure.id}
          latitude={treasure.latitude}
          longitude={treasure.longitude}
          onClick={() => onTreasureSelect?.(treasure)}
          color="#FF0000"
        >
          <div className="w-6 h-6 bg-red-500 rounded-full cursor-pointer hover:bg-red-600 transition-colors" />
        </Marker>
      ))}
    </Map>
  );
}