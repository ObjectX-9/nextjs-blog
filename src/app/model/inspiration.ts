import { PaginatedData } from ".";

export interface IInspiration {
  _id?: string;
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

// 用于查询的过滤器类型
export interface IInspirationFilter {
  status?: "draft" | "published";
  tags?: string[];
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  searchText?: string; // 用于搜索标题和内容
}

export interface PaginatedInspirations extends PaginatedData<IInspiration> {
  data: IInspiration[];
}