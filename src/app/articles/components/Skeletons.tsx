export const ArticleSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div key={i} className="p-3 border-b last:border-b-0">
        <div className="h-5 bg-gray-200 rounded w-4/5 mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-1/3"></div>
      </div>
    ))}
  </div>
);

export const ArticleSkeletonDesktop = () => (
  <div className="animate-pulse space-y-4">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div key={i} className="p-3 rounded-lg mb-2 bg-gray-50">
        <div className="h-5 bg-gray-200 rounded w-4/5 mb-2"></div>
        <div className="h-4 bg-gray-100 rounded w-1/3"></div>
      </div>
    ))}
  </div>
);

export const CategorySkeleton = () => (
  <div className="animate-pulse h-full">
    <div className="p-4 border-b">
      <div className="h-7 bg-gray-200 rounded w-1/2 mb-4"></div>
    </div>
    <div className="p-4 space-y-3">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="p-3 rounded-lg border border-gray-100">
          <div className="flex gap-1 mb-2">
            <div className="h-4 bg-gray-200 rounded w-12"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-5 bg-gray-100 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded w-8"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
