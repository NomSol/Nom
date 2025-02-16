import React from "react";
import { Treasure } from "@/types/treasure";

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-2xl w-[90%] max-w-md p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="space-y-6">
          {/* Energy Consumption */}
          <p className="text-center text-gray-600 text-lg">
            Energy Consumption: {treasure.points || 4}
          </p>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">
              {treasure.name || "Treasure Title"}
            </h2>
            <p className="text-gray-500 text-xl">
              {treasure.description || "Description"}
            </p>
          </div>

          {/* Stats */}
          <div className="space-y-3 text-xl">
            <p>Difficulty: Medium</p>
            <p>Total Collects: 105</p>
            <p>Rate: 8/10</p>
          </div>

          {/* Owner Info */}
          <div className="space-y-1">
            <p className="text-xl font-bold">
              OWNER: {treasure.creator_id || "@CATHER1"}
            </p>
            <p className="text-blue-500 text-lg">
              {treasure.hint || "chance to discover AR crypto airdrop today"}
            </p>
          </div>

          <PawIcon />

          {/* Navigation Button */}
          <button
            onClick={onNavigate}
            className="w-full bg-green-400 text-white py-4 rounded-xl text-xl font-semibold hover:bg-green-500 transition-colors mt-8"
          >
            GO!
          </button>
          {/* <button
            onClick={() => {
              onClose(); // Close the detail panel
              onNavigate(); // Start navigation
            }}
            className="w-full bg-green-400 text-white py-4 rounded-xl text-xl font-semibold hover:bg-green-500 transition-colors mt-8"
          >
            GO!
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default TreasureDetail;
