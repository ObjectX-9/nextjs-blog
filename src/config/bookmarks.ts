export interface Bookmark {
  title: string;
  url: string;
  description: string;
  imageUrl?: string;
}

export interface BookmarkCategory {
  name: string;
  bookmarks: Bookmark[];
}

export const bookmarkData: BookmarkCategory[] = [
  {
    "name": "软件 & 工具",
    "bookmarks": [
      {
        "title": "Pagy – Simple website builder",
        "url": "https://pagy.co",
        "description": "The easiest way to build a website. Like if Notion and Squarespace had a baby."
      },
      {
        "title": "CompressX测试",
        "url": "https://compressx.app",
        "description": "Offline video and image compressor - Minimal quality loss"
      }
    ]
  },
  {
    "name": "Art & Prints",
    "bookmarks": []
  },
  {
    "name": "Books & Magazines",
    "bookmarks": []
  },
  {
    "name": "Design",
    "bookmarks": []
  },
  {
    "name": "Fonts",
    "bookmarks": []
  },
  {
    "name": "Frontend",
    "bookmarks": []
  },
  {
    "name": "Icons",
    "bookmarks": []
  }
];
