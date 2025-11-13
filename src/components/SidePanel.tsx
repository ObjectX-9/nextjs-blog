"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Forward,
  History,
  Home,
  Laptop,
  Menu,
  Slack,
  Users,
  Camera,
  FolderHeart,
  Github,
  Folder,
  Globe,
  MapPin,
  FileEdit,
  Eye,
  BookOpen,
  Blocks,
  Lightbulb, // 添加 Lightbulb 图标
  CheckSquare, // 添加 CheckSquare 图标用于 Todo
  Target, // 添加 Target 图标用于项目需求
  Dumbbell, // 添加 Dumbbell 图标用于健身记录
  Plane, // 添加 Plane 图标用于旅行记录
  ExternalLink, // 添加 ExternalLink 图标用于外部文章
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ISocialLink } from "@/app/model/social-link";
import { useSiteStore } from "@/store/site";
import { socialLinkBusiness } from "@/app/business/social-link";
import { message } from "antd";

const baseNavList = [
  {
    title: "首页&简介",
    href: "/",
    prefix: <Home size={16} />,
  },
  { title: "技术栈", href: "/stack", prefix: <Slack size={16} /> },
  {
    title: "灵感笔记",
    href: "/inspirations",
    prefix: <Lightbulb size={16} />,
  },
  { title: "技术文章", href: "/articles", prefix: <BookOpen size={16} /> },
  { title: "收录文章", href: "/external-articles", prefix: <ExternalLink size={16} /> },
  { title: "生活相册", href: "/album", prefix: <Camera size={16} /> },
  { title: "健身打卡", href: "/fitness", prefix: <Dumbbell size={16} /> },
  { title: "旅行记录", href: "/travel", prefix: <Plane size={16} /> },
  { title: "工作空间", href: "/workspace", prefix: <Laptop size={16} /> },
  { title: "导航站", href: "/bookmarks", prefix: <FolderHeart size={16} /> },
  { title: "时间笔记", href: "/timeline", prefix: <History size={16} /> },
  { title: "项目", href: "/projects", prefix: <Folder size={16} /> },
  { title: "demo", href: "/demos", prefix: <Blocks size={16} /> },
  { title: "友链", href: "/friends", prefix: <Users size={16} /> },
];

// 管理员专属导航项
const adminNavList = [
  { title: "待办事项", href: "/todos", prefix: <CheckSquare size={16} /> },
  { title: "项目需求", href: "/project-requirements", prefix: <Target size={16} /> },
];

const iconMap = {
  博客: <Globe size={16} />,
  掘金: <MapPin size={16} />,
  Github: <Github size={16} />,
  Codesandbox: <FileEdit size={16} />,
  灵感笔记: <FileEdit size={16} />,
  Follow: <Eye size={16} />,
} as const;

