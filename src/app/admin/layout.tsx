"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navItems = [
  { name: "网站信息管理", href: "/admin/site" },
  { name: "文章管理", href: "/admin/articles" },
  { name: "收录文章", href: "/admin/external-articles" },
  { name: "书签管理", href: "/admin/bookmarks" },
  { name: "友链管理", href: "/admin/friends" },
  { name: "相册管理", href: "/admin/photos" },
  { name: "健身管理", href: "/admin/fitness" },
  { name: "旅行管理", href: "/admin/travel" },
  { name: "图像影调分析", href: "/admin/image-analysis" },
  { name: "时间线管理", href: "/admin/timelines" },
  { name: "灵感管理", href: "/admin/inspirations" },
  { name: "项目管理", href: "/admin/projects" },
  { name: "demo管理", href: "/admin/demos" },
  { name: "技术栈", href: "/admin/stacks" },
  { name: "工作空间管理", href: "/admin/workspaces" },
  { name: "社交链接管理", href: "/admin/social-links" },
  { name: "工作经历管理", href: "/admin/work-experience" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 检查是否是新建或编辑页面（文章、时间轴、项目需求编辑）
  const isFullScreenEditPage =
    pathname === "/admin/articles/new" ||
    pathname.includes("/admin/articles/edit/") ||
    pathname === "/admin/timelines/new" ||
    pathname.includes("/admin/timelines/edit/") ||
    pathname.includes("/admin/project-requirements/edit/");

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth", {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-1">
      {!isFullScreenEditPage && (
        <>
          {/* 移动端遮罩层 */}
          {isDrawerOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={() => setIsDrawerOpen(false)}
            />
          )}

          {/* 移动端菜单按钮 */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="fixed top-4 left-4 z-20 lg:hidden p-2 rounded-md bg-white shadow-md"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </>
      )}

      {/* 侧边栏 */}
      {!isFullScreenEditPage && (
        <aside
          className={`fixed lg:static w-64 h-full bg-gray-50 border-r z-30 transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"
            } lg:translate-x-0`}
        >
          <div className="p-4 border-b flex justify-between items-center">
            <h1 className="text-xl font-bold">后台管理</h1>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              退出
            </button>
          </div>
          <nav className="p-4 overflow-auto h-[calc(100vh-61px)]">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsDrawerOpen(false)}
                      className={`block px-4 py-2 rounded-md ${isActive
                        ? "bg-gray-200 text-gray-900"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
      )}

      {/* 主内容区 */}
      <main className={`flex-1 bg-white overflow-auto h-[100vh] ${isFullScreenEditPage ? 'p-0' : 'p-4 lg:p-6 lg:ml-0'
        }`}>
        <div className={isFullScreenEditPage ? '' : 'max-w-7xl mx-auto'}>
          {children}
        </div>
      </main>
    </div>
  );
}
