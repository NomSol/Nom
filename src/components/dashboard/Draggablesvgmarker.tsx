"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { normalizeLongitude, normalizeLatitude } from "@/lib/geoUtils";

interface DraggableTreasureMarkerSvgProps {
  map: mapboxgl.Map | null;
  latString: string;
  lngString: string;
  onDragEnd: (lat: number, lng: number) => void;
}

export function DraggableTreasureMarkerSvg({
  map,
  latString,
  lngString,
  onDragEnd,
}: DraggableTreasureMarkerSvgProps) {
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  // 将传入的字符串转为数字类型
  const lat = parseFloat(latString);
  const lng = parseFloat(lngString);

  useEffect(() => {
    if (!map) return;

    // 1. 这里放你的 SVG 字符串 (可自行替换为其他样式)
    // const treasureChestSvg = `<?xml version="1.0" encoding="UTF-8"?>
    // <svg width="15" height="15" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg" id="fire-station">
    //   <path fill="#F00C0C" d="M7.5 14C11.0899 14 14 11 14 7.50003C14 4.5 11.5 2 11.5 2L10.5 5.5L7.5 1L4.5 5.5L3.5 2C3.5 2 1 4.5 1 7.50003C1 11 3.91015 14 7.5 14ZM7.5 12.5C6.11929 12.5 5 11.3807 5 10C5 8.61929 7.5 5.5 7.5 5.5C7.5 5.5 10 8.61929 10 10C10 11.3807 8.88071 12.5 7.5 12.5Z"/>
    // </svg>`;

    const treasureChestSvg = `<?xml version="1.0" encoding="UTF-8"?>
    <svg width="48" height="48" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5"/>
          <feOffset dx="0" dy="1"/>
          <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1"/>
          <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.4 0"/>
        </filter>
      </defs>
      <circle cx="16" cy="16" r="15" fill="#7C3AED" opacity="0.2"/>
      <circle cx="16" cy="16" r="13" fill="#7C3AED" filter="url(#shadow)"/>
      <circle cx="16" cy="16" r="11" fill="#6D28D9"/>
      <path d="M15 10h2v5h5v2h-5v5h-2v-5h-5v-2h5v-5z" fill="#FFD700"/>
      <path d="M16 7c4.97 0 9 4.03 9 9s-4.03 9-9 9-9-4.03-9-9 4.03-9 9-9zm0 2c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z" fill="white" opacity="0.4"/>
      <g fill="white" opacity="0.8">
        <path d="M16 4l2 3h-4l2-3z"/>
        <path d="M16 28l2-3h-4l2 3z"/>
        <path d="M4 16l3-2v4l-3-2z"/>
        <path d="M28 16l-3-2v4l3-2z"/>
      </g>
    </svg>`;

    //     `<?xml version="1.0" encoding="UTF-8"?>
    // <svg width="32px" height="32px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    //   <path fill="#d97706" d="M21.2,7.8H2.8C1.8,7.8,1,8.6,1,9.6v4.8c0,1,0.8,1.8,1.8,1.8h18.4c1,0,1.8-0.8,1.8-1.8V9.6C23,8.6,22.2,7.8,21.2,7.8z"/>
    //   <path fill="#fff" d="M4 11h16v2H4z"/>
    // </svg>`;

    // 2. 转为 Blob，方便在 <img> 里使用
    const svgBlob = new Blob([treasureChestSvg], { type: "image/svg+xml" });
    const svgUrl = URL.createObjectURL(svgBlob);

    // 3. 创建 DOM 元素，并指定鼠标拖拽样式
    const el = document.createElement("div");
    el.style.cursor = "move";

    // 4. 在这个元素里放一个 <img>，加载我们的 SVG
    const img = document.createElement("img");
    img.src = svgUrl;
    img.style.width = "32px";
    img.style.height = "32px";
    // 如果你想要更小/更大，就调整上面宽高即可

    el.appendChild(img);

    // 5. 使用这个 DOM 元素创建 draggable Marker
    const initialPosition: [number, number] = [lng, lat];
    const marker = new mapboxgl.Marker({
      element: el,
      draggable: true,
    })
      .setLngLat(initialPosition)
      .addTo(map);

    // 6. 拖拽结束时，获取新的经纬度
    marker.on("dragend", () => {
      const { lng, lat } = marker.getLngLat();
      onDragEnd(lat, lng);
    });

    markerRef.current = marker;

    // 组件卸载时清理
    return () => {
      marker.remove();
      markerRef.current = null;
      URL.revokeObjectURL(svgUrl);
    };
  }, [map]);

  // 当外部的经纬度发生变化时，更新 marker 的坐标
  useEffect(() => {
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    const normalizedLng = normalizeLongitude(lng);
    const normalizedLat = normalizeLatitude(lat);
    if (markerRef.current) {
      markerRef.current.setLngLat([normalizedLng, normalizedLat]);
    }
  }, [latString, lngString]);

  return null;
}
