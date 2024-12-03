interface WorkspaceItem {
  id: number;
  product: string;
  specs: string;
  buyAddress: string;
  buyLink: string;
}

export const workspaceItems: WorkspaceItem[] = [
  {
    "id": 1,
    "product": "Apple1121",
    "specs": "iPhone 13",
    "buyAddress": "Apple Store",
    "buyLink": "https://www.apple.com"
  },
  {
    "id": 2,
    "product": "Google",
    "specs": "Pixel 6",
    "buyAddress": "Google Store",
    "buyLink": "https://store.google.com"
  },
  {
    "id": 3,
    "product": "Microsoft",
    "specs": "Surface Pro 8",
    "buyAddress": "Microsoft Store",
    "buyLink": "https://www.microsoft.com"
  },
  {
    "id": 4,
    "product": "Amazon",
    "specs": "Kindle",
    "buyAddress": "Amazon Store",
    "buyLink": "https://www.amazon.com"
  }
];
