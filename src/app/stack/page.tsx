"use client";

import { Card } from "@/components/ui/card";
import { Link } from "lucide-react";
import Image from "next/image";
import { IStack } from "@/app/model/stack";
import { useEffect, useState } from "react";

// Utility function to truncate text
function truncateText(text: string, maxLength: number = 50) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

const CACHE_KEYS = {
  STACKS: 'stacks_data',
  LAST_FETCH: 'stacks_last_fetch',
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getFromCache<T>(key: string, duration: number = CACHE_DURATION): T | null {
  if (typeof window === "undefined") return null;
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > duration) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    key,
    JSON.stringify({
      data,
      timestamp: Date.now(),
    })
  );
}

async function fetchStacks() {
  try {
    // Try to get from cache first
    const cachedData = getFromCache<IStack[]>(CACHE_KEYS.STACKS);
    if (cachedData) {
      return cachedData;
    }

    const response = await fetch("/api/stacks", {
      cache: "no-store",
    });
    const data = await response.json();
    if (data.success) {
      // Cache the result
      setCache(CACHE_KEYS.STACKS, data.stacks);
      return data.stacks;
    }
    return [];
  } catch (error) {
    console.error("Error fetching stacks:", error);
    return [];
  }
}

export default function Stack() {
  const [stackList, setStackList] = useState<IStack[]>([]);

  useEffect(() => {
    fetchStacks().then(setStackList);
  }, []);

  return (
    <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-8 px-8">
      <h1 className="text-3xl font-bold mb-6">技术栈</h1>
      <div className="mb-4 last:mb-0">
        这里是我的常用栈，我使用这些工具来构建和维护我的项目。
      </div>
      <ul className="mt-4 grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
        {stackList.map((stackItem) => (
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
        ))}
      </ul>
    </main>
  );
}
