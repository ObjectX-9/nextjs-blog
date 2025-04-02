import { Skeleton } from "@/components/ui/skeleton";

export function BookmarksSkeleton({ isMobile = false }: { isMobile?: boolean }) {
  if (isMobile) {
    return (
      <div className="p-4">
        <Skeleton className="h-10 w-32 mb-6" />
        <div className="space-y-2">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="w-full h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* 侧边栏骨架屏 */}
      <aside className="w-64 border-r bg-white">
        <div className="p-4 space-y-2">
          {[...Array(8)].map((_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </aside>

      {/* 主内容区骨架屏 */}
      <main className="flex-1 p-8">
        <Skeleton className="h-10 w-48 mb-6" />
        <div className="grid grid-cols-2 gap-6 w-full">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
