"use client";
import React, { useState, useContext, useEffect } from "react";
import { Plus, ChevronRight, ChevronDown } from "lucide-react";
import { MapContext } from "./MapContext";
import { TreasureCreationForm } from "./TreansureCreationForm";
import { useTreasures } from "@/hooks/use-treasure";

// 规范化经纬度函数
function normalizeLongitude(longitude: number): number {
  return ((longitude + 180) % 360) - 180; // 将经度限制在 -180 到 180 之间
}

function normalizeLatitude(latitude: number): number {
  while (latitude > 90 || latitude < -90) {
    if (latitude > 90) latitude = 180 - latitude; // 翻转超过 90 的纬度
    if (latitude < -90) latitude = -180 - latitude; // 翻转小于 -90 的纬度
  }
  return latitude;
}

export function TreasureListDropdown() {
  const map = useContext(MapContext);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // 使用 useTreasures 钩子从数据库加载宝藏数据
  const { treasures, isLoading, error } = useTreasures();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handlePlusClick = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const normalizedLat = normalizeLatitude(lat);
        const normalizedLng = normalizeLongitude(lng);
        if (map) {
          map.flyTo({ center: [normalizedLng, normalizedLat], zoom: 15 });
        }
        setLatitude(normalizedLat.toString());
        setLongitude(normalizedLng.toString());
        setIsCreating(true);
      },
      (err) => {
        console.error("Error getting location:", err);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  const handleCancel = () => {
    setIsCreating(false);
  };

  const handleMarkerDragEnd = (lat: number, lng: number) => {
    const normalizedLat = normalizeLatitude(lat);
    const normalizedLng = normalizeLongitude(lng);
    setLatitude(normalizedLat.toString());
    setLongitude(normalizedLng.toString());
  };

  useEffect(() => {
    if (!map || !isCreating) return;

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    const normalizedLat = normalizeLatitude(lat);
    const normalizedLng = normalizeLongitude(lng);

    const point = [normalizedLng, normalizedLat] as [number, number];
    const bounds = map?.getBounds();
    if (bounds && !bounds.contains(point)) {
      map.flyTo({ center: point, zoom: 15 });
    }
  }, [latitude, longitude, isCreating, map]);

  return (
    <div className="mt-2">
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-gray-100 rounded-md"
        onClick={toggleCollapse}
      >
        <h2 className="text-sm font-medium">Created</h2>
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </div>

      {!isCollapsed && (
        <div className="px-4">
          {!isCreating && (
            <div>
              <div className="flex justify-between items-center mb-2">
                {isLoading ? (
                  <span className="text-xs text-muted-foreground">
                    Loading...
                  </span>
                ) : error ? (
                  <span className="text-xs text-red-500">
                    Error loading treasures
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Below are all the treasures:
                  </span>
                )}

                {/* 创建宝藏按钮 */}
                <button
                  className="p-1 border rounded hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlusClick();
                  }}
                  title="Create a new treasure"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* 列表区域：设置最大高度和溢出滚动 */}
              <div className="max-h-64 overflow-y-auto border rounded">
                <ul className="text-sm space-y-2 p-2">
                  {treasures &&
                    treasures.map((t) => (
                      <li
                        key={t.id}
                        className="flex flex-col border rounded p-2 hover:bg-gray-50"
                      >
                        <span className="font-medium">{t.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Lat: {t.latitude}, Lng: {t.longitude}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}

          {isCreating && (
            <TreasureCreationForm
              map={map}
              latitude={latitude}
              longitude={longitude}
              setLatitude={setLatitude}
              setLongitude={setLongitude}
              onCancel={handleCancel}
              onMarkerDragEnd={handleMarkerDragEnd}
            />
          )}
        </div>
      )}
    </div>
  );
}
