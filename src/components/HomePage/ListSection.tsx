import Link from "next/link";
import ViewCounter from "./ViewCounter";
import LikeButton from "./LikeButton";
import { Article } from "@/app/model/article";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

interface ListSectionProps {
  title: string;
  titleLink: string;
  items: Article[];
}

export const ListSection = ({ title, titleLink, items }: ListSectionProps) => {
  if (!items) return null;
  const isMobile = useDeviceDetection();
  return (
    <div className="w-full max-w-3xl my-0 mx-auto mt-10">
      <Link
        className="mb-4 mt-8 font-semibold cursor-pointer text-lg hover:underline text-gray-900 underline-offset-4"
        href={titleLink}
      >
        {title}
      </Link>
      <div className="text-sm">
        <div className="grid grid-cols-6 py-2 mt-4 mb-1 font-medium text-gray-500 border-b border-gray-200">
          <div className="col-span-1 text-left">年份</div>
          <div className="col-span-5">
            <div className="grid grid-cols-4 md:grid-cols-8">
              <div className="col-span-1 text-left">日期</div>
              <div className="col-span-3 md:col-span-6">标题</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-6 text-gray-700 transition-colors duration-500 hover:text-gray-200">
          {items?.map((item, idx) => {
            const date = new Date(item.createdAt!);
            const isSameYear = idx === 0 || date.getFullYear() !== new Date(items[idx - 1].createdAt!).getFullYear();

            return (
              <Link
                key={item._id?.toString() || ""}
                href={`/articles/${item._id?.toString() || ""}`}
                className="col-span-6 hover:text-gray-700"
              >
                <div className="grid grid-cols-6">
                  <div
                    className={`col-span-1 text-left py-4${!isSameYear ? "" : " border-b border-gray-200"}`}
                  >
                    {isSameYear && date.getFullYear()}
                  </div>
                  <div
                    className={`col-span-5 py-4 border-b border-gray-200${idx + 1 === items.length ? " border-b-0" : ""}`}
                  >
                    <div className="grid grid-cols-12 text-sm">
                      <div className="col-span-10 flex items-center gap-4">
                        <div className="text-left">{`${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`}</div>
                        <div className="truncate">{item.title}</div>
                      </div>
                      {
                        !isMobile && (
                          <div className="col-span-2 flex items-baseline justify-around text-gray-500 text-xs">
                            <div className="w-4 h-4 flex items-center justify-start">
                              <LikeButton articleId={item._id?.toString() || ""} initialLikes={item.likes!} />
                            </div>
                            <div className="w-4 h-4 flex items-center justify-start cursor-default pointer-events-none">
                              <ViewCounter initialViews={item.views!} />
                            </div>
                          </div>
                        )
                      }
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
