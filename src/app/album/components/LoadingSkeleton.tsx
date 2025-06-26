import React from 'react';

const LoadingSkeleton: React.FC = () => {
    return (
        <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-8 px-8">
            <div className="animate-pulse">
                {/* 标题骨架 */}
                <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>

                {/* 描述骨架 */}
                <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>

                {/* 照片网格骨架 */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }, (_, i) => (
                        <div
                            key={i}
                            className="bg-gray-200 rounded-xl pb-[66.67%] relative"
                            style={{ animationDelay: `${i * 0.1}s` }}
                        />
                    ))}
                </div>
            </div>
        </main>
    );
};

export default React.memo(LoadingSkeleton); 