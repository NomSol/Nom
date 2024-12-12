"use client";

import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { TreasureMarker } from "./TreasureMarker";
import { Treasure } from "@/types/treasure";

interface TreasureMarkersProps {
  map: mapboxgl.Map;
  treasures: Treasure[];
}

export function TreasureMarkers({ map, treasures }: TreasureMarkersProps) {
  // 这里我们使用TreasureMarker为每个宝藏创建标记
  // TreasureMarker现在已经修改可以根据传入的宝藏信息来创建标记，显示popup等
  return (
    <>
      {treasures.map((treasure) => (
        <TreasureMarker key={treasure.id} map={map} treasure={treasure} />
      ))}
    </>
  );
}
