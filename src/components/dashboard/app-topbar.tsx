"use client";

import { useSidebar } from "./sidebar";
import { useUserGameProps } from "@/hooks/use-usergameprops";
import { Cat, Star, Coins, CircleDot, Battery } from "lucide-react";
import { BsList } from "react-icons/bs";
import { WalletStatus } from "@/components/wallet-status";

export function AppTopbar() {
  const { open, toggleSidebar } = useSidebar();
  const { gameProps, isLoading } = useUserGameProps();

  const formatNumber = (num: number | undefined | null) => {
    if (num === undefined || num === null) return "0";
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + "k";
    }
    return num.toString();
  };

  return (
    <div
      className={`absolute top-0 left-0 z-[51] flex w-full items-center justify-between bg-white p-2 transition-all duration-300 ${open ? "h-0 opacity-0" : "h-16 opacity-100"
        }`}
    >
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
        >
          <BsList size={24} />
        </button>
        <div className="font-bold">NOM Dashboard</div>
      </div>

      <div className="mr-4 flex items-center">
        <WalletStatus />
      </div>
    </div>
  );
}
