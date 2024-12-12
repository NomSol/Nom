"use client";

import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { PiTreasureChestFill } from "react-icons/pi";
import { createRoot } from "react-dom/client";
import { Treasure } from "@/types/treasure";

interface TreasureMarkerProps {
  map: mapboxgl.Map;
  treasure: Treasure;
}

export function TreasureMarker({ map, treasure }: TreasureMarkerProps) {
  let { latitude: rawLat, longitude: rawLng, name, description } = treasure;

  // 规范化经纬度函数
  const normalizeLongitude = (longitude: number) =>
    ((longitude + 180) % 360) - 180;
  const normalizeLatitude = (latitude: number) => {
    while (latitude > 90 || latitude < -90) {
      if (latitude > 90) latitude = 180 - latitude;
      if (latitude < -90) latitude = -180 - latitude;
    }
    return latitude;
  };

  // 规范化的经纬度
  const lat = normalizeLatitude(rawLat);
  const lng = normalizeLongitude(rawLng);

  useEffect(() => {
    if (!map) return;

    // 创建标记的 DOM 元素
    const el = document.createElement("div");
    el.className =
      "treasure-marker cursor-pointer text-3xl text-amber-600 " +
      "flex items-center justify-center w-6 h-6 origin-center " +
      "transition-transform duration-200 hover:scale-110";

    const root = createRoot(el);
    root.render(<PiTreasureChestFill />);

    // 创建 Mapbox 标记
    const marker = new mapboxgl.Marker({ element: el, draggable: false })
      .setLngLat([lng, lat])
      .addTo(map);

    // 定义弹窗
    const popup = new mapboxgl.Popup({ offset: 25 });

    // 点击标记显示弹窗
    el.addEventListener("click", (e) => {
      e.stopPropagation();

      const { lng: actualLng, lat: actualLat } = marker.getLngLat();
      const normalizedLng = normalizeLongitude(actualLng);
      const normalizedLat = normalizeLatitude(actualLat);

      popup
        .setLngLat([normalizedLng, normalizedLat])
        .setHTML(
          `<div class="text-sm">
            <h3 class="m-0 mb-1 font-bold">${name}</h3>
            <p class="m-0">${description}</p>
            <p class="m-0 text-gray-600 text-xs">
              <strong>Latitude:</strong> ${normalizedLat.toFixed(6)}<br />
              <strong>Longitude:</strong> ${normalizedLng.toFixed(6)}
            </p>
          </div>`
        )
        .addTo(map);
    });

    // 点击地图其他地方时关闭弹窗
    map.on("click", (ev) => {
      if (ev.originalEvent.target !== el) {
        popup.remove();
      }
    });

    // 清理标记和弹窗
    return () => {
      marker.remove();
      popup.remove();
    };
  }, [map, lat, lng, name, description]);

  return null;
}
