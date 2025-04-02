export default function Loading() {
    return (
        <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-8 px-8">
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse mb-24"></div>

            <div className="w-full max-w-3xl my-0 mx-auto">
                {/* 作者介绍骨架屏 */}
                <div className="animate-pulse mb-8">
                    <div className="flex items-center mb-4">
                        <div className="h-20 w-20 bg-gray-200 rounded-full mr-4"></div>
                        <div className="space-y-2">
                            <div className="h-6 bg-gray-200 rounded w-32"></div>
                            <div className="h-4 bg-gray-200 rounded w-48"></div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                </div>

                <div className="max-w-2xl">
                    {/* 社交账号骨架屏 */}
                    <div className="mb-8 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                        <div className="flex flex-wrap gap-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-8 w-24 bg-gray-200 rounded-full"></div>
                            ))}
                        </div>
                    </div>

                    {/* 运行信息骨架屏 */}
                    <div className="mb-8 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    </div>

                    {/* 网站信息骨架屏 */}
                    <div className="mb-8 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>

                    {/* 教育经历骨架屏 */}
                    <div className="mb-8 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                        <div className="space-y-4">
                            <div className="h-16 bg-gray-200 rounded"></div>
                            <div className="h-16 bg-gray-200 rounded"></div>
                        </div>
                    </div>

                    {/* 工作经历骨架屏 */}
                    <div className="mb-8 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                        <div className="space-y-4">
                            <div className="h-24 bg-gray-200 rounded"></div>
                            <div className="h-24 bg-gray-200 rounded"></div>
                            <div className="h-24 bg-gray-200 rounded"></div>
                        </div>
                    </div>

                    {/* 技术文章骨架屏 */}
                    <div className="animate-pulse mt-8">
                        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex space-x-3">
                                    <div className="h-16 w-16 bg-gray-200 rounded"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>


        </main>
    );
}