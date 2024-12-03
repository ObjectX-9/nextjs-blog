interface WorkspaceItem {
  id: number;
  product: string;
  specs: string;
  buyAddress: string;
}

export const workspaceItems: WorkspaceItem[] = [
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
