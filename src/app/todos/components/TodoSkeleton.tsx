export const TodoSkeleton = () => {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="h-5 w-32 bg-gray-100 rounded"></div>
                    <div className="h-5 w-16 bg-gray-100 rounded"></div>
                </div>
                <div className="h-3 w-full bg-gray-100 rounded"></div>
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <div className="h-6 w-12 bg-gray-100 rounded"></div>
                        <div className="h-6 w-12 bg-gray-100 rounded"></div>
                    </div>
                    <div className="h-6 w-24 bg-gray-100 rounded"></div>
                </div>
            </div>
        </div>
    );
}; 