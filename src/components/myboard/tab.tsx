"use client";
import React, { useState } from "react";
import { Notes } from "./notes";
import TreasuresPage from '../../app/main/treasures/page';

export const TabComponent = () => {
    // 当前激活的标签索引
    const [activeTab, setActiveTab] = useState("notes");

    // 标签内容映射
    const renderContent = () => {
        switch (activeTab) {
            case "notes":
                return < TreasuresPage />;
            case "collections":
                return <div>这是收藏的内容</div>;
            case "likes":
                return <div>这是点赞的内容</div>;
            default:
                return null;
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* 标签导航 */}
            <div
                className="flex justify-center items-center border-b"
                style={{ width: "100%", padding: "8px 0" }}
            >
                {/* 笔记 Tab */}
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
                    笔记
                </div>

                {/* 收藏 Tab */}
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
                        收藏
                    </div>
                </div>

                {/* 点赞 Tab */}
                <div
                    className={`sub-tab-list cursor-pointer ${activeTab === "likes" ? "text-blue-600 font-bold" : "text-gray-600"
                        }`}
                    style={{
                        padding: "8px 16px",
                        fontSize: "16px",
                    }}
                    onClick={() => setActiveTab("likes")}
                >
                    点赞
                </div>
            </div>

            {/* 激活标签的底部高亮线 */}
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

            {/* 标签内容 */}
            <div className="tab-content mt-4 text-center">{renderContent()}</div>
        </div>
    );
};

export default TabComponent;