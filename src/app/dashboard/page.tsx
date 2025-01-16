"use client";

import { Suspense } from 'react';
import { SidebarProvider } from "@/components/dashboard/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { SearchBar } from '@/components/myboard/search-bar';
import { MainContent } from '@/components/myboard/main-content';
import { TabComponent } from "@/components/myboard/tab";
import LoadingProfile from '@/components/myboard/loading-profile';
import LoadingTabs from '@/components/myboard/loading-tabs';

function DashboardPage() {
    return (
        <div className="min-h-screen">
            <SidebarProvider>
                <div className="flex">
                    <div className="fixed inset-y-0 left-0 z-40">
                        <AppSidebar />
                    </div>

                    <main className="flex-1 ml-[280px] min-h-screen">
                        <div className="container mx-auto px-4 py-6 max-w-5xl">
                            <div className="mb-6">
                                <SearchBar />
                            </div>

                            <div className="bg-white rounded-lg shadow">
                                <Suspense
                                    fallback={
                                        <div className="w-full">
                                            <LoadingProfile />
                                        </div>
                                    }
                                >
                                    <MainContent />
                                </Suspense>
                            </div>

                            <div className="mt-6">
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

export default DashboardPage;