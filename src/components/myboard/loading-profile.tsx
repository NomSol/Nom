export default function LoadingProfile() {
    return (
        <div className="w-full animate-pulse p-6">
            <div className="flex items-start space-x-10">
                <div className="flex-shrink-0">
                    <div className="w-36 h-36 bg-gray-200 rounded-full" />
                </div>

                <div className="flex-1">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-4" />

                    <div className="flex gap-4 mb-4">
                        <div className="h-4 bg-gray-200 rounded w-32" />
                        <div className="h-4 bg-gray-200 rounded w-32" />
                    </div>

                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>

                    <div className="h-4 bg-gray-200 rounded w-64 mt-4" />

                    <div className="h-4 bg-gray-200 rounded w-40 mt-4" />
                </div>
            </div>
        </div>
    );
}


export function LoadingTabs() {
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