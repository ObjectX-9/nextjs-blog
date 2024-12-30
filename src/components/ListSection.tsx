import Link from "next/link";
import LikeButton from "./LikeButton";
import ViewCounter from "./ViewCounter";

interface ListItem {
  _id?: string;
  name?: string;
  title?: string;
  url?: string;
  lastModified?: Date;
  createdAt?: string;
  likes?: number;
  views?: number;
}

interface ListSectionProps {
  title: string;
  titleLink: string;
  items: ListItem[];
  isArticle?: boolean;
}

export const ListSection = ({ title, titleLink, items, isArticle = false }: ListSectionProps) => {
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
          <span className="col-span-1 text-left md:grid">年份</span>
          <span className="col-span-5 md:col-span-5">
            <span className="grid grid-cols-4 items-center md:grid-cols-8">
              <span className="col-span-1 text-left">日期</span>
              <span className="col-span-3 md:col-span-6">标题</span>
            </span>
          </span>
        </div>
        <div className="grid grid-cols-6 transition-colors text-gray-700 duration-500 hover:text-gray-200">
          {items.map((item, idx) => {
            const date = isArticle ? new Date(item.createdAt!) : item.lastModified!;
            const isSameYear = isArticle
              ? idx === 0 || date.getFullYear() !== new Date(items[idx - 1].createdAt!).getFullYear()
              : date.getFullYear() !== items[idx - 1]?.lastModified?.getFullYear();

            return (
              <Link
                key={isArticle ? item._id : item.name}
                href={isArticle ? (item.url || '#') : `/writing/${item.name}`}
                {...(isArticle ? { target: "_blank" } : {})}
                className="col-span-6 md:col-span-6 hover:text-gray-700"
              >
                <span className="grid grid-cols-6 items-center">
                  <span
                    className={`col-span-1 text-left py-4${!isSameYear ? "" : " border-b border-gray-200"
                      }`}
                  >
                    {isSameYear && date.getFullYear()}
                  </span>
                  <span
                    className={`col-span-5 md:col-span-5 py-4 border-b border-gray-200${idx + 1 === items.length ? " border-b-0" : ""
                      }`}
                  >
                    <span className="grid grid-cols-4 items-center md:grid-cols-8">
                      <span className="col-span-1 text-left">
                        {isArticle
                          ? `${date.getMonth() + 1}/${date.getDate().toString().padStart(2, "0")}`
                          : `${date.getDate().toString().padStart(2, "0")}/${(
                            date.getMonth() + 1
                          ).toString().padStart(2, "0")}`}
                      </span>
                      <span className={`col-span-2 md:col-span-${isArticle ? "5" : "6"} flex items-center`}>
                        <span className={isArticle ? "truncate block max-w-[200px] md:max-w-[500px]" : ""}>
                          {isArticle ? item.title : item.name}
                        </span>
                      </span>
                      {isArticle && (
                        <span className="col-span-1 md:col-span-2 flex items-center justify-end gap-4 text-gray-500 text-xs">
                          <LikeButton
                            articleId={item._id?.toString() || ""}
                            initialLikes={item.likes!}
                          />
                          <ViewCounter
                            articleId={item._id?.toString() || ""}
                            initialViews={item.views!}
                          />
                        </span>
                      )}
                    </span>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
