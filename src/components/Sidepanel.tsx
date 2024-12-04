"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Forward,
  History,
  Home,
  Laptop,
  Menu,
  PencilLine,
  Slack,
  SquareDashedBottomCode,
  Terminal,
  Twitter,
  UnfoldVertical,
  Users,
  Video,
  Camera,
  X,
  FolderHeart,
  Github,
  Flower,
  Folder,
  Globe,
  MapPin,
  FileEdit,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ISocialLink } from "@/app/model/social-link";

const navList = [
  {
    title: "首页&简介",
    href: "/",
    prefix: <Home size={16} />,
  },
  { title: "技术栈", href: "/stack", prefix: <Slack size={16} /> },
  { title: "时间笔记", href: "/writing", prefix: <PencilLine size={16} /> },
  { title: "生活相册", href: "/album", prefix: <Camera size={16} /> },
  { title: "工作空间", href: "/workspace", prefix: <Laptop size={16} /> },
  { title: "导航站", href: "/bookmarks", prefix: <FolderHeart size={16} /> },
  { title: "时间轴", href: "/timeline", prefix: <History size={16} /> },
  { title: "项目", href: "/projects", prefix: <Folder size={16} /> },
  { title: "友链", href: "/friends", prefix: <Users size={16} /> },
];

const iconMap = {
  "博客": <Globe size={16} />,
  "掘金": <MapPin size={16} />,
  "Github": <Github size={16} />,
  "Codesandbox": <FileEdit size={16} />,
  "灵感笔记": <FileEdit size={16} />,
  "Follow": <Eye size={16} />,
} as const;

// Cache management
const CACHE_KEYS = {
  SOCIAL_LINKS: 'social_links_data',
  LAST_FETCH: 'social_links_last_fetch',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getFromCache<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(key: string, data: any): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    key,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    })
  );
}

const SidebarContent = ({ onNavClick }: { onNavClick?: () => void }) => {
  const currentPathname = usePathname();
  const [socialLinks, setSocialLinks] = useState<ISocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      // Try to get from cache first
      const cached = getFromCache<ISocialLink[]>(CACHE_KEYS.SOCIAL_LINKS);
      if (cached) {
        setSocialLinks(cached);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/social-links");
        if (!response.ok) {
          throw new Error("Failed to fetch social links");
        }
        const data = await response.json();
        if (data.success) {
          setSocialLinks(data.socialLinks);
          setCache(CACHE_KEYS.SOCIAL_LINKS, data.socialLinks);
        } else {
          throw new Error("Failed to fetch social links");
        }
      } catch (error) {
        console.error("Error fetching social links:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch social links");
      } finally {
        setLoading(false);
      }
    };

    fetchSocialLinks();
  }, []);

  const socialList = socialLinks.map((link) => ({
    title: link.name,
    href: link.url,
    prefix: iconMap[link.name as keyof typeof iconMap] || <></>,
  }));

  return (
    <div className="flex h-full w-full flex-col bg-zinc-50 p-3">
      <div className="mb-4 p-2 flex flex-row flex-nowrap gap-2">
        <Avatar>
          <AvatarImage src="/avatar.png" alt="vespser" />
          <AvatarFallback>ObjectX</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-semibold tracking-tight">ObjectX-不知名程序员</h1>
          <p className="text-gray-600">👨🏻‍💻 前端工程师</p>
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
                {socialItem.prefix}
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

export default function Sidepanel() {
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
        className={`fixed inset-0 z-50 transform transition-all duration-300 ease-in-out lg:hidden ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={handleClose}
        />

        {/* Drawer Panel */}
        <div
          ref={drawerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className={`absolute bottom-0 left-0 right-0 h-[65vh] transform rounded-t-[20px] bg-white shadow-xl transition-transform duration-300 ease-in-out ${
            isOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="relative flex h-14 items-center justify-between border-b px-4">
            <div className="absolute left-1/2 top-1/2 h-1 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300" />
            <div className="flex-1" />
            <button
              onClick={handleClose}
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="h-[calc(65vh-3.5rem)] overflow-y-auto overscroll-contain">
            <SidebarContent onNavClick={handleClose} />
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="min-w-60 relative hidden w-60 flex-col border-r bg-zinc-50 p-3 lg:flex xl:w-72">
        <SidebarContent />
      </aside>
    </>
  );
}
