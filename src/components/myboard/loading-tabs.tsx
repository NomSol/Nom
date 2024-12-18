// src/components/myboard/loading-tabs.tsx
export default function LoadingTabs() {
    return (
        <div className="animate-pulse">
            <div className="flex gap-4 border-b pb-4">
                <div className="h-8 bg-gray-200 rounded w-20" />
                <div className="h-8 bg-gray-200 rounded w-20" />
                <div className="h-8 bg-gray-200 rounded w-20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 bg-gray-200 rounded" />
                ))}
            </div>
        </div>
    );
}