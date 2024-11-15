import { Table } from "@/components/Table";
import { Button } from "@/components/ui/button";

export default async function Workspace() {
  const imgList = ["/example1.jpg", "/example2.jpg"];

  const items = [
    {
      id: 1,
      product: "Apple",
      specs: "iPhone 13",
      buyAddress: "Apple Store",
    },
    {
      id: 2,
      product: "Google",
      specs: "Pixel 6",
      buyAddress: "Google Store",
    },
    {
      id: 3,
      product: "Microsoft",
      specs: "Surface Pro 8",
      buyAddress: "Microsoft Store",
    },
    {
      id: 4,
      product: "Amazon",
      specs: "Kindle",
      buyAddress: "Amazon Store",
    },
  ];
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
      <h1 className="text-3xl font-bold mb-6">Workspace</h1>
      <div className="mx-6 mb-4 flex snap-x snap-mandatory gap-6 overflow-x-scroll pb-4 md:mx-0 md:grid md:snap-none md:grid-cols-2 md:overflow-x-auto md:pb-0">
        {imgList.map((imgSrc) => (
          // next/image is very expensive, so i use img tag here
          <img
            className="w-2/3 snap-center object-cover md:w-full md:snap-align-none h-96 md:h-72 rounded-md shadow-md"
            src={imgSrc}
            key={imgSrc}
            alt="jpg"
          />
        ))}
      </div>
      <div className="border border-gray-200 rounded-xl mt-4">
        <Table
          caption="For other cool stuff, don‘t forget to check some.wtf"
          items={items}
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
