"use client";

import { useState, useEffect } from "react";
import { ItemType, Table } from "@/components/Table";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Cache management functions
const CACHE_KEYS = {
  WORKSPACE_ITEMS: "workspace_items",
  UNSPLASH_IMAGES: "workspace_unsplash_images",
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

export default function Workspace() {
  const [workspaceItems, setWorkspaceItems] = useState<ItemType[]>([]);
  const [imgList] = useState<string[]>(["/example1.jpg", "/example2.jpg"]);

  // Fetch workspace items with cache
  useEffect(() => {
    const fetchWorkspaceItems = async () => {
      // Try to get from cache first
      const cached = getFromCache<ItemType[]>(CACHE_KEYS.WORKSPACE_ITEMS);
      if (cached) {
        setWorkspaceItems(cached);
        return;
      }

      try {
        const response = await fetch("/api/workspaceItems", {
          // Add cache control headers
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
  }, []);

  // Fetch Unsplash images with cache
  // useEffect(() => {
  //   const fetchUnsplashImages = async () => {
  //     // Try to get from cache first
  //     const cached = getFromCache<string[]>(CACHE_KEYS.UNSPLASH_IMAGES);
  //     if (cached) {
  //       setImgList(cached);
  //       return;
  //     }

  //     try {
  //       const data = await getExampleImgSrc();
  //       if (data && data.urls) {
  //         const newImages = [data.urls.regular, data.urls.regular];
  //         setImgList(newImages);
  //         setCache(CACHE_KEYS.UNSPLASH_IMAGES, newImages);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching Unsplash images:", error);
  //     }
  //   };

  //   fetchUnsplashImages();
  // }, []);

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

const getExampleImgSrc = async () => {
  // remember add you unsplash key
  return await fetch("https://api.unsplash.com/photos/random", {}).then(
    (res) => {
      return res.json();
    }
  );
};
