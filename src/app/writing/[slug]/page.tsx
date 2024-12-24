import Markdown, { getDocsList } from "@/components/Markdown";
import Link from "next/link";

export default function Writing({ params }: { params: { slug: string } }) {
  const docsList = getDocsList();
  let { slug } = params;
  slug = decodeURIComponent(slug);
  return (
    <main className="flex flex-col lg:flex-row w-full h-screen box-border">
      {/* Mobile header with back button */}
      <div className="lg:hidden sticky top-0 z-20 border-b bg-zinc-50 px-4 py-3 flex items-center">
        <Link href="/writing" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          <span className="inline-flex items-center text-gray-400 text-base leading-none relative top-[1px]">←</span>
          返回文章列表
        </Link>
      </div>

      {/* Sidebar - hidden on mobile */}
      <div className="overflow-y-auto flex-col hidden bg-zinc-50 lg:flex lg:flex-col lg:border-r flex-grow lg:max-w-96">
        <div className="sticky top-0 z-10 border-b bg-zinc-50 px-5 py-4">
          <div className="flex items-center">
            <span className="text-sm font-semibold tracking-tight">📝 时间笔记-记录日常</span>
          </div>
        </div>
        <div className="bg-zinc-50 p-3">
          <div className="flex flex-col gap-1 text-sm">
            {docsList.map((navItem) => {
              const commonClasses = `flex flex-col gap-1 transition-colors duration-300 rounded-lg p-2`
              const selectedClasses = `${commonClasses} bg-black text-white`
              const hoverClasses =
                `${commonClasses} hover:bg-gray-200`;
              return (
                <Link
                  key={navItem.name}
                  href={`/writing/${navItem.name}`}
                  className={slug === navItem.name ? selectedClasses : hoverClasses}
                >
                  <span className="font-medium">{navItem.name}</span>
                  <time
                    className="transition-colors duration-300 text-slate-500"
                    dateTime={navItem.lastModified.toISOString()}
                  >
                    {navItem.lastModified.toDateString()}
                  </time>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pt-4 lg:pt-[6rem] px-4 lg:px-[2rem] pb-[4rem] flex-[20] overflow-y-auto bg-white">
        <Markdown blogName={slug} />
      </div>
    </main>
  );
}
