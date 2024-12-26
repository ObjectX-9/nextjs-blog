"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/site");
  }, [router]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">系统设置</h1>
      <div className="space-y-4">
      </div>
    </div>
  );
}
