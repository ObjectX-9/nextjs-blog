"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "书签管理", href: "/admin/bookmarks" },
  { name: "友链管理", href: "/admin/friends" },
  { name: "相册管理", href: "/admin/photos" },
  { name: "项目管理", href: "/admin/projects" },
  { name: "技术栈", href: "/admin/stacks" },
  { name: "时间轴", href: "/admin/timelines" },
  { name: "工作空间", href: "/admin/workspaces" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-gray-50">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold">后台管理</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block px-4 py-2 rounded-md ${
                      isActive
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
      <main className="flex-1 bg-white">{children}</main>
    </div>
  );
}
