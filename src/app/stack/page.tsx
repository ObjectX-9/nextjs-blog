"use client";

import { Card } from "@/components/ui/card";
import { Link } from "lucide-react";
import Image from "next/image";
import { IStack } from "@/app/model/stack";
import { useEffect, useState, useCallback } from "react";
import { truncateText } from "@/utils/text";
import { stacksBusiness } from "../business/stacks";
import { message } from "antd";
import PageHeader from "@/components/PageHeader";

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
  // 获取技术栈数据
  const fetchStacks = useCallback(async () => {
    try {
      const stacks = await stacksBusiness.getStacks();
      setStackList(stacks);
      setLoading(false);
    } catch (error) {
      message.error("Error fetching stacks:" + error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStacks()
  }, [fetchStacks]);

  return (
    <main className="flex h-screen w-full box-border flex-col overflow-y-auto custom-scrollbar-thin py-8 px-8">
      <PageHeader
        title="技术栈"
        description="这里是我的常用栈，我使用这些工具来构建和维护我的项目。"
      />
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
              <Card className="flex-1 max-w-96 cursor-pointer" onClick={() => {
                window.open(stackItem.link, '_blank');
              }}>
                <div className="flex items-center h-full space-x-4 rounded-md p-4">
                  <Image
                    src={stackItem.iconSrc}
                    width={24}
                    height={24}
                    alt={stackItem.title}
                  ></Image>
                  <div className="flex-1 space-y-1">
                    <div
                      className="text-sm font-medium leading-none flex items-center"
                    >
                      {stackItem.title}
                      <Link className="ml-1" size={14} />
                    </div>
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