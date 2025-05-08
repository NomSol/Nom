"use client";
import React, { useState, useContext, useEffect } from "react";
import { MapContext } from "@/components/dashboard/MapContext";
import { TreasureCreationForm } from "./TreansureCreationForm"; // 你已有的创建表单
import {
  Plus,
  Compass, // 占位图标
  Bell, // 占位图标
  User, // 占位图标
  X, // 关闭按钮图标（在创建时可用）
} from "lucide-react";
import { MatchModal } from "./MatchModal";

// 这两个工具函数可以直接复制，也可以从 TreasureListDropdown 里抽取
function normalizeLongitude(longitude: number): number {
  return ((longitude + 180) % 360) - 180;
}
function normalizeLatitude(latitude: number): number {
  while (latitude > 90 || latitude < -90) {
    if (latitude > 90) latitude = 180 - latitude;
    if (latitude < -90) latitude = -180 - latitude;
  }
  return latitude;
}

export function FloatingActions() {
  const map = useContext(MapContext);

  // 与 TreasureListDropdown 中相同的状态
  const [isCreating, setIsCreating] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);

  // 点击加号时，执行与侧边栏同样的定位逻辑
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

  // 取消创建
  const handleCancel = () => {
    setIsCreating(false);
  };

  // Marker 拖拽结束时更新经纬度
  const handleMarkerDragEnd = (lat: number, lng: number) => {
    const normalizedLat = normalizeLatitude(lat);
    const normalizedLng = normalizeLongitude(lng);
    setLatitude(normalizedLat.toString());
    setLongitude(normalizedLng.toString());
  };

  // 如果正在创建时，自动把地图中心飞到当前 latitude/longitude
  useEffect(() => {
    if (!map || !isCreating) return;
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return;

    const normalizedLat = normalizeLatitude(lat);
    const normalizedLng = normalizeLongitude(lng);

    const point = [normalizedLng, normalizedLat] as [number, number];
    const bounds = map?.getBounds();
    if (bounds && !bounds.contains(point)) {
      map.flyTo({ center: point, zoom: 15 });
    }
  }, [latitude, longitude, isCreating, map]);

  return (
    <>
      {/* 浮动按钮容器：固定在右下角 */}
      <div className="fixed bottom-4 right-4 flex flex-col items-center space-y-3 z-[60]">
        {/* 这里放 3 个占位按钮 + 1 个加号按钮 */}
        <button
          className="p-3 rounded-full bg-white shadow hover:bg-gray-100"
          onClick={() => alert("Placeholder #1")}
        >
          <Compass className="h-5 w-5 text-gray-700" />
        </button>

        <button
          className="p-3 rounded-full bg-white shadow hover:bg-gray-100"
          onClick={() => alert("Placeholder #2")}
        >
          <Bell className="h-5 w-5 text-gray-700" />
        </button>

        <button
          className="p-3 rounded-full bg-white shadow hover:bg-gray-100"
          onClick={() => setIsMatchModalOpen(true)}
        >
          <User className="h-5 w-5 text-gray-700" />
        </button>

        {/* 加号按钮 */}
        <button
          className="p-3 rounded-full bg-blue-500 shadow hover:bg-blue-600"
          onClick={handlePlusClick}
        >
          <Plus className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* 如果正在创建，就在右下角显示一个小面板/或弹窗 */}
      {isCreating && (
        <div className="fixed bottom-16 right-4 w-80 max-w-full p-4 bg-white rounded shadow-md z-[61]">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-sm font-medium text-gray-700">
              Create a new treasure
            </h2>
            <button onClick={handleCancel}>
              <X className="h-5 w-5 text-gray-600 hover:text-gray-800" />
            </button>
          </div>
          <TreasureCreationForm
            map={map}
            latitude={latitude}
            longitude={longitude}
            setLatitude={setLatitude}
            setLongitude={setLongitude}
            onCancel={handleCancel}
            onMarkerDragEnd={handleMarkerDragEnd}
          />
        </div>
      )}

        {/* 添加匹配Modal */}
        <MatchModal 
        isOpen={isMatchModalOpen} 
        onClose={() => setIsMatchModalOpen(false)} 
      />
    </>
  );
}
