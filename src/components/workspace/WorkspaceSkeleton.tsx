import { Skeleton } from "@/components/ui/skeleton";

export function WorkspaceSkeleton() {
  return (
    <div className="w-full">
      {/* 标题骨架屏 */}
      <Skeleton className="h-10 w-48 mb-6" />
      
      {/* 描述骨架屏 */}
      <Skeleton className="h-6 w-full max-w-md mb-6" />
      
      {/* 图片骨架屏 */}
      <div className="mx-6 mb-4 flex snap-x snap-mandatory gap-6 overflow-x-scroll pb-4 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:overflow-x-auto md:pb-0">
        <Skeleton className="w-2/3 md:w-full h-96 md:h-72 snap-center rounded-md" />
        <Skeleton className="w-2/3 md:w-full h-96 md:h-72 snap-center rounded-md" />
      </div>
      
      {/* 表格骨架屏 */}
      <div className="border border-gray-200 rounded-xl mt-4">
        <div className="p-4">
          <div className="space-y-4">
            {/* 表头骨架屏 */}
            <div className="flex border-b pb-2">
              <Skeleton className="h-8 w-1/3 mr-4" />
              <Skeleton className="h-8 w-1/3 mr-4" />
              <Skeleton className="h-8 w-1/3" />
            </div>
            
            {/* 表格行骨架屏 */}
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex py-3">
                <Skeleton className="h-6 w-1/3 mr-4" />
                <Skeleton className="h-6 w-1/3 mr-4" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
