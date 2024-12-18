// src/app/dashboard/loading.tsx
import LoadingProfile from '@/components/myboard/loading-profile';
import LoadingTabs from '@/components/myboard/loading-tabs';

export default function Loading() {
    return (
        <div className="min-h-screen">
            <div className="flex">
                <main className="flex-1 ml-[280px] min-h-screen">
                    <div className="container mx-auto px-4 py-6 max-w-5xl">
                        <div className="mb-6">
                            <div className="w-full h-10 bg-gray-200 rounded-full animate-pulse" />
                        </div>

                        <div className="bg-white rounded-lg shadow">
                            <LoadingProfile />
                        </div>

                        <div className="mt-6">
                            <LoadingTabs />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}