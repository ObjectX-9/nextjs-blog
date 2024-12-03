import { ItemType, Table } from "@/components/Table";
import { Button } from "@/components/ui/button";
import { workspaceItems } from "@/config/workspace-items";
import Image from "next/image";

export default async function Workspace() {
  const imgList = ["/example1.jpg", "/example2.jpg"];

  const fields = [
    { key: "product", label: "产品" },
    { key: "specs", label: "规格" },
    {
      key: "buyAddress",
      label: "",
      align: "right" as const,
      render: (field: string | number, idx: number) => (
        <Button variant="link" size="sm">
          去购买
        </Button>
      ),
    },
  ];

  return (
    <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-24 px-8">
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
          items={workspaceItems as unknown as ItemType[]}
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
