import { getDocsList } from "@/components/Markdown";
import Link from "next/link";

export default function Writing() {
  const docsList = getDocsList();
  return (
    <main className="flex h-screen w-full box-border">
      <div className="overflow-y-auto relative w-full flex-col hidden bg-zinc-50 lg:flex lg:flex-col lg:border-r lg:w-80 xl:w-96">
        <div className="sticky top-0 z-10 border-b bg-zinc-50 px-5 py-3 text-sm font-semibold tracking-tight">
          📝 时间笔记-记录日常
        </div>
        <div className="bg-zinc-50 p-3">
          <div className="flex flex-col gap-1 text-sm">
            {docsList.map((navItem) => {
              const commonClasses =
                "flex flex-col gap-1 transition-colors duration-300 hover:bg-gray-200 rounded-lg p-2";
              return (
                <Link
                  key={navItem.name}
                  href={`/writing/${navItem.name}`}
                  className={`${commonClasses}`}
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
      <div className="bg-dots bg-dots-size bg-dots-position flex-1"></div>
    </main>
  );
}
