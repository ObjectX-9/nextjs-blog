import { getDocsList } from "@/components/Markdown";
import { Star } from "lucide-react";
import Link from "next/link";

export default function Index() {
  const docsList = getDocsList();
  return (
    <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-24 px-8">
      <div className="w-full max-w-3xl my-0 mx-auto">
        <p className="mb-6">
          Hi😎~ I&apos;m Vesper. I&apos;m a Front-End engineer, sometime i wirte
          backend by node.js, and I write a little bit about programming and
          life. I hope you enjoy your stay.
        </p>
        <p className="mb-6">
          Actually, I only have a high school degree because i started a
          business in college and did not concentrate on my studies, which
          resulted in my failure to graduate. I started to learn programming in
          2016, and I have been working as a front-end engineer since 2017. I
          have been working in the field of front-end development for more than
          6 years.
        </p>
      </div>
      <div className="w-full max-w-3xl my-0 mx-auto">
        <Link
          className="mb-4 mt-8 font-semibold cursor-pointer text-lg hover:underline text-gray-900 underline-offset-4"
          href="/writing"
        >
          Writing
        </Link>
        <div className="text-sm">
          <div className="grid grid-cols-6 py-2 mt-4 mb-1 font-medium text-gray-500 border-b border-gray-200">
            <span className="col-span-1 text-left md:grid">Year</span>
            <span className="col-span-5 md:col-span-5">
              <span className="grid grid-cols-4 items-center md:grid-cols-8">
                <span className="col-span-1 text-left">Date</span>
                <span className="col-span-3 md:col-span-6">Title</span>
              </span>
            </span>
          </div>
          <div className="grid grid-cols-6 transition-colors text-gray-700 duration-500 hover:text-gray-200">
            {docsList.map((navItem, idx) => {
              const lastModified = navItem.lastModified;
              const isSameYear =
                lastModified.getFullYear() !==
                docsList[idx - 1]?.lastModified.getFullYear();
              return (
                <Link
                  key={navItem.name}
                  href={`/writing/${navItem.name}`}
                  className="col-span-6 md:col-span-6 hover:text-gray-700"
                >
                  <span className="grid grid-cols-6 items-center">
                    <span
                      className={`col-span-1 text-left py-4${
                        !isSameYear ? "" : " border-b border-gray-200"
                      }`}
                    >
                      {isSameYear && lastModified.getFullYear()}
                    </span>
                    <span
                      className={`col-span-5 md:col-span-5 py-4 border-b border-gray-200${
                        idx + 1 === docsList.length ? " border-b-0" : ""
                      }`}
                    >
                      <span className="grid grid-cols-4 items-center md:grid-cols-8">
                        <span className="col-span-1 text-left">
                          {`${lastModified
                            .getDate()
                            .toString()
                            .padStart(2, "0")}/${(lastModified.getMonth() + 1)
                            .toString()
                            .padStart(2, "0")}`}
                        </span>
                        <span className="col-span-2 md:col-span-6">
                          {navItem.name}
                        </span>
                        <span className="col-span-1 flex flex-nowrap">
                          <Star size={16} />
                          <Star size={16} />
                          <Star size={16} />
                          <Star size={16} />
                          <Star size={16} />
                        </span>
                      </span>
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
