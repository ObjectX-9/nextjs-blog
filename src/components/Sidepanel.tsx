"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Flower,
  FolderHeart,
  Forward,
  Github,
  History,
  Home,
  Laptop,
  PencilLine,
  Slack,
  SquareDashedBottomCode,
  Terminal,
  Twitter,
  UnfoldVertical,
  Video,
  Camera,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navList = [
  {
    title: "Home",
    href: "/",
    prefix: <Home size={16} />,
  },
  { title: "Stack", href: "/stack", prefix: <Slack size={16} /> },
  { title: "Lify_Writing", href: "/writing", prefix: <PencilLine size={16} /> },
  { title: "Album", href: "/album", prefix: <Camera size={16} /> },
  { title: "Workspace", href: "/workspace", prefix: <Laptop size={16} /> },
  { title: "Bookmarks", href: "/bookmarks", prefix: <FolderHeart size={16} /> },
  { title: "Playground", href: "/playground", prefix: <Slack size={16} /> },
  { title: "timeline", href: "/timeline", prefix: <History size={16} /> },
];

const socialList = [
  {
    title: "GitHub",
    href: "https://github.com/newObjectccc",
    prefix: <Github size={16} />,
  },
  {
    title: "X (Twitter)",
    href: "https://twitter.com/cccxy10086",
    prefix: <Twitter size={16} />,
  },
  {
    title: "Bilibili",
    href: "https://space.bilibili.com/270440208?spm_id_from=333.1007.0.0",
    prefix: <Flower size={16} />,
  },
];

const openSourceList = [
  {
    title: "V2G",
    href: "https://vtog.vesper.host",
    prefix: <Video size={16} />,
  },
  {
    title: "BeautyCode",
    href: "https://marketplace.visualstudio.com/items?itemName=Vesper.beautycode",
    prefix: <SquareDashedBottomCode size={16} />,
  },
  {
    title: "Vtabs",
    href: "https://chromewebstore.google.com/detail/vtabs/ldjlkpemhoddnoedhbebgdncegooejim?hl=zh-CN&utm_source=ext_sidebar",
    prefix: <UnfoldVertical size={16} />,
  },
  {
    title: "Bup",
    href: "https://www.npmjs.com/package/buildp",
    prefix: <Terminal size={16} />,
  },
];

export default function Sidepanel() {
  const currentPathname = usePathname();
  return (
    <aside className="min-w-60 relative w-full flex-col text-sm hidden bg-zinc-50 p-3 lg:flex lg:flex-col lg:border-r lg:w-60 xl:w-72">
      <div className="mb-4 p-2 flex flex-row flex-nowrap gap-2">
        <Avatar>
          <AvatarImage src="/avatar.png" alt="vespser" />
          <AvatarFallback>vesper</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-semibold tracking-tight">ObjectX-js.design</h1>
          <p className="text-gray-600">Front-End Engineer</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {navList.map((navItem, index) => {
          const isSelected =
            currentPathname.split("/")[1] === navItem.href.replace("/", "");
          const commonClasses =
            "group flex items-center justify-between rounded-lg p-2";
          const selectedClasses = isSelected
            ? "bg-black text-white"
            : "hover:bg-gray-200";
          const borderClasses = isSelected
            ? "border-gray-600 bg-gray-700 text-gray-200 group-hover:border-gray-600"
            : "border-gray-200 bg-gray-100 text-gray-500 group-hover:border-gray-300";
          return (
            <Link
              key={navItem.href}
              href={navItem.href}
              className={`${commonClasses} ${selectedClasses}`}
            >
              <span className="flex items-center">
                {navItem.prefix}
                <span className="ml-2 font-medium">{navItem.title}</span>
              </span>
              <span
                className={`hidden h-5 w-5 place-content-center rounded border text-xs font-medium transition-colors duration-200 lg:grid ${borderClasses}`}
              >
                {index + 1}
              </span>
            </Link>
          );
        })}
      </nav>
      <Separator className="my-5" />
      <span className="px-2 text-xs mb-2 font-medium leading-relaxed text-gray-600">
        Online
      </span>
      <nav className="flex flex-col gap-1">
        {socialList.map((socialItem, index) => (
          <Link
            key={socialItem.href}
            href={socialItem.href}
            target="_blank"
            className="group flex items-center justify-between rounded-lg p-2"
          >
            <span className="flex items-center">
              {socialItem.prefix}
              <span className="ml-2 font-medium">{socialItem.title}</span>
            </span>
            <Forward size={16} />
          </Link>
        ))}
      </nav>
      <Separator className="my-5" />
      <span className="px-2 text-xs mb-2 font-medium leading-relaxed text-gray-600">
        Open Source
      </span>
      <nav className="flex flex-col gap-1">
        {openSourceList.map((openItem, index) => (
          <Link
            key={openItem.href}
            href={openItem.href}
            target="_blank"
            className="group flex items-center justify-between rounded-lg p-2"
          >
            <span className="flex items-center">
              {openItem.prefix}
              <span className="ml-2 font-medium">{openItem.title}</span>
            </span>
            <Forward size={16} />
          </Link>
        ))}
      </nav>
    </aside>
  );
}
