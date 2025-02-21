// components/dashboard/MatchModal.tsx

import { X } from "lucide-react";
import MatchMaking from "@/components/match/match-making";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MatchModal({ isOpen, onClose }: MatchModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* 半透明背景，点击时关闭modal */}
      <div 
        className="absolute inset-0 bg-black/30" 
        onClick={onClose}
      />
      
      {/* 匹配界面容器 */}
      <div className="relative w-full max-w-xl mx-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl z-[101]">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
        
        {/* 匹配组件 */}
        <div className="p-4">
          <MatchMaking />
        </div>
      </div>
    </div>
  );
}