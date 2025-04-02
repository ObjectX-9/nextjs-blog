"use client";

import { useState, useEffect } from "react";
import { ItemType, Table } from "@/components/Table";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useLocalCache } from "@/app/hooks/useLocalCache";

// 缓存键常量
const CACHE_KEYS = {
  WORKSPACE_ITEMS: "workspace_items",
};

// 缓存时间设置
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

export default function Workspace() {
  const [workspaceItems, setWorkspaceItems] = useState<ItemType[]>([]);
  const [imgList] = useState<string[]>(["/example1.jpg", "/example2.jpg"]);
  const { getFromCache, setCache } = useLocalCache(CACHE_DURATION);

  useEffect(() => {
    const fetchWorkspaceItems = async () => {
      const cached = getFromCache<ItemType[]>(CACHE_KEYS.WORKSPACE_ITEMS);
      if (cached) {
        setWorkspaceItems(cached);
        return;
      }

      try {
        const response = await fetch("/api/workspaceItems", {
          headers: {
            "Cache-Control": "no-store",
            Pragma: "no-cache",
          },
        });
        const data = await response.json();
        if (data.success) {
          setWorkspaceItems(data.items);
          setCache(CACHE_KEYS.WORKSPACE_ITEMS, data.items);
        }
      } catch (error) {
        console.error("Error fetching workspace items:", error);
      }
    };

    fetchWorkspaceItems();
  }, [getFromCache, setCache]);

  const fields = [
    { key: "product", label: "产品" },
    { key: "specs", label: "规格" },
    {
      key: "buyAddress",
      label: "",
      align: "right" as const,
      render: (field: string | number, item: any) => (
        <Button variant="link" size="sm" asChild>
          <a href={item.buyLink} target="_blank" rel="noopener noreferrer">
            去购买
          </a>
        </Button>
      ),
    },
  ];

  return (
    <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-8 px-8">
      <h1 className="text-3xl font-bold mb-6">工作空间</h1>
      <div className="mb-6 last:mb-0">工作空间，记录了工作用到的产品和工具</div>
      <div className="mx-6 mb-4 flex snap-x snap-mandatory gap-6 overflow-x-scroll pb-4 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:overflow-x-auto md:pb-0">
        {imgList.map((imgSrc) => (
          <div key={imgSrc} className="relative w-2/3 md:w-full h-96 md:h-72">
            <Image
              className="snap-center object-cover rounded-md shadow-md"
              src={imgSrc}
              alt="Workspace image"
              fill
              sizes="(max-width: 768px) 66vw, 50vw"
              priority
            />
          </div>
        ))}
      </div>
      <div className="border border-gray-200 rounded-xl mt-4">
        <Table
          caption="For other cool stuff, don't forget to check some.wtf"
          items={workspaceItems}
          fields={fields}
        ></Table>
      </div>
    </main>
  );
}