const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => {
  const currentPathname = usePathname();
  const [socialLinks, setSocialLinks] = useState<ISocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const { site } = useSiteStore();

  // 检查管理员权限
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth");
        const data = await response.json();
        setIsAdmin(data.isAuthenticated || false);
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAdmin(false);
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const socialLinks = await socialLinkBusiness.getSocialLinks();
        setSocialLinks(socialLinks);
      } catch (error) {
        message.error("Error fetching social links:" + error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch social links"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSocialLinks();
  }, []);

  // 根据管理员权限组合导航列表
  const navList = [...baseNavList];
  if (isAdmin) {
    // 在"项目"后面插入管理员专属导航项
    const projectIndex = baseNavList.findIndex(item => item.href === "/projects");
    navList.splice(projectIndex + 1, 0, ...adminNavList);
  }

  const socialList = socialLinks.map((link) => ({
    title: link.name,
    href: link.url,
    icon: link.icon || "",
  }));

  const renderIcon = (icon: string, title: string) => {
    if (!icon) {
      return iconMap[title as keyof typeof iconMap] || <Globe size={16} />;
    }

    return (
      <div className="relative w-4 h-4 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
        <Image
          src={icon}
          alt={title}
          width={16}
          height={16}
          className="object-contain"
          onError={() => {
            console.error(`Failed to load icon for ${title}`);
            return (
              iconMap[title as keyof typeof iconMap] || <Globe size={16} />
            );
          }}
        />
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col p-3">
      <div className="mb-4 p-2 flex flex-row flex-nowrap gap-2">
        <Avatar>
          <AvatarImage
            src={site?.author?.avatar || "./avatar.png"}
            alt="vespser"
          />
          <AvatarFallback>ObjectX</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-semibold tracking-tight">
            {site?.author?.name ?? "ObjectX-不知名程序员"}
          </h1>
          <p className="text-gray-600">
            {site?.author?.bio ?? "👨🏻‍💻 前端工程师"}
          </p>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {navList
          .filter((navItem) => {
            // 如果权限检查未完成，显示基础导航项
            if (authLoading) {
              return baseNavList.includes(navItem);
            }
            // 权限检查完成后，根据管理员状态过滤
            const isAdminItem = adminNavList.some(adminItem => adminItem.href === navItem.href);
            return !isAdminItem || isAdmin;
          })
          .map((navItem, index) => {
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
                key={`nav-${navItem.href}`}
                href={navItem.href}
                onClick={onNavClick}
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
        {loading ? (
          // Loading skeleton for social links
          <div className="space-y-2 px-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center gap-2">
                <div className="h-4 w-4 bg-zinc-200 rounded"></div>
                <div className="h-4 bg-zinc-200 rounded w-20"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="px-3 py-2 text-sm text-red-500">
            Failed to load social links
          </div>
        ) : (
          // Social links
          socialList.map((socialItem, index) => (
            <Link
              key={`social-${index}`}
              href={socialItem.href}
              target="_blank"
              className="group flex items-center justify-between rounded-lg p-2 hover:bg-gray-200"
            >
              <span className="flex items-center">
                {renderIcon(socialItem.icon, socialItem.title)}
                <span className="ml-2 font-medium">{socialItem.title}</span>
              </span>
              <Forward size={16} />
            </Link>
          ))
        )}
      </nav>
    </div>
  );
};

export default function SidePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [startY, setStartY] = useState(0);
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!drawerRef.current) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;

    if (deltaY > 0) {
      // Only allow downward swipe
      drawerRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!drawerRef.current) return;

    const currentY = e.changedTouches[0].clientY;
    const deltaY = currentY - startY;

    if (deltaY > 50) {
      // If swiped down more than 50px, close the drawer
      setIsOpen(false);
    }
    drawerRef.current.style.transform = "";
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Navigation Button */}
      <div className="fixed bottom-6 right-6 z-40 lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-lg transition-colors hover:bg-gray-800"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 z-50 transform transition-all duration-300 ease-in-out lg:hidden ${isOpen ? "pointer-events-auto" : "pointer-events-none"
          }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"
            }`}
          onClick={handleClose}
        />

        {/* Drawer Panel */}
        <div
          ref={drawerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`absolute bottom-0 left-0 right-0 h-[65vh] transform rounded-t-[20px] bg-white shadow-xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-y-0" : "translate-y-full"
            }`}
        >
          {/* Drawer Header */}
          <div className="relative flex h-5 items-center justify-between border-b px-4">
            <div className="absolute left-1/2 top-1/2 h-1 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300" />
            <div className="flex-1" />
          </div>

          {/* Drawer Content */}
          <div className="h-[calc(70vh-3.5rem)] overflow-y-auto overscroll-contain">
            <SidebarContent onNavClick={handleClose} />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="min-w-60 relative hidden h-screen w-60 flex-col border-r bg-zinc-50 lg:flex xl:w-72">
        <div className="overflow-y-auto scrollbar-hidden p-3 h-full">
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}
