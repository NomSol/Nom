"use client";

import { useSession } from "next-auth/react";
import { useSidebar } from "./sidebar";
import { useUserGameProps } from "@/hooks/use-usergameprops";
import { Cat, Star, Coins, CircleDot, Battery } from "lucide-react";

export function AppTopbar() {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar();
  const { gameProps, isLoading } = useUserGameProps();
  const isSidebarOpen = isMobile ? openMobile : open;

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return "0";
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  return (
    <div className="fixed top-0 left-0 z-50 p-3">
      {/* Content area on the left: contains cat buttons and data indicators */}
      <div className="flex items-center gap-3">
        {/* Cat Button Container - Always visible */}
        <div className="rounded-full shadow-md bg-gray-200 flex items-center justify-center w-10 h-10">
          <button
            className="w-full h-full flex items-center justify-center transition-colors hover:bg-gray-300 rounded-full"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            <Cat className="h-6 w-6 text-gray-600" strokeWidth={2} />
          </button>
        </div>

        {/* Data indicator part - Only show when sidebar is closed */}
        {!isSidebarOpen && !isLoading && gameProps && (
          <div className="flex items-center gap-2 rounded-full bg-gray-900/30 backdrop-blur-sm border border-white/10 px-3 py-1.5">
            {/* Energy */}
            <div className="flex items-center gap-1.5">
              <Battery className="h-4 w-4 text-green-400" strokeWidth={2} />
              <span className="text-sm font-medium text-white">
                {gameProps.energy || "100"}
              </span>
            </div>
            <div className="h-3 w-px bg-white/20" />

            {/* XP */}
            <div className="flex items-center gap-1.5">
              <Star
                className="h-4 w-4 text-amber-400"
                fill="currentColor"
                strokeWidth={0.5}
              />
              <span className="text-sm font-medium text-white">
                {formatNumber(gameProps.xp)}
              </span>
            </div>
            <div className="h-3 w-px bg-white/20" />

            {/* Coins */}
            <div className="flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-amber-500" strokeWidth={2} />
              <span className="text-sm font-medium text-white">
                {formatNumber(gameProps.coins)}
              </span>
            </div>
            <div className="h-3 w-px bg-white/20" />

            {/* Balance */}
            <div className="flex items-center gap-1.5">
              <CircleDot className="h-4 w-4 text-blue-400" strokeWidth={2.5} />
              <span className="text-sm font-medium text-white">
                {formatNumber(gameProps.balance)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
