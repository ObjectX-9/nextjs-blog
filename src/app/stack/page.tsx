import { Card } from "@/components/ui/card";
import { Link } from "lucide-react";
import Image from "next/image";
import { getDb } from "@/lib/mongodb";
import { IStack } from "@/app/model/stack";

// Utility function to truncate text
function truncateText(text: string, maxLength: number = 50) {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

async function getStacks() {
  try {
    const db = await getDb();
    const stacks = await db.collection<IStack>("stacks").find().toArray();
    return stacks;
  } catch (error) {
    console.error("Error fetching stacks:", error);
    return [];
  }
}

export default async function Stack() {
  const stackList = await getStacks();

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
