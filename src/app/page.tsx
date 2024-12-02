import { getDocsList } from "@/components/Markdown";
import { Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const socialLinks = [
  {
    name: "博客",
    icon: "🌐",
    url: "https://blog.example.com",
    bgColor: "#e8f5e9",
  },
  {
    name: "掘金",
    icon: "📍",
    url: "#",
    bgColor: "#ffebee",
  },
  {
    name: "Github",
    icon: "👨‍💻",
    url: "https://github.com",
    bgColor: "#f3e5f5",
  },
  {
    name: "Codesandbox",
    icon: "🐥",
    url: "https://codesandbox.io",
    bgColor: "#fff3e0",
  },
  {
    name: "灵感笔记",
    icon: "📝",
    url: "#",
    bgColor: "#fff8e1",
  },
  {
    name: "Follow",
    icon: "👀",
    url: "#",
    bgColor: "#e3f2fd",
  },
] as const;

interface WorkExperience {
  company: string;
  companyUrl: string;
  position: string;
  description: string;
  startDate: string;
  endDate: string | null; // null means current position
}

const workExperiences: WorkExperience[] = [
  {
    company: "js.design",
    companyUrl: "https://js.design/",
    position: "前端【图形编辑器方向】",
    description: "实习和校招目前在北京即时设计",
    startDate: "2022-07-01",
    endDate: null, // current position
  },
];

const calculateDuration = (startDate: string, endDate: string | null) => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffInMonths =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  const years = Math.floor(diffInMonths / 12);
  const months = diffInMonths % 12;
  return { years, months };
};

export default function Index() {
  const docsList = getDocsList();
  return (
    <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-8 px-8">
      <div className="relative w-full">
        {/* Background Image */}
        <div className="w-[80%] h-[25vh] rounded-xl overflow-hidden relative mx-auto">
          <Image
            src="/images/background.jpg"
            alt="Background"
            fill
            className="object-cover object-[center_12%]"
            priority
          />
        </div>

        {/* Avatar */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-16">
          <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src="/avatar.png"
                alt="Avatar"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl my-0 mx-auto mt-24">
        <p className="text-gray-600 mt-4">
          你好 👋，我是{" "}
          <span className="bg-[#e8f5e9] px-2 py-0.5 rounded">ObjectX</span>
          ，一个热爱生活和分享技术的前端工程师。我希望能够通过我的博客，与大家分享我的生活态度、经历和技术的
          学习，希望带给大家一些启发和帮助！你也可以在我的
          <a href="#" className="bg-[#ffebee] px-2 py-0.5 rounded mx-1">
            掘金
          </a>{" "}
          和
          <a href="#" className="bg-[#f3e5f5] px-2 py-0.5 rounded mx-1">
            Github
          </a>
          里面了解更多。
        </p>
        <div className="max-w-2xl">
          <h1 className="mb-4 mt-8 font-semibold text-lg text-gray-900">
            社交账号
          </h1>
          <div className="flex flex-wrap gap-1 mb-8">
            {socialLinks.map((link, index) => (
              <>
                <a
                  key={link.name}
                  href={link.url}
                  className="flex items-center gap-1 px-2 py-1 rounded text-gray-600 hover:text-gray-900"
                  style={{ backgroundColor: link.bgColor }}
                >
                  <span>{link.icon}</span>
                  {link.name}
                </a>
                {index !== socialLinks.length - 1 && (
                  <span className="text-gray-300 flex items-center">|</span>
                )}
              </>
            ))}
          </div>

          <h1 className="mb-4 mt-8 font-semibold text-lg text-gray-900">
            教育经历
          </h1>
          <div className="mb-8">
            <div className="mb-4">
              <p className="text-gray-800">
                辽宁大学211 | 计算机科学与技术 | CET6
              </p>
            </div>
          </div>

          <h1 className="mb-4 mt-8 font-semibold text-lg text-gray-900">
            工作经历
          </h1>
          <div className="space-y-8">
            {workExperiences.map((experience, index) => {
              const { years, months } = calculateDuration(
                experience.startDate,
                experience.endDate
              );
              return (
                <div key={index} className="mb-8">
                  <div className="mb-4">
                    <p className="text-gray-800">
                      {experience.description}{" "}
                      <a
                        href={experience.companyUrl}
                        className="text-pink-500 font-medium"
                      >
                        {experience.company}
                      </a>{" "}
                      {experience.position}
                    </p>
                  </div>
                  <div className="mt-4">
                    <p className="text-gray-800">
                      工作经验：{years}年{months}个月
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="w-full max-w-3xl my-0 mx-auto">
        <Link
          className="mb-4 mt-8 font-semibold cursor-pointer text-lg hover:underline text-gray-900 underline-offset-4"
          href="/writing"
        >
          📒 时间笔记
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
