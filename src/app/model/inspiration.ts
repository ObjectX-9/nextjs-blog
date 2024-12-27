import { ObjectId } from "mongodb";

export interface IInspiration {
  _id?: ObjectId;
  title: string;
  content: string;
  images?: string[]; // 图片URL数组
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  views: number;
  bilibili?: {
    bvid: string;      // B站视频的BV号
    title?: string;    // 视频标题
    cover?: string;    // 视频封面图片URL
    page?: number;     // 视频分P号，默认为1
  };
  links?: {
    title: string;
    url: string;
    icon?: string; // 可选的链接图标
  }[];
  tags?: string[]; // 可选的标签
  status: "draft" | "published"; // 草稿或已发布状态
}

export interface IInspirationCreate
  extends Omit<
    IInspiration,
    "_id" | "createdAt" | "updatedAt" | "likes" | "views"
  > {
  // 创建时不需要的字段都被省略
}

export interface IInspirationUpdate
  extends Partial<Omit<IInspiration, "_id" | "createdAt" | "updatedAt">> {
  // 更新时所有字段都是可选的
}

// 用于前端展示的灵感笔记类型
export interface InspirationDisplay
  extends Omit<IInspiration, "_id" | "createdAt" | "updatedAt"> {
  _id: string; // ObjectId 转为字符串
  createdAt: string; // Date 转为字符串
  updatedAt: string; // Date 转为字符串
}

// 数据库中的灵感笔记类型
export type InspirationDocument = IInspiration & {
  _id: ObjectId;
};

// 用于查询的过滤器类型
export interface InspirationFilter {
  status?: "draft" | "published";
  tags?: string[];
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  searchText?: string; // 用于搜索标题和内容
}
