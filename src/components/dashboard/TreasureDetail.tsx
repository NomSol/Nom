import React from "react";
import { Treasure } from "@/types/treasure";
import Image from "next/image";

interface TreasureDetailProps {
  treasure: Treasure;
  onClose: () => void;
  onNavigate: () => void;
}

export const TreasureDetail: React.FC<TreasureDetailProps> = ({
  treasure,
  onClose,
  onNavigate,
}) => {
  const PawIcon = () => (
    <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="24" cy="24" r="24" fill="#FF6B6B" opacity="0.1" />
        <path
          d="M32 21.5C32 22.88 30.88 24 29.5 24C28.12 24 27 22.88 27 21.5C27 20.12 28.12 19 29.5 19C30.88 19 32 20.12 32 21.5Z"
          fill="#FF6B6B"
        />
        <path
          d="M25 19.5C25 20.88 23.88 22 22.5 22C21.12 22 20 20.88 20 19.5C20 18.12 21.12 17 22.5 17C23.88 17 25 18.12 25 19.5Z"
          fill="#FF6B6B"
        />
        <path
          d="M18 21.5C18 22.88 16.88 24 15.5 24C14.12 24 13 22.88 13 21.5C13 20.12 14.12 19 15.5 19C16.88 19 18 20.12 18 21.5Z"
          fill="#FF6B6B"
        />
        <path
          d="M29 29.7C29 32.72 26.52 35 23.5 35C20.48 35 18 32.72 18 29.7C18 26.68 20.48 24 23.5 24C26.52 24 29 26.68 29 29.7Z"
          fill="#FF6B6B"
        />
      </svg>
    </div>
  );

  // 计算随机难度
  const difficultyLevel = ["Easy", "Medium", "Hard"];
  const randomDifficulty = difficultyLevel[Math.floor(Math.random() * 3)];

  // 随机收集次数和评分
  const collectCount = Math.floor(Math.random() * 200) + 50;
  const rating = (Math.floor(Math.random() * 30) + 70) / 10; // 7.0 到 10.0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
      <div
        className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
        style={{
          background:
            "linear-gradient(to bottom, white, white 70%, rgba(255, 240, 195, 0.2))",
        }}
      >
        {/* 关闭按钮 - 更现代的设计 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18"
              stroke="#666"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 6L18 18"
              stroke="#666"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* 宝藏图片 */}
        <div className="w-full h-60 relative bg-gray-100">
          {treasure.image_url ? (
            <div className="w-full h-full relative">
              <Image
                src={treasure.image_url}
                alt={treasure.name || "Treasure"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
              {/* 添加金色光晕效果 */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(255, 215, 140, 0.3) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              ></div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-amber-50 to-orange-50">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(255, 215, 140, 0.4) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              ></div>
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 15.9999V7.9999C20.9996 7.64918 20.9071 7.30471 20.7315 7.00106C20.556 6.69742 20.3037 6.44526 20 6.2699L13 2.2699C12.696 2.09437 12.3511 2.00152 12 2.00152C11.6489 2.00152 11.304 2.09437 11 2.2699L4 6.2699C3.69626 6.44526 3.44398 6.69742 3.26846 7.00106C3.09294 7.30471 3.00036 7.64918 3 7.9999V15.9999C3.00036 16.3506 3.09294 16.6951 3.26846 16.9987C3.44398 17.3024 3.69626 17.5545 4 17.7299L11 21.7299C11.304 21.9054 11.6489 21.9983 12 21.9983C12.3511 21.9983 12.696 21.9054 13 21.7299L20 17.7299C20.3037 17.5545 20.556 17.3024 20.7315 16.9987C20.9071 16.6951 20.9996 16.3506 21 15.9999Z"
                  stroke="#D97706"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3.27002 6.96L12 12.01L20.73 6.96"
                  stroke="#D97706"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 22.08V12"
                  stroke="#D97706"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}

          {/* 能量消耗指示器 - 直接放在图片上 */}
          <div className="absolute left-4 bottom-4 bg-white bg-opacity-90 px-3 py-1 rounded-full shadow-md flex items-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="mr-1 text-yellow-500"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-gray-800 font-medium">
              Energy: {treasure.points || 4}
            </span>
          </div>
        </div>

        <div
          className="p-6 space-y-5"
          style={{
            background:
              "linear-gradient(to bottom, white, rgba(255, 248, 230, 0.2))",
          }}
        >
          {/* 宝藏标题和描述 */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {treasure.name || "Treasure Title"}
            </h2>
            <p className="text-gray-600">
              {treasure.description ||
                "An amazing treasure waiting to be found."}
            </p>
          </div>

          {/* 宝藏信息卡片 */}
          <div className="bg-gray-50 p-4 rounded-xl shadow-inner">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Difficulty</p>
                <p className="font-semibold text-sm">{randomDifficulty}</p>
              </div>
              <div className="text-center border-x border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Collects</p>
                <p className="font-semibold text-sm">{collectCount}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">Rating</p>
                <p className="font-semibold text-sm">{rating.toFixed(1)}/10</p>
              </div>
            </div>
          </div>

          {/* 提示信息已被移除 */}

          {/* 导航按钮 */}
          <button
            onClick={onNavigate}
            className="w-full bg-green-500 text-white py-4 rounded-xl text-2xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="mr-2"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 16L16 12L12 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 12H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            GO!
          </button>
        </div>
      </div>
    </div>
  );
};

export default TreasureDetail;
