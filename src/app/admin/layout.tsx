"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "系统设置", href: "/admin/config" },
  { name: "书签管理", href: "/admin/bookmarks" },
  { name: "友链管理", href: "/admin/friends" },
  { name: "相册管理", href: "/admin/photos" },
  { name: "项目管理", href: "/admin/projects" },
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
