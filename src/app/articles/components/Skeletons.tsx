export const ArticleSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div key={i} className="p-4 border-b border-gray-100 last:border-b-0">
        <div className="space-y-3">
          {/* 标题骨架 */}
          <div className="space-y-2">
            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-full animate-pulse bg-[length:200%_100%]"></div>
            <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-md w-3/4 animate-pulse bg-[length:200%_100%]"></div>
          </div>

          {/* 摘要骨架 */}
          <div className="space-y-2">
            <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded w-full animate-pulse bg-[length:200%_100%]"></div>
            <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 rounded w-5/6 animate-pulse bg-[length:200%_100%]"></div>
          </div>

          {/* 底部信息骨架 */}
          <div className="flex items-center justify-between">
            <div className="h-3 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded w-20 animate-pulse bg-[length:200%_100%]"></div>
            <div className="flex items-center space-x-3">
              <div className="h-3 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded w-8 animate-pulse bg-[length:200%_100%]"></div>
              <div className="h-3 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded w-8 animate-pulse bg-[length:200%_100%]"></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ArticleSkeletonDesktop = () => (
  <div className="space-y-2">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div key={i} className="p-3 rounded-lg mb-2 bg-gray-50/50 border border-gray-100/50 hover:bg-gray-50 transition-colors">
        <div className="space-y-2">
          {/* 标题骨架 */}
          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-150 to-gray-200 rounded w-4/5 animate-pulse bg-[length:200%_100%]"></div>

          {/* 底部信息骨架 */}
          <div className="flex items-center justify-between">
            <div className="h-3 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded w-24 animate-pulse bg-[length:200%_100%]"></div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8">
                <div className="h-3 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded w-6 animate-pulse bg-[length:200%_100%]"></div>
              </div>
              <div className="flex items-center justify-center w-8">
                <div className="h-3 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded w-6 animate-pulse bg-[length:200%_100%]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const CategorySkeleton = () => (
  <div className="h-full bg-white">
    <div className="p-4 border-b border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-150 to-gray-200 rounded-lg w-24 animate-pulse bg-[length:200%_100%]"></div>
        <div className="h-4 w-4 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded animate-pulse bg-[length:200%_100%]"></div>
      </div>
    </div>

    <div className="p-4 space-y-2">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="pl-2 pr-2 pt-2 pb-2 rounded-lg hover:bg-gray-50 transition-colors group">
          <div className="flex items-center justify-between min-h-[40px]">
            <div className="flex items-center gap-2 flex-1">
              <div className="space-y-1 flex-1">
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-150 to-gray-200 rounded w-3/4 animate-pulse bg-[length:200%_100%]"></div>
                <div className="flex gap-2">
                  <div className="h-3 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded w-12 animate-pulse bg-[length:200%_100%]"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded w-8 animate-pulse bg-[length:200%_100%]"></div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded w-8 animate-pulse bg-[length:200%_100%]"></div>
              <div className="h-3 w-3 bg-gradient-to-r from-gray-150 via-gray-100 to-gray-150 rounded animate-pulse bg-[length:200%_100%]"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
