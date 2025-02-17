"use client";

import { useSession } from "next-auth/react";
import { useSidebar } from "./sidebar";
import { Cat, Star, Coins, CircleDot } from "lucide-react";

export function AppTopbar() {
  const { open, openMobile, isMobile, toggleSidebar } = useSidebar();
  const isSidebarOpen = isMobile ? openMobile : open;

  return (
    <div className="fixed top-0 left-0 z-50 p-3">
      {/* Content area on the left: contains cat buttons and data indicators */}
      <div className="flex items-center gap-3">
        {/* Cat Button Container */}
        <div className="rounded-full bg-gray-900/30 backdrop-blur-sm border border-white/10">
          <button
            className="p-2 transition-colors hover:bg-white/10 rounded-full"
            onClick={toggleSidebar}
          >
            <Cat className="h-5 w-5 text-white" strokeWidth={2.5} />
          </button>
        </div>

        {/* Data indicator part */}
        {!isSidebarOpen && (
          <div className="flex items-center gap-2 rounded-full bg-gray-900/30 backdrop-blur-sm border border-white/10 px-3 py-1.5">
            <div className="flex items-center gap-1.5">
              <Star
                className="h-4 w-4 text-amber-400"
                fill="currentColor"
                strokeWidth={0.5}
              />
              <span className="text-sm font-medium text-white">323</span>
            </div>
            <div className="h-3 w-px bg-white/20" />
            <div className="flex items-center gap-1.5">
              <Coins className="h-4 w-4 text-amber-500" strokeWidth={2} />
              <span className="text-sm font-medium text-white">8.2k</span>
            </div>
            <div className="h-3 w-px bg-white/20" />
            <div className="flex items-center gap-1.5">
              <CircleDot className="h-4 w-4 text-blue-400" strokeWidth={2.5} />
              <span className="text-sm font-medium text-white">12.5</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
