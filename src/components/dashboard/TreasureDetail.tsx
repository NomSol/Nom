import React, { useMemo } from "react";
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
  // Pawprint icon for visual indication
  const PawIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-amber-500"
    >
      <path
        d="M10.5 11.5C10.5 12.3284 9.82843 13 9 13C8.17157 13 7.5 12.3284 7.5 11.5C7.5 10.6716 8.17157 10 9 10C9.82843 10 10.5 10.6716 10.5 11.5Z"
        fill="currentColor"
      />
      <path
        d="M15 13C15.8284 13 16.5 12.3284 16.5 11.5C16.5 10.6716 15.8284 10 15 10C14.1716 10 13.5 10.6716 13.5 11.5C13.5 12.3284 14.1716 13 15 13Z"
        fill="currentColor"
      />
      <path
        d="M10.5 17.5C10.5 18.3284 9.82843 19 9 19C8.17157 19 7.5 18.3284 7.5 17.5C7.5 16.6716 8.17157 16 9 16C9.82843 16 10.5 16.6716 10.5 17.5Z"
        fill="currentColor"
      />
      <path
        d="M15 19C15.8284 19 16.5 18.3284 16.5 17.5C16.5 16.6716 15.8284 16 15 16C14.1716 16 13.5 16.6716 13.5 17.5C13.5 18.3284 14.1716 19 15 19Z"
        fill="currentColor"
      />
      <path
        d="M18.5 13C17.1193 13 16 11.8807 16 10.5C16 9.11929 17.1193 8 18.5 8C19.8807 8 21 9.11929 21 10.5C21 11.8807 19.8807 13 18.5 13Z"
        fill="currentColor"
      />
      <path
        d="M18.5 21C17.1193 21 16 19.8807 16 18.5C16 17.1193 17.1193 16 18.5 16C19.8807 16 21 17.1193 21 18.5C21 19.8807 19.8807 21 18.5 21Z"
        fill="currentColor"
      />
      <path
        d="M5.5 13C4.11929 13 3 11.8807 3 10.5C3 9.11929 4.11929 8 5.5 8C6.88071 8 8 9.11929 8 10.5C8 11.8807 6.88071 13 5.5 13Z"
        fill="currentColor"
      />
      <path
        d="M5.5 21C4.11929 21 3 19.8807 3 18.5C3 17.1193 4.11929 16 5.5 16C6.88071 16 8 17.1193 8 18.5C8 19.8807 6.88071 21 5.5 21Z"
        fill="currentColor"
      />
    </svg>
  );

  // Generate random difficulty, collect count, and rating for visual enhancement
  const randomDifficulty = useMemo(() => {
    const difficulties = ["Easy", "Medium", "Hard", "Expert"];
    return difficulties[Math.floor(Math.random() * difficulties.length)];
  }, []);

  const collectCount = useMemo(() => Math.floor(Math.random() * 1000), []);
  const rating = useMemo(() => 7 + Math.random() * 3, []); // Random rating between 7-10

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-xl animate-fade-in-up relative max-h-[90vh] overflow-y-auto">
        {/* Close button - Modern design */}
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

        {/* Treasure image */}
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
              {/* Add golden glow effect */}
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

          {/* Energy consumption indicator - directly on the image */}
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
          {/* Treasure title and description */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {treasure.name || "Treasure Title"}
            </h2>
            <p className="text-gray-600">
              {treasure.description ||
                "An amazing treasure waiting to be found."}
            </p>
          </div>

          {/* Treasure info card */}
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

          {/* Hint information has been removed */}

          {/* Navigation button */}
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
