"use client";

import { useState, useEffect } from "react";
import { ItemType, Table } from "@/components/Table";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { WorkspaceSkeleton } from "@/components/workspace/WorkspaceSkeleton";
import { workspaceBusiness } from "@/app/business/workspace";
import { useSiteStore } from "@/store/site";
import { ISite } from "../model/site";

export default function Workspace() {
  const [workspaceItems, setWorkspaceItems] = useState<ItemType[]>([]);
  const [bgImages, setBgImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { site } = useSiteStore();

  // 获取站点信息
  useEffect(() => {
    const updateBackgroundImages = (site: ISite) => {
      const images = [];
      if (site.workspaceBgUrl1) images.push(site.workspaceBgUrl1);
      if (site.workspaceBgUrl2) images.push(site.workspaceBgUrl2);

      // 如果没有设置背景图，使用默认图片
      if (images.length === 0) {
        images.push("/example1.jpg", "/example2.jpg");
      }

      setBgImages(images);
    };

    if (site) {
      updateBackgroundImages(site);
    }
  }, [site]);

  useEffect(() => {
    const fetchWorkspaceItems = async () => {
      setIsLoading(true);

      try {
        const items = await workspaceBusiness.getWorkspaceItems();
        // 确保返回的是数组而不是分页对象
        const workspaceItemsArray = Array.isArray(items) ? items : [];

        // 转换为 ItemType 格式
        const itemsForTable: ItemType[] = workspaceItemsArray.map(item => ({
          id: item._id || '',
          product: item.product,
          specs: item.specs,
          buyAddress: item.buyAddress,
          buyLink: item.buyLink,
        }));

        setWorkspaceItems(itemsForTable);
      } catch (error) {
        console.error("Error fetching workspace items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaceItems();
  }, []);

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

  if (isLoading) {
    return (
      <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-8 px-8">
        <WorkspaceSkeleton />
      </main>
    );
  }

  return (
    <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-8 px-8">
      <h1 className="text-3xl font-bold mb-6">工作空间</h1>
      <div className="mb-6 last:mb-0">工作空间，记录了工作用到的产品和工具</div>
      <div className="mx-6 mb-4 flex snap-x snap-mandatory gap-6 overflow-x-scroll pb-4 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:overflow-x-auto md:pb-0">
        {bgImages.map((imgSrc, index) => (
          <div key={index} className="relative w-2/3 md:w-full h-96 md:h-72">
            <Image
              className="snap-center object-cover rounded-md shadow-md"
              src={imgSrc}
              alt={`工作空间背景图 ${index + 1}`}
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
