import Markdown, { getDocsList } from "@/components/Markdown";
import Link from "next/link";

export default function Writing({ params }: { params: { slug: string } }) {
  const docsList = getDocsList();
  let { slug } = params;
  slug = decodeURIComponent(slug);
  return (
    <main className="flex w-full h-screen box-border">
      <div className="overflow-y-auto flex-col hidden bg-zinc-50 lg:flex lg:flex-col lg:border-r flex-grow lg:max-w-96">
        <div className="sticky top-0 z-10 border-b bg-zinc-50 px-5 py-4 text-sm font-semibold tracking-tight">
          📝 时间笔记-记录日常
        </div>
        <div className="bg-zinc-50 p-3">
          <div className="flex flex-col gap-1 text-sm">
            {docsList.map((navItem) => {
              const selectedClasses =
                slug === navItem.name
                  ? "bg-black text-white"
                  : "hover:bg-gray-200";
              const commonClasses =
                "flex flex-col gap-1 transition-colors duration-300 hover:bg-gray-200 rounded-lg p-2";
              return (
                <Link
                  key={navItem.name}
                  href={`/writing/${navItem.name}`}
                  className={`${commonClasses} ${selectedClasses}`}
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
      <div className="pt-[6rem] h-fit sm:h-auto md:h-auto lg:h-auto px-[2rem] pb-[4rem] flex-[20] overflow-y-auto bg-white">
        <Markdown blogName={slug} />
      </div>
    </main>
  );
}
