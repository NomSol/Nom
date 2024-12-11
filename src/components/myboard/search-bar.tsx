"use client";

import React from "react";

export function SearchBar() {
    const handleSearch = () => {
        console.log("搜索按钮点击");
        // 在这里添加搜索逻辑
    };

    return (
        <div className="relative w-full">
            <input
                type="search"
                placeholder="搜索笔记..."
                className="w-full px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={handleSearch}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500 hover:text-gray-700"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zM11 8a5 5 0 11-10 0 5 5 0 0110 0z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
        </div>
    );
}