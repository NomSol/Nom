"use client";
import React, { useState } from "react";
import { Notes } from "./notes";
import TreasuresPage from '../../app/main/treasures/page';

export const TabComponent = () => {
    // Current active tab index
    const [activeTab, setActiveTab] = useState("notes");

    // Tab content mapping
    const renderContent = () => {
        switch (activeTab) {
            case "notes":
                return < TreasuresPage />;
            case "collections":
                return <div>Collection</div>;
            case "likes":
                return <div>Likes</div>;
            default:
                return null;
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Tab navigation */}
            <div
                className="flex justify-center items-center border-b"
                style={{ width: "100%", padding: "8px 0" }}
            >
                {/* Notes Tab */}
                <div
                    className={`sub-tab-list cursor-pointer ${activeTab === "notes" ? "text-blue-600 font-bold" : "text-gray-600"
                        }`}
                    style={{
                        padding: "8px 16px",
                        marginRight: "16px",
                        fontSize: "16px",
                    }}
                    onClick={() => setActiveTab("notes")}
                >
                    Post
                </div>

                {/* Collections Tab */}
                <div
                    className={`sub-tab-list cursor-pointer ${activeTab === "collections"
                        ? "text-blue-600 font-bold"
                        : "text-gray-600"
                        }`}
                    style={{
                        padding: "8px 16px",
                        marginRight: "16px",
                        fontSize: "16px",
                    }}
                    onClick={() => setActiveTab("collections")}
                >
                    <div className="flex items-center">
                        Collection
                    </div>
                </div>

                {/* Likes Tab */}
                <div
                    className={`sub-tab-list cursor-pointer ${activeTab === "likes" ? "text-blue-600 font-bold" : "text-gray-600"
                        }`}
                    style={{
                        padding: "8px 16px",
                        fontSize: "16px",
                    }}
                    onClick={() => setActiveTab("likes")}
                >
                    Likes
                </div>
            </div>

            {/* Bottom highlight line for active tab */}
            <div
                className="active-tag bg-blue-600"
                style={{
                    height: "2px",
                    width: "64px",
                    marginTop: "-2px",
                    transform: `${activeTab === "notes"
                        ? "translateX(-80px)"
                        : activeTab === "collections"
                            ? "translateX(0px)"
                            : "translateX(80px)"
                        }`,
                    transition: "transform 0.3s ease",
                }}
            ></div>

            {/* Tab content */}
            <div className="tab-content mt-4 text-center">{renderContent()}</div>
        </div>
    );
};

export default TabComponent;