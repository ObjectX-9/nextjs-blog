"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/bookmarks");
  }, [router]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">系统设置</h1>
      <div className="space-y-4">
        <Link
          href="/admin/bookmarks"
          className="block p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          书签管理
        </Link>
      </div>
    </div>
  );
}
