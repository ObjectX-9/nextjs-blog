"use client";

import { Card } from "@/components/ui/card";
import { Link } from "lucide-react";
import Image from "next/image";
import { IStack } from "@/app/model/stack";
import { useEffect, useState, useCallback } from "react";
import { useLocalCache } from "@/app/hooks/useLocalCache";
import { truncateText } from "@/utils/text";

const CACHE_KEYS = {
  STACKS: 'stacks_data',
};

// 骨架屏组件
const StackSkeleton = () => {
  return (
    <Card className="flex-1 max-w-96">
      <div className="flex items-center h-full space-x-4 rounded-md p-4">
        {/* 图标骨架 */}
        <div className="h-6 w-6 rounded-md bg-gray-200 animate-pulse"></div>
        <div className="flex-1 space-y-2">
          {/* 标题骨架 */}
          <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          {/* 描述骨架 */}
          <div className="h-3 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </Card>
  );
};

export default function Stack() {
  const [stackList, setStackList] = useState<IStack[]>([]);
  const [loading, setLoading] = useState(true);
  const { getFromCache, setCache } = useLocalCache();

  // 获取技术栈数据
  const fetchStacks = useCallback(async () => {
    try {
      // 先尝试从缓存获取
      const cachedData = getFromCache<IStack[]>(CACHE_KEYS.STACKS);
      if (cachedData) {
        return cachedData;
      }

      const response = await fetch("/api/stacks", {
        cache: "no-store",
      });
      const data = await response.json();
      if (data.success) {
        // 缓存结果
        setCache(CACHE_KEYS.STACKS, data.stacks);
        return data.stacks;
      }
      return [];
    } catch (error) {
      console.error("Error fetching stacks:", error);
      return [];
    }
  }, [getFromCache, setCache]);

  useEffect(() => {
    fetchStacks()
      .then(data => {
        setStackList(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [fetchStacks]);

  return (
    <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-8 px-8">
      <h1 className="text-3xl font-bold mb-6">技术栈</h1>
      <div className="mb-4 last:mb-0">
        这里是我的常用栈，我使用这些工具来构建和维护我的项目。
      </div>
      <ul className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
        {loading ? (
          // 显示骨架屏
          Array(8).fill(0).map((_, index) => (
            <li key={`skeleton-${index}`} className="mb-1 flex last:mb-0">
              <StackSkeleton />
            </li>
          ))
        ) : (
          // 显示实际数据
          stackList.map((stackItem) => (
            <li key={stackItem._id as any} className="mb-1 flex last:mb-0">
              <Card className="flex-1 max-w-96">
                <div className="flex items-center h-full space-x-4 rounded-md p-4">
                  <Image
                    src={stackItem.iconSrc}
                    width={24}
                    height={24}
                    alt={stackItem.title}
                  ></Image>
                  <div className="flex-1 space-y-1">
                    <a
                      className="text-sm font-medium leading-none flex hover:underline items-center"
                      href={stackItem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {stackItem.title}
                      <Link className="ml-1" size={14} />
                    </a>
                    <p className="text-sm text-muted-foreground">
                      {truncateText(stackItem.description)}
                    </p>
                  </div>
                </div>
              </Card>
            </li>
          ))
        )}
      </ul>
    </main>
  );
}