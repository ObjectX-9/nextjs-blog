export interface Bookmark {
  title: string;
  url: string;
  description: string;
  imageUrl?: string;
}

export interface BookmarkCategory {
  name: string;
  count: number;
  bookmarks: Bookmark[];
}

export const bookmarkData: BookmarkCategory[] = [
  {
    name: "Apps & Tools",
    count: 141,
    bookmarks: [
      {
        title: "CompressX",
        url: "https://compressx.app",
        description:
          "Offline video and image compressor - Minimal quality loss",
        // imageUrl: "/images/compressx.png"
      },
      {
        title: "Pagy – Simple website builder",
        url: "https://pagy.co",
        description:
          "The easiest way to build a website. Like if Notion and Squarespace had a baby.",
        // imageUrl: "/images/pagy.png"
      },
    ],
  },
  {
    name: "Art & Prints",
    count: 64,
    bookmarks: [],
  },
  {
    name: "Books & Magazines",
    count: 14,
    bookmarks: [],
  },
  {
    name: "Design",
    count: 82,
    bookmarks: [],
  },
  {
    name: "Fonts",
    count: 68,
    bookmarks: [],
  },
  {
    name: "Frontend",
    count: 218,
    bookmarks: [],
  },
  {
    name: "Icons",
    count: 26,
    bookmarks: [],
  },
  {
    name: "Portfolio",
    count: 180,
    bookmarks: [],
  },
];
