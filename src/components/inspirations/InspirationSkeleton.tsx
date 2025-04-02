import React from 'react';

interface InspirationSkeletonProps {
  itemCount?: number;
}

/**
 * 灵感笔记加载骨架屏组件
 */
export const InspirationSkeleton: React.FC<InspirationSkeletonProps> = ({
  itemCount = 3
}) => {
  return (
    <main className="flex-1 h-screen overflow-hidden">
      <div className="h-full overflow-y-auto px-4 sm:px-4 py-4 sm:py-16">
        <div className="w-full max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            {Array.from({ length: itemCount }).map((_, i) => (
              <div key={i} className="mb-8">
                <div className="h-24 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default InspirationSkeleton;
