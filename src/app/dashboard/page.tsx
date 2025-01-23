"use client";

import { Suspense } from 'react';
import { SidebarProvider } from "@/components/dashboard/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SearchBar } from '@/components/myboard/search-bar';
import { MainContent } from '@/components/myboard/main-content';
import { TabComponent } from "@/components/myboard/tab";
import LoadingProfile from '@/components/myboard/loading-profile';
import LoadingTabs from '@/components/myboard/loading-tabs';

export default async function DashboardPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <SidebarProvider>
                <div className="flex min-h-screen">
                    {/* 侧边栏固定宽度 */}
                    <div className="fixed inset-y-0 left-0 z-40 hidden md:block w-[280px]">
                        <AppSidebar />
                    </div>

                    {/* 主内容区域 - 调整左边距以匹配侧边栏宽度 */}
                    <main className="flex-1 w-full md:pl-[280px] min-h-screen transition-all duration-300 ease-in-out">
                        <div className="w-full px-2 sm:px-4 py-2 sm:py-6">
                            <div className="mb-4 sm:mb-6">
                                <SearchBar />
                            </div>

                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg overflow-hidden">
                                <Suspense fallback={<LoadingProfile />}>
                                    <MainContent />
                                </Suspense>
                            </div>

                            <div className="mt-2 sm:mt-6">
                                <Suspense fallback={<LoadingTabs />}>
                                    <TabComponent />
                                </Suspense>
                            </div>
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        </div>
    );
}