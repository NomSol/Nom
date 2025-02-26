"use client";
import React, { useState, useEffect } from "react";
import { Search, ChevronRight, ChevronDown } from "lucide-react";
import { useSidebar } from "./sidebar";

// Mock data - replace with actual data fetching
const mockFindings = [
  { id: "1", name: "Historic Landmark", foundDate: "2024-02-10", points: 150 },
  { id: "2", name: "Hidden Statue", foundDate: "2024-02-15", points: 200 },
  { id: "3", name: "Secret Garden", foundDate: "2024-02-18", points: 180 },
];

export function MyFindings() {
  const { open, openMobile, isMobile } = useSidebar();
  const isSidebarOpen = isMobile ? openMobile : open;
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [findings, setFindings] = useState(mockFindings);

  // Auto-collapse when sidebar is closed
  useEffect(() => {
    if (!isSidebarOpen) {
      setIsCollapsed(true);
    }
  }, [isSidebarOpen]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="rounded-lg overflow-hidden shadow-sm mx-2 mt-2">
      <div
        className="flex items-center justify-between py-3 px-4 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={toggleCollapse}
      >
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-600" />
          <h2 className="text-sm font-medium text-gray-700">My Findings</h2>
        </div>
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        )}
      </div>

      {/* Collapsible content */}
      {!isCollapsed && (
        <div className="border-t border-gray-100">
          <div className="bg-white p-3">
            <div className="mb-3">
              <span className="text-xs text-gray-500">
                Treasures you've discovered:
              </span>
            </div>

            {/* Findings list with custom scrollbar */}
            <div className="max-h-64 overflow-y-auto border rounded-lg scrollbar-container">
              <ul className="text-sm space-y-2 p-2">
                {findings && findings.length > 0 ? (
                  findings.map((f) => (
                    <li
                      key={f.id}
                      className="flex flex-col border rounded-lg p-3 hover:bg-gray-50 border-gray-200 cursor-pointer transition-all duration-300"
                    >
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-800">
                          {f.name}
                        </span>
                        <span className="text-green-600 font-medium">
                          +{f.points} pts
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">
                        Found on: {new Date(f.foundDate).toLocaleDateString()}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-center py-3 text-gray-500">
                    No findings yet. Explore more!
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .scrollbar-container {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e0 #edf2f7;
        }

        .scrollbar-container::-webkit-scrollbar {
          width: 6px;
        }

        .scrollbar-container::-webkit-scrollbar-track {
          background: #edf2f7;
          border-radius: 3px;
        }

        .scrollbar-container::-webkit-scrollbar-thumb {
          background-color: #cbd5e0;
          border-radius: 3px;
        }

        .scrollbar-container::-webkit-scrollbar-thumb:hover {
          background-color: #a0aec0;
        }
      `}</style>
    </div>
  );
}
